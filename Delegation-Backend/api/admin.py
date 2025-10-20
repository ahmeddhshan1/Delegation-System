from django.contrib import admin
from django.utils.html import format_html
from .models import (
    MainEvent, SubEvent, Nationality, Cities,
    AirLine, AirPort, EquivalentJob, Delegation, Member, CheckOut
)


@admin.register(MainEvent)
class MainEventAdmin(admin.ModelAdmin):
    list_display = ('event_name', 'event_link', 'created_at', 'created_by')
    list_filter = ('created_at',)
    search_fields = ('event_name',)
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'id')
    list_per_page = 25
    
    fieldsets = (
        ('معلومات أساسية', {'fields': ('event_name', 'event_link', 'event_icon')}),
        ('معلومات النظام', {'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by', 'updated_by')
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()


@admin.register(SubEvent)
class SubEventAdmin(admin.ModelAdmin):
    list_display = ('event_name', 'main_event_id', 'created_at', 'created_by')
    list_filter = ('main_event_id', 'created_at')
    search_fields = ('event_name',)
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'id')
    list_per_page = 25
    
    fieldsets = (
        ('معلومات أساسية', {'fields': ('event_name', 'main_event_id')}),
        ('معلومات النظام', {'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('main_event_id', 'created_by', 'updated_by')
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()


@admin.register(Nationality)
class NationalityAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'created_by')
    list_filter = ('created_at',)
    search_fields = ('name',)
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at', 'id')
    list_per_page = 25
    
    fieldsets = (
        ('معلومات أساسية', {'fields': ('name',)}),
        ('معلومات النظام', {'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by', 'updated_by')
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()


@admin.register(Cities)
class CitiesAdmin(admin.ModelAdmin):
    list_display = ('city_name', 'created_at', 'created_by')
    list_filter = ('created_at',)
    search_fields = ('city_name',)
    ordering = ('city_name',)
    readonly_fields = ('created_at', 'updated_at', 'id')
    list_per_page = 25
    
    fieldsets = (
        ('معلومات أساسية', {'fields': ('city_name',)}),
        ('معلومات النظام', {'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by', 'updated_by')
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()


@admin.register(AirLine)
class AirLineAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'created_by')
    list_filter = ('created_at',)
    search_fields = ('name',)
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at', 'id')
    list_per_page = 25
    
    fieldsets = (
        ('معلومات أساسية', {'fields': ('name',)}),
        ('معلومات النظام', {'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by', 'updated_by')
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()


@admin.register(AirPort)
class AirPortAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'created_by')
    list_filter = ('created_at',)
    search_fields = ('name',)
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at', 'id')
    list_per_page = 25
    
    fieldsets = (
        ('معلومات أساسية', {'fields': ('name',)}),
        ('معلومات النظام', {'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by', 'updated_by')
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()


@admin.register(EquivalentJob)
class EquivalentJobAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'created_by')
    list_filter = ('created_at',)
    search_fields = ('name',)
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at', 'id')
    list_per_page = 25
    
    fieldsets = (
        ('معلومات أساسية', {'fields': ('name',)}),
        ('معلومات النظام', {'fields': ('id', 'created_at', 'updated_at', 'created_by', 'updated_by')}),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by', 'updated_by')
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()


@admin.register(Delegation)
class DelegationAdmin(admin.ModelAdmin):
    list_display = ('delegation_leader_name', 'nationality_id', 'sub_event_id', 'type', 'get_status_display_colored', 'current_members', 'member_count', 'created_at')
    list_filter = ('type', 'status', 'sub_event_id__main_event_id', 'created_at')
    search_fields = ('delegation_leader_name', 'nationality_id__name', 'sub_event_id__event_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'current_members')
    list_editable = ('member_count',)
    list_per_page = 25
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('nationality_id', 'sub_event_id__main_event_id', 'created_by', 'updated_by')
    
    def get_status_display_colored(self, obj):
        colors = {
            'NOT_DEPARTED': 'green',
            'PARTIALLY_DEPARTED': 'orange',
            'FULLY_DEPARTED': 'red'
        }
        status_text = {
            'NOT_DEPARTED': 'لم يغادر أحد',
            'PARTIALLY_DEPARTED': 'غادر جزء من الأعضاء',
            'FULLY_DEPARTED': 'غادر جميع الأعضاء'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            status_text.get(obj.status, obj.status)
        )
    get_status_display_colored.short_description = 'حالة الوفد'
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()


class MemberInline(admin.TabularInline):
    model = Member
    extra = 0
    readonly_fields = ('created_at', 'updated_at')
    fields = ('name', 'rank', 'job_title', 'equivalent_job_id', 'status', 'departure_date', 'created_at')
    
    def has_add_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()


# Add inline and fieldsets to DelegationAdmin
DelegationAdmin.inlines = [MemberInline]
DelegationAdmin.fieldsets = (
    ('معلومات أساسية', {'fields': ('sub_event_id', 'nationality_id', 'type', 'status')}),
    ('معلومات رئيس الوفد', {'fields': ('delegation_leader_name',)}),
    ('معلومات الأعضاء', {'fields': ('member_count', 'current_members')}),
    ('معلومات الوصول', {'fields': ('airport_id', 'airline_id', 'city_id', 'flight_number', 'arrive_date', 'arrive_time', 'receiver_name', 'going_to', 'goods')}),
    ('معلومات إضافية', {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by')}),
)


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'delegation_id', 'rank', 'job_title', 'get_member_status_display', 'status', 'departure_date', 'created_at')
    list_filter = ('status', 'rank', 'delegation_id__type', 'delegation_id__sub_event_id__main_event_id', 'created_at')
    search_fields = ('name', 'rank', 'job_title', 'delegation_id__delegation_leader_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('status',)
    list_per_page = 50
    raw_id_fields = ('delegation_id',)
    
    fieldsets = (
        ('معلومات أساسية', {'fields': ('delegation_id', 'name', 'rank', 'job_title')}),
        ('معلومات إضافية', {'fields': ('equivalent_job_id', 'status', 'departure_date')}),
        ('معلومات النظام', {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by')}),
    )
    
    def get_member_status_display(self, obj):
        colors = {
            'NOT_DEPARTED': 'green',
            'DEPARTED': 'red'
        }
        status_text = {
            'NOT_DEPARTED': 'لم يغادر',
            'DEPARTED': 'غادر'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            status_text.get(obj.status, obj.status)
        )
    get_member_status_display.short_description = 'حالة العضو'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('delegation_id__nationality_id', 'delegation_id__sub_event_id', 'created_by', 'updated_by')
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()


@admin.register(CheckOut)
class CheckOutAdmin(admin.ModelAdmin):
    list_display = ('delegation_id', 'nationality_id', 'checkout_date', 'checkout_time', 'flight_number', 'depositor_name', 'created_at')
    list_filter = ('checkout_date', 'created_at')
    search_fields = ('delegation_id__delegation_leader_name', 'nationality_id__name', 'flight_number', 'depositor_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 25
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('delegation_id__nationality_id', 'delegation_id__sub_event_id', 'created_by', 'updated_by')
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()