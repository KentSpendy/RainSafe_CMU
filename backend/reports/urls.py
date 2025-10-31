from django.urls import path, include
from .views import ReportCreateView, ReportListView, ReportUpdateView
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet


router = DefaultRouter()
router.register(r'', ReportViewSet, basename='report')

urlpatterns = [
    path('create/', ReportCreateView.as_view(), name='create-report'),
    path('all/', ReportListView.as_view(), name='list-reports'),
    path('<int:pk>/update/', ReportUpdateView.as_view(), name='update-report'),
    path('', include(router.urls)),
]
