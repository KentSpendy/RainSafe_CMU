from django.urls import path
from .views import FetchWeatherData, WeatherHistoryView, WeatherForecastView

urlpatterns = [
    path("fetch/", FetchWeatherData.as_view(), name="fetch-weather"),
    path("history/", WeatherHistoryView.as_view(), name="weather-history"),
    path("forecast/", WeatherForecastView.as_view(), name="weather_forecast"),
]
