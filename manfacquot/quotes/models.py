import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

from designs.models import Design

class QuoteStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    ACCEPTED = 'accepted', 'Accepted'
    REJECTED = 'rejected', 'Rejected'
    EXPIRED = 'expired', 'Expired'

class Quote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    design = models.ForeignKey(
        Design,
        on_delete=models.CASCADE,
        related_name='quotes'
    )
    manufacturer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quotes_given',
        # Ensure only users with the 'manufacturer' role can be assigned
        limit_choices_to={'role': 'manufacturer'}
    )
    price_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="The quoted price in USD."
    )
    estimated_lead_time_days = models.PositiveIntegerField(
        help_text="Estimated lead time in days."
    )
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=QuoteStatus.choices,
        default=QuoteStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'Quotes'
        verbose_name = 'Quote'
        verbose_name_plural = 'Quotes'
        # A manufacturer can only quote a design once.
        unique_together = ('design', 'manufacturer')

    def __str__(self):
        return f"Quote for {self.design.design_name} by {self.manufacturer.company_name} - ${self.price_usd}"

    def clean(self):
        # Ensure the assigned user is actually a manufacturer
        if self.manufacturer and self.manufacturer.role != 'manufacturer':
            raise ValidationError("The user assigned as manufacturer must have the 'manufacturer' role.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
