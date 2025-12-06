from django.db import models
from django.conf import settings
import uuid

class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional: Link to related object for deep linking
    # content_type = ...
    # object_id = ...
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient}: {self.message[:20]}"
