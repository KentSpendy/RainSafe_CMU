from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("user", "User"),
    )

    # Remove username, use email instead
    username = None
    email = models.EmailField(unique=True)

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")
    age = models.PositiveIntegerField(null=True, blank=True)
    contact_number = models.CharField(max_length=20, blank=True, null=True)

    # Structured Address
    purok = models.CharField(max_length=50, blank=True, null=True)
    barangay = models.CharField(max_length=100, blank=True, null=True)
    municipal = models.CharField(max_length=100, blank=True, null=True)
    province = models.CharField(max_length=100, blank=True, null=True)

    sex = models.CharField(
        max_length=10,
        choices=(("male", "Male"), ("female", "Female")),
        blank=True,
        null=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]  # ✅ removed username

    objects = CustomUserManager()  # ✅ attach custom manager

    def __str__(self):
        return f"{self.email} ({self.role})"
