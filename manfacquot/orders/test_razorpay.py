import unittest
from unittest.mock import patch, MagicMock
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User, UserRole
from designs.models import Design, DesignStatus
from quotes.models import Quote, QuoteStatus
from orders.models import Order, OrderStatus
from notifications.models import Notification
from django.conf import settings
from django.test import override_settings # Import override_settings

@override_settings(RAZORPAY_KEY_ID='test_key_id', RAZORPAY_KEY_SECRET='test_key_secret')
class RazorpayIntegrationTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(email="cust_rp@example.com", password="password", role=UserRole.CUSTOMER)
        self.manufacturer = User.objects.create_user(email="manuf_rp@example.com", password="password", role=UserRole.MANUFACTURER)
        
        self.design = Design.objects.create(customer=self.customer, design_name="Part", status=DesignStatus.QUOTED, quantity=1)
        self.quote = Quote.objects.create(design=self.design, manufacturer=self.manufacturer, price_usd=100, estimated_lead_time_days=3, status=QuoteStatus.ACCEPTED)
        self.order = Order.objects.create(
            design=self.design, accepted_quote=self.quote, customer=self.customer, manufacturer=self.manufacturer,
            status=OrderStatus.PENDING_PAYMENT, order_total_price_usd=100
        )
        
        self.payment_url = reverse('order_process_payment', kwargs={'id': self.order.id})
        self.callback_url = reverse('payment_callback')

    @patch('orders.views.razorpay.Client')
    def test_initiate_razorpay_payment(self, mock_razorpay_client):
        self.client.force_authenticate(user=self.customer)
        
        # Mock Razorpay order creation
        mock_client_instance = MagicMock()
        mock_razorpay_client.return_value = mock_client_instance
        mock_client_instance.order.create.return_value = {
            'id': 'order_rp_123',
            'amount': 10000,
            'currency': 'INR'
        }
        
        response = self.client.post(self.payment_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], 'order_rp_123')
        self.assertEqual(response.data['amount'], 10000)
        self.assertEqual(str(response.data['order_id']), str(self.order.id))

    @patch('orders.views.razorpay.Client')
    def test_payment_callback_success(self, mock_razorpay_client):
        # Mock verification success (no exception raised)
        mock_client_instance = MagicMock()
        mock_razorpay_client.return_value = mock_client_instance
        
        data = {
            'razorpay_payment_id': 'pay_123',
            'razorpay_order_id': 'order_rp_123',
            'razorpay_signature': 'sig_123',
            'internal_order_id': str(self.order.id)
        }
        
        response = self.client.post(self.callback_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, OrderStatus.PROCESSING)
        
        # Verify Notification
        notif = Notification.objects.filter(recipient=self.manufacturer).first()
        self.assertIsNotNone(notif)
        self.assertIn("ready for processing", notif.message)

    @patch('orders.views.razorpay.Client')
    def test_payment_callback_failure(self, mock_razorpay_client):
        import razorpay # Import here to use the error class
        
        mock_client_instance = MagicMock()
        mock_razorpay_client.return_value = mock_client_instance
        # Mock verification failure
        mock_client_instance.utility.verify_payment_signature.side_effect = razorpay.errors.SignatureVerificationError("Bad sig")
        
        data = {
            'razorpay_payment_id': 'pay_123',
            'razorpay_order_id': 'order_rp_123',
            'razorpay_signature': 'bad_sig',
            'internal_order_id': str(self.order.id)
        }
        
        response = self.client.post(self.callback_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, OrderStatus.PENDING_PAYMENT) # Status should not change
