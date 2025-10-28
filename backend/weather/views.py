import requests
from datetime import datetime, timedelta
from django.utils.timezone import make_aware, now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.db.models import Avg, Min, Max
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from .models import WeatherData, Station
from .serializers import StationSerializer
from users.permissions import IsAdmin, IsAdminOrReadOnlyAuthenticated


def fetch_and_store_weather_data():
    """
    Fetch live & recent hourly weather data from Open-Meteo for all stations.
    - Stores the past 24 hours (hourly) + current reading.
    - Uses update_or_create() to avoid duplicates.
    """
    results = []
    base_url = (
        "https://api.open-meteo.com/v1/forecast?"
        "timezone=auto&past_days=1&hourly=temperature_2m,relative_humidity_2m,"
        "precipitation_probability,windspeed_10m&current=temperature_2m,"
        "relative_humidity_2m,precipitation_probability,windspeed_10m"
    )

    for station in Station.objects.all():
        url = f"{base_url}&latitude={station.latitude}&longitude={station.longitude}"

        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as e:
            results.append({"station": station.name, "error": f"Fetch failed: {str(e)}"})
            continue

        # --- Store hourly data for past 24h ---
        hourly = data.get("hourly", {})
        if hourly and "time" in hourly:
            for i, ts_str in enumerate(hourly["time"]):
                try:
                    timestamp = datetime.fromisoformat(ts_str)
                    if timestamp.tzinfo is None:
                        timestamp = make_aware(timestamp)
                except Exception:
                    continue

                WeatherData.objects.update_or_create(
                    station=station,
                    timestamp=timestamp,
                    defaults={
                        "location_name": station.name,
                        "latitude": station.latitude,
                        "longitude": station.longitude,
                        "temperature": hourly.get("temperature_2m", [None])[i],
                        "humidity": hourly.get("relative_humidity_2m", [None])[i],
                        "precipitation_probability": hourly.get("precipitation_probability", [None])[i],
                        "wind_speed": hourly.get("windspeed_10m", [None])[i],
                    },
                )

        # --- Store current reading ---
        current = data.get("current", {})
        if current:
            ts_str = current.get("time")
            if ts_str:
                timestamp = datetime.fromisoformat(ts_str)
                if timestamp.tzinfo is None:
                    timestamp = make_aware(timestamp)

                WeatherData.objects.update_or_create(
                    station=station,
                    timestamp=timestamp,
                    defaults={
                        "location_name": station.name,
                        "latitude": station.latitude,
                        "longitude": station.longitude,
                        "temperature": current.get("temperature_2m"),
                        "humidity": current.get("relative_humidity_2m"),
                        "precipitation_probability": current.get("precipitation_probability"),
                        "wind_speed": current.get("windspeed_10m"),
                    },
                )

        results.append({
            "station": station.name,
            "latitude": station.latitude,
            "longitude": station.longitude,
            "entries_saved": WeatherData.objects.filter(station=station).count(),
        })

    return {"message": "Weather data (current + 24h history) updated", "results": results}


# ===================== API VIEWS =====================

class FetchWeatherData(APIView):
    """Manual API fetch endpoint (Admin only)."""
    permission_classes = [IsAdmin]

    def get(self, request):
        result = fetch_and_store_weather_data()
        has_error = any("error" in r for r in result["results"])
        status_code = status.HTTP_502_BAD_GATEWAY if has_error else status.HTTP_200_OK

        latest = WeatherData.objects.order_by("-timestamp").first()
        data_summary = None
        if latest:
            data_summary = {
                "station": latest.station.name,
                "temperature": latest.temperature,
                "humidity": latest.humidity,
                "precipitation_probability": latest.precipitation_probability,
                "wind_speed": latest.wind_speed,
                "timestamp": latest.timestamp,
            }

        payload = {
            "message": result["message"],
            "results": result["results"],
            "data": data_summary,
        }
        return Response(payload, status=status_code)


class WeatherHistoryView(APIView):
    """Aggregates and returns average weather data for the past 7 days."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = now().date()
        start_date = today - timedelta(days=7)

        history = (
            WeatherData.objects.filter(timestamp__date__gte=start_date)
            .values("timestamp__date")
            .annotate(
                avg_temp=Avg("temperature"),
                min_temp=Min("temperature"),
                max_temp=Max("temperature"),
                avg_humidity=Avg("humidity"),
                min_humidity=Min("humidity"),
                max_humidity=Max("humidity"),
                avg_wind=Avg("wind_speed"),
                min_wind=Min("wind_speed"),
                max_wind=Max("wind_speed"),
            )
            .order_by("timestamp__date")
        )

        return Response({
            "message": "Weather history (past 7 days)",
            "data": list(history),
        })


class WeatherForecastView(APIView):
    """Fetches 3-day forecast (live, not stored)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        latitude = 7.85
        longitude = 125.05
        location_name = "CMU Campus"

        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={latitude}&longitude={longitude}"
            f"&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_mean,windspeed_10m_max"
            f"&timezone=auto&forecast_days=3"
        )

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as e:
            return Response(
                {"error": f"Failed to fetch forecast data: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        daily = data.get("daily", {})
        if not daily:
            return Response({"error": "No forecast data available"}, status=500)

        forecast = []
        for i, date in enumerate(daily.get("time", [])):
            forecast.append({
                "date": date,
                "min_temp": daily.get("temperature_2m_min", [])[i],
                "max_temp": daily.get("temperature_2m_max", [])[i],
                "rain_chance": daily.get("precipitation_probability_mean", [])[i],
                "wind_max": daily.get("windspeed_10m_max", [])[i],
            })

        return Response({
            "message": "3-day forecast",
            "location": location_name,
            "data": forecast,
        })


class StationListCreateView(generics.ListCreateAPIView):
    """List all stations or create a new one."""
    queryset = Station.objects.all().order_by("name")
    serializer_class = StationSerializer
    permission_classes = [IsAdminOrReadOnlyAuthenticated]


class StationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific station."""
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    permission_classes = [IsAdminOrReadOnlyAuthenticated]


@api_view(["GET"])
@permission_classes([AllowAny])
def live_weather_view(request):
    """
    Fetch live weather data from Open-Meteo for given coordinates (no DB storage).
    Example: /api/weather/live/?lat=8.1017&lon=125.1279
    """
    lat = request.query_params.get("lat")
    lon = request.query_params.get("lon")

    if not lat or not lon:
        return Response(
            {"error": "Missing latitude or longitude parameters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,relative_humidity_2m,precipitation_probability,windspeed_10m"
            f"&timezone=auto"
        )
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        current = data.get("current", {})
        if not current:
            return Response({"error": "No live weather data found."}, status=502)

        result = {
            "latitude": float(lat),
            "longitude": float(lon),
            "temperature": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "precipitation_probability": current.get("precipitation_probability"),
            "wind_speed": current.get("windspeed_10m"),
            "time": current.get("time"),
        }
        return Response(result)

    except requests.RequestException as e:
        return Response(
            {"error": f"Failed to fetch live data: {str(e)}"},
            status=status.HTTP_502_BAD_GATEWAY,
        )
