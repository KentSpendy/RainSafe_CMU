from django.urls import path
from .views import ReportCreateView, ReportListView, ReportUpdateView

urlpatterns = [
    path('create/', ReportCreateView.as_view(), name='create-report'),
    path('all/', ReportListView.as_view(), name='list-reports'),
    path('<int:pk>/update/', ReportUpdateView.as_view(), name='update-report'),
]
