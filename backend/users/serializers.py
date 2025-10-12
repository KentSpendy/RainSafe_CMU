from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",  
            "role",
            "age",
            "contact_number",
            "purok",
            "barangay",
            "municipal",
            "province",
            "sex",
        ]
        read_only_fields = ["role", "email"] 


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "password",
            "password2",
            "age",
            "contact_number",
            "sex",
            "purok",
            "barangay",
            "municipal",
            "province",
        ]

    def validate(self, attrs):
        # Check password match
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords didn’t match."})

        # Check for duplicate email
        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "This email is already registered."})

        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")

        # Use custom manager so email is respected
        user = User.objects.create_user(
            password=password,
            role="user",  # default role
            **validated_data
        )
        return user

