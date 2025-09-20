from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class SchedulerConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "scheduler"

    def ready(self):
        """Start scheduler when Django starts."""
        from apscheduler.schedulers.background import BackgroundScheduler
        from apscheduler.triggers.interval import IntervalTrigger
        from django_apscheduler.jobstores import DjangoJobStore, register_events
        from weather.views import fetch_and_store_weather_data
        import atexit

        scheduler = BackgroundScheduler()
        scheduler.add_jobstore(DjangoJobStore(), "default")

        # Run every hour
        scheduler.add_job(
            fetch_and_store_weather_data,
            trigger=IntervalTrigger(hours=1),
            id="fetch_weather_job",
            replace_existing=True,
        )

        register_events(scheduler)
        scheduler.start()
        logger.info("Scheduler started for weather auto-fetching.")

        # Shut down gracefully on exit
        atexit.register(lambda: scheduler.shutdown())
