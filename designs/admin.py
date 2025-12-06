from django.contrib import admin
from .models import Design

class DesignAdmin(admin.ModelAdmin):
    list_display = ('design_name', 'customer', 'material', 'quantity', 'status', 'created_at')
    list_filter = ('status', 'material')
    search_fields = ('design_name', 'customer__email', 'customer__company_name')
    readonly_fields = ('id', 's3_file_key', 'geometric_data', 'created_at', 'updated_at')

# Register your models here.
admin.site.register(Design, DesignAdmin)