from django.contrib import admin
from .models import Quote

class QuoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'design', 'manufacturer', 'price_usd', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('design__design_name', 'manufacturer__email')
    readonly_fields = ('id', 'created_at', 'updated_at')

admin.site.register(Quote, QuoteAdmin)
