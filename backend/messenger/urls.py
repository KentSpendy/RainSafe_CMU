from django.urls import path
# from .views import facebook_webhook
from . import views

urlpatterns = [
    # path("webhook/", facebook_webhook, name="facebook_webhook"),
    path("webhook/", views.webhook, name="messenger-webhook"),
]
