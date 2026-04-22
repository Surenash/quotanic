from decimal import Decimal, InvalidOperation # Add this import
from rest_framework import serializers
from .models import User, Manufacturer # Added Manufacturer import
from .constants import UserRole
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError # Renamed to avoid clash

class UserSerializer(serializers.ModelSerializer):
    # Make role human-readable for GET, but allow setting by enum value for POST/PUT
    role = serializers.ChoiceField(choices=UserRole.choices, source='get_role_display', read_only=True)
    role_write = serializers.ChoiceField(choices=UserRole.choices, write_only=True, source='role')

    class Meta:
        model = User
        fields = ['id', 'email', 'company_name', 'role', 'role_write', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'role']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")
    role = serializers.ChoiceField(choices=UserRole.choices, required=True)

    class Meta:
        model = User
        fields = ('email', 'company_name', 'password', 'password2', 'role')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        # Remove password2 as it's not part of the User model
        attrs.pop('password2')

        # Validate email uniqueness explicitly here, although model's unique=True also handles it at DB level
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})

        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            company_name=validated_data.get('company_name'), # .get() for optional field
            role=validated_data['role']
        )
        # If the user is a manufacturer, create an empty Manufacturer profile
        if user.role == UserRole.MANUFACTURER:
            # Manufacturer is now imported at the top of the file
            Manufacturer.objects.create(user=user)
        return user


