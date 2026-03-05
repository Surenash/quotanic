from rest_framework import serializers
from django.utils import timezone # Import timezone
from .models import Order, OrderStatus
from designs.serializers import DesignSerializer # To nest design details
from quotes.serializers import QuoteSerializer # To nest quote details
# For displaying user details like email/company name
from accounts.serializers import UserSerializer # Simplified user details
from notifications.signals import order_status_changed # Import signal

class OrderSerializer(serializers.ModelSerializer):
    # Using simplified serializers for related objects to avoid overly complex nesting
    # or full model representations if not needed for order display.

    # design = DesignSerializer(read_only=True) # Could be too verbose
    # accepted_quote = QuoteSerializer(read_only=True) # Could be too verbose

    # More targeted related data:
    design_info = serializers.SerializerMethodField(read_only=True)
    quote_info = serializers.SerializerMethodField(read_only=True)
    customer_info = serializers.SerializerMethodField(read_only=True)
    manufacturer_info = serializers.SerializerMethodField(read_only=True)

    status_display = serializers.CharField(source='get_status_display', read_only=True)
    # Explicitly define fields that can be updated to ensure they are processed correctly during PATCH
    status = serializers.ChoiceField(choices=OrderStatus.choices, required=False)
    shipping_address = serializers.JSONField(required=False, allow_null=True)
    tracking_number = serializers.CharField(max_length=100, required=False, allow_null=True, allow_blank=True)
    shipping_carrier = serializers.CharField(max_length=100, required=False, allow_null=True, allow_blank=True)
    actual_ship_date = serializers.DateField(required=False, allow_null=True)
    cancellation_reason = serializers.CharField(required=False, allow_null=True, allow_blank=True)


    class Meta:
        model = Order
        fields = [
            'id',
            'design',
            'design_info',
            'accepted_quote',
            'quote_info',
            'customer',
            'customer_info',
            'manufacturer',
            'manufacturer_info',
            'status',
            'status_display',
            'order_total_price_usd',
            'estimated_delivery_date',
            'shipping_address',
            'tracking_number',
            'shipping_carrier',
            'actual_ship_date',      # Ensure this is in fields
            'cancellation_reason',   # Ensure this is in fields
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'design', # FKs are generally not changed post-creation if we consider the Order immutable in its core links
            'design_info',
            'accepted_quote',
            'quote_info',
            'customer',
            'customer_info',
            'manufacturer',
            'manufacturer_info',
            'status_display', # Read-only version of status
            'order_total_price_usd',
            'estimated_delivery_date',
            # 'actual_ship_date' is made writable below (not in read_only) but set by update logic too
            # 'cancellation_reason' is made writable below
            'created_at',
            'updated_at'
        ]
        # Fields like 'status', 'shipping_address', 'tracking_number',
        # 'shipping_carrier', 'actual_ship_date', 'cancellation_reason' are implicitly writable.
        # Their update is controlled by permissions and view logic.

    def get_design_info(self, obj):
        if obj.design:
            return {
                "id": obj.design.id,
                "design_name": obj.design.design_name,
                "material": obj.design.material,
                "quantity": obj.design.quantity
            }
        return None

    def get_quote_info(self, obj):
        if obj.accepted_quote:
            return {
                "id": obj.accepted_quote.id,
                "price_usd": obj.accepted_quote.price_usd, # Already on order, but good for reference
                "estimated_lead_time_days": obj.accepted_quote.estimated_lead_time_days
            }
        return None

    def get_customer_info(self, obj):
        if obj.customer:
            return {
                "id": obj.customer.id,
                "email": obj.customer.email,
                "company_name": obj.customer.company_name
            }
        return None

    def get_manufacturer_info(self, obj):
        if obj.manufacturer:
            return {
                "id": obj.manufacturer.id,
                "email": obj.manufacturer.email,
                "company_name": obj.manufacturer.company_name
            }
        return None

    def update(self, instance, validated_data):
        # Capture old status before update
        old_status = instance.status
        
        # If status is changed to SHIPPED, and actual_ship_date is not provided, set it to now.
        if 'status' in validated_data and validated_data['status'] == OrderStatus.SHIPPED:
            if not validated_data.get('actual_ship_date'):
                validated_data['actual_ship_date'] = timezone.now().date()

        # Call super().update first to save all standard writable fields from validated_data
        instance = super().update(instance, validated_data)

        # Post-update logic: If status was changed to SHIPPED and actual_ship_date wasn't provided in the update,
        # set it now. This ensures actual_ship_date is set if the update payload only contained status.
        if 'status' in validated_data and instance.status == OrderStatus.SHIPPED:
            if 'actual_ship_date' not in validated_data or not validated_data.get('actual_ship_date'):
                instance.actual_ship_date = timezone.now().date()
                instance.save(update_fields=['actual_ship_date']) # Save this specific change

        # Emit signal if status changed
        new_status = instance.status
        if old_status != new_status:
            order_status_changed.send(sender=self.__class__, order=instance, old_status=old_status, new_status=new_status)

        return instance


