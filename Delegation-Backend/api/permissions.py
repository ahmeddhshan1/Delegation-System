from rest_framework import permissions
from django.contrib.auth import get_user_model

User = get_user_model()


class IsSuperAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow Super Admin users to edit objects.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions are only allowed to Super Admin
        return (
            request.user.is_authenticated and 
            request.user.is_super_admin()
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow Admin and Super Admin users to edit objects.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions are only allowed to Admin and Super Admin
        return (
            request.user.is_authenticated and 
            (request.user.is_admin() or request.user.is_super_admin())
        )


class IsUserOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow User role to add objects but not edit/delete.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # POST (create) permissions are allowed to all authenticated users
        if request.method == 'POST':
            return request.user.is_authenticated
        
        # PUT/PATCH/DELETE permissions are only allowed to Admin and Super Admin
        return (
            request.user.is_authenticated and 
            (request.user.is_admin() or request.user.is_super_admin())
        )


class IsSuperAdminOnly(permissions.BasePermission):
    """
    Custom permission to only allow Super Admin users.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.is_super_admin()
        )


class IsAdminOrSuperAdmin(permissions.BasePermission):
    """
    Custom permission to allow Admin and Super Admin users.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.is_admin() or request.user.is_super_admin())
        )


class CanManageUsers(permissions.BasePermission):
    """
    Custom permission to check if user can manage users.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.can_manage_users()
        )


class CanViewReports(permissions.BasePermission):
    """
    Custom permission to check if user can view reports.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.can_view_reports()
        )


class CanDeleteData(permissions.BasePermission):
    """
    Custom permission to check if user can delete data.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.can_delete_data()
        )
