from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class User(AbstractUser):
    """
    Custom User model based on the new users table schema
    """
    USER_ROLES = [
        ('SUPER_ADMIN', 'مدير النظام'),
        ('ADMIN', 'مدير'),
        ('USER', 'مستخدم'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=100)
    password_hash = models.CharField(max_length=255, db_column='password_hash')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    role = models.CharField(max_length=20, choices=USER_ROLES, default='USER')
    last_login = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_users', db_column='created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_users', db_column='updated_by')
    updated_at = models.DateTimeField(auto_now=True)
    device_info = models.JSONField(default=dict, blank=True)
    
    # Override password field to use password_hash column
    def set_password(self, raw_password):
        """Set password using Django's password hashing"""
        from django.contrib.auth.hashers import make_password
        self.password_hash = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Check password using Django's password checking"""
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.password_hash)
    
    @property
    def password(self):
        """Return password_hash for compatibility"""
        return self.password_hash
    
    @password.setter
    def password(self, value):
        """Set password_hash when password is set"""
        self.password_hash = value
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['full_name', 'role']
    
    # Override Django auth fields to match our schema
    @property
    def email(self):
        return None
    
    @email.setter
    def email(self, value):
        pass
    
    @property
    def first_name(self):
        return None
    
    @first_name.setter
    def first_name(self, value):
        pass
    
    @property
    def last_name(self):
        return None
    
    @last_name.setter
    def last_name(self, value):
        pass
    
    @property
    def date_joined(self):
        return self.created_at
    
    @date_joined.setter
    def date_joined(self, value):
        self.created_at = value
    
    class Meta:
        db_table = 'users'
        verbose_name = 'مستخدم'
        verbose_name_plural = 'المستخدمين'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} ({self.username})"
    
    def is_super_admin(self):
        return self.role == 'SUPER_ADMIN'
    
    def is_admin(self):
        return self.role in ['SUPER_ADMIN', 'ADMIN']
    
    def can_manage_users(self):
        return self.role == 'SUPER_ADMIN'
    
    def can_view_reports(self):
        return self.role in ['SUPER_ADMIN', 'ADMIN']
    
    def can_print_reports(self):
        return self.role in ['SUPER_ADMIN', 'ADMIN']
    
    def can_delete_data(self):
        return self.role in ['SUPER_ADMIN', 'ADMIN']
    
    def has_perm(self, perm, obj=None):
        """Check if user has specific permission"""
        if self.is_superuser:
            return True
        return super().has_perm(perm, obj)
    
    def has_module_perms(self, app_label):
        """Check if user has permissions for specific app"""
        if self.is_superuser:
            return True
        return super().has_module_perms(app_label)
    
    def get_full_name(self):
        return self.full_name
    
    def get_short_name(self):
        return self.username


class LoginLogs(models.Model):
    """
    Login logs tracking model
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_logs')
    login_time = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device = models.TextField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    success = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'login_logs'
        verbose_name = 'سجل الدخول'
        verbose_name_plural = 'سجلات الدخول'
        ordering = ['-login_time']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.login_time}"


class AuditLog(models.Model):
    """
    Audit log for tracking all changes
    """
    ACTION_CHOICES = [
        ('INSERT', 'إضافة'),
        ('UPDATE', 'تعديل'),
        ('DELETE', 'حذف'),
    ]
    
    id = models.BigAutoField(primary_key=True)
    table_name = models.CharField(max_length=100)
    record_id = models.UUIDField(null=True, blank=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    old_data = models.JSONField(null=True, blank=True)
    new_data = models.JSONField(null=True, blank=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    changed_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'audit_log'
        verbose_name = 'سجل التدقيق'
        verbose_name_plural = 'سجلات التدقيق'
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.action} - {self.table_name} - {self.changed_at}"