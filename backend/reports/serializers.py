from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = ['user', 'date_created']
