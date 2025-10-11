from django.contrib import admin
from django.utils.html import format_html
from .models import (
    MainEvent, SubEvent, Nationality, MilitaryPosition, 
    Airport, Airline, Delegation, Member, DepartureSession
)


@admin.register(MainEvent)
class MainEventAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'created_at', 'created_by')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 25
    
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
    list_display = ('name', 'main_event', 'created_at', 'created_by')
    list_filter = ('main_event', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 25
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('main_event', 'created_by', 'updated_by')
    
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
    list_display = ('name', 'code', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'code')
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 25
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()


@admin.register(MilitaryPosition)
class MilitaryPositionAdmin(admin.ModelAdmin):
    list_display = ('name', 'equivalent_position', 'rank_level', 'created_at')
    list_filter = ('rank_level', 'created_at')
    search_fields = ('name', 'equivalent_position')
    ordering = ('rank_level', 'name')
    readonly_fields = ('created_at', 'updated_at')
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()


@admin.register(Airport)
class AirportAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'city', 'country', 'created_at')
    list_filter = ('country', 'created_at')
    search_fields = ('name', 'code', 'city', 'country')
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()


@admin.register(Airline)
class AirlineAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'country', 'created_at')
    list_filter = ('country', 'created_at')
    search_fields = ('name', 'code', 'country')
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    
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
    list_display = ('nationality', 'sub_event', 'type', 'get_status_display_colored', 'get_members_display', 'max_members', 'created_at')
    list_filter = ('type', 'status', 'sub_event__main_event', 'created_at')
    search_fields = ('nationality__name', 'sub_event__name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'current_members')
    list_editable = ('max_members',)
    list_per_page = 25
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('nationality', 'sub_event__main_event', 'created_by', 'updated_by')
    
    def get_delegation_head(self, obj):
        return obj.get_delegation_head()
    get_delegation_head.short_description = 'رئيس الوفد'
    
    def get_members_display(self, obj):
        return format_html(
            '<span style="color: {};">{}/{} أعضاء</span>',
            'green' if obj.current_members <= obj.max_members else 'red',
            obj.current_members,
            obj.max_members
        )
    get_members_display.short_description = 'عدد الأعضاء'
    
    def get_status_display_colored(self, obj):
        colors = {
            'NOT_DEPARTED': 'green',
            'PARTIALLY_DEPARTED': 'orange',
            'FULLY_DEPARTED': 'red'
        }
        status_text = {
            'NOT_DEPARTED': 'لم يغادر',
            'PARTIALLY_DEPARTED': 'غادر جزئياً',
            'FULLY_DEPARTED': 'غادر بالكامل'
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
    fields = ('name', 'rank', 'position', 'equivalent_position', 'status', 'created_at')
    
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
    ('معلومات أساسية', {'fields': ('sub_event', 'nationality', 'type', 'status')}),
    ('معلومات الأعضاء', {'fields': ('max_members', 'current_members')}),
    ('معلومات الوصول', {'fields': ('arrival_info',)}),
    ('معلومات إضافية', {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'device_info')}),
)

# Add bulk actions
DelegationAdmin.actions = ['mark_as_not_departed', 'mark_as_partially_departed', 'mark_as_fully_departed', 'export_selected']

def mark_as_not_departed(modeladmin, request, queryset):
    """Mark selected delegations as not departed"""
    queryset.update(status='NOT_DEPARTED')
    modeladmin.message_user(request, f"تم تحديث {queryset.count()} وفد إلى حالة 'لم يغادر'")
mark_as_not_departed.short_description = "تحديث إلى 'لم يغادر'"

def mark_as_partially_departed(modeladmin, request, queryset):
    """Mark selected delegations as partially departed"""
    queryset.update(status='PARTIALLY_DEPARTED')
    modeladmin.message_user(request, f"تم تحديث {queryset.count()} وفد إلى حالة 'غادر جزئياً'")
mark_as_partially_departed.short_description = "تحديث إلى 'غادر جزئياً'"

