from rest_framework import generics, permissions
from .models import Order, OrderStatus
from .serializers import OrderSerializer
from accounts.models import UserRole # To check user roles
import razorpay
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from notifications.signals import order_status_changed

# --- Custom Permissions for Orders ---

class IsOrderParticipantOrAdmin(permissions.BasePermission):
    """
    Permission to ensure only the customer who placed the order,
    the manufacturer fulfilling it, or an admin can view/access the order.
    """
    def has_object_permission(self, request, view, obj): # obj is an Order instance
        if request.user and request.user.is_authenticated: # Ensure user is authenticated
            if request.user.is_staff:
                return True
            return obj.customer == request.user or obj.manufacturer == request.user
        return False

# --- API Views for Orders ---

class OrderListView(generics.ListAPIView):
    """
    GET /api/orders/
    - Customers see orders they placed.
    - Manufacturers see orders they received.
    - Admins see all orders.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # select_related is used to optimize queries by fetching related objects in a single DB hit.
        base_queryset = Order.objects.select_related(
            'design',
            'accepted_quote',
            'customer', # User object for customer
            'manufacturer' # User object for manufacturer
        )

        if user.is_staff:
            return base_queryset.all()
        elif user.role == UserRole.CUSTOMER:
            return base_queryset.filter(customer=user)
        elif user.role == UserRole.MANUFACTURER:
            return base_queryset.filter(manufacturer=user)

        return Order.objects.none() # Should ideally not be reached if user is authenticated


class OrderDetailView(generics.RetrieveUpdateAPIView): # Changed to allow Update (PATCH/PUT)
    """
    GET /api/orders/{order_id}/ - Retrieve a specific order.
    PATCH /api/orders/{order_id}/ - Partially update an order (e.g., status, tracking).
    PUT /api/orders/{order_id}/ - Update an order (less common for partial updates).
    - Accessible by the customer who placed it, the manufacturer fulfilling it, or an admin,
      with specific field update permissions handled by CanUpdateSpecificOrderFieldsPermission.
    """
    queryset = Order.objects.select_related(
        'design',
        'accepted_quote',
        'customer',
        'manufacturer'
    ).all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipantOrAdmin] # Base permission for GET
    lookup_field = 'id' # Order model PK is 'id' (UUID)

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        For PUT/PATCH, use a more specific permission class.
        """
        if self.request.method in ['PUT', 'PATCH']:
            return [permissions.IsAuthenticated(), CanUpdateSpecificOrderFieldsPermission()]
        return super().get_permissions()


class CanUpdateSpecificOrderFieldsPermission(permissions.BasePermission):
    """
    Custom permission to control updates to specific Order fields based on user role.
    - Manufacturer: Can update status (defined transitions), tracking_number, shipping_carrier, actual_ship_date.
    - Customer: Can update status to CANCELLED_BY_CUSTOMER (if order is cancelable).
    - Admin: Can update these fields.
    """
    message = "You do not have permission to update this field or make this status transition."

    def has_object_permission(self, request, view, obj): # obj is an Order instance
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_staff:
            return True

        # Check if the user is either the customer or the manufacturer for this order
        is_customer = (obj.customer == request.user)
        is_manufacturer = (obj.manufacturer == request.user)

        if not (is_customer or is_manufacturer):
            return False # User is not related to the order

        # What fields are being updated?
        updated_fields = request.data.keys()
        allowed_fields_manufacturer = {'status', 'tracking_number', 'shipping_carrier', 'actual_ship_date', 'cancellation_reason'}
        allowed_fields_customer = {'status', 'shipping_address', 'cancellation_reason'} # Customer might update shipping if not shipped

        # Check if trying to update forbidden fields
        if is_manufacturer:
            for field in updated_fields:
                if field not in allowed_fields_manufacturer:
                    self.message = f"Manufacturer cannot update field: {field}."
                    return False
        elif is_customer:
            for field in updated_fields:
                if field not in allowed_fields_customer:
                    self.message = f"Customer cannot update field: {field}."
                    return False

        # Status transition validation (moved from serializer for more context here)
        if 'status' in updated_fields:
            current_status = obj.status
            new_status = request.data.get('status')

            if is_manufacturer:
                allowed_transitions = {
                    OrderStatus.PENDING_MANUFACTURER_CONFIRMATION: [OrderStatus.PROCESSING, OrderStatus.CANCELLED_BY_MANUFACTURER],
                    OrderStatus.PROCESSING: [OrderStatus.IN_PRODUCTION, OrderStatus.CANCELLED_BY_MANUFACTURER],
                    OrderStatus.IN_PRODUCTION: [OrderStatus.SHIPPED],
                    OrderStatus.SHIPPED: [OrderStatus.COMPLETED],
                }
                if current_status not in allowed_transitions or new_status not in allowed_transitions[current_status]:
                    self.message = f"Manufacturer: Invalid status transition from '{current_status}' to '{new_status}'."
                    return False
                
                # If setting to SHIPPED, ensure tracking info is provided
                if new_status == OrderStatus.SHIPPED:
                    tracking = request.data.get('tracking_number')
                    carrier = request.data.get('shipping_carrier')
                    if not tracking or not carrier:
                         self.message = "Manufacturer must provide 'tracking_number' and 'shipping_carrier' when marking order as Shipped."
                         return False

            elif is_customer:
                # Customer can only cancel if order is in a pre-production state
                cancelable_statuses = [
                    OrderStatus.PENDING_MANUFACTURER_CONFIRMATION,
                    OrderStatus.PENDING_PAYMENT,
                    OrderStatus.PROCESSING
                ]
                if new_status == OrderStatus.CANCELLED_BY_CUSTOMER and current_status in cancelable_statuses:
                    if not request.data.get('cancellation_reason'): # Require reason for customer cancellation
                        self.message = "Please provide a reason for cancelling the order."
                        return False
                    return True
                elif new_status == OrderStatus.CANCELLED_BY_CUSTOMER and current_status not in cancelable_statuses:
                     self.message = f"Order cannot be cancelled by customer in its current status: '{current_status}'."
                     return False
                else: # Customer trying other status changes
                    self.message = "Customer can only cancel orders in specific states or update shipping address."
                    return False

        # Customer updating shipping address
        if is_customer and 'shipping_address' in updated_fields:
            # Allow customer to update shipping address if order is not too far in progress
            if obj.status in [OrderStatus.SHIPPED, OrderStatus.IN_PRODUCTION, OrderStatus.COMPLETED, OrderStatus.CANCELLED_BY_MANUFACTURER]:
                self.message = f"Shipping address cannot be updated when order status is '{obj.status}'."
                return False

        return True # All checks passed for the role and attempted field updates


