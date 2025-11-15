from apscheduler.schedulers.background import BackgroundScheduler
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler.models import DjangoJobExecution
from django_apscheduler import util
from .views import fetch_and_store_weather_data


def start():
    scheduler = BackgroundScheduler(timezone="Asia/Manila")
    scheduler.add_jobstore(DjangoJobStore(), "default")

    scheduler.add_job(
        fetch_and_store_weather_data,
        trigger="interval",
        hours=1,
        id="weather_fetch_job",
        replace_existing=True,
    )

    scheduler.start()
    print("✅ Weather Scheduler started successfully")
