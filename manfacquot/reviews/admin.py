from django.contrib import admin
from .models import Review

class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'manufacturer', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('customer__email', 'manufacturer__email')
    readonly_fields = ('id', 'created_at', 'updated_at')

admin.site.register(Review, ReviewAdmin)
