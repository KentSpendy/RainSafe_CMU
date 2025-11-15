from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    image_url = serializers.SerializerMethodField() 

    class Meta:
        model = Report
        fields = [
            'id',
            'user_email',
            'name',
            'number',  
            'description',
            'latitude',
            'longitude',
            'address',
            'image',
            'image_url',  
            'status',
            'date_created',
        ]
        read_only_fields = ['user_email', 'user', 'date_created']
    
    def get_image_url(self, obj):
        """Return the full Cloudinary URL for the image"""
        if obj.image:
            return obj.image.url
        return None