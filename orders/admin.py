from django.contrib import admin
from .models import Order

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'design', 'customer', 'manufacturer', 'status', 'order_total_price_usd', 'created_at')
    list_filter = ('status', 'manufacturer', 'customer')
    search_fields = ('id__iexact', 'design__design_name', 'customer__email', 'manufacturer__email')
    readonly_fields = ('id', 'design', 'accepted_quote', 'customer', 'manufacturer', 'order_total_price_usd', 'created_at', 'updated_at')

admin.site.register(Order, OrderAdmin)