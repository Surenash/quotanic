import logging
import uuid
import boto3 # Ensure boto3 is installed
from botocore.exceptions import ClientError
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
# from accounts.models import UserRole # If needed for role checks, though IsAuthenticated is primary here

logger = logging.getLogger(__name__)

class DesignUploadURLView(APIView):
    """
    Generates a pre-signed S3 URL for uploading a design file.
    POST /api/designs/upload-url
    Request Body: { "fileName": "part_v1.stl", "fileType": "model/stl" }
    Response: { "uploadUrl": "...", "s3Key": "..." }
    """
    permission_classes = [IsAuthenticated] # Only authenticated users (customers) can get an upload URL

    # Optional: Add role check if only 'customer' role should upload
    # def check_permissions(self, request):
    #     super().check_permissions(request)
    #     if request.user.role != UserRole.CUSTOMER:
    #         self.permission_denied(
    #             request, message="Only customers can upload designs."
    #         )

    def post(self, request, *args, **kwargs):
        file_name = request.data.get('fileName')
        file_type = request.data.get('fileType') # e.g., 'model/stl', 'application/step'

        if not file_name:
            return Response({"error": "fileName is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Sanitize file_name to prevent issues
        original_file_name_parts = file_name.split('.')
        file_extension = original_file_name_parts[-1] if len(original_file_name_parts) > 1 else ''

        # Create a unique file key
        s3_object_name = f"{settings.AWS_S3_DESIGNS_UPLOAD_PREFIX.strip('/')}/{request.user.id}/{uuid.uuid4()}.{file_extension}"

        # Check if we should use local storage instead of S3
        if settings.USE_LOCAL_STORAGE:
            # For local storage, return a local upload endpoint
            import urllib.parse
            encoded_key = urllib.parse.quote(s3_object_name)
            return Response({
                'upload_url': f'/api/designs/upload-local/?key={encoded_key}',  # Will be handled by a new view
                's3_file_key': s3_object_name,  # Keep same naming convention
                'file_name': file_name,
                'use_local': True
            }, status=status.HTTP_200_OK)

        # Otherwise use S3
        s3_params = {
            'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
            'Key': s3_object_name,
        }
        if file_type:
            s3_params['ContentType'] = file_type

        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME,
                endpoint_url=settings.AWS_S3_ENDPOINT_URL,
                config=boto3.session.Config(signature_version=settings.AWS_S3_SIGNATURE_VERSION)
            )

            presigned_url = s3_client.generate_presigned_url(
                ClientMethod='put_object',
                Params=s3_params,
                ExpiresIn=settings.AWS_S3_PRESIGNED_URL_EXPIRATION,
                HttpMethod='PUT'
            )

            return Response({
                'uploadUrl': presigned_url,
                's3Key': s3_object_name  # The key the client should use to confirm upload later
            }, status=status.HTTP_200_OK)

        except ClientError as e:
            logger.error(f"S3 ClientError generating pre-signed URL for {s3_object_name}: {e}")
            return Response({"error": "Could not generate upload URL. S3 client error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Unexpected error generating pre-signed URL for {s3_object_name}: {e}")
            # In production, avoid sending detailed internal errors to client
            return Response({"error": "An unexpected error occurred while preparing the file upload."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework.parsers import BaseParser
class RawFileUploadParser(BaseParser):
    """Plain text parser for uploading raw files."""
    media_type = '*/*'
    def parse(self, stream, media_type=None, parser_context=None):
        return stream.read()

class LocalUploadView(APIView):
    """
    PUT /api/designs/upload-local/
    Handles local file upload for development when USE_LOCAL_STORAGE is True.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [RawFileUploadParser]

    def put(self, request, *args, **kwargs):
        if not settings.USE_LOCAL_STORAGE:
            return Response({"error": "Local storage is disabled."}, status=status.HTTP_400_BAD_REQUEST)
            
        target_key = request.GET.get('key')
        if not target_key:
            return Response({"error": "key query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        from pathlib import Path
        file_path = Path(settings.MEDIA_ROOT) / target_key
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, 'wb') as f:
            f.write(request.data)
            
        return Response({"message": "File uploaded successfully"}, status=status.HTTP_200_OK)

# --- Design CRUD Views ---
from rest_framework import generics
from .models import Design
from .serializers import DesignSerializer, DesignCreateSerializer
from accounts.models import UserRole # For permission check

class IsOwnerOrAdmin(IsAuthenticated): # Or use DRF's IsAuthenticatedOrReadOnly for public GETs
    """
    Custom permission to only allow design owners or admin users to access/edit.
    For retrieve/update/delete. List might be different.
    """
    def has_object_permission(self, request, view, obj):
        # Admin users can access anything
        if request.user and request.user.is_staff:
            return True
        # Manufacturers can access designs to provide quotes
        if request.user and request.user.role == 'manufacturer':
            return True
        # Owner of the design can access
        return obj.customer == request.user

class IsCustomerUser(IsAuthenticated):
    """
    Custom permission to only allow users with 'customer' role.
    """
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in [UserRole.CUSTOMER, 'manufacturer']

class DesignListCreateView(generics.ListCreateAPIView):
    """
    POST /api/designs - Create a new design record.
    GET /api/designs - List designs for the authenticated customer.
    """
    serializer_class = DesignSerializer # Default for list
    permission_classes = [IsAuthenticated, IsCustomerUser] # Only authenticated customers

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DesignCreateSerializer
        return DesignSerializer # For GET (list)

    def get_queryset(self):
        """
        This view should only return designs for the currently authenticated user.
        """
        user = self.request.user
        if user.is_authenticated:
            # Further check if user is customer, though IsCustomerUser permission handles this.
            # If admin/staff should see all, add logic here:
            # if user.is_staff:
            #     return Design.objects.all()
            return Design.objects.filter(customer=user)
        return Design.objects.none() # Should not happen due to IsAuthenticated

    def perform_create(self, serializer):
        """
        Pass additional context (request) to the serializer if needed,
        or directly save with the customer.
        DesignCreateSerializer handles setting the customer from context.
        """
        # Handle local file storage
        if settings.USE_LOCAL_STORAGE and self.request.data.get('use_local_storage'):
            import base64
            from pathlib import Path
            
            file_data = self.request.data.get('file_data')
            file_name = self.request.data.get('file_name')
            s3_file_key = serializer.validated_data.get('s3_file_key')
            
            if file_data and s3_file_key:
                # Decode base64 file data
                # Format: "data:application/octet-stream;base64,..." or similar
                if ',' in file_data:
                    file_data = file_data.split(',')[1]  # Remove data URL prefix
                
                file_bytes = base64.b64decode(file_data)
                
                # Create full path
                file_path = Path(settings.MEDIA_ROOT) / s3_file_key
                file_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Save file
                with open(file_path, 'wb') as f:
                    f.write(file_bytes)
                
                logger.info(f"Saved local file: {file_path}")
        
        serializer.save() # customer is set in DesignCreateSerializer.create via context

class DesignDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/designs/{id} - Get a specific design.
    PUT /api/designs/{id} - Update a specific design (limited fields typically).
    PATCH /api/designs/{id} - Partially update a specific design.
    DELETE /api/designs/{id} - Delete a specific design.
    """
    # queryset = Design.objects.all() # Initial queryset, will be filtered by get_queryset
    serializer_class = DesignSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin] # IsOwnerOrAdmin handles object-level permission
    lookup_field = 'id' # Since Design model PK is 'id' (UUID)

    def get_queryset(self):
        """
        Filter designs so that users can only see/affect their own designs,
        unless they are manufacturers (who can see designs they need to quote) 
        or staff/admin. 
        """
        user = self.request.user
        if user.is_staff:
            return Design.objects.all() # Staff can see all designs
        
        if user.role == 'manufacturer':
            # For now, allow manufacturers to see all designs so they can quote.
            # In a stricter system, you'd filter by those they've received requests for.
            return Design.objects.all()
            
        # Customers can only see their own designs
        return Design.objects.filter(customer=user)

    # By default, PUT would require all fields from DesignSerializer.
    # If updates are restricted (e.g., cannot change s3_key or customer post-creation),
    # a different serializer for updates might be needed, or make fields read_only in DesignSerializer.
    # For now, DesignSerializer has many read_only fields, limiting what can be updated.
    # Deletion is allowed by IsOwnerOrAdmin.

class DesignThumbnailUpdateView(APIView):
    """
    PATCH /api/designs/{id}/thumbnail/
    Updates the thumbnail URL of a specific design.
    """
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def patch(self, request, id, *args, **kwargs):
        design = get_object_or_404(Design, id=id)

        # Allow if user is staff, the owner (customer), or a manufacturer associated with a quote for this design
        has_permission = request.user.is_staff or design.customer == request.user
        
        if not has_permission:
            # Check if this user is a manufacturer who has a quote for this design
            from quotes.models import Quote
            if Quote.objects.filter(design=design, manufacturer__user=request.user).exists():
                has_permission = True

        if not has_permission:
            return Response(
                {"error": "You do not have permission to update this design thumbnail."},
                status=status.HTTP_403_FORBIDDEN
            )

        thumbnail_url = request.data.get('thumbnail_url')
        if not thumbnail_url:
            return Response(
                {"error": "thumbnail_url is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if design.geometric_data is None:
            design.geometric_data = {}

        design.geometric_data['thumbnail_key'] = thumbnail_url
        design.save(update_fields=['geometric_data', 'updated_at'])

        return Response({"message": "Thumbnail updated successfully.", "thumbnail_key": thumbnail_url}, status=status.HTTP_200_OK)


# --- Automated Quote Generation ---
from django.db import transaction
from accounts.models import Manufacturer # Import Manufacturer model
from quotes.models import Quote # Import Quote model
from quotes.serializers import QuoteSerializer # To serialize generated quotes
from quotes.pricing import calculate_quote_price # The pricing logic
from .models import DesignStatus as DesignModelStatus # Alias to avoid clash with DRF status
from .fbm_manufacturing_intelligence import fbm_manufacturing_intelligence
from .matcher import smart_matcher


class GenerateQuotesView(APIView):
    """
    POST /api/designs/{id}/generate-quotes
    Triggers automated quote generation for a given design from all suitable manufacturers.
    """
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin] # Only design owner or admin can trigger this

    def post(self, request, id, *args, **kwargs): # 'id' is the design_id from URL
        design = get_object_or_404(Design, id=id)

        # Check object permissions using the same logic as DesignDetailView for consistency
        # This ensures the IsOwnerOrAdmin check is effectively applied before proceeding.
        # (Alternatively, could make a helper or rely on get_object_or_404 with filtered queryset)
        if not (request.user.is_staff or design.customer == request.user):
            return Response(
                {"error": "You do not have permission to generate quotes for this design."},
                status=status.HTTP_403_FORBIDDEN
            )

        if design.status != DesignModelStatus.ANALYSIS_COMPLETE:
            return Response(
                {"error": f"Design must be in '{DesignModelStatus.ANALYSIS_COMPLETE.label}' status to generate quotes. Current status: {design.get_status_display()}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not design.geometric_data:
            return Response(
                {"error": "Design geometric data is missing. Cannot generate quotes."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Direct Manufacturer Request
        requested_manufacturer_id = request.data.get('manufacturer_id')
        
        # 2. Intelligent Requirements Analysis
        requirements = fbm_manufacturing_intelligence.determine_manufacturing_requirements(
            design.geometric_data, 
            design.material, 
            design.quantity
        )
        logger.info(f"Design {design.id} Analysis Result: {requirements}")

        eligible_manufacturers_with_scores = []
        all_manufacturers = Manufacturer.objects.select_related('user').all()

        design_bbox_sorted = sorted(design.geometric_data.get('bbox_mm', [0,0,0]))
        
        logger.info(f"Checking {all_manufacturers.count()} manufacturers for design {design.id}")

        for mf_profile in all_manufacturers:
            # Skip direct flow filter if ID is provided and doesn't match
            if requested_manufacturer_id and str(mf_profile.user.id) != str(requested_manufacturer_id):
                continue
                
            capabilities = mf_profile.capabilities or {}

            # Basic Filters (Material & Size)
            # Use the new 'selected_materials' field from settings if available, else fallback to 'materials_supported'
            supported_materials = capabilities.get('selected_materials') or capabilities.get('materials_supported', [])
            
            # Flexible Material Matching (Substring)
            material_matched = False
            for m in supported_materials:
                if design.material.lower() in m.lower() or m.lower() in design.material.lower():
                    material_matched = True
                    break
            
            if not material_matched:
                logger.info(f"Mf {mf_profile.user.email} filtered out: Material {design.material} not in {supported_materials}")
                if not requested_manufacturer_id: continue

            # Size Logic (Simplified for brevity)
            # ... (Assume size logic same as before, simplified here)
            
            # --- INTELLIGENT MATCHING ---
            match_score = smart_matcher.calculate_match_score(design, requirements, mf_profile)
            logger.info(f"Mf {mf_profile.user.email} match score: {match_score}")
            
            if match_score > 20.0: # Matcher threshold
                eligible_manufacturers_with_scores.append((mf_profile, match_score))
            else:
                logger.info(f"Mf {mf_profile.user.email} filtered out: Score {match_score} below threshold 20.0")

        # Sort by Score Descending
        eligible_manufacturers_with_scores.sort(key=lambda x: x[1], reverse=True)
        
        # If Intelligent Search (no ID), take top 5
        if not requested_manufacturer_id:
            eligible_manufacturers_with_scores = eligible_manufacturers_with_scores[:5]
            
        if not eligible_manufacturers_with_scores:
            logger.warning(f"No suitable manufacturers found for design {design.id}. Check requirements vs capabilities.")
            return Response(
                {"message": "No suitable manufacturers found.", "requirements": requirements},
                status=status.HTTP_200_OK
            )

        generated_quotes = []
        errors_by_manufacturer = {}
        quotes_created_count = 0

        with transaction.atomic():
            for mf_profile, score in eligible_manufacturers_with_scores:
                # Handle internal designs: only the owner can quote it
                if getattr(design, 'is_internal', False):
                    if design.customer != mf_profile.user:
                        logger.info(f"Skipping external quote for internal design by {mf_profile.user.email}")
                        continue
                else:
                    # Skip owner for normal designs
                    if design.customer == mf_profile.user: 
                        logger.info(f"Skipping self-quote for {mf_profile.user.email}")
                        continue
                if Quote.objects.filter(design=design, manufacturer=mf_profile.user).exists(): 
                    logger.info(f"Quote already exists for {mf_profile.user.email}")
                    continue

                logger.info(f"Calculating quote for {mf_profile.user.email} (Score: {score})")
                pricing_details = calculate_quote_price(design=design, manufacturer=mf_profile)

                if pricing_details.price_usd is not None and not pricing_details.errors:
                    try:
                        import json
                        # Ensure calculation_details is properly serialized to JSON within the notes string
                        # The frontend expects "Match Score: ... Process: ... {JSON}"
                        notes_prefix = f"Match Score: {score:.1f}/100. Process: {requirements.get('primary_process', 'CNC Machining')}. "
                        
                        quote = Quote.objects.create(
                            design=design,
                            manufacturer=mf_profile.user,
                            price_usd=pricing_details.price_usd,
                            estimated_lead_time_days=pricing_details.estimated_lead_time_days,
                            notes=notes_prefix + json.dumps(pricing_details.calculation_details),
                            status='pending'
                        )
                        generated_quotes.append(quote)
                        quotes_created_count += 1
                        logger.info(f"Quote created for {mf_profile.user.email}: ${pricing_details.price_usd}")
                    except Exception as e:
                        logger.error(f"Error creating quote for {mf_profile.user.email}: {e}")
                        errors_by_manufacturer[str(mf_profile.user.id)] = str(e)
                else:
                    logger.warning(f"Pricing failed for {mf_profile.user.email}: {pricing_details.errors}")

        # Update Design Status
        if quotes_created_count > 0 and design.status == DesignModelStatus.ANALYSIS_COMPLETE:
            design.status = DesignModelStatus.QUOTED
            design.save(update_fields=['status', 'updated_at'])

        serialized_quotes = QuoteSerializer(generated_quotes, many=True).data
        return Response({
            "message": f"{quotes_created_count} quote(s) generated.", 
            "analysis": requirements,
            "generated_quotes": serialized_quotes
        }, status=status.HTTP_200_OK)


# ===================================================================
# FBM-Specific Views
# ===================================================================

class FBMAnalysisView(APIView):
    """
    GET /api/designs/{id}/fbm-analysis/
    Returns complete FBM analysis data for a design
    """
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    
    def get(self, request, id, *args, **kwargs):
        design = get_object_or_404(Design, id=id)
        
        # Check permissions
        if not (request.user.is_staff or design.customer == request.user):
            return Response(
                {"error": "You do not have permission to access this design's FBM analysis."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if design has geometric data
        if not design.geometric_data:
            return Response(
                {"error": "Design has not been analyzed yet."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if FBM data is available
        if 'fbm_features' not in design.geometric_data:
            return Response(
                {
                    "message": "FBM analysis not available for this design. Basic geometric analysis was performed instead.",
                    "analysis_engine": design.geometric_data.get('analysis_engine', 'unknown'),
                    "geometric_data": design.geometric_data
                },
                status=status.HTTP_200_OK
            )
        
        # Return FBM analysis data
        from .serializers import FBMAnalysisSerializer
        serializer = FBMAnalysisSerializer(design.geometric_data)
        
        return Response({
            "design_id": str(design.id),
            "design_name": design.design_name,
            "status": design.status,
            "fbm_analysis": serializer.data
        }, status=status.HTTP_200_OK)


class FBMFeaturesView(APIView):
    """
    GET /api/designs/{id}/fbm-features/
    Returns just the detected features from FBM analysis
    """
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    
    def get(self, request, id, *args, **kwargs):
        design = get_object_or_404(Design, id=id)
        
        # Check permissions
        if not (request.user.is_staff or design.customer == request.user):
            return Response(
                {"error": "You do not have permission to access this design's features."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get FBM features
        geometric_data = design.geometric_data or {}
        fbm_features = geometric_data.get('fbm_features', [])
        
        if not fbm_features:
            return Response(
                {
                    "message": "No FBM features available for this design.",
                    "features": []
                },
                status=status.HTTP_200_OK
            )
        
        # Serialize features
        from .serializers import FBMFeatureSerializer
        serializer = FBMFeatureSerializer(fbm_features, many=True)
        
        return Response({
            "design_id": str(design.id),
            "design_name": design.design_name,
            "total_features": len(fbm_features),
            "features": serializer.data
        }, status=status.HTTP_200_OK)


class FBMOperationsView(APIView):
    """
    GET /api/designs/{id}/fbm-operations/
    Returns machining operations from FBM analysis
    """
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    
    def get(self, request, id, *args, **kwargs):
        design = get_object_or_404(Design, id=id)
        
        # Check permissions
        if not (request.user.is_staff or design.customer == request.user):
            return Response(
                {"error": "You do not have permission to access this design's operations."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get FBM operations
        geometric_data = design.geometric_data or {}
        fbm_operations = geometric_data.get('fbm_operations', [])
        
        if not fbm_operations:
            return Response(
                {
                    "message": "No FBM operations available for this design.",
                    "operations": []
                },
                status=status.HTTP_200_OK
            )
        
        # Serialize operations
        from .serializers import FBMOperationSerializer
        serializer = FBMOperationSerializer(fbm_operations, many=True)
        
        # Calculate totals
        total_time_minutes = sum(op['estimated_time'] for op in fbm_operations)
        total_time_hours = total_time_minutes / 60.0
        
        return Response({
            "design_id": str(design.id),
            "design_name": design.design_name,
            "total_operations": len(fbm_operations),
            "total_time_minutes": round(total_time_minutes, 2),
            "total_time_hours": round(total_time_hours, 2),
            "operations": serializer.data
        }, status=status.HTTP_200_OK)


class FBMPatternsView(APIView):
    """
    GET /api/designs/{id}/fbm-patterns/
    Returns recognized patterns from FBM analysis
    """
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    
    def get(self, request, id, *args, **kwargs):
        design = get_object_or_404(Design, id=id)
        
        # Check permissions
        if not (request.user.is_staff or design.customer == request.user):
            return Response(
                {"error": "You do not have permission to access this design's patterns."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get FBM patterns
        geometric_data = design.geometric_data or {}
        fbm_patterns = geometric_data.get('fbm_patterns', [])
        
        # Serialize patterns
        from .serializers import FBMPatternSerializer
        serializer = FBMPatternSerializer(fbm_patterns, many=True)
        
        return Response({
            "design_id": str(design.id),
            "design_name": design.design_name,
            "total_patterns": len(fbm_patterns),
            "patterns": serializer.data if fbm_patterns else [],
            "optimization_opportunities": geometric_data.get('optimization_opportunities', [])
        }, status=status.HTTP_200_OK)


class FBMExportView(APIView):
    """
    GET /api/designs/{id}/fbm-export/
    Exports FBM operation sheet in structured format
    """
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    
    def get(self, request, id, *args, **kwargs):
        design = get_object_or_404(Design, id=id)
        
        # Check permissions
        if not (request.user.is_staff or design.customer == request.user):
            return Response(
                {"error": "You do not have permission to export this design's data."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get FBM data
        geometric_data = design.geometric_data or {}
        
        if 'fbm_features' not in geometric_data:
            return Response(
                {"error": "FBM analysis not available for this design."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Build export data
        export_data = {
            "design_info": {
                "id": str(design.id),
                "name": design.design_name,
                "material": design.material,
                "quantity": design.quantity,
                "status": design.get_status_display(),
            },
            "summary": geometric_data.get('fbm_summary', {}),
            "features": geometric_data.get('fbm_features', []),
            "operations": geometric_data.get('fbm_operations', []),
            "patterns": geometric_data.get('fbm_patterns', []),
            "machinability": geometric_data.get('machinability_assessment', {}),
            "manufacturing_risks": geometric_data.get('manufacturing_risks', []),
            "optimization_opportunities": geometric_data.get('optimization_opportunities', []),
            "export_timestamp": design.updated_at.isoformat() if design.updated_at else None,
        }
        
        return Response(export_data, status=status.HTTP_200_OK)


class FBMManufacturingIntelligenceView(APIView):
    """
    GET /api/designs/{id}/fbm-intelligence/
    Returns comprehensive manufacturing intelligence report
    
    This provides value-add analysis for manufacturers including:
    - Detailed tooling analysis with actual costs
    - Material-specific machining parameters
    - Optimization suggestions
    - Quality control planning
    - Manufacturing difficulty assessment
    - Cost saving opportunities
    """
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    
    def get(self, request, id, *args, **kwargs):
        design = get_object_or_404(Design, id=id)
        
        # Check permissions
        if not (request.user.is_staff or design.customer == request.user):
            return Response(
                {"error": "You do not have permission to access this design's intelligence report."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get geometric data
        geometric_data = design.geometric_data or {}
        
        # Check if manufacturing intelligence is available
        if 'manufacturing_intelligence' not in geometric_data:
            return Response(
                {
                    "error": "Manufacturing intelligence not available. FBM analysis may not have been performed.",
                    "suggestion": "Upload a STEP or IGES file for full FBM analysis."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        intelligence = geometric_data['manufacturing_intelligence']
        
        if not intelligence.get('available', False):
            return Response(
                {
                    "error": "Manufacturing intelligence could not be generated.",
                    "reason": intelligence.get('reason') or intelligence.get('error')
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Return intelligence report
        return Response({
            "design_id": str(design.id),
            "design_name": design.design_name,
            "material": design.material,
            "quantity": design.quantity,
            "intelligence_report": intelligence,
            "generated_at": design.updated_at.isoformat() if design.updated_at else None,
            
            # Quick summary for dashboard display
            "summary": {
                "total_tool_cost_estimate": intelligence.get('tool_analysis', {}).get('total_tool_cost_estimate', 0),
                "specialty_tools_count": len(intelligence.get('tool_analysis', {}).get('specialty_tools_needed', [])),
                "estimated_time_savings_percent": intelligence.get('optimization_suggestions', {}).get('estimated_total_time_savings_percent', 0),
                "manufacturing_difficulty": intelligence.get('manufacturing_difficulty', {}).get('difficulty_rating', 'Unknown'),
                "critical_dimensions_count": len(intelligence.get('quality_planning', {}).get('critical_dimensions', [])),
                "cost_saving_opportunities": len(intelligence.get('cost_opportunities', []))
            }
        }, status=status.HTTP_200_OK)



