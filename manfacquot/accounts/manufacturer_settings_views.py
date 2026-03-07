from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.models import Manufacturer


def get_default_settings():
    """Returns default settings structure for manufacturer pricing"""
    return {
        'pricing_factors': {
            'material_properties': {
                'Aluminum': {'density_g_cm3': 2.7, 'cost_usd_kg': 4.0},
                'Aluminum 6061': {'density_g_cm3': 2.7, 'cost_usd_kg': 4.5},
                'Aluminum 7075': {'density_g_cm3': 2.81, 'cost_usd_kg': 6.0},
                'Steel': {'density_g_cm3': 7.85, 'cost_usd_kg': 2.0},
                'Stainless Steel 304': {'density_g_cm3': 8.0, 'cost_usd_kg': 5.0},
                'Stainless Steel 316': {'density_g_cm3': 8.0, 'cost_usd_kg': 6.5},
                'Titanium': {'density_g_cm3': 4.5, 'cost_usd_kg': 40.0},
                'Brass': {'density_g_cm3': 8.5, 'cost_usd_kg': 8.0},
                'Copper': {'density_g_cm3': 8.96, 'cost_usd_kg': 10.0}
            },
            'machining': {
                'machining_rate_usd_min': 1.5,
                'setup_fee_usd': 150.0,
                'base_run_cost_unit': 5.0,
                'material_removal_rate_cm3_min': 20.0,
                '5_axis_multiplier': 2.0
            },
            'labor': {
                'skilled_rate_hourly': 25.0,
                'efficiency_factor': 1.0
            },
            'overheads': {
                'rate_percent': 0.20
            },
            'material_factors': {
                'scrap_rate_percent': 0.10,
                'yield_rate_percent': 0.95
            },
            'tooling': {
                'custom_tooling_cost_usd': 0.0,
                'amortize': True
            },
            'engineering': {
                'review_fee_usd': 50.0
            },
            'qc': {
                'inspection_costs': {
                    'cmm': 50.0,
                    'material_cert': 25.0,
                    'dimensional': 30.0
                }
            },
            'packaging': {
                'standard_cost_unit': 2.0,
                'custom_cost_unit': 5.0,
                'export_cost_unit': 10.0
            },
            'logistics': {
                'base_fee_usd': 50.0,
                'cost_per_kg': 2.0
            },
            'risk_contingency': {
                'rate_percent': 0.05
            },
            'profit_margin': {
                'rate_percent': 0.25
            },
            'urgency_premium': {
                'rate_percent': 0.20
            },
            'terms': {
                'validity_days': 30,
                'payment_terms': 'Net 30'
            },
            'finishing': {},
            'estimated_lead_time_base_days': 14
        },
        'processes': ['milling_3_axis'],
        'materials_supported': [
            'Aluminum',
            'Aluminum 6061', 
            'Aluminum 7075',
            'Steel',
            'Stainless Steel 304',
            'Stainless Steel 316',
            'Titanium',
            'Brass',
            'Copper'
        ]
    }


class ManufacturerSettingsView(APIView):
    """
    GET: Retrieve manufacturer settings
    PUT: Update manufacturer settings
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current manufacturer settings"""
        try:
            manufacturer = Manufacturer.objects.get(user=request.user)
            capabilities = manufacturer.capabilities or {}
            
            # If no settings exist, return defaults
            if not capabilities:
                capabilities = get_default_settings()
                
            return Response({
                'capabilities': capabilities,
                'company_name': manufacturer.user.company_name or '',
                'location': manufacturer.location or '',
                'about': manufacturer.about or ''
            }, status=status.HTTP_200_OK)
            
        except Manufacturer.DoesNotExist:
            return Response(
                {'error': 'Manufacturer profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request):
        """Update manufacturer settings"""
        try:
            manufacturer = Manufacturer.objects.get(user=request.user)
            data = request.data
            
            # 1. Update capabilities (JSON field)
            if 'capabilities' in data:
                # Merge logic: if we only send part of capabilities, keep the rest
                current_caps = manufacturer.capabilities or get_default_settings()
                new_caps = data['capabilities']
                
                # Deep update for pricing_factors if present
                if 'pricing_factors' in new_caps and 'pricing_factors' in current_caps:
                    current_caps['pricing_factors'].update(new_caps['pricing_factors'])
                    del new_caps['pricing_factors']
                
                current_caps.update(new_caps)
                manufacturer.capabilities = current_caps
            
            # 2. Update core Manufacturer fields
            if 'location' in data:
                manufacturer.location = data['location']
            if 'about' in data:
                manufacturer.about = data['about']
            if 'experience_years' in data:
                manufacturer.experience_years = data.get('experience_years')
            
            # 3. Update related User fields (Company Name)
            user = manufacturer.user
            if 'company_name' in data:
                user.company_name = data['company_name']
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            user.save()
            
            manufacturer.save()
            
            return Response({
                'message': 'Settings updated successfully',
                'capabilities': manufacturer.capabilities,
                'company_name': user.company_name,
                'location': manufacturer.location
            }, status=status.HTTP_200_OK)
            
        except Manufacturer.DoesNotExist:
            return Response(
                {'error': 'Manufacturer profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to update settings: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ManufacturerSettingsResetView(APIView):
    """POST: Reset settings to defaults"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Reset manufacturer settings to defaults"""
        try:
            manufacturer = Manufacturer.objects.get(user=request.user)
            manufacturer.capabilities = get_default_settings()
            manufacturer.save()
            
            return Response({
                'message': 'Settings reset to defaults successfully',
                'capabilities': manufacturer.capabilities
            }, status=status.HTTP_200_OK)
            
        except Manufacturer.DoesNotExist:
            return Response(
                {'error': 'Manufacturer profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
