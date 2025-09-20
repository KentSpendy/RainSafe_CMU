from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Use email as the unique identifier
    model = CustomUser

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name")}),
        ("Additional Info", {
            "fields": (
                "role",
                "age",
                "contact_number",
                "purok",
                "barangay",
                "municipal",
                "province",
                "sex",
            ),
        }),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email",
                "password1",
                "password2",
                "first_name",
                "last_name",
                "role",
                "age",
                "contact_number",
                "purok",
                "barangay",
                "municipal",
                "province",
                "sex",
                "is_staff",
                "is_active",
            ),
        }),
    )

    # ✅ Display email instead of username
    list_display = (
        "email",
        "first_name",
        "last_name",
        "role",
        "age",
        "contact_number",
        "barangay",
        "municipal",
        "province",
    )

    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    list_filter = ("role", "sex", "municipal", "province")
