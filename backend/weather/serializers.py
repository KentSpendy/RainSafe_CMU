# backend/weather/serializers.py
from rest_framework import serializers
from .models import WeatherData, Station


class WeatherDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherData
        fields = "__all__"


class StationSerializer(serializers.ModelSerializer):
    temperature = serializers.SerializerMethodField()
    humidity = serializers.SerializerMethodField()
    rain_chance = serializers.SerializerMethodField()
    wind_speed = serializers.SerializerMethodField()
    last_updated = serializers.SerializerMethodField()

    class Meta:
        model = Station
        fields = [
            "id",
            "name",
            "latitude",
            "longitude",
            "elevation",
            "description",
            "created_at",
            "temperature",
            "humidity",
            "rain_chance",
            "wind_speed",
            "last_updated",
        ]

    # --- Helper to get latest weather record per station ---
    def _get_latest_weather(self, obj):
        """Get the most recent WeatherData record for this station (cached)."""
        if not hasattr(self, "_weather_cache"):
            self._weather_cache = {}
        if obj.id not in self._weather_cache:
            self._weather_cache[obj.id] = obj.weather_records.order_by("-timestamp").first()
        return self._weather_cache[obj.id]

    # --- Computed fields ---
    def get_temperature(self, obj):
        record = self._get_latest_weather(obj)
        return record.temperature if record else None

    def get_humidity(self, obj):
        record = self._get_latest_weather(obj)
        return record.humidity if record else None

    def get_rain_chance(self, obj):
        record = self._get_latest_weather(obj)
        return record.precipitation_probability if record else None

    def get_wind_speed(self, obj):
        record = self._get_latest_weather(obj)
        return record.wind_speed if record else None

    def get_last_updated(self, obj):
        record = self._get_latest_weather(obj)
        return record.timestamp.isoformat() if record and record.timestamp else None
