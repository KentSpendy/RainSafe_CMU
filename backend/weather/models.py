from django.db import models


class Station(models.Model):
    name = models.CharField(max_length=128)
    latitude = models.FloatField()
    longitude = models.FloatField()
    elevation = models.FloatField(null=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class WeatherData(models.Model):
    station = models.ForeignKey("Station", on_delete=models.CASCADE, related_name="weather_records")
    timestamp = models.DateTimeField()

    # Weather metrics
    temperature = models.FloatField(null=True, blank=True)  # °C
    humidity = models.FloatField(null=True, blank=True)    # %
    precipitation_probability = models.FloatField(null=True, blank=True)
    wind_speed = models.FloatField(null=True, blank=True)

    # Optional redundancy (useful for queries without join)
    location_name = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]  # newest first

    def __str__(self):
        return f"{self.station.name} @ {self.timestamp:%Y-%m-%d %H:%M} - {self.temperature}°C"
