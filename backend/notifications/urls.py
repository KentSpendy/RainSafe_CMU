from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, NotificationListView, NotificationMarkReadView

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notifications')

urlpatterns = [
    path("all/", NotificationListView.as_view(), name="notifications-list"),
    path("<int:pk>/read/", NotificationMarkReadView.as_view(), name="notification-read"),

    # ✅ Include router URLs so that /api/notifications/ works
    path("", include(router.urls)),
]
