from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class RecentActivity(models.Model):
    ACTIVITY_TYPES = (
        ('counselor_approved', 'Counselor Approved'),
        ('counselor_rejected', 'Counselor Rejected'),
        ('user_added', 'User Added'),
        ('counselor_added', 'Counselor Added'),
        ('admin_added', 'Admin Added'),
    )
    
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    admin_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_activities')
    description = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Recent Activity'
        verbose_name_plural = 'Recent Activities'
    
    def __str__(self):
        return f"{self.get_activity_type_display()} - {self.user.full_name}"
    
    def get_icon_and_color(self):
        """Returns icon emoji and color class for the activity type"""
        icons = {
            'counselor_approved': ('✅', 'rgba(72, 187, 120, 0.2)', '#48bb78'),
            'counselor_rejected': ('❌', 'rgba(245, 101, 101, 0.2)', '#f56565'),
            'user_added': ('👤', 'rgba(102, 126, 234, 0.2)', '#667eea'),
            'counselor_added': ('🩺', 'rgba(139, 195, 74, 0.2)', '#8bc34a'),
            'admin_added': ('👑', 'rgba(156, 39, 176, 0.2)', '#9c27b0'),
        }
        return icons.get(self.activity_type, ('📝', 'rgba(102, 126, 234, 0.2)', '#667eea'))
    
    def time_since(self):
        """Returns human readable time since the activity"""
        now = timezone.now()
        diff = now - self.created_at
        
        if diff.days > 0:
            if diff.days == 1:
                return "Yesterday"
            else:
                return f"{diff.days} days ago"
        elif diff.seconds > 3600:  # More than 1 hour
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:  # More than 1 minute
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"
        

class WellnessTip(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title