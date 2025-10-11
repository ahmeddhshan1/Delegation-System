from rest_framework import serializers
from .models import (
    MainEvent, SubEvent, Nationality, MilitaryPosition,
    Airport, Airline, Delegation, Member, DepartureSession
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
    main_event_name = serializers.CharField(source='main_event.name', read_only=True)
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


class MilitaryPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MilitaryPosition
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id')


class AirportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id')


class AirlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airline
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id')


class MemberSerializer(serializers.ModelSerializer):
    delegation_nationality = serializers.CharField(source='delegation.nationality.name', read_only=True)
    delegation_sub_event = serializers.CharField(source='delegation.sub_event.name', read_only=True)
    
    class Meta:
        model = Member
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id')
    
    def create(self, validated_data):
        member = super().create(validated_data)
        # Update delegation members count
        member.delegation.update_members_count()
        return member
    
    def update(self, instance, validated_data):
        member = super().update(instance, validated_data)
        # Update delegation members count
        member.delegation.update_members_count()
        return member


class DelegationSerializer(serializers.ModelSerializer):
    nationality_name = serializers.CharField(source='nationality.name', read_only=True)
    sub_event_name = serializers.CharField(source='sub_event.name', read_only=True)
    main_event_name = serializers.CharField(source='sub_event.main_event.name', read_only=True)
    delegation_head = serializers.SerializerMethodField()
    members = MemberSerializer(many=True, read_only=True)
    
    class Meta:
        model = Delegation
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id', 'current_members')
    
    def get_delegation_head(self, obj):
        return obj.get_delegation_head()


class DepartureSessionSerializer(serializers.ModelSerializer):
    delegation_nationality = serializers.CharField(source='delegation.nationality.name', read_only=True)
    delegation_sub_event = serializers.CharField(source='delegation.sub_event.name', read_only=True)
    
    class Meta:
        model = DepartureSession
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'id')


# Statistics Serializers
class EventStatsSerializer(serializers.Serializer):
    total_main_events = serializers.IntegerField()
    total_sub_events = serializers.IntegerField()
    total_delegations = serializers.IntegerField()
    total_members = serializers.IntegerField()
    total_departure_sessions = serializers.IntegerField()


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
