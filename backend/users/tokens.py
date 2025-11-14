# users/tokens.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import serializers
from django.utils import timezone


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Explicitly use email as the login field
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        # SimpleJWT uses self.username_field internally → already "email"
        data = super().validate({
            "email": email,
            "password": password
        })

        # Update last_login timestamp
        self.user.last_login = timezone.now()
        self.user.save(update_fields=['last_login'])

        # Add extra claims in the response body
        data["email"] = self.user.email
        data["role"] = self.user.role
        data["first_name"] = self.user.first_name
        data["last_name"] = self.user.last_name

        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["role"] = user.role
        return token


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
