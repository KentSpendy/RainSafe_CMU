from users.tokens import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/weather/", include("weather.urls")),
    path("api/messenger/", include("messenger.urls")),
    path('api/reports/', include('reports.urls')),

]
