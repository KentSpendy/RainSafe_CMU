from django.db import models

class WeatherData(models.Model):
    timestamp = models.DateTimeField()
    location_name = models.CharField(max_length=100, default="CMU Campus")  # human-readable name
    latitude = models.FloatField(default=0.0)   # actual lat from API
    longitude = models.FloatField(default=0.0)  # actual lon from API

    precipitation_probability = models.FloatField()
    wind_speed = models.FloatField()
    temperature = models.FloatField(null=True, blank=True)  # °C
    humidity = models.FloatField(null=True, blank=True)    # %

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.location_name} @ {self.timestamp} - {self.precipitation_probability}% rain"
