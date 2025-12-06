from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Manufacturer

# Define a custom UserAdmin to display role and company_name
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'company_name', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('email', 'company_name')
    ordering = ('email',)
    
    # The fieldsets from BaseUserAdmin need to be customized if you add new fields
    # to the User model that you want to be editable in the admin.
    # For now, the default fieldsets are okay, but we add 'role' and 'company_name'.
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('company_name',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions', 'role')}),
        ('Important dates', {'fields': ('last_login', 'created_at')}),
    )
    readonly_fields = ('last_login', 'created_at')


# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Manufacturer)