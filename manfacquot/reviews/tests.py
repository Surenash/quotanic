from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User, UserRole
from designs.models import Design, DesignStatus
from quotes.models import Quote, QuoteStatus
from orders.models import Order, OrderStatus
from reviews.models import Review

class ReviewConstraintTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            email="cust_rev@example.com", password="password", role=UserRole.CUSTOMER
        )
        self.manufacturer = User.objects.create_user(
            email="manuf_rev@example.com", password="password", role=UserRole.MANUFACTURER
        )
        
        self.url = reverse('manufacturer-review-list-create', kwargs={'manufacturer_id': self.manufacturer.id})

    def test_create_review_no_order_fails(self):
        self.client.force_authenticate(user=self.customer)
        data = {'rating': 5, 'comment': 'Great!'}
        response = self.client.post(self.url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("only review a manufacturer after you have a completed order", str(response.data))

    def test_create_review_with_completed_order_success(self):
        # Create completed order
        design = Design.objects.create(customer=self.customer, design_name="D", status=DesignStatus.QUOTED, quantity=1)
        quote = Quote.objects.create(design=design, manufacturer=self.manufacturer, price_usd=10, estimated_lead_time_days=1, status=QuoteStatus.ACCEPTED)
        Order.objects.create(
            design=design, accepted_quote=quote, customer=self.customer, manufacturer=self.manufacturer,
            status=OrderStatus.COMPLETED, order_total_price_usd=10
        )
        
        self.client.force_authenticate(user=self.customer)
        data = {'rating': 5, 'comment': 'Great!'}
        response = self.client.post(self.url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)
        self.assertEqual(Review.objects.first().manufacturer, self.manufacturer)

    def test_manufacturer_cannot_review_self(self):
        self.client.force_authenticate(user=self.manufacturer)
        data = {'rating': 5, 'comment': 'I am the best'}
        # Should fail either due to permission (IsAuthenticatedOrReadOnly allows auth users, but perform_create checks logic)
        # or due to not being a customer.
        # Our code checks order.customer == request.user. 
        # A manufacturer usually doesn't have orders with themselves as customer.
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
