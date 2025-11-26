from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils.timezone import localdate

User = get_user_model()

WEEKDAYS = [
    ("Monday", "Monday"),
    ("Tuesday", "Tuesday"),
    ("Wednesday", "Wednesday"),
    ("Thursday", "Thursday"),
    ("Friday", "Friday"),
    ("Saturday", "Saturday"),
    ("Sunday", "Sunday"),
]

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('started', 'Started'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
     
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments')
    counselor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='counselor_appointments')
    date = models.DateField()
    time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')  # e.g., Scheduled, Completed, Cancelled
    google_meet_link = models.URLField(blank=True, null=True)
    counselor_notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.patient.full_name} with {self.counselor.full_name} on {self.date} at {self.time}"


class Availability(models.Model):
    counselor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='availabilities')
    weekday = models.CharField(max_length=10, choices=WEEKDAYS, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_vacation = models.BooleanField(default=False)
    total_slots = models.IntegerField(default=1)   # <-- add this
    booked_slots = models.IntegerField(default=0)

    class Meta:
        unique_together = ('counselor', 'date', 'start_time', 'end_time')
        ordering = ['date', 'start_time']

    def save(self, *args, **kwargs):
        # auto-compute weekday from date
        self.weekday = self.date.strftime('%A')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.counselor.full_name} available on {self.date} from {self.start_time} to {self.end_time}"