class OrderPaymentView(APIView):
    """
    POST /api/orders/{order_id}/process-payment/
    Initiates a Razorpay order for payment.
    Returns the Razorpay Order ID and options for the frontend checkout.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id, *args, **kwargs):
        order = get_object_or_404(Order, id=id)

        # Check permission: Only customer (owner) can pay
        if order.customer != request.user:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        if order.status != OrderStatus.PENDING_PAYMENT:
            return Response(
                {"error": f"Order is not pending payment. Status: {order.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Initialize Razorpay Client
        # Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are in settings.py
        try:
            print(f"DEBUG: View - RAZORPAY_KEY_ID: {getattr(settings, 'RAZORPAY_KEY_ID', 'NOT FOUND IN VIEW')}")
            print(f"DEBUG: View - RAZORPAY_KEY_SECRET: {getattr(settings, 'RAZORPAY_KEY_SECRET', 'NOT FOUND IN VIEW')}")
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        except AttributeError:
             return Response({"error": "Server configuration error: Razorpay keys missing."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Razorpay expects amount in paise (1 INR = 100 paise)
        # order_total_price_usd is essentially acting as INR for this context
        # assuming the platform uses INR, or we converted USD to INR before this step.
        # For simplicity, let's treat the decimal value as the main currency unit (e.g. INR).
        amount_in_subunit = int(order.order_total_price_usd * 100)

        data = {
            "amount": amount_in_subunit,
            "currency": "INR",
            "receipt": str(order.id),
            "notes": {
                "design_id": str(order.design.id),
                "customer_email": order.customer.email
            }
        }

        try:
            razorpay_order = client.order.create(data=data)
            # Return necessary details to frontend to open Razorpay Modal
            return Response({
                "id": razorpay_order['id'],
                "amount": razorpay_order['amount'],
                "currency": razorpay_order['currency'],
                "key": settings.RAZORPAY_KEY_ID,
                "order_id": order.id # Our internal order ID
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Razorpay Order Creation Failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentCallbackView(APIView):
    """
    POST /api/orders/payment-callback/
    Verifies the Razorpay signature after payment completion.
    Updates Order status to PROCESSING if successful.
    """
    permission_classes = [permissions.AllowAny] # Callback might come from client or webhook

    def post(self, request, *args, **kwargs):
        # Frontend sends these details after successful payment
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature]):
             return Response({"error": "Missing payment details."}, status=status.HTTP_400_BAD_REQUEST)

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        try:
            # verify_payment_signature raises an error if verification fails
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
        except razorpay.errors.SignatureVerificationError:
            return Response({"error": "Payment verification failed: Invalid Signature."}, status=status.HTTP_400_BAD_REQUEST)

        # If verification successful, update our Order
        # We need to find which internal order corresponds to this Razorpay order.
        # Since we didn't store razorpay_order_id on the model yet, we can't look it up directly.
        # Ideally, we should have stored it in OrderPaymentView or have the frontend send back our internal 'order_id'.
        # Let's assume the frontend sends our internal 'internal_order_id' for robust lookup.
        
        internal_order_id = request.data.get('internal_order_id')
        if not internal_order_id:
             # Fallback: If we stored razorpay_order_id in the DB, we'd query by that.
             # For now, fail if not provided.
             return Response({"error": "Internal Order ID missing in callback."}, status=status.HTTP_400_BAD_REQUEST)

        order = get_object_or_404(Order, id=internal_order_id)

        if order.status == OrderStatus.PROCESSING:
             return Response({"message": "Order already processed."}, status=status.HTTP_200_OK)

        with transaction.atomic():
            old_status = order.status
            order.status = OrderStatus.PROCESSING
            # Optionally store the transaction ID
            # order.payment_id = razorpay_payment_id 
            order.save()
            
            order_status_changed.send(sender=self.__class__, order=order, old_status=old_status, new_status=order.status)

        return Response({"message": "Payment verified. Order processing started."}, status=status.HTTP_200_OK)
