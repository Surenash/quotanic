from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User, UserRole
from designs.models import Design, DesignStatus
from quotes.models import Quote, QuoteStatus
from orders.models import Order, OrderStatus
from notifications.models import Notification
from django.test import override_settings
from django.conf import settings
from unittest.mock import patch, MagicMock # Import patch and MagicMock # Import settings to inspect

@override_settings(RAZORPAY_KEY_ID='test_key_id', RAZORPAY_KEY_SECRET='test_key_secret')
class OrderFulfillmentTests(APITestCase):
    def setUp(self):
        super().setUp() # Call parent setUp if it exists
        print(f"DEBUG: RAZORPAY_KEY_ID in test setup: {getattr(settings, 'RAZORPAY_KEY_ID', 'NOT SET')}")
        print(f"DEBUG: RAZORPAY_KEY_SECRET in test setup: {getattr(settings, 'RAZORPAY_KEY_SECRET', 'NOT SET')}")
        self.customer = User.objects.create_user(email="cust_order@example.com", password="password", role=UserRole.CUSTOMER)
        self.manufacturer = User.objects.create_user(email="manuf_order@example.com", password="password", role=UserRole.MANUFACTURER)
        
        self.design = Design.objects.create(customer=self.customer, design_name="Part", status=DesignStatus.QUOTED, quantity=1)
        self.quote = Quote.objects.create(design=self.design, manufacturer=self.manufacturer, price_usd=50, estimated_lead_time_days=3, status=QuoteStatus.ACCEPTED)
        self.order = Order.objects.create(
            design=self.design, accepted_quote=self.quote, customer=self.customer, manufacturer=self.manufacturer,
            status=OrderStatus.PENDING_PAYMENT, order_total_price_usd=50
        )
        
        self.url = reverse('order_detail', kwargs={'id': self.order.id})

    @patch('orders.views.razorpay.Client')
    def test_payment_initiation_success(self, mock_razorpay_client):
        self.client.force_authenticate(user=self.customer)

        # Mock Razorpay order creation
        mock_client_instance = MagicMock()
        mock_razorpay_client.return_value = mock_client_instance
        mock_client_instance.order.create.return_value = {
            'id': 'order_rp_123_mock',
            'amount': 5000, # 50 * 100
            'currency': 'INR'
        }

        payment_url = reverse('order_process_payment', kwargs={'id': self.order.id})
        response = self.client.post(payment_url, {}) # No payment_token needed as Razorpay called
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], 'order_rp_123_mock') # Assert Razorpay order ID returned
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, OrderStatus.PENDING_PAYMENT) # Status should NOT change yet
        
        # Ensure no Notification created yet for processing (as callback not run)
        self.assertFalse(Notification.objects.filter(recipient=self.manufacturer).exists())


    def test_manufacturer_ship_order_requires_tracking(self):
        # Setup order in PRODUCTION
        self.order.status = OrderStatus.IN_PRODUCTION
        self.order.save()
        
        self.client.force_authenticate(user=self.manufacturer)
        
        # Try to ship without tracking
        data = {'status': OrderStatus.SHIPPED}
        response = self.client.patch(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) # Permission check fails
        
        # Ship with tracking
        data = {'status': OrderStatus.SHIPPED, 'tracking_number': 'TRK123', 'shipping_carrier': 'DHL'}
        response = self.client.patch(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, OrderStatus.SHIPPED)
        self.assertEqual(self.order.tracking_number, 'TRK123')
        
        # Verify Notification to Customer
        notif = Notification.objects.filter(recipient=self.customer).first()
        self.assertIsNotNone(notif)
        self.assertIn("shipped", notif.message)
        self.assertIn("TRK123", notif.message)

    def test_customer_cancel_order(self):
        self.order.status = OrderStatus.PROCESSING
        self.order.save()
        
        self.client.force_authenticate(user=self.customer)
        
        # Cancel without reason fails
        data = {'status': OrderStatus.CANCELLED_BY_CUSTOMER}
        response = self.client.patch(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Cancel with reason succeeds
        data = {'status': OrderStatus.CANCELLED_BY_CUSTOMER, 'cancellation_reason': 'Changed my mind'}
        response = self.client.patch(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, OrderStatus.CANCELLED_BY_CUSTOMER)
        self.assertEqual(self.order.cancellation_reason, 'Changed my mind')
        
        # Verify Notification to Manufacturer
        notif = Notification.objects.filter(recipient=self.manufacturer).first()
        self.assertIsNotNone(notif)
        self.assertIn("cancelled by the customer", notif.message)