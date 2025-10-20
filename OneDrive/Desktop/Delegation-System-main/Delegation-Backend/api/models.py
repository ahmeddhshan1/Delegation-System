from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Nationality(models.Model):
    """
    Nationalities lookup table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, verbose_name='اسم الجنسية')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_nationalities', db_column='created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_nationalities', db_column='updated_by')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'nationality'
        verbose_name = 'الجنسية'
        verbose_name_plural = 'الجنسيات'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Cities(models.Model):
    """
    Cities lookup table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    city_name = models.CharField(max_length=100, unique=True, verbose_name='اسم المدينة')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_cities', db_column='created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_cities', db_column='updated_by')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cities'
        verbose_name = 'المدينة'
        verbose_name_plural = 'المدن'
        ordering = ['city_name']
    
    def __str__(self):
        return self.city_name


class AirLine(models.Model):
    """
    Airlines lookup table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, verbose_name='اسم شركة الطيران')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_airlines', db_column='created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_airlines', db_column='updated_by')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'air_line'
        verbose_name = 'شركة الطيران'
        verbose_name_plural = 'شركات الطيران'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class AirPort(models.Model):
    """
    Airports lookup table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, verbose_name='اسم المطار')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_airports', db_column='created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_airports', db_column='updated_by')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'air_port'
        verbose_name = 'المطار'
        verbose_name_plural = 'المطارات'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class EquivalentJob(models.Model):
    """
    Equivalent jobs lookup table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, verbose_name='اسم الوظيفة المعادلة')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_equivalent_jobs', db_column='created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_equivalent_jobs', db_column='updated_by')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'equivalent_job'
        verbose_name = 'الوظيفة المعادلة'
        verbose_name_plural = 'الوظائف المعادلة'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class MainEvent(models.Model):
    """
    Main events model (like EDEX, Equestrian, etc.)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_name = models.CharField(max_length=100, verbose_name='اسم الحدث الرئيسي')
    event_link = models.TextField(null=True, blank=True, verbose_name='رابط الحدث')
    event_icon = models.TextField(null=True, blank=True, verbose_name='أيقونة الحدث')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_main_events', db_column='created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_main_events', db_column='updated_by')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'main_event'
        verbose_name = 'الحدث الرئيسي'
        verbose_name_plural = 'الأحداث الرئيسية'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.event_name


