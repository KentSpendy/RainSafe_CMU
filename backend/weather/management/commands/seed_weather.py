import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils.timezone import make_aware
from weather.models import WeatherData


class Command(BaseCommand):
    help = "Seed the database with the past 7 days of weather data"

    def handle(self, *args, **kwargs):
        today = datetime.now().date()

        for i in range(7):
            day = today - timedelta(days=i)

            # Skip if already exists
            if WeatherData.objects.filter(timestamp__date=day).exists():
                self.stdout.write(self.style.WARNING(f"Data already exists for {day}, skipping."))
                continue

            # Generate random but realistic weather data
            temp = round(random.uniform(22, 32), 1)       # Celsius
            humidity = random.randint(60, 95)             # %
            wind = round(random.uniform(0.5, 5.0), 1)     # m/s
            precip = random.randint(0, 100)               # %

            WeatherData.objects.create(
                timestamp=make_aware(datetime.combine(day, datetime.min.time())),
                location_name="CMU Campus",  # ✅ fixed field name
                latitude=7.85,
                longitude=125.05,
                precipitation_probability=precip,
                wind_speed=wind,
                temperature=temp,
                humidity=humidity,
            )

            self.stdout.write(self.style.SUCCESS(f"Seeded weather data for {day}"))