def mark_as_fully_departed(modeladmin, request, queryset):
    """Mark selected delegations as fully departed"""
    queryset.update(status='FULLY_DEPARTED')
    modeladmin.message_user(request, f"تم تحديث {queryset.count()} وفد إلى حالة 'غادر بالكامل'")
mark_as_fully_departed.short_description = "تحديث إلى 'غادر بالكامل'"

def export_selected(modeladmin, request, queryset):
    """Export selected delegations data"""
    # This would typically export to CSV or Excel
    modeladmin.message_user(request, f"تم تصدير بيانات {queryset.count()} وفد")
export_selected.short_description = "تصدير البيانات المحددة"

# Assign actions to DelegationAdmin
DelegationAdmin.mark_as_not_departed = mark_as_not_departed
DelegationAdmin.mark_as_partially_departed = mark_as_partially_departed
DelegationAdmin.mark_as_fully_departed = mark_as_fully_departed
DelegationAdmin.export_selected = export_selected


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'delegation', 'rank', 'position', 'get_member_status_display', 'status', 'created_at')
    list_filter = ('status', 'rank', 'delegation__type', 'delegation__sub_event__main_event', 'created_at')
    search_fields = ('name', 'rank', 'position', 'delegation__nationality__name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('status',)
    list_per_page = 50
    raw_id_fields = ('delegation',)
    
    fieldsets = (
        ('معلومات أساسية', {'fields': ('delegation', 'name', 'rank', 'position')}),
        ('معلومات إضافية', {'fields': ('equivalent_position', 'status')}),
        ('معلومات النظام', {'fields': ('created_at', 'updated_at', 'created_by', 'updated_by', 'device_info')}),
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
        return super().get_queryset(request).select_related('delegation__nationality', 'delegation__sub_event', 'created_by', 'updated_by')
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()

# Add bulk actions for Member
MemberAdmin.actions = ['mark_members_as_not_departed', 'mark_members_as_departed', 'export_members']

def mark_members_as_not_departed(modeladmin, request, queryset):
    """Mark selected members as not departed"""
    queryset.update(status='NOT_DEPARTED')
    modeladmin.message_user(request, f"تم تحديث {queryset.count()} عضو إلى حالة 'لم يغادر'")
mark_members_as_not_departed.short_description = "تحديث الأعضاء إلى 'لم يغادر'"

def mark_members_as_departed(modeladmin, request, queryset):
    """Mark selected members as departed"""
    queryset.update(status='DEPARTED')
    modeladmin.message_user(request, f"تم تحديث {queryset.count()} عضو إلى حالة 'غادر'")
mark_members_as_departed.short_description = "تحديث الأعضاء إلى 'غادر'"

def export_members(modeladmin, request, queryset):
    """Export selected members data"""
    # This would typically export to CSV or Excel
    modeladmin.message_user(request, f"تم تصدير بيانات {queryset.count()} عضو")
export_members.short_description = "تصدير بيانات الأعضاء"

# Assign actions to MemberAdmin
MemberAdmin.mark_members_as_not_departed = mark_members_as_not_departed
MemberAdmin.mark_members_as_departed = mark_members_as_departed
MemberAdmin.export_members = export_members


@admin.register(DepartureSession)
class DepartureSessionAdmin(admin.ModelAdmin):
    list_display = ('delegation', 'session_type', 'created_at', 'created_by')
    list_filter = ('session_type', 'created_at')
    search_fields = ('delegation__nationality__name', 'delegation__sub_event__name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 25
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('delegation__nationality', 'delegation__sub_event', 'created_by', 'updated_by')
    
    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()
    
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_super_admin()

# Add bulk actions for DepartureSession
DepartureSessionAdmin.actions = ['export_departure_sessions']

def export_departure_sessions(modeladmin, request, queryset):
    """Export selected departure sessions data"""
    # This would typically export to CSV or Excel
    modeladmin.message_user(request, f"تم تصدير بيانات {queryset.count()} جلسة مغادرة")
export_departure_sessions.short_description = "تصدير جلسات المغادرة"

# Assign actions to DepartureSessionAdmin
DepartureSessionAdmin.export_departure_sessions = export_departure_sessions