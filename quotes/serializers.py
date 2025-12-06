from rest_framework import serializers
from .models import Quote

class QuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = [
            'id',
            'design',
            'manufacturer',
            'price_usd',
            'estimated_lead_time_days',
            'notes',
            'status',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'design', 'manufacturer', 'created_at', 'updated_at']
