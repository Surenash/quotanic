from django.urls import path
from . import views # Import views from current app

# URLs for /api/orders/
urlpatterns = [
    # GET /api/orders/ - List Orders (filtered by user role)
    path('', views.OrderListView.as_view(), name='order_list'),

    # GET /api/orders/<uuid:id>/ - Retrieve a specific Order
    path('<uuid:id>/', views.OrderDetailView.as_view(), name='order_detail'),

    # POST /api/orders/<uuid:id>/process-payment/ - Initiate Razorpay payment
    path('<uuid:id>/process-payment/', views.OrderPaymentView.as_view(), name='order_process_payment'),

    # POST /api/orders/payment-callback/ - Verify Razorpay payment
    path('payment-callback/', views.PaymentCallbackView.as_view(), name='payment_callback'),
]
