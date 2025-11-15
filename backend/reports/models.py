from django.db import models
from django.contrib.auth import get_user_model
from cloudinary.models import CloudinaryField

User = get_user_model()

class Report(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reports")
    name = models.CharField(max_length=100)
    number = models.CharField(max_length=20)  # Changed from 'contact' to match your frontend
    description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.CharField(max_length=500, null=True, blank=True)
    
    # Replace ImageField with CloudinaryField
    image = CloudinaryField('image', blank=True, null=True, folder='weather_reports')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.status}) - {self.date_created.strftime('%Y-%m-%d %H:%M')}"
    
    class Meta:
        ordering = ['-date_created']