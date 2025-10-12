import requests
from django.conf import settings
from django.core.cache import cache
from .models import Station


def fetch_and_cache_station_weather():
    """Fetch OpenWeather data for all stations and cache results"""
    api_key = getattr(settings, "OPEN_WEATHER_KEY", None)
    if not api_key:
        print("⚠️ No OPEN_WEATHER_KEY set.")
        return

    for station in Station.objects.all():
        url = (
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?lat={station.latitude}&lon={station.longitude}&appid={api_key}&units=metric"
        )

        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                cache_key = f"station_weather_{station.id}"
                cache.set(cache_key, data, timeout=600)  # cache for 10 min
                print(f"✅ Cached weather for {station.name}")
            else:
                print(f"⚠️ Failed to fetch weather for {station.name}")
        except Exception as e:
            print(f"❌ Error fetching weather for {station.name}: {e}")
