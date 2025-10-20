from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.translation import gettext_lazy as _

# Custom Admin Site Configuration
class CustomAdminSite(AdminSite):
    site_header = "نظام إدارة الوفود"
    site_title = "إدارة الوفود"
    index_title = "لوحة تحكم إدارة الوفود"
    
    def has_permission(self, request):
        """
        Allow access to admin site for SUPER_ADMIN users
        """
        return (
            request.user.is_active and 
            (request.user.is_superuser or request.user.is_super_admin())
        )
    

# Create custom admin site instance
admin_site = CustomAdminSite(name='custom_admin')

# Register default admin site with custom configuration
admin.site.site_header = "نظام إدارة الوفود"
admin.site.site_title = "إدارة الوفود"
admin.site.index_title = "لوحة تحكم إدارة الوفود"
