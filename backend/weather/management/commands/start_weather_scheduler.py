from django.core.management.base import BaseCommand
from weather.scheduler import start

class Command(BaseCommand):
    help = "Starts the weather data scheduler"

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting weather scheduler...")
        start()
        self.stdout.write("Weather scheduler is now running.")
