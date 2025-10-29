from rest_framework import permissions

class IsCustomAdmin(permissions.BasePermission):
    """
    Allows access only to users with role='admin' or is_staff=True.
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (
                getattr(request.user, "role", None) == "admin"
                or request.user.is_staff
            )
        )
