from rest_framework import status, generics, permissions
from rest_framework.response import Response
from .models import Report
from .serializers import ReportSerializer
from .permissions import IsCustomAdmin  # 👈 import the new permission

# User can submit a report
class ReportCreateView(generics.CreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Admin can view all reports
class ReportListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    queryset = Report.objects.all().order_by('-date_created')
    permission_classes = [IsCustomAdmin]  # 👈 updated

# Admin can update report status
class ReportUpdateView(generics.UpdateAPIView):
    serializer_class = ReportSerializer
    queryset = Report.objects.all()
    permission_classes = [IsCustomAdmin]  # 👈 updated
