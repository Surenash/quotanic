from rest_framework import generics, permissions, serializers
from django.shortcuts import get_object_or_404
from .models import Review
from .serializers import ReviewSerializer
from accounts.models import User, Manufacturer
from orders.models import Order, OrderStatus

class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit it.
    Read-only for everyone else.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the review or admin.
        return obj.customer == request.user or request.user.is_staff

class ReviewListCreateView(generics.ListCreateAPIView):
    """
    GET /api/manufacturers/{manufacturer_id}/reviews/ - List reviews for a manufacturer.
    POST /api/manufacturers/{manufacturer_id}/reviews/ - Create a new review for a manufacturer.
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Must be authenticated to create

    def get_queryset(self):
        manufacturer_id = self.kwargs.get('manufacturer_id')
        manufacturer_user = get_object_or_404(User, id=manufacturer_id)
        return Review.objects.filter(manufacturer=manufacturer_user)

    def perform_create(self, serializer):
        manufacturer_id = self.kwargs.get('manufacturer_id')
        manufacturer_user = get_object_or_404(User, id=manufacturer_id)
        
        # Ensure only a customer who has a completed order with this manufacturer can create a review.
        has_completed_order = Order.objects.filter(
            customer=self.request.user,
            manufacturer=manufacturer_user,
            status=OrderStatus.COMPLETED
        ).exists()

        if not has_completed_order:
            raise serializers.ValidationError("You can only review a manufacturer after you have a completed order with them.")

        serializer.save(customer=self.request.user, manufacturer=manufacturer_user)

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/reviews/{id}/ - Retrieve a review.
    PUT /api/reviews/{id}/ - Update a review.
    PATCH /api/reviews/{id}/ - Partially update a review.
    DELETE /api/reviews/{id}/ - Delete a review.
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsOwnerOrAdminOrReadOnly]
    lookup_field = 'id'
