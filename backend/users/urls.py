from django.urls import path
from .views import RegisterView, CurrentUserView, CurrentUserUpdateView, UserDetailAdminView, UserListView
from .tokens import CustomTokenObtainPairView  # <-- use custom JWT
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Registration
    path("register/", RegisterView.as_view(), name="register"),

    # Authentication
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # User info
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("me/update/", CurrentUserUpdateView.as_view(), name="current-user-update"),

    # Admin-only
    path("list/", UserListView.as_view(), name="user-list"),
    path("<int:pk>/", UserDetailAdminView.as_view(), name="user-detail-admin"),
]
