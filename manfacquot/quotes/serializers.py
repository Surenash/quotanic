from rest_framework import serializers
from .models import Quote

class QuoteSerializer(serializers.ModelSerializer):
    # Add manufacturer details
    manufacturer_name = serializers.SerializerMethodField()
    manufacturer_company = serializers.SerializerMethodField()
    manufacturer_email = serializers.SerializerMethodField()
    
    # Add design details for manufacturer view
    design_name = serializers.SerializerMethodField()
    design_material = serializers.SerializerMethodField()
    design_quantity = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    is_internal = serializers.BooleanField(source='design.is_internal', read_only=True)
    
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
            'updated_at',
            # Manufacturer details
            'manufacturer_name',
            'manufacturer_company',
            'manufacturer_email',
            # Design details
            'design_name',
            'design_material',
            'design_quantity',
            'customer_name',
            'customer_email',
            'is_internal',
        ]
        read_only_fields = ['id', 'design', 'manufacturer', 'created_at', 'updated_at', 'is_internal']
    
    def get_manufacturer_name(self, obj):
        """Get manufacturer's company name or email"""
        user = obj.manufacturer
        return user.company_name or user.email
    
    def get_manufacturer_company(self, obj):
        """Get manufacturer's company name"""
        try:
            return obj.manufacturer.manufacturer_profile.company_name or obj.manufacturer.company_name or 'N/A'
        except:
            return obj.manufacturer.company_name or 'N/A'
    
    def get_manufacturer_email(self, obj):
        """Get manufacturer's email"""
        return obj.manufacturer.email
    
    def get_design_name(self, obj):
        """Get design name"""
        return obj.design.design_name
    
    def get_design_material(self, obj):
        """Get design material"""
        return obj.design.material
    
    def get_design_quantity(self, obj):
        """Get design quantity"""
        return obj.design.quantity
    
    def get_customer_name(self, obj):
        """Get customer's company name or email"""
        user = obj.design.customer
        return user.company_name or user.email
    
    def get_customer_email(self, obj):
        """Get customer's email"""
        return obj.design.customer.email
