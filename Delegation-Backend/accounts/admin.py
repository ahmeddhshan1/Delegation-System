from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, LoginLogs, AuditLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'full_name', 'role', 'is_active', 'is_staff', 'is_superuser', 'created_at')
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser', 'created_at')
    search_fields = ('username', 'full_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('معلومات شخصية', {'fields': ('full_name', 'role')}),
        ('الصلاحيات', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('تواريخ مهمة', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
        ('معلومات إضافية', {'fields': ('created_by', 'updated_by', 'device_info')}),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_login', 'date_joined')
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'full_name', 'role', 'password1', 'password2'),
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by', 'updated_by')
    
    def has_add_permission(self, request):
        """Allow SUPER_ADMIN to add users"""
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        """Allow SUPER_ADMIN to change users"""
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        """Allow SUPER_ADMIN to delete users"""
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        """Allow SUPER_ADMIN to view users"""
        return request.user.is_superuser or request.user.is_super_admin()


@admin.register(LoginLogs)
class LoginLogsAdmin(admin.ModelAdmin):
    list_display = ('user', 'login_time', 'ip_address', 'success', 'device')
    list_filter = ('success', 'login_time')
    search_fields = ('user__username', 'user__full_name', 'ip_address')
    ordering = ('-login_time',)
    readonly_fields = ('login_time',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def has_add_permission(self, request):
        return False  # Login logs should not be manually created
    
    def has_change_permission(self, request, obj=None):
        return False  # Login logs should not be modified
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'table_name', 'changed_by', 'changed_at')
    list_filter = ('action', 'table_name', 'changed_at')
    search_fields = ('table_name', 'changed_by__username', 'changed_by__full_name')
    ordering = ('-changed_at',)
    readonly_fields = ('changed_at',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('changed_by')
    
    def has_add_permission(self, request):
        return False  # Audit logs should not be manually created
    
    def has_change_permission(self, request, obj=None):
        return False  # Audit logs should not be modified
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()