import os
from rest_framework import serializers
from .models import Design, DesignStatus
from accounts.models import UserRole # To validate user role if needed

class DesignSerializer(serializers.ModelSerializer):
    # customer = serializers.PrimaryKeyRelatedField(read_only=True) # Or SlugRelatedField for username
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    view_url = serializers.SerializerMethodField()

    class Meta:
        model = Design
        fields = [
            'id',
            'customer', # FK, writeable for association, but usually set from request.user
            'customer_email', # Read-only display
            'design_name',
            's3_file_key',
            'material',
            'quantity',
            'manufacturing_process',
            'surface_finish',
            'tolerances',
            'post_processing',
            'additional_instructions',
            'required_certifications',
            'shipping_destination',
            'target_price',
            'supporting_files',
            'urgency',
            'packaging_requirements',
            'inspection_requirements',
            'requires_engineering_review',
            'status',         # Writeable for admin/internal updates if needed, otherwise read_only post-creation
            'status_display', # Read-only display
            'view_url',
            'geometric_data', # Typically read-only, populated by backend analysis
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id', 'customer_email', 'status_display', 'view_url',
            'geometric_data', 'created_at', 'updated_at'
        ]

    def get_view_url(self, obj):
        \"\"\"
        Returns the URL for the 3D viewer.
        If it's an STL, returns the original file.
        If it's STEP/IGES, returns the generated GLB if available.
        \"\"\"
        from django.conf import settings
        
        # Get base media URL
        media_url = settings.MEDIA_URL
        # Ensure it's absolute if needed (or let the frontend handle relative)
        
        file_key = obj.s3_file_key
        file_ext = os.path.splitext(file_key)[1].lower()
        
        # Default to original file for STL
        target_key = file_key
        
        # Use GLB for STEP/IGES if analysis is complete
        if file_ext in ['.step', '.stp', '.iges', '.igs']:
            if obj.geometric_data and 'glb_file_key' in obj.geometric_data:
                target_key = obj.geometric_data['glb_file_key']
        
        if settings.USE_LOCAL_STORAGE:
            return f\"{media_url}{target_key}\"
        else:
            # Generate pre-signed S3 URL
            import boto3
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME,
                endpoint_url=settings.AWS_S3_ENDPOINT_URL
            )
            try:
                url = s3_client.generate_presigned_url(
                    ClientMethod='get_object',
                    Params={
                        'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                        'Key': target_key
                    },
                    ExpiresIn=3600
                )
                return url
            except Exception:
                return None

    def validate_customer(self, value):
        """
        Ensure the customer has the 'customer' role.
        This validation is good if 'customer' field is part of request data.
        If set from request.user, this specific validation might be redundant here
        but good for direct serializer usage.
        """
        if value.role != UserRole.CUSTOMER:
            raise serializers.ValidationError("Only users with the 'customer' role can own designs.")
        return value

    def validate_s3_file_key(self, value):
        """
        Basic validation for s3_file_key.
        Can be expanded to check format or if it belongs to the user's "folder" on S3.
        """
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("s3_file_key cannot be empty.")
        # Example: check if it starts with the expected prefix pattern
        # from django.conf import settings
        # expected_prefix = f"{settings.AWS_S3_DESIGNS_UPLOAD_PREFIX.strip('/')}/{self.context['request'].user.id}/"
        # if not value.startswith(expected_prefix):
        #     raise serializers.ValidationError("Invalid s3_file_key format or prefix mismatch.")
        return value

    def create(self, validated_data):
        """
        Override create to set customer from the request context if not provided,
        and to ensure status is 'pending_analysis' on creation.
        """
        # Set customer from the currently authenticated user making the request
        # This assumes 'request' is in the serializer context
        if 'request' in self.context and not validated_data.get('customer'):
            validated_data['customer'] = self.context['request'].user

        # Ensure the user being associated is indeed a customer
        # (even if set from context, double check role)
        user = validated_data.get('customer')
        if user and user.role != UserRole.CUSTOMER:
             raise serializers.ValidationError({
                 "customer": "Designs can only be associated with users having the 'customer' role."
             })

        # Set initial status
        validated_data['status'] = DesignStatus.PENDING_ANALYSIS

        # Geometric data should not be settable at creation via this serializer by client
        validated_data.pop('geometric_data', None)

        return super().create(validated_data)

