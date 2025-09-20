import requests
from datetime import datetime
from django.utils.timezone import make_aware, now, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Min, Max
from .models import WeatherData


def fetch_and_store_weather_data():
    """Fetch current weather from Open-Meteo and save to DB."""
    latitude = 7.85
    longitude = 125.05
    location_name = "CMU Campus"

    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={latitude}&longitude={longitude}"
        f"&current=temperature_2m,relative_humidity_2m,precipitation_probability,windspeed_10m"
        f"&timezone=auto"
    )

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        return {"error": f"Failed to fetch data from Open-Meteo: {str(e)}"}

    current = data.get("current", {})
    if not current:
        return {"error": "No current weather data available"}

    timestamp = make_aware(datetime.fromisoformat(current["time"]))
    temperature = current.get("temperature_2m")
    humidity = current.get("relative_humidity_2m")
    precipitation_probability = current.get("precipitation_probability")
    wind_speed = current.get("windspeed_10m")

    # Prevent duplicates
    weather_obj, created = WeatherData.objects.get_or_create(
        timestamp=timestamp,
        defaults={
            "location_name": location_name,
            "latitude": latitude,
            "longitude": longitude,
            "temperature": temperature,
            "humidity": humidity,
            "precipitation_probability": precipitation_probability,
            "wind_speed": wind_speed,
        },
    )

    return {
        "message": "Weather data fetched successfully",
        "data": {
            "id": weather_obj.id,
            "timestamp": weather_obj.timestamp,
            "location": weather_obj.location_name,
            "latitude": weather_obj.latitude,
            "longitude": weather_obj.longitude,
            "temperature": weather_obj.temperature,
            "humidity": weather_obj.humidity,
            "precipitation_probability": weather_obj.precipitation_probability,
            "wind_speed": weather_obj.wind_speed,
            "created": created,
        },
    }


class FetchWeatherData(APIView):
    """Manual API fetch (also uses helper function)."""
    def get(self, request):
        result = fetch_and_store_weather_data()
        status_code = (
            status.HTTP_502_BAD_GATEWAY if "error" in result else status.HTTP_200_OK
        )
        return Response(result, status=status_code)


class WeatherHistoryView(APIView):
    """Return aggregated weather data from the past 7 days (stored in DB)."""
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

        return Response(
            {
                "message": "Weather history (past week)",
                "data": list(history),
            }
        )


class WeatherForecastView(APIView):
    """
    Fetch 3-day weather forecast from Open-Meteo API (live only, not stored in DB).
    """

    def get(self, request):
        latitude = 7.85
        longitude = 125.05
        location_name = "CMU Campus"

        # Open-Meteo daily forecast API
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={latitude}&longitude={longitude}"
            f"&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_mean,windspeed_10m_max"
            f"&timezone=auto"
            f"&forecast_days=3"
        )

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as e:
            return Response(
                {"error": f"Failed to fetch forecast data from Open-Meteo: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # Extract daily forecast data
        daily = data.get("daily", {})
        if not daily:
            return Response(
                {"error": "No forecast data available"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        forecast = []
        for i, date in enumerate(daily.get("time", [])):
            forecast.append({
                "date": date,
                "min_temp": daily.get("temperature_2m_min", [])[i],
                "max_temp": daily.get("temperature_2m_max", [])[i],
                "rain_chance": daily.get("precipitation_probability_mean", [])[i],
                "wind_max": daily.get("windspeed_10m_max", [])[i],
            })

        return Response(
            {
                "message": "3-day forecast",
                "location": location_name,
                "data": forecast,
            }
        )
