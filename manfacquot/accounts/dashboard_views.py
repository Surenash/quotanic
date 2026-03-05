"""
Manufacturer Dashboard Stats API
GET /api/manufacturers/dashboard/stats/
Returns real-time statistics for the authenticated manufacturer
"""
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Avg, Count, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class ManufacturerDashboardStatsView(APIView):
    """
    GET /api/manufacturers/dashboard/stats/
    Returns dashboard statistics for the authenticated manufacturer
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            logger.info(f"Dashboard stats requested by user: {request.user.email}")
            user = request.user
            
            # Ensure user is a manufacturer
            if user.role != 'manufacturer':
                logger.warning(f"Non-manufacturer user {user.email} tried to access dashboard")
                return Response({'error': 'User is not a manufacturer'}, status=403)
            
            # Get manufacturer profile
            try:
                manufacturer = user.manufacturer_profile
                logger.info(f"Found manufacturer profile for {user.email}")
            except Exception as e:
                logger.error(f"Manufacturer profile not found for {user.email}: {e}")
                return Response({'error': 'Manufacturer profile not found'}, status=404)
            
            # Gracefully handle missing models
            try:
                from quotes.models import Quote
                quote_model_exists = True
            except (ImportError, LookupError):
                quote_model_exists = False
            
            try:
                from orders.models import Order
                order_model_exists = True
            except (ImportError, LookupError):
                order_model_exists = False
            
            # --- Quote Statistics ---
            quote_funnel = {
                'total': 0, 'pending': 0, 'accepted': 0, 'rejected': 0, 'expired': 0
            }
            top_materials = []
            
            if quote_model_exists:
                user_quotes = Quote.objects.filter(manufacturer=user)
                total_quotes = user_quotes.count()
                pending_quotes = user_quotes.filter(status='pending').count()
                
                # Funnel data
                quote_counts = user_quotes.values('status').annotate(count=Count('id'))
                for q in quote_counts:
                    if q['status'] in quote_funnel:
                        quote_funnel[q['status']] = q['count']
                quote_funnel['total'] = total_quotes
                
                # Material breakdown (from related Design)
                materials = user_quotes.values('design__material').annotate(
                    count=Count('id')
                ).order_by('-count')[:5]
                top_materials = [{'material': m['design__material'], 'count': m['count']} for m in materials if m['design__material']]
                
                # Average response time (hours) - skip if field doesn't exist
                avg_response_hours = 0
                
                # Acceptance rate
                acceptance_rate = 0
                if total_quotes > 0:
                    acceptance_rate = int((quote_funnel['accepted'] / total_quotes) * 100)
            else:
                total_quotes = 0
                pending_quotes = 0
                avg_response_hours = 0
                acceptance_rate = 0
            
            # --- Order Statistics ---
            order_breakdown = {
                'pending_payment': 0, 'in_production': 0, 'shipped': 0, 'completed': 0, 'cancelled': 0
            }
            revenue_trend = []
            
            if order_model_exists:
                user_orders = Order.objects.filter(manufacturer=user)
                
                # Active/completed general counts
                active_orders = user_orders.filter(status__in=['in_production', 'processing']).count()
                completed_orders = user_orders.filter(status='completed').count()
                
                # Detailed breakdown
                order_counts = user_orders.values('status').annotate(count=Count('id'))
                for o in order_counts:
                    status = o['status']
                    if status in order_breakdown:
                        order_breakdown[status] = o['count']
                    elif status.startswith('cancelled'):
                        order_breakdown['cancelled'] += o['count']
                    elif status in ['pending_manuf_confirm', 'processing']:
                        order_breakdown['in_production'] += o['count']
                
                # Revenue calculation (this month)
                this_month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0)
                monthly_revenue = user_orders.filter(
                    status='completed',
                    updated_at__gte=this_month_start
                ).aggregate(total=Sum('order_total_price_usd'))['total'] or Decimal('0.00')
                
                # Total revenue (all time)
                total_revenue = user_orders.filter(
                    status='completed'
                ).aggregate(total=Sum('order_total_price_usd'))['total'] or Decimal('0.00')
                
                # Revenue trend (last 6 months)
                today = timezone.now()
                for i in range(5, -1, -1):
                    # Calculate start and end of the target month
                    target_month = (today.month - i - 1) % 12 + 1
                    target_year = today.year + ((today.month - i - 1) // 12)
                    
                    month_start = today.replace(year=target_year, month=target_month, day=1, hour=0, minute=0, second=0, microsecond=0)
                    if target_month == 12:
                        month_end = month_start.replace(year=target_year + 1, month=1)
                    else:
                        month_end = month_start.replace(month=target_month + 1)
                        
                    month_revenue = user_orders.filter(
                        status='completed',
                        updated_at__gte=month_start,
                        updated_at__lt=month_end
                    ).aggregate(total=Sum('order_total_price_usd'))['total'] or Decimal('0.00')
                    
                    revenue_trend.append({
                        'month': month_start.strftime('%b'),
                        'revenue': float(month_revenue)
                    })
                    
                # New Metric: Top Customers
                # Group by customer company name and sum revenue
                top_customers_query = user_orders.filter(status='completed') \
                    .values('customer__company_name') \
                    .annotate(total_spend=Sum('order_total_price_usd')) \
                    .order_by('-total_spend')[:5]
                top_customers = [{'name': c['customer__company_name'], 'spend': float(c['total_spend'])} for c in top_customers_query if c['customer__company_name']]
                
                # New Metric: Upcoming Deadlines
                # Active orders sorted by estimated_delivery_date
                now_date = timezone.now().date()
                upcoming_deadlines_query = user_orders.filter(
                    status__in=['in_production', 'processing'],
                    estimated_delivery_date__isnull=False
                ).order_by('estimated_delivery_date')[:5]
                
                upcoming_deadlines = []
                for order in upcoming_deadlines_query:
                    days_remaining = (order.estimated_delivery_date - now_date).days
                    upcoming_deadlines.append({
                        'id': str(order.id)[:8],
                        'design_name': order.design.design_name if order.design else 'Unknown Part',
                        'date': order.estimated_delivery_date.strftime('%b %d, %Y'),
                        'days_remaining': days_remaining
                    })
                    
                # New Metric: On-Time Delivery Rate
                # Completed orders where actual_ship_date <= estimated_delivery_date
                completed_shipped = user_orders.filter(
                    status='completed',
                    actual_ship_date__isnull=False,
                    estimated_delivery_date__isnull=False
                )
                total_shipped_count = completed_shipped.count()
                
                if total_shipped_count > 0:
                    from django.db.models import F
                    on_time_count = completed_shipped.filter(actual_ship_date__lte=F('estimated_delivery_date')).count()
                    on_time_delivery_rate = int((on_time_count / total_shipped_count) * 100)
                else:
                    on_time_delivery_rate = 100 # Default if no data
                    
            else:
                active_orders = 0
                completed_orders = 0
                monthly_revenue = Decimal('0.00')
                total_revenue = Decimal('0.00')
                top_customers = []
                upcoming_deadlines = []
                on_time_delivery_rate = 100
            
            # --- Profile completeness ---
            profile_fields = {
                'location': manufacturer.location,
                'website_url': manufacturer.website_url,
                'certifications': manufacturer.certifications,
                'capabilities': manufacturer.capabilities,
            }
            
            filled_fields = sum(1 for v in profile_fields.values() if v)
            total_fields = len(profile_fields)
            profile_completeness = int((filled_fields / total_fields) * 100) if total_fields > 0 else 0
            
            return Response({
                'total_quotes': total_quotes,
                'pending_quotes': pending_quotes,
                'active_orders': active_orders,
                'completed_orders': completed_orders,
                'monthly_revenue': float(monthly_revenue),
                'total_revenue': float(total_revenue),
                'avg_response_time_hours': round(avg_response_hours, 1),
                'profile_completeness': profile_completeness,
                'acceptance_rate': acceptance_rate,
                'rating': float(manufacturer.average_rating) if manufacturer.average_rating else 0.0,
                # New enhanced data
                'quote_funnel': quote_funnel,
                'order_breakdown': order_breakdown,
                'revenue_trend': revenue_trend,
                'top_materials': top_materials,
                'top_customers': top_customers,
                'upcoming_deadlines': upcoming_deadlines,
                'on_time_delivery_rate': on_time_delivery_rate
            })
        except Exception as e:
            logger.error(f"Dashboard stats error: {str(e)}", exc_info=True)
            return Response({'error': f'Internal error: {str(e)}'}, status=500)


class ManufacturerRecentActivityView(APIView):
    """
    GET /api/manufacturers/dashboard/recent-activity/
    Returns recent activity for the authenticated manufacturer
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.role != 'manufacturer':
            return Response({'error': 'User is not a manufacturer'}, status=403)
        
        try:
            manufacturer = user.manufacturer_profile
        except:
            return Response({'error': 'Manufacturer profile not found'}, status=404)
        
        # Check if models exist
        try:
            from quotes.models import Quote
            quote_model_exists = True
        except (ImportError, LookupError):
            quote_model_exists = False
        
        try:
            from orders.models import Order
            order_model_exists = True
        except (ImportError, LookupError):
            order_model_exists = False
        
        # Recent quotes (last 5)
        if quote_model_exists:
            recent_quotes = Quote.objects.filter(
                manufacturer=user
            ).order_by('-created_at')[:5].values(
                'id', 'design__design_name', 'status', 'price_usd', 'created_at'
            )
        else:
            recent_quotes = []
        
        # Recent orders (if Order model exists)
        if order_model_exists:
            recent_orders = Order.objects.filter(
                manufacturer=user
            ).order_by('-created_at')[:5].values(
                'id', 'status', 'order_total_price_usd', 'created_at'
            )
        else:
            recent_orders = []
        
        # Profile update history (simple mock for now)
        profile_updates = [
            {
                'action': 'Profile updated',
                'timestamp': manufacturer.updated_at,
                'details': 'Profile information updated successfully'
            }
        ]
        
        return Response({
            'recent_quotes': list(recent_quotes),
            'recent_orders': list(recent_orders),
            'profile_updates': profile_updates,
        })
