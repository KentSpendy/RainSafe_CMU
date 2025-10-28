# users/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS



class IsAuthenticatedAndActive(BasePermission):
    """Grants access only to authenticated and active users."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_active


class IsAdmin(BasePermission):
    """Allows access only to admin users."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == "admin"
        )


class IsUser(BasePermission):
    """Allows access only to normal users."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == "user"
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Allows access if the user is the owner of the object
    or if the user is an admin.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if getattr(user, "role", None) == "admin":
            return True
        return (
            obj == user
            or getattr(obj, "user", None) == user
            or getattr(obj, "owner", None) == user
        )


class ReadOnly(BasePermission):
    """Allows safe (read-only) methods for all users."""
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS


class IsAdminOrReadOnlyAuthenticated(BasePermission):
    """
    Allow GET/HEAD/OPTIONS for authenticated users.
    For unsafe methods (POST/PUT/PATCH/DELETE) require admin.
    Works for both list and detail endpoints (object-level allowed).
    """
    def has_permission(self, request, view):
        # Read-only methods allowed if authenticated
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        # Unsafe methods require admin
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == "admin"
        )

    def has_object_permission(self, request, view, obj):
        # For object-level checks: same as permission level above.
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == "admin"
        )