class ManufacturerProfileSerializer(serializers.ModelSerializer):
    # user_id is the PK of Manufacturer model, which is user.id
    # We can expose some user details if needed, e.g. email or company_name
    email = serializers.EmailField(source='user.email', read_only=True)
    # Use source for company_name to correctly retrieve it from the User model
    company_name = serializers.CharField(source='user.company_name', read_only=True) 
    
    # Frontend aliases mapped to backend fields
    website = serializers.URLField(source='website_url', required=False, allow_blank=True)
    logoUrl = serializers.CharField(source='logo_url', required=False, allow_blank=True)
    backgroundUrl = serializers.CharField(source='background_url', required=False, allow_blank=True)
    portfolio = serializers.JSONField(source='portfolio_data', required=False)

    class Meta:
        model = Manufacturer
        fields = [
            'user_id', # This is user.pk
            'email',
            'company_name',
            'location',
            'about',
            'website_url',
            
            # Explicitly include the alias fields declared above
            'website',
            'logoUrl',
            'backgroundUrl',
            'portfolio',
            
            # Image fields (mapped to model fields)
            'logo_url',
            'background_url',
            'portfolio_data',
            
            'capabilities',  # Includes general capabilities and pricing_factors
            'markup_factor', # New dedicated field for general markup
            'certifications',
            'average_rating', # Typically read-only, updated by reviews system
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['user_id', 'email', 'average_rating', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        # company_name and user data are now read-only or handled during registration
        validated_data.pop('user', None)
        
        # Handle capabilities - ensure it's properly stored
        if 'capabilities' in validated_data:
            capabilities = validated_data['capabilities']
            # Store the capabilities as-is (it's already validated)
            instance.capabilities = capabilities
            validated_data.pop('capabilities')  # Remove so we manually set it
        
        # Update remaining Manufacturer model fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Ensure company_name is explicitly added from the User model if it's missing
        if 'company_name' not in ret or not ret['company_name']:
            if instance.user and hasattr(instance.user, 'company_name'):
                ret['company_name'] = instance.user.company_name
        return ret

    def validate_markup_factor(self, value):
        if value <= 0:
            raise serializers.ValidationError("Markup factor must be a positive value (e.g., 1.0 for no markup, 1.2 for 20%).")
        return value

    def validate_capabilities(self, value):
        if value is not None:
            if not isinstance(value, dict):
                raise serializers.ValidationError("Capabilities must be a JSON object.")

            pricing_factors = value.get('pricing_factors', {})
            
            # Only validate pricing_factors if they are provided (not required during signup)
            if pricing_factors and isinstance(pricing_factors, dict):
                # Validate pricing_factors structure only if present
                materials_supported = value.get("materials_supported", [])
                if not isinstance(materials_supported, list):
                    raise serializers.ValidationError("`materials_supported` must be a list of material names (strings).")
                if not all(isinstance(item, str) for item in materials_supported):
                    raise serializers.ValidationError("All items in `materials_supported` must be strings.")

                # --- Optional pricing_factors validation (only if provided) ---
                material_properties = pricing_factors.get('material_properties', {})
                if material_properties:  # Only validate if material_properties exist
                    if not isinstance(material_properties, dict):
                        raise serializers.ValidationError("`material_properties` in pricing_factors must be a JSON object.")

                    # Ensure all 'materials_supported' have entries in 'material_properties'
                    for supported_material in materials_supported:
                        if supported_material not in material_properties:
                            raise serializers.ValidationError(
                                f"Material '{supported_material}' is listed in 'materials_supported' but lacks pricing data in 'pricing_factors.material_properties'."
                            )
                        
                        mat_props = material_properties[supported_material]
                        if not isinstance(mat_props, dict):
                            raise serializers.ValidationError(f"Pricing data for '{supported_material}' must be a JSON object.")
                        
                        # Validate density and cost
                        if 'density_g_cm3' not in mat_props:
                            raise serializers.ValidationError(f"Density for material '{supported_material}' is missing.")
                        if 'cost_usd_kg' not in mat_props:
                            raise serializers.ValidationError(f"Cost per kg for material '{supported_material}' is missing.")
                        
                        try:
                            density = float(mat_props['density_g_cm3'])
                            cost = float(mat_props['cost_usd_kg'])
                            if density <= 0:
                                 raise serializers.ValidationError(f"Density for material '{supported_material}' must be a positive number.")
                            if cost < 0:
                                 raise serializers.ValidationError(f"Cost per kg for material '{supported_material}' must be a non-negative number.")
                        except (ValueError, TypeError):
                            raise serializers.ValidationError(f"Density and cost for material '{supported_material}' must be valid numbers.")

                # Validate machining factors (only if provided)
                machining = pricing_factors.get('machining', {})
                if machining:  # Only validate if machining data exists
                    if not isinstance(machining, dict):
                        raise serializers.ValidationError("`machining` in pricing_factors must be a JSON object.")
                    
                    for key in ['base_time_cost_unit', 'time_multiplier_complexity_cost_unit']:
                        if key not in machining:
                             raise serializers.ValidationError(f"Pricing factor '{key}' is missing from 'pricing_factors.machining'.")
                        try:
                            val = float(machining[key])
                            if val < 0:
                                raise serializers.ValidationError(f"`{key}` in machining factors must be a non-negative number.")
                        except (ValueError, TypeError):
                             raise serializers.ValidationError(f"`{key}` in machining factors must be a valid number.")
            else:
                # No pricing_factors provided, just validate materials_supported format
                materials_supported = value.get("materials_supported", [])
                if materials_supported:
                    if not isinstance(materials_supported, list):
                        raise serializers.ValidationError("`materials_supported` must be a list of material names (strings).")
                    if not all(isinstance(item, str) for item in materials_supported):
                        raise serializers.ValidationError("All items in `materials_supported` must be strings.")

        # Validate 'max_size_mm' structure
        if value:
            max_size_mm = value.get("max_size_mm")
            if max_size_mm is not None:
                if not isinstance(max_size_mm, list) or len(max_size_mm) != 3:
                    raise serializers.ValidationError("`max_size_mm` must be a list of three numbers (e.g., [X, Y, Z]).")
                # Allow None values in max_size_mm
                if not all((dim is None or (isinstance(dim, (int, float)) and dim >= 0)) for dim in max_size_mm):
                    raise serializers.ValidationError("All dimensions in `max_size_mm` must be non-negative numbers or None.")

        return value


    def validate_certifications(self, value):
        # Example validation: ensure certifications is a list of strings if provided
        if value is not None:
            if not isinstance(value, list):
                raise serializers.ValidationError("Certifications must be a list.")
            if not all(isinstance(item, str) for item in value):
                raise serializers.ValidationError("All certifications must be strings.")
        return value

class ManufacturerPublicSerializer(serializers.ModelSerializer):
    """
    Serializer for public display of manufacturers.
    Omits sensitive or internal data.
    """
    company_name = serializers.CharField(source='user.company_name', read_only=True)
    # user_id is not exposed directly, but company_name acts as an identifier

    company_name = serializers.CharField(source='user.company_name', read_only=True)
    # Map user_id to id for frontend compatibility
    id = serializers.UUIDField(source='user_id', read_only=True)
    # Map average_rating to rating for frontend
    rating = serializers.DecimalField(source='average_rating', max_digits=2, decimal_places=1, read_only=True)
    
    # Safe list fields
    capabilities = serializers.SerializerMethodField()
    certifications = serializers.SerializerMethodField()

    # Map backend fields to frontend-expected names
    logoUrl = serializers.CharField(source='logo_url', read_only=True)
    backgroundUrl = serializers.CharField(source='background_url', read_only=True)
    portfolio = serializers.JSONField(source='portfolio_data', read_only=True)
    
    # Placeholder fields (reviews/equipment still computed/placeholder for now)
    reviews = serializers.SerializerMethodField()
    equipment = serializers.SerializerMethodField()
    qualityControl = serializers.SerializerMethodField()

    class Meta:
        model = Manufacturer
        fields = [
            'id',
            'user_id', # Keep for backward compat if needed
            'company_name',
            'location',
            'capabilities',
            'certifications',
            'rating',
            'average_rating',
            'website_url',
            'logoUrl',
            'backgroundUrl',
            'about',
            'portfolio',
            'reviews',
            'equipment',
            'qualityControl',
        ]
        read_only_fields = fields # All fields are read-only for public view

    def get_capabilities(self, obj):
        if not obj.capabilities:
            return []
        if isinstance(obj.capabilities, dict):
            # Aggregate all list-based capabilities into a single flat list for the frontend
            all_caps = []
            
            # Add general processes
            all_caps.extend(obj.capabilities.get('processes', []))
            
            # Add materials
            all_caps.extend(obj.capabilities.get('materials_supported', []))
            
            # Add specific capabilities from all manufacturing process sub-groups
            # These keys match what the frontend sends (converted from group titles)
            sub_groups = [
                'machining',  # Machining
                'sheetmetal',  # Sheet Metal
                'casting',  # Casting
                'forging',  # Forging
                'injectionmolding',  # Injection Molding
                '3dprinting',  # 3D Printing
                'weldingandjoining',  # Welding & Joining
                # Legacy keys for backward compatibility
                'cnc_machining', 'three_d_printing', 'experimentation', 
                'injection_molding', 'sheet_metal_fabrication', 
                'vacuum_casting', 'finishing_services'
            ]
            
            for group in sub_groups:
                vals = obj.capabilities.get(group, [])
                if isinstance(vals, list):
                    all_caps.extend(vals)
            
            # Remove duplicates and return
            return list(set(all_caps))
            
        if isinstance(obj.capabilities, list):
            return obj.capabilities
        return []

    def get_certifications(self, obj):
        if not obj.certifications:
            return []
        if isinstance(obj.certifications, list):
            return obj.certifications
        return []

    def get_logoUrl(self, obj):
        return "https://via.placeholder.com/150"
        
    def get_backgroundUrl(self, obj):
        return "https://via.placeholder.com/800x400"

    def get_portfolio(self, obj):
        return []

    def get_reviews(self, obj):
        return []

    def get_equipment(self, obj):
        """Extract equipment list from capabilities.material_testing field"""
        if not obj.capabilities or not isinstance(obj.capabilities, dict):
            return []
        
        material_testing = obj.capabilities.get('material_testing', '')
        if not material_testing:
            return []
        
        # Split by newlines or commas and clean up
        equipment_list = []
        for line in material_testing.replace(',', '\n').split('\n'):
            line = line.strip()
            if line:
                equipment_list.append(line)
        
        return equipment_list

    def get_qualityControl(self, obj):
        """Extract quality control processes from capabilities.quality_control field"""
        if not obj.capabilities or not isinstance(obj.capabilities, dict):
            return None
        
        return obj.capabilities.get('quality_control', None)


# Modify UserSerializer to include manufacturer profile if user is a manufacturer
class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True) # Renamed from 'role' to avoid clash
    role = serializers.ChoiceField(choices=UserRole.choices, write_only=True) # Kept 'role' for writing
    manufacturer_profile = ManufacturerProfileSerializer(read_only=True, required=False)
    company_name = serializers.CharField(required=False, allow_blank=True) # Ensure it's explicitly included

    class Meta:
        model = User
        fields = [
            'id', 'email', 'company_name',
            'role', 'role_display', # Use 'role' for write, 'role_display' for read
            'manufacturer_profile',
            'created_at', 'updated_at', 'is_active', 'is_staff'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'role_display', 'manufacturer_profile', 'is_active', 'is_staff']

    def to_representation(self, instance):
        """
        Customize representation to conditionally show 'role' or 'role_display'.
        And ensure 'role' (writable field) is not in output.
        """
        ret = super().to_representation(instance)
        # Return actual role value (lowercase) instead of display value
        ret['role'] = instance.role  # Returns 'customer' or 'manufacturer'
        if 'role_write' in ret: # remove the write only field if it was included
            del ret['role_write']

        # If user is not a manufacturer, remove manufacturer_profile
        if instance.role != UserRole.MANUFACTURER or not hasattr(instance, 'manufacturer_profile'):
            ret.pop('manufacturer_profile', None)
        return ret