class DesignCreateSerializer(serializers.ModelSerializer):
    """
    Serializer specifically for creating a new Design record after file upload.
    The client provides s3Key, designName, material, quantity.
    Customer is set from the authenticated user.
    Status defaults to 'pending_analysis'.
    """
    class Meta:
        model = Design
        fields = [
            'id', # Add id to be included in the response after creation
            'design_name',
            's3_file_key',
            'material',
            'quantity',
        ]
        read_only_fields = ['id'] # id is read-only, generated by the backend
        # s3_file_key is provided by the client after successful S3 upload.

    def validate_s3_file_key(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("s3_file_key cannot be empty and must be provided.")
        # Add more sophisticated validation if needed, e.g., check expected path structure
        # for the current user (requires access to request.user from context)
        # user = self.context['request'].user
        # expected_prefix = f"{settings.AWS_S3_DESIGNS_UPLOAD_PREFIX.strip('/')}/{user.id}/"
        # if not value.startswith(expected_prefix):
        #     raise serializers.ValidationError("s3_file_key does not match expected user path.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        if user.role != UserRole.CUSTOMER:
            raise serializers.ValidationError("Only customers can create designs.")

        design = Design.objects.create(
            customer=user,
            status=DesignStatus.PENDING_ANALYSIS, # Default status
            **validated_data
        )

        # Trigger Celery task for CAD analysis
        from .tasks import analyze_cad_file # Import task here to avoid circular dependency issues at module level
        analyze_cad_file.delay(design.id)

        return design


# ===================================================================
# FBM-Specific Serializers
# ===================================================================

class FBMFeatureSerializer(serializers.Serializer):
    """Serializer for FBM detected features"""
    feature_id = serializers.IntegerField()
    feature_type = serializers.CharField()
    diameter = serializers.FloatField(allow_null=True, required=False)
    depth = serializers.FloatField(allow_null=True, required=False)
    width = serializers.FloatField(allow_null=True, required=False)
    length = serializers.FloatField(allow_null=True, required=False)
    area = serializers.FloatField(allow_null=True, required=False)
    volume = serializers.FloatField(allow_null=True, required=False)
    orientation = serializers.CharField(allow_null=True, required=False)
    accessibility = serializers.CharField(allow_null=True, required=False)
    surface_finish_required = serializers.CharField(allow_null=True, required=False)
    tolerance = serializers.CharField(allow_null=True, required=False)
    confidence_score = serializers.FloatField(required=False)
    complexity_rating = serializers.IntegerField(required=False)
    manufacturing_notes = serializers.ListField(child=serializers.CharField(), required=False)
    alternative_strategies = serializers.ListField(child=serializers.CharField(), required=False)
    risk_factors = serializers.ListField(child=serializers.CharField(), required=False)
    pattern_id = serializers.IntegerField(allow_null=True, required=False)
    # Thread-specific
    thread_pitch = serializers.FloatField(required=False)
    thread_type = serializers.CharField(required=False)
    # Counterbore/countersink
    shoulder_diameter = serializers.FloatField(required=False)
    shoulder_depth = serializers.FloatField(required=False)
    sink_angle = serializers.FloatField(required=False)
    # Boss/protrusion
    height = serializers.FloatField(required=False)


class FBMOperationSerializer(serializers.Serializer):
    """Serializer for FBM machining operations"""
    operation_id = serializers.IntegerField()
    operation_name = serializers.CharField()
    strategy = serializers.CharField()
    tool_type = serializers.CharField()
    tool_diameter = serializers.FloatField()
    cutting_speed = serializers.FloatField()
    feed_rate = serializers.FloatField()
    spindle_speed = serializers.IntegerField()
    depth_of_cut = serializers.FloatField()
    stepover = serializers.FloatField()
    number_of_passes = serializers.IntegerField()
    estimated_time = serializers.FloatField()  # in minutes
    setup_required = serializers.IntegerField()
    priority = serializers.IntegerField()
    coolant = serializers.CharField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)


class FBMPatternSerializer(serializers.Serializer):
    """Serializer for FBM recognized patterns"""
    pattern_type = serializers.CharField()
    feature_ids = serializers.ListField(child=serializers.IntegerField())
    pattern_count = serializers.IntegerField()
    spacing = serializers.FloatField(allow_null=True, required=False)
    confidence = serializers.FloatField()
    center = serializers.ListField(child=serializers.FloatField(), required=False, allow_null=True)
    direction = serializers.ListField(child=serializers.FloatField(), required=False)
    radius = serializers.FloatField(required=False)
    angle_step = serializers.FloatField(required=False)


class FBMAnalysisSerializer(serializers.Serializer):
    """Serializer for complete FBM analysis data"""
    # Basic geometric data
    volume_cm3 = serializers.FloatField()
    bbox_mm = serializers.ListField(child=serializers.FloatField())
    surface_area_cm2 = serializers.FloatField()
    complexity_score = serializers.FloatField()
    analysis_engine = serializers.CharField()
    
    # FBM-specific data
    fbm_features = FBMFeatureSerializer(many=True, required=False)
    fbm_operations = FBMOperationSerializer(many=True, required=False)
    fbm_patterns = FBMPatternSerializer(many=True, required=False)
    
    # Manufacturing intelligence
    feature_types_detected = serializers.ListField(child=serializers.CharField(), required=False)
    has_advanced_features = serializers.BooleanField(required=False)
    manufacturing_risks = serializers.ListField(child=serializers.CharField(), required=False)
    
    # Summary
    fbm_summary = serializers.DictField(required=False)
    machinability_assessment = serializers.DictField(required=False)
    optimization_opportunities = serializers.ListField(child=serializers.DictField(), required=False)
