from rest_framework import serializers
from .models import (
    MainEvent, SubEvent, Nationality, Cities,
    AirLine, AirPort, EquivalentJob, Delegation, Member, CheckOut
)


class MainEventSerializer(serializers.ModelSerializer):
    sub_events_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MainEvent
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id')
    
    def get_sub_events_count(self, obj):
        return obj.sub_events.count()


class SubEventSerializer(serializers.ModelSerializer):
    main_event_name = serializers.CharField(source='main_event_id.event_name', read_only=True)
    delegations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SubEvent
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id')
    
    def get_delegations_count(self, obj):
        return obj.delegations.count()


class NationalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Nationality
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id')


class CitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cities
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id')


class AirLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = AirLine
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id')


class AirPortSerializer(serializers.ModelSerializer):
    class Meta:
        model = AirPort
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id')


class EquivalentJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquivalentJob
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id')


class MemberSerializer(serializers.ModelSerializer):
    delegation_nationality = serializers.CharField(source='delegation_id.nationality_id.name', read_only=True)
    delegation_sub_event = serializers.CharField(source='delegation_id.sub_event_id.event_name', read_only=True)
    equivalent_job_name = serializers.CharField(source='equivalent_job_id.name', read_only=True)
    
    class Meta:
        model = Member
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id')
    
    def create(self, validated_data):
        member = super().create(validated_data)
        # Update delegation members count
        if member.delegation_id:
            member.delegation_id.update_members_count()
        return member
    
    def update(self, instance, validated_data):
        member = super().update(instance, validated_data)
        # Update delegation members count
        if member.delegation_id:
            member.delegation_id.update_members_count()
        return member


class DelegationSerializer(serializers.ModelSerializer):
    nationality_name = serializers.CharField(source='nationality_id.name', read_only=True)
    sub_event_name = serializers.CharField(source='sub_event_id.event_name', read_only=True)
    main_event_name = serializers.CharField(source='sub_event_id.main_event_id.event_name', read_only=True)
    airport_name = serializers.CharField(source='airport_id.name', read_only=True)
    airline_name = serializers.CharField(source='airline_id.name', read_only=True)
    city_name = serializers.CharField(source='city_id.city_name', read_only=True)
    members = MemberSerializer(many=True, read_only=True)
    
    class Meta:
        model = Delegation
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id', 'current_members')


class CheckOutSerializer(serializers.ModelSerializer):
    delegation_nationality = serializers.CharField(source='delegation_id.nationality_id.name', read_only=True)
    delegation_sub_event = serializers.CharField(source='delegation_id.sub_event_id.event_name', read_only=True)
    airport_name = serializers.CharField(source='airport_id.name', read_only=True)
    airline_name = serializers.CharField(source='airline_id.name', read_only=True)
    city_name = serializers.CharField(source='city_id.city_name', read_only=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # تحويل member IDs إلى member objects كاملة
        if 'members' in data and data['members']:
            from .models import Member
            member_ids = data['members']
            if isinstance(member_ids, list) and member_ids:
                try:
                    members = Member.objects.filter(id__in=member_ids).values('id', 'name', 'rank')
                    member_dict = {str(member['id']): member for member in members}
                    data['members'] = [member_dict.get(str(member_id), {'id': member_id, 'name': f'عضو #{member_id}', 'rank': ''}) for member_id in member_ids]
                except Exception as e:
                    # في حالة الخطأ، نترك البيانات كما هي
                    pass
        
        return data
    
    class Meta:
        model = CheckOut
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id')


# Statistics Serializers
class EventStatsSerializer(serializers.Serializer):
    total_main_events = serializers.IntegerField()
    total_sub_events = serializers.IntegerField()
    total_delegations = serializers.IntegerField()
    total_members = serializers.IntegerField()
    total_check_outs = serializers.IntegerField()


class DelegationStatsSerializer(serializers.Serializer):
    total_delegations = serializers.IntegerField()
    military_delegations = serializers.IntegerField()
    civilian_delegations = serializers.IntegerField()
    not_departed = serializers.IntegerField()
    partially_departed = serializers.IntegerField()
    fully_departed = serializers.IntegerField()


class MemberStatsSerializer(serializers.Serializer):
    total_members = serializers.IntegerField()
    not_departed_members = serializers.IntegerField()
    departed_members = serializers.IntegerField()


# Dashboard Data Serializer
class DashboardDataSerializer(serializers.Serializer):
    event_stats = EventStatsSerializer()
    delegation_stats = DelegationStatsSerializer()
    member_stats = MemberStatsSerializer()
    recent_delegations = DelegationSerializer(many=True)
    recent_members = MemberSerializer(many=True)
    recent_check_outs = CheckOutSerializer(many=True)