from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class MainEvent(models.Model):
    """
    Main events model (like EDEX, Equestrian, etc.)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name='اسم الحدث')
    icon = models.CharField(max_length=100, null=True, blank=True, verbose_name='الأيقونة')
    description = models.TextField(null=True, blank=True, verbose_name='الوصف')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_main_events', db_column='created_by')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_main_events', db_column='updated_by')
    device_info = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'main_events'
        verbose_name = 'الحدث الرئيسي'
        verbose_name_plural = 'الأحداث الرئيسية'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class SubEvent(models.Model):
    """
    Sub events model under main events
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name='اسم الحدث الفرعي')
    main_event = models.ForeignKey(MainEvent, on_delete=models.CASCADE, related_name='sub_events')
    description = models.TextField(null=True, blank=True, verbose_name='الوصف')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_sub_events', db_column='created_by')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_sub_events', db_column='updated_by')
    device_info = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'sub_events'
        verbose_name = 'الحدث الفرعي'
        verbose_name_plural = 'الأحداث الفرعية'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.main_event.name}"


class Nationality(models.Model):
    """
    Nationalities lookup table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, verbose_name='اسم الجنسية')
    code = models.CharField(max_length=3, unique=True, verbose_name='كود الجنسية')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_nationalities', db_column='created_by')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_nationalities', db_column='updated_by')
    device_info = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'nationalities'
        verbose_name = 'الجنسية'
        verbose_name_plural = 'الجنسيات'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class MilitaryPosition(models.Model):
    """
    Military positions lookup table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name='اسم المنصب')
    equivalent_position = models.CharField(max_length=200, null=True, blank=True, verbose_name='المنصب المكافئ')
    rank_level = models.IntegerField(default=0, verbose_name='مستوى الرتبة')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_military_positions', db_column='created_by')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_military_positions', db_column='updated_by')
    device_info = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'military_positions'
        verbose_name = 'المنصب العسكري'
        verbose_name_plural = 'المناصب العسكرية'
        ordering = ['rank_level', 'name']
    
    def __str__(self):
        return self.name


class Airport(models.Model):
    """
    Airports lookup table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name='اسم المطار')
    code = models.CharField(max_length=10, unique=True, verbose_name='كود المطار')
    city = models.CharField(max_length=100, verbose_name='المدينة')
    country = models.CharField(max_length=100, verbose_name='الدولة')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_airports', db_column='created_by')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_airports', db_column='updated_by')
    device_info = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'airports'
        verbose_name = 'المطار'
        verbose_name_plural = 'المطارات'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class Airline(models.Model):
    """
    Airlines lookup table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name='اسم الخط الجوي')
    code = models.CharField(max_length=10, unique=True, verbose_name='كود الخط الجوي')
    country = models.CharField(max_length=100, verbose_name='الدولة')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_airlines', db_column='created_by')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_airlines', db_column='updated_by')
    device_info = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'airlines'
        verbose_name = 'الخط الجوي'
        verbose_name_plural = 'الخطوط الجوية'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class Delegation(models.Model):
    """
    Delegations model
    """
    DELEGATION_TYPES = [
        ('MILITARY', 'عسكري'),
        ('CIVILIAN', 'مدني'),
    ]
    
    DELEGATION_STATUS = [
        ('NOT_DEPARTED', 'لم يغادر'),
        ('PARTIALLY_DEPARTED', 'غادر جزئياً'),
        ('FULLY_DEPARTED', 'غادر بالكامل'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sub_event = models.ForeignKey(SubEvent, on_delete=models.CASCADE, related_name='delegations')
    nationality = models.ForeignKey(Nationality, on_delete=models.CASCADE, related_name='delegations')
    status = models.CharField(max_length=20, choices=DELEGATION_STATUS, default='NOT_DEPARTED', verbose_name='حالة الوفد')
    type = models.CharField(max_length=20, choices=DELEGATION_TYPES, verbose_name='نوع الوفد')
    arrival_info = models.JSONField(default=dict, verbose_name='معلومات الوصول')
    max_members = models.IntegerField(default=0, verbose_name='الحد الأقصى للأعضاء')
    current_members = models.IntegerField(default=0, verbose_name='العدد الحالي للأعضاء')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_delegations', db_column='created_by')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_delegations', db_column='updated_by')
    device_info = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'delegations'
        verbose_name = 'الوفد'
        verbose_name_plural = 'الوفود'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.nationality.name} - {self.sub_event.name}"
    
    def get_delegation_head(self):
        """Get the delegation head from members"""
        # Try to find head by position containing 'رئيس'
        head = self.members.filter(position__icontains='رئيس').first()
        if head:
            return head.name
        
        # If no head found by position, try by rank
        head = self.members.filter(rank__icontains='رئيس').first()
        if head:
            return head.name
        
        # If still no head found, return the first member or 'غير محدد'
        first_member = self.members.first()
        return first_member.name if first_member else 'غير محدد'
    
    def get_members_count(self):
        """Get actual members count"""
        return self.members.count()
    
    def update_members_count(self):
        """Update current members count"""
        self.current_members = self.get_members_count()
        self.save(update_fields=['current_members'])


class Member(models.Model):
    """
    Members model
    """
    MEMBER_STATUS = [
        ('NOT_DEPARTED', 'لم يغادر'),
        ('DEPARTED', 'غادر'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    delegation = models.ForeignKey(Delegation, on_delete=models.CASCADE, related_name='members')
    name = models.CharField(max_length=200, verbose_name='اسم العضو')
    rank = models.CharField(max_length=100, verbose_name='الرتبة')
    position = models.CharField(max_length=200, verbose_name='المنصب')
    equivalent_position = models.CharField(max_length=200, null=True, blank=True, verbose_name='المنصب المكافئ')
    status = models.CharField(max_length=20, choices=MEMBER_STATUS, default='NOT_DEPARTED', verbose_name='حالة العضو')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_members', db_column='created_by')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_members', db_column='updated_by')
    device_info = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'members'
        verbose_name = 'عضو'
        verbose_name_plural = 'الأعضاء'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.delegation.nationality.name}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update delegation members count
        if self.delegation:
            self.delegation.update_members_count()
    
    def delete(self, *args, **kwargs):
        delegation = self.delegation
        super().delete(*args, **kwargs)
        # Update delegation members count
        if delegation:
            delegation.update_members_count()


class DepartureSession(models.Model):
    """
    Departure sessions model
    """
    SESSION_TYPES = [
        ('PARTIAL', 'جزئية'),
        ('FULL', 'كاملة'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    delegation = models.ForeignKey(Delegation, on_delete=models.CASCADE, related_name='departure_sessions')
    departure_info = models.JSONField(default=dict, verbose_name='معلومات المغادرة')
    session_type = models.CharField(max_length=20, choices=SESSION_TYPES, verbose_name='نوع الجلسة')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_departure_sessions', db_column='created_by')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_departure_sessions', db_column='updated_by')
    device_info = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'departure_sessions'
        verbose_name = 'جلسة المغادرة'
        verbose_name_plural = 'جلسات المغادرة'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.delegation.nationality.name} - {self.session_type}"