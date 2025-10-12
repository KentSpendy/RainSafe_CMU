from django.apps import AppConfig
import os


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self):
        # Prevent running scheduler multiple times with Django autoreloader
        if os.environ.get("RUN_MAIN", None) != "true":
            return

        from weather import scheduler
        try:
            scheduler.start()
        except Exception as e:
            print(f"⚠️ Scheduler failed to start: {e}")
