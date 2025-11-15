from django.contrib import admin
from .models import Station, WeatherData
from django.utils.html import format_html


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ("name", "latitude", "longitude", "elevation", "created_at")
    search_fields = ("name",)
    list_filter = ("created_at",)


@admin.register(WeatherData)
class WeatherDataAdmin(admin.ModelAdmin):
    list_display = (
        "station",
        "timestamp",
        "temperature",
        "humidity",
        "precipitation_probability",
        "wind_speed",
    )
    list_filter = ("station", "timestamp")
    search_fields = ("station__name",)
    ordering = ("-timestamp",)

    readonly_fields = (
        "station",
        "timestamp",
        "location_name",
        "latitude",
        "longitude",
        "temperature",
        "humidity",
        "precipitation_probability",
        "wind_speed",
        "created_at",
    )
