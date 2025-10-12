from django.urls import path
from .views import (
    FetchWeatherData,
    WeatherHistoryView,
    WeatherForecastView,
    StationListCreateView,
    StationDetailView,
    live_weather_view, 
)

app_name = "weather"

urlpatterns = [
    path("fetch/", FetchWeatherData.as_view(), name="fetch-weather"),
    path("history/", WeatherHistoryView.as_view(), name="weather-history"),
    path("forecast/", WeatherForecastView.as_view(), name="weather-forecast"),
    
    # Station endpoints
    path("stations/", StationListCreateView.as_view(), name="station-list"),
    path("stations/<int:pk>/", StationDetailView.as_view(), name="station-detail"),
    path("live/", live_weather_view, name="live-weather"),  
]
