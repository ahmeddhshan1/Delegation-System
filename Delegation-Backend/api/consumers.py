import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from .models import MainEvent, SubEvent, Delegation, Member, DepartureSession
from .serializers import (
    MainEventSerializer, SubEventSerializer, DelegationSerializer, 
    MemberSerializer, DepartureSessionSerializer
)

User = get_user_model()


class DelegationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get user from query params
        self.user = await self.get_user_from_token(self.scope['query_string'].decode())
        if not self.user:
            await self.close()
            return
        
        self.room_group_name = 'delegations'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'get_delegations':
                delegations = await self.get_delegations(data.get('filters', {}))
                await self.send(text_data=json.dumps({
                    'type': 'delegations_data',
                    'data': delegations
                }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def delegation_updated(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'delegation_updated',
            'data': event['data']
        }))

    async def delegation_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'delegation_created',
            'data': event['data']
        }))

    async def delegation_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'delegation_deleted',
            'data': event['data']
        }))

    @database_sync_to_async
    def get_user_from_token(self, query_string):
        try:
            # Parse query string to get token
            params = {}
            for param in query_string.split('&'):
                if '=' in param:
                    key, value = param.split('=', 1)
                    params[key] = value
            
            token_key = params.get('token')
            if not token_key:
                return None
            
            token = Token.objects.get(key=token_key)
            return token.user
        except:
            return None

    @database_sync_to_async
    def get_delegations(self, filters):
        queryset = Delegation.objects.all().select_related(
            'nationality', 'sub_event__main_event'
        ).prefetch_related('members')
        
        # Apply filters
        if filters.get('sub_event_id'):
            queryset = queryset.filter(sub_event_id=filters['sub_event_id'])
        if filters.get('nationality_id'):
            queryset = queryset.filter(nationality_id=filters['nationality_id'])
        if filters.get('type'):
            queryset = queryset.filter(type=filters['type'])
        if filters.get('status'):
            queryset = queryset.filter(status=filters['status'])
        
        return DelegationSerializer(queryset, many=True).data


class MemberConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = await self.get_user_from_token(self.scope['query_string'].decode())
        if not self.user:
            await self.close()
            return
        
        self.room_group_name = 'members'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'get_members':
                members = await self.get_members(data.get('filters', {}))
                await self.send(text_data=json.dumps({
                    'type': 'members_data',
                    'data': members
                }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def member_updated(self, event):
        await self.send(text_data=json.dumps({
            'type': 'member_updated',
            'data': event['data']
        }))

    async def member_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'member_created',
            'data': event['data']
        }))

    async def member_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'member_deleted',
            'data': event['data']
        }))

    @database_sync_to_async
    def get_user_from_token(self, query_string):
        try:
            params = {}
            for param in query_string.split('&'):
                if '=' in param:
                    key, value = param.split('=', 1)
                    params[key] = value
            
            token_key = params.get('token')
            if not token_key:
                return None
            
            token = Token.objects.get(key=token_key)
            return token.user
        except:
            return None

    @database_sync_to_async
    def get_members(self, filters):
        queryset = Member.objects.all().select_related(
            'delegation__nationality', 'delegation__sub_event'
        )
        
        if filters.get('delegation_id'):
            queryset = queryset.filter(delegation_id=filters['delegation_id'])
        if filters.get('status'):
            queryset = queryset.filter(status=filters['status'])
        
        return MemberSerializer(queryset, many=True).data


class EventConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = await self.get_user_from_token(self.scope['query_string'].decode())
        if not self.user:
            await self.close()
            return
        
        self.room_group_name = 'events'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'get_events':
                events = await self.get_events()
                await self.send(text_data=json.dumps({
                    'type': 'events_data',
                    'data': events
                }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def event_updated(self, event):
        await self.send(text_data=json.dumps({
            'type': 'event_updated',
            'data': event['data']
        }))

    async def event_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'event_created',
            'data': event['data']
        }))

    async def event_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'event_deleted',
            'data': event['data']
        }))

    @database_sync_to_async
    def get_user_from_token(self, query_string):
        try:
            params = {}
            for param in query_string.split('&'):
                if '=' in param:
                    key, value = param.split('=', 1)
                    params[key] = value
            
            token_key = params.get('token')
            if not token_key:
                return None
            
            token = Token.objects.get(key=token_key)
            return token.user
        except:
            return None

    @database_sync_to_async
    def get_events(self):
        main_events = MainEvent.objects.all().prefetch_related('sub_events')
        return MainEventSerializer(main_events, many=True).data


class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = await self.get_user_from_token(self.scope['query_string'].decode())
        if not self.user:
            await self.close()
            return
        
        self.room_group_name = 'dashboard'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'get_stats':
                stats = await self.get_dashboard_stats()
                await self.send(text_data=json.dumps({
                    'type': 'stats_data',
                    'data': stats
                }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def stats_updated(self, event):
        await self.send(text_data=json.dumps({
            'type': 'stats_updated',
            'data': event['data']
        }))

    @database_sync_to_async
    def get_user_from_token(self, query_string):
        try:
            params = {}
            for param in query_string.split('&'):
                if '=' in param:
                    key, value = param.split('=', 1)
                    params[key] = value
            
            token_key = params.get('token')
            if not token_key:
                return None
            
            token = Token.objects.get(key=token_key)
            return token.user
        except:
            return None

    @database_sync_to_async
    def get_dashboard_stats(self):
        from django.db.models import Count
        
        event_stats = {
            'total_main_events': MainEvent.objects.count(),
            'total_sub_events': SubEvent.objects.count(),
            'total_delegations': Delegation.objects.count(),
            'total_members': Member.objects.count(),
            'total_departure_sessions': DepartureSession.objects.count(),
        }
        
        delegation_stats = {
            'total_delegations': Delegation.objects.count(),
            'military_delegations': Delegation.objects.filter(type='MILITARY').count(),
            'civilian_delegations': Delegation.objects.filter(type='CIVILIAN').count(),
            'not_departed': Delegation.objects.filter(status='NOT_DEPARTED').count(),
            'partially_departed': Delegation.objects.filter(status='PARTIALLY_DEPARTED').count(),
            'fully_departed': Delegation.objects.filter(status='FULLY_DEPARTED').count(),
        }
        
        member_stats = {
            'total_members': Member.objects.count(),
            'not_departed_members': Member.objects.filter(status='NOT_DEPARTED').count(),
            'departed_members': Member.objects.filter(status='DEPARTED').count(),
        }
        
        return {
            'event_stats': event_stats,
            'delegation_stats': delegation_stats,
            'member_stats': member_stats,
        }
