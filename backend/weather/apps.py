# backend/weather/apps.py
from django.apps import AppConfig

class WeatherConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "weather"

    def ready(self):
        # do not auto-start scheduler here (start centrally in core.apps)
        pass
