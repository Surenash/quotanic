from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Quote, QuoteStatus
from .serializers import QuoteSerializer
from designs.models import Design
from orders.models import Order, OrderStatus

class IsOwnerOrManufacturerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow:
    - The design owner to view quotes for their design.
    - The manufacturer who created the quote to view/edit it.
    - Admins to do anything.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            # Allow read access if user is design owner or quoting manufacturer
            return obj.design.customer == request.user or obj.manufacturer == request.user or request.user.is_staff
        
        # Write permissions are only allowed to the manufacturer who created the quote (if pending)
        # or the design owner to accept/reject.
        if request.user == obj.manufacturer and obj.status == 'pending':
            return True # Manufacturer can edit if pending
        if request.user == obj.design.customer and obj.status == 'pending':
            # Customer can only PATCH to change status
            return request.method == 'PATCH'
        
        return request.user.is_staff

class QuoteListCreateView(generics.ListCreateAPIView):
    """
    GET /api/designs/{design_id}/quotes/ - List quotes for a design.
    POST /api/designs/{design_id}/quotes/ - Create a new quote for a design.
    """
    serializer_class = QuoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        design_id = self.kwargs.get('design_id')
        design = get_object_or_404(Design, id=design_id)
        
        # Only the design owner or an admin can list all quotes for a design
        if self.request.user == design.customer or self.request.user.is_staff:
            return Quote.objects.filter(design=design)
        
        # A manufacturer viewing the list should only see their own quote for that design
        return Quote.objects.filter(design=design, manufacturer=self.request.user)

    def perform_create(self, serializer):
        design_id = self.kwargs.get('design_id')
        design = get_object_or_404(Design, id=design_id)
        
        # Ensure the user creating the quote is a manufacturer
        if self.request.user.role != 'manufacturer':
            raise permissions.PermissionDenied("Only manufacturers can create quotes.")

        serializer.save(design=design, manufacturer=self.request.user)

        serializer.save(design=design, manufacturer=self.request.user)

class QuoteListView(generics.ListAPIView):
    """
    GET /api/quotes/ - List all quotes for the authenticated user.
    - Manufacturers see quotes they created (or requests sent to them).
    - Customers see quotes for their designs.
    """
    serializer_class = QuoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'manufacturer':
            return Quote.objects.filter(manufacturer=user)
        elif user.role == 'customer':
            return Quote.objects.filter(design__customer=user)
        return Quote.objects.none()

class QuoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/quotes/{id}/ - Retrieve a quote.
    PUT /api/quotes/{id}/ - Update a quote.
    PATCH /api/quotes/{id}/ - Partially update a quote.
    DELETE /api/quotes/{id}/ - Delete a quote.
    """
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer
    permission_classes = [IsOwnerOrManufacturerOrReadOnly]
    lookup_field = 'id'

    def perform_update(self, serializer):
        # Check if status is being updated to ACCEPTED
        new_status = serializer.validated_data.get('status')
        
        if new_status == QuoteStatus.ACCEPTED:
            with transaction.atomic():
                quote = serializer.save()
                
                # Check if an order already exists for this quote to prevent duplicates
                if not Order.objects.filter(accepted_quote=quote).exists():
                    # Create the Order
                    order = Order.objects.create(
                        design=quote.design,
                        accepted_quote=quote,
                        customer=quote.design.customer,
                        manufacturer=quote.manufacturer,
                        status=OrderStatus.PENDING_PAYMENT,
                        order_total_price_usd=quote.price_usd,
                    )
                    # Calculate initial estimated delivery date based on quote's lead time
                    order.calculate_and_set_estimated_delivery(quote.estimated_lead_time_days)
                    order.save()
        else:
            serializer.save()
