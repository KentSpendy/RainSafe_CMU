from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Report
from .serializers import ReportSerializer
from .permissions import IsCustomAdmin  # ✅ use your custom permission
from notifications.models import Notification  # ✅ import notification model
from .utils import reverse_geocode  # ✅ import geocoding utility

User = get_user_model()


# 🧭 User can submit a report
class ReportCreateView(generics.CreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Get the latitude and longitude from the request
        latitude = serializer.validated_data.get('latitude')
        longitude = serializer.validated_data.get('longitude')

        # Perform reverse geocoding to get the address
        address = reverse_geocode(latitude, longitude)

        # Save the report with the geocoded address
        report = serializer.save(user=self.request.user, address=address)

        # ✅ Notify all admin users
        admins = User.objects.filter(role="admin")
        for admin in admins:
            Notification.objects.create(
                user=admin,
                title="🚨 New User Report",
                message=(
                    f"A new report has been submitted by {self.request.user.email}.\n\n"
                    f"Description: {report.description}\n"
                    f"Location: {address if address else f'({report.latitude}, {report.longitude})'}"
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
        if self.action in ['update_status']:
            permission_classes = [IsCustomAdmin]
        elif self.action in ['create', 'destroy', 'retrieve', 'my_reports']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = []  # Read actions can be public or adjusted as needed
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        """
        Allow users to delete their own reports only if status is 'Pending'.
        Admins can delete any report.
        """
        report = self.get_object()

        # Check if user is admin or owner
        if request.user.role == 'admin':
            report.delete()
            return Response({'message': 'Report deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

        # Check if user is the owner
        if report.user != request.user:
            return Response({'error': 'You do not have permission to delete this report'}, status=status.HTTP_403_FORBIDDEN)

        # Check if report is still pending
        if report.status != 'Pending':
            return Response({'error': 'Only pending reports can be deleted'}, status=status.HTTP_400_BAD_REQUEST)

        report.delete()
        return Response({'message': 'Report deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='my-reports', permission_classes=[permissions.IsAuthenticated])
    def my_reports(self, request):
        """
        Returns all reports created by the authenticated user.
        """
        reports = Report.objects.filter(user=request.user).order_by('-date_created')
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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

