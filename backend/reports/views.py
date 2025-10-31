from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Report
from .serializers import ReportSerializer
from .permissions import IsCustomAdmin  # ✅ use your custom permission
from notifications.models import Notification  # ✅ import notification model

User = get_user_model()


# 🧭 User can submit a report
class ReportCreateView(generics.CreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        report = serializer.save(user=self.request.user)

        # ✅ Notify all admin users
        admins = User.objects.filter(role="admin")
        for admin in admins:
            Notification.objects.create(
                user=admin,
                title="🚨 New User Report",
                message=(
                    f"A new report has been submitted by {self.request.user.email}.\n\n"
                    f"Description: {report.description}\n"
                    f"Location: ({report.latitude}, {report.longitude})"
                ),
            )


# 🧭 Admin can view all reports
class ReportListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    queryset = Report.objects.all().order_by("-date_created")
    permission_classes = [IsCustomAdmin]  # ✅ replaced IsAdminUser


# 🧭 Admin can update report status
class ReportUpdateView(generics.UpdateAPIView):
    serializer_class = ReportSerializer
    queryset = Report.objects.all()
    permission_classes = [IsCustomAdmin]  # ✅ replaced IsAdminUser


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all().order_by('-date_created')
    serializer_class = ReportSerializer

    def get_permissions(self):
        """
        Apply admin-only permissions for certain actions.
        """
        if self.action in ['update_status', 'destroy']:
            permission_classes = [IsCustomAdmin]
        elif self.action in ['create']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = []  # Read actions can be public or adjusted as needed
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['patch'], url_path='update_status', permission_classes=[IsCustomAdmin])
    def update_status(self, request, pk=None):
        """
        Allows admin to update the status of a report and notify the user.
        """
        try:
            report = self.get_object()
            new_status = request.data.get('status')

            if not new_status or new_status not in ['Pending', 'In Progress', 'Resolved']:
                return Response({'error': 'Invalid status value.'}, status=status.HTTP_400_BAD_REQUEST)

            # Update status
            report.status = new_status
            report.save()

            # 🔔 Create a notification for the report owner
            Notification.objects.create(
                user=report.user,
                title="📢 Report Status Updated",
                message=f"Your report '{report.description[:30]}...' has been marked as '{new_status}'."
            )

            return Response(
                {'message': 'Status updated successfully.', 'status': new_status},
                status=status.HTTP_200_OK
            )

        except Report.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