class SubEvent(models.Model):
    """
    Sub events model under main events
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    main_event_id = models.ForeignKey(MainEvent, on_delete=models.CASCADE, related_name='sub_events', db_column='main_event_id')
    event_name = models.CharField(max_length=100, verbose_name='اسم الحدث الفرعي')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_sub_events', db_column='created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_sub_events', db_column='updated_by')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sub_event'
        verbose_name = 'الحدث الفرعي'
        verbose_name_plural = 'الأحداث الفرعية'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.event_name} - {self.main_event_id.event_name}"


class Delegation(models.Model):
    """
    Delegations model
    """
    DELEGATION_TYPES = [
        ('MILITARY', 'عسكري'),
        ('CIVILIAN', 'مدني'),
    ]
    
    DELEGATION_STATUS = [
        ('NOT_DEPARTED', 'لم يغادر أحد'),
        ('PARTIALLY_DEPARTED', 'غادر جزء من الأعضاء'),
        ('FULLY_DEPARTED', 'غادر جميع الأعضاء'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sub_event_id = models.ForeignKey(SubEvent, on_delete=models.CASCADE, related_name='delegations', db_column='sub_event_id')
    nationality_id = models.ForeignKey(Nationality, on_delete=models.SET_NULL, null=True, blank=True, related_name='delegations', db_column='nationality_id')
    airport_id = models.ForeignKey(AirPort, on_delete=models.SET_NULL, null=True, blank=True, related_name='delegations', db_column='airport_id')
    airline_id = models.ForeignKey(AirLine, on_delete=models.SET_NULL, null=True, blank=True, related_name='delegations', db_column='airline_id')
    city_id = models.ForeignKey(Cities, on_delete=models.SET_NULL, null=True, blank=True, related_name='delegations', db_column='city_id')
    delegation_leader_name = models.CharField(max_length=100, verbose_name='اسم رئيس الوفد')
    member_count = models.IntegerField(default=0, verbose_name='عدد الأعضاء المحدد للوفد')
    current_members = models.IntegerField(default=0, verbose_name='العدد الحالي للأعضاء')
    flight_number = models.CharField(max_length=20, null=True, blank=True, verbose_name='رقم الرحلة')
    type = models.CharField(max_length=20, choices=DELEGATION_TYPES, verbose_name='نوع الوفد')
    status = models.CharField(max_length=20, choices=DELEGATION_STATUS, default='NOT_DEPARTED', verbose_name='حالة الوفد')
    arrive_date = models.DateField(null=True, blank=True, verbose_name='تاريخ الوصول')
    arrive_time = models.TimeField(null=True, blank=True, verbose_name='ساعة الوصول')
    receiver_name = models.CharField(max_length=100, null=True, blank=True, verbose_name='اسم المستقبل')
    going_to = models.CharField(max_length=255, null=True, blank=True, verbose_name='الوجهة')
    goods = models.TextField(null=True, blank=True, verbose_name='الشحنات')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_delegations', db_column='created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_delegations', db_column='updated_by')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'delegation'
        verbose_name = 'الوفد'
        verbose_name_plural = 'الوفود'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.delegation_leader_name} - {self.nationality_id.name if self.nationality_id else 'غير محدد'}"
    
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
    delegation_id = models.ForeignKey(Delegation, on_delete=models.CASCADE, related_name='members', db_column='delegation_id')
    rank = models.CharField(max_length=50, null=True, blank=True, verbose_name='الرتبة العسكرية')
    name = models.CharField(max_length=100, verbose_name='اسم العضو')
    job_title = models.CharField(max_length=100, null=True, blank=True, verbose_name='الوظيفة/الدور الحالي')
    equivalent_job_id = models.ForeignKey(EquivalentJob, on_delete=models.SET_NULL, null=True, blank=True, related_name='members', db_column='equivalent_job_id')
    status = models.CharField(max_length=20, choices=MEMBER_STATUS, default='NOT_DEPARTED', verbose_name='حالة العضو')
    departure_date = models.DateField(null=True, blank=True, verbose_name='تاريخ المغادرة الفعلي للعضو')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_members', db_column='created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_members', db_column='updated_by')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'member'
        verbose_name = 'عضو'
        verbose_name_plural = 'الأعضاء'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.delegation_id.delegation_leader_name if self.delegation_id else 'غير محدد'}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update delegation members count
        if self.delegation_id:
            self.delegation_id.update_members_count()
    
    def delete(self, *args, **kwargs):
        delegation = self.delegation_id
        super().delete(*args, **kwargs)
        # Update delegation members count
        if delegation:
            delegation.update_members_count()


class CheckOut(models.Model):
    """
    Check out sessions model
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    delegation_id = models.ForeignKey(Delegation, on_delete=models.CASCADE, related_name='check_outs', db_column='delegation_id')
    nationality_id = models.ForeignKey(Nationality, on_delete=models.SET_NULL, null=True, blank=True, related_name='check_outs', db_column='nationality_id')
    airport_id = models.ForeignKey(AirPort, on_delete=models.SET_NULL, null=True, blank=True, related_name='check_outs', db_column='airport_id')
    airline_id = models.ForeignKey(AirLine, on_delete=models.SET_NULL, null=True, blank=True, related_name='check_outs', db_column='airline_id')
    city_id = models.ForeignKey(Cities, on_delete=models.SET_NULL, null=True, blank=True, related_name='check_outs', db_column='city_id')
    flight_number = models.CharField(max_length=20, null=True, blank=True, verbose_name='رقم رحلة المغادرة')
    checkout_date = models.DateField(null=True, blank=True, verbose_name='تاريخ المغادرة')
    checkout_time = models.TimeField(null=True, blank=True, verbose_name='ساعة المغادرة')
    depositor_name = models.CharField(max_length=100, null=True, blank=True, verbose_name='اسم المودع')
    goods = models.TextField(null=True, blank=True, verbose_name='الشحنات')
    notes = models.TextField(null=True, blank=True, verbose_name='ملاحظات إضافية')
    members = models.JSONField(default=list, verbose_name='قائمة الأعضاء في هذه الجلسة')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_check_outs', db_column='created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_check_outs', db_column='updated_by')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'check_out'
        verbose_name = 'جلسة المغادرة'
        verbose_name_plural = 'جلسات المغادرة'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.delegation_id.delegation_leader_name if self.delegation_id else 'غير محدد'} - {self.checkout_date}"