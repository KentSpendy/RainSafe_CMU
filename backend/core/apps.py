from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self):
        from weather import scheduler
        try:
            scheduler.start()
        except Exception as e:
            print(f"⚠️ Scheduler failed to start: {e}")
