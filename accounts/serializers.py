from decimal import Decimal, InvalidOperation # Add this import
from rest_framework import serializers
from .models import User, UserRole, Manufacturer # Added Manufacturer import
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
    company_name = serializers.CharField(source='user.company_name', read_only=True) # Assuming company name is on User model

    class Meta:
        model = Manufacturer
        fields = [
            'user_id', # This is user.pk
            'email',
            'company_name',
            'location',
            'capabilities',  # Includes general capabilities and pricing_factors
            'markup_factor', # New dedicated field for general markup
            'certifications',
            'average_rating', # Typically read-only, updated by reviews system
            'website_url',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['user_id', 'email', 'company_name', 'average_rating', 'created_at', 'updated_at']
        # `markup_factor` and `capabilities` are writable.

    def validate_markup_factor(self, value):
        if value <= 0:
            raise serializers.ValidationError("Markup factor must be a positive value (e.g., 1.0 for no markup, 1.2 for 20%).")
        return value

    def validate_capabilities(self, value):
        if value is not None:
            if not isinstance(value, dict):
                raise serializers.ValidationError("Capabilities must be a JSON object.")

            pricing_factors = value.get('pricing_factors', {})
            if not isinstance(pricing_factors, dict):
                raise serializers.ValidationError("`pricing_factors` within capabilities must be a JSON object.")

            materials_supported = value.get("materials_supported", [])
            if not isinstance(materials_supported, list):
                raise serializers.ValidationError("`materials_supported` must be a list of material names (strings).")
            if not all(isinstance(item, str) for item in materials_supported):
                raise serializers.ValidationError("All items in `materials_supported` must be strings.")

            # --- Updated pricing_factors validation ---
            material_properties = pricing_factors.get('material_properties', {})
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

            # Validate machining factors
            machining = pricing_factors.get('machining', {})
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

        # Validate 'max_size_mm' structure
        max_size_mm = value.get("max_size_mm")
        if max_size_mm is not None:
            if not isinstance(max_size_mm, list) or len(max_size_mm) != 3:
                raise serializers.ValidationError("`max_size_mm` must be a list of three numbers (e.g., [X, Y, Z]).")
            if not all(isinstance(dim, (int, float)) and dim >= 0 for dim in max_size_mm):
                raise serializers.ValidationError("All dimensions in `max_size_mm` must be non-negative numbers.")

        return value

    def validate_certifications(self, value):
        # Example validation: ensure certifications is a list of strings if provided
        if value is not None:
            if not isinstance(value, list):
                raise serializers.ValidationError("Certifications must be a list.")
            if not all(isinstance(item, str) for item in value):
                raise serializers.ValidationError("All certifications must be strings.")
        return value

    def update(self, instance, validated_data):
        # print(f"Serializer update validated_data: {validated_data}") # DEBUG: REMOVE AFTER DEBUGGING
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    def update(self, instance, validated_data):
        print(f"Serializer update validated_data: {validated_data}") # DEBUG
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
class ManufacturerPublicSerializer(serializers.ModelSerializer):
    """
    Serializer for public display of manufacturers.
    Omits sensitive or internal data.
    """
    company_name = serializers.CharField(source='user.company_name', read_only=True)
    # user_id is not exposed directly, but company_name acts as an identifier

    class Meta:
        model = Manufacturer
        fields = [
            'user_id', # Still useful as an ID for GET /api/manufacturers/{id}
            'company_name',
            'location',
            'capabilities',
            'certifications',
            'average_rating',
            'website_url',
            # 'created_at' # Maybe not for public view
        ]
        read_only_fields = fields # All fields are read-only for public view


# Modify UserSerializer to include manufacturer profile if user is a manufacturer
class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True) # Renamed from 'role' to avoid clash
    role = serializers.ChoiceField(choices=UserRole.choices, write_only=True) # Kept 'role' for writing
    manufacturer_profile = ManufacturerProfileSerializer(read_only=True, required=False)

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
        # Ensure 'role' (write field) is not in the output, use 'role_display'
        ret['role'] = instance.get_role_display() # Overwrite 'role' with display value
        if 'role_write' in ret: # remove the write only field if it was included
            del ret['role_write']

        # If user is not a manufacturer, remove manufacturer_profile
        if instance.role != UserRole.MANUFACTURER or not hasattr(instance, 'manufacturer_profile'):
            ret.pop('manufacturer_profile', None)
        return ret
