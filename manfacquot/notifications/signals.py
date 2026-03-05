from django.dispatch import Signal, receiver
from notifications.models import Notification
from orders.models import OrderStatus, Order

# Define custom signals
order_status_changed = Signal() # args: order, old_status, new_status

@receiver(order_status_changed)
def notify_order_status_change(sender, order, old_status, new_status, **kwargs):
    """
    Create a notification when order status changes.
    """
    recipient = None
    message = ""

    # Logic to determine recipient and message based on transition
    if new_status == OrderStatus.PROCESSING:
        # Notify manufacturer that payment is done and order is ready to process
        recipient = order.manufacturer
        message = f"New Order #{order.id} is ready for processing (Payment Confirmed)."
    
    elif new_status == OrderStatus.SHIPPED:
        # Notify customer that order is shipped
        recipient = order.customer
        message = f"Your Order #{order.id} has been shipped! Tracking: {order.tracking_number}"
    
    elif new_status == OrderStatus.COMPLETED:
        # Notify customer (and maybe manufacturer?)
        recipient = order.customer
        message = f"Your Order #{order.id} has been marked as completed."

    elif new_status == OrderStatus.CANCELLED_BY_CUSTOMER:
        # Notify manufacturer
        recipient = order.manufacturer
        message = f"Order #{order.id} was cancelled by the customer."

    elif new_status == OrderStatus.CANCELLED_BY_MANUFACTURER:
        # Notify customer
        recipient = order.customer
        message = f"Order #{order.id} was cancelled by the manufacturer."

    if recipient:
        Notification.objects.create(recipient=recipient, message=message)
