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
            "email",   # ✅ using email as identifier
            "role",
            "age",
            "contact_number",
            "purok",
            "barangay",
            "municipal",
            "province",
            "sex",
        ]
        read_only_fields = ["role", "email"]  # ✅ prevent accidental changes


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
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords didn’t match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")

        # ✅ Use our custom manager so it respects email login
        user = User.objects.create_user(
            password=password,
            role="user",  # default role
            **validated_data
        )
        return user
