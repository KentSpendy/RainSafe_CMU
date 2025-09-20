from apscheduler.schedulers.background import BackgroundScheduler
from django_apscheduler.jobstores import register_events, DjangoJobStore
from .views import fetch_and_store_weather_data


def start():
    """Start the background scheduler to fetch weather data every hour."""
    scheduler = BackgroundScheduler(timezone="Asia/Manila")
    scheduler.add_jobstore(DjangoJobStore(), "default")

    # Job: fetch weather data every hour
    scheduler.add_job(
        fetch_and_store_weather_data,
        trigger="interval",
        hours=1,
        id="weather_fetch_job",
        replace_existing=True,
    )

    register_events(scheduler)
    scheduler.start()
    print("✅ APScheduler started: Weather fetch every hour")
