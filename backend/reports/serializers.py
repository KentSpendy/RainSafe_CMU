from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id',
            'user_email',
            'name',
            'contact',
            'description',
            'latitude',
            'longitude',
            'image',
            'status',
            'date_created',
        ]
        read_only_fields = ['user_email', 'user', 'date_created']
