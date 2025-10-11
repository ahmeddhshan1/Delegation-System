from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Q
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

User = get_user_model()
from django.utils import timezone
from rest_framework.authtoken.models import Token
from .models import (
    MainEvent, SubEvent, Nationality, MilitaryPosition,
    Airport, Airline, Delegation, Member, DepartureSession
)
from .serializers import (
    MainEventSerializer, SubEventSerializer, NationalitySerializer,
    MilitaryPositionSerializer, AirportSerializer, AirlineSerializer,
    DelegationSerializer, MemberSerializer, DepartureSessionSerializer,
    DashboardDataSerializer
)


class MainEventViewSet(viewsets.ModelViewSet):
    queryset = MainEvent.objects.all()
    serializer_class = MainEventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = MainEvent.objects.all().prefetch_related('sub_events')
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)
        self.send_websocket_update('event_created', instance)
    
    def perform_update(self, serializer):
        instance = serializer.save(updated_by=self.request.user)
        self.send_websocket_update('event_updated', instance)
    
    def perform_destroy(self, instance):
        self.send_websocket_update('event_deleted', instance)
        instance.delete()
    
    def send_websocket_update(self, event_type, instance):
        channel_layer = get_channel_layer()
        serializer_data = MainEventSerializer(instance).data
        async_to_sync(channel_layer.group_send)(
            'events',
            {
                'type': event_type,
                'data': serializer_data
            }
        )


class SubEventViewSet(viewsets.ModelViewSet):
    queryset = SubEvent.objects.all()
    serializer_class = SubEventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = SubEvent.objects.all().select_related('main_event')
        main_event_id = self.request.query_params.get('main_event_id', None)
        search = self.request.query_params.get('search', None)
        
        if main_event_id:
            queryset = queryset.filter(main_event_id=main_event_id)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset.order_by('-created_at')


class NationalityViewSet(viewsets.ModelViewSet):
    queryset = Nationality.objects.all()
    serializer_class = NationalitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Nationality.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset.order_by('name')


class MilitaryPositionViewSet(viewsets.ModelViewSet):
    queryset = MilitaryPosition.objects.all()
    serializer_class = MilitaryPositionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = MilitaryPosition.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset.order_by('rank_level', 'name')


class AirportViewSet(viewsets.ModelViewSet):
    queryset = Airport.objects.all()
    serializer_class = AirportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Airport.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(code__icontains=search) |
                Q(city__icontains=search)
            )
        return queryset.order_by('name')


class AirlineViewSet(viewsets.ModelViewSet):
    queryset = Airline.objects.all()
    serializer_class = AirlineSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Airline.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(code__icontains=search)
            )
        return queryset.order_by('name')


class DelegationViewSet(viewsets.ModelViewSet):
    queryset = Delegation.objects.all()
    serializer_class = DelegationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Delegation.objects.all().select_related(
            'nationality', 'sub_event__main_event'
        ).prefetch_related('members')
        
        # Filters
        sub_event_id = self.request.query_params.get('sub_event_id', None)
        nationality_id = self.request.query_params.get('nationality_id', None)
        delegation_type = self.request.query_params.get('type', None)
        status_filter = self.request.query_params.get('status', None)
        search = self.request.query_params.get('search', None)
        
        if sub_event_id:
            queryset = queryset.filter(sub_event_id=sub_event_id)
        if nationality_id:
            queryset = queryset.filter(nationality_id=nationality_id)
        if delegation_type:
            queryset = queryset.filter(type=delegation_type)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if search:
            queryset = queryset.filter(nationality__name__icontains=search)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)
        self.send_websocket_update('delegation_created', instance)
    
    def perform_update(self, serializer):
        instance = serializer.save(updated_by=self.request.user)
        self.send_websocket_update('delegation_updated', instance)
    
    def perform_destroy(self, instance):
        self.send_websocket_update('delegation_deleted', instance)
        instance.delete()
    
    def send_websocket_update(self, event_type, instance):
        channel_layer = get_channel_layer()
        serializer_data = DelegationSerializer(instance).data
        async_to_sync(channel_layer.group_send)(
            'delegations',
            {
                'type': event_type,
                'data': serializer_data
            }
        )
        # Also update dashboard stats
        async_to_sync(channel_layer.group_send)(
            'dashboard',
            {
                'type': 'stats_updated',
                'data': {'type': 'delegation_change'}
            }
        )


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Member.objects.all().select_related(
            'delegation__nationality', 'delegation__sub_event'
        )
        
        # Filters
        delegation_id = self.request.query_params.get('delegation_id', None)
        status_filter = self.request.query_params.get('status', None)
        search = self.request.query_params.get('search', None)
        
        if delegation_id:
            queryset = queryset.filter(delegation_id=delegation_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)
        self.send_websocket_update('member_created', instance)
    
    def perform_update(self, serializer):
        instance = serializer.save(updated_by=self.request.user)
        self.send_websocket_update('member_updated', instance)
    
    def perform_destroy(self, instance):
        self.send_websocket_update('member_deleted', instance)
        instance.delete()
    
    def send_websocket_update(self, event_type, instance):
        channel_layer = get_channel_layer()
        serializer_data = MemberSerializer(instance).data
        async_to_sync(channel_layer.group_send)(
            'members',
            {
                'type': event_type,
                'data': serializer_data
            }
        )
        # Also update dashboard stats
        async_to_sync(channel_layer.group_send)(
            'dashboard',
            {
                'type': 'stats_updated',
                'data': {'type': 'member_change'}
            }
        )


class DepartureSessionViewSet(viewsets.ModelViewSet):
    queryset = DepartureSession.objects.all()
    serializer_class = DepartureSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = DepartureSession.objects.all().select_related(
            'delegation__nationality', 'delegation__sub_event'
        )
        
        # Filters
        delegation_id = self.request.query_params.get('delegation_id', None)
        session_type = self.request.query_params.get('session_type', None)
        
        if delegation_id:
            queryset = queryset.filter(delegation_id=delegation_id)
        if session_type:
            queryset = queryset.filter(session_type=session_type)
        
        return queryset.order_by('-created_at')


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get dashboard statistics"""
        
        # Event stats
        event_stats = {
            'total_main_events': MainEvent.objects.count(),
            'total_sub_events': SubEvent.objects.count(),
            'total_delegations': Delegation.objects.count(),
            'total_members': Member.objects.count(),
            'total_departure_sessions': DepartureSession.objects.count(),
        }
        
        # Delegation stats
        delegation_stats = {
            'total_delegations': Delegation.objects.count(),
            'military_delegations': Delegation.objects.filter(type='MILITARY').count(),
            'civilian_delegations': Delegation.objects.filter(type='CIVILIAN').count(),
            'not_departed': Delegation.objects.filter(status='NOT_DEPARTED').count(),
            'partially_departed': Delegation.objects.filter(status='PARTIALLY_DEPARTED').count(),
            'fully_departed': Delegation.objects.filter(status='FULLY_DEPARTED').count(),
        }
        
        # Member stats
        member_stats = {
            'total_members': Member.objects.count(),
            'not_departed_members': Member.objects.filter(status='NOT_DEPARTED').count(),
            'departed_members': Member.objects.filter(status='DEPARTED').count(),
        }
        
        # Recent data
        recent_delegations = Delegation.objects.select_related(
            'nationality', 'sub_event__main_event'
        ).order_by('-created_at')[:10]
        
        recent_members = Member.objects.select_related(
            'delegation__nationality'
        ).order_by('-created_at')[:10]
        
        data = {
            'event_stats': event_stats,
            'delegation_stats': delegation_stats,
            'member_stats': member_stats,
            'recent_delegations': DelegationSerializer(recent_delegations, many=True).data,
            'recent_members': MemberSerializer(recent_members, many=True).data,
        }
        
        return Response(data)


class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """User login"""
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                token, created = Token.objects.get_or_create(user=user)
                
                # Create login session
                from accounts.models import LoginSession
                LoginSession.objects.create(
                    user=user,
                    device_info=request.data.get('device_info', {}),
                    ip_address=self.get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
                
                return Response({
                    'token': token.key,
                    'user': {
                        'id': str(user.id),
                        'username': user.username,
                        'full_name': user.full_name,
                        'role': user.role,
                        'is_super_admin': user.is_super_admin(),
                        'is_admin': user.is_admin(),
                    }
                })
            else:
                return Response(
                    {'error': 'Account is disabled'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """User logout"""
        if request.user.is_authenticated:
            # End active login session
            from accounts.models import LoginSession
            LoginSession.objects.filter(
                user=request.user, 
                is_active=True
            ).update(is_active=False, logout_time=timezone.now())
            
            logout(request)
            return Response({'message': 'Logged out successfully'})
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user info"""
        if request.user.is_authenticated:
            return Response({
                'id': str(request.user.id),
                'username': request.user.username,
                'full_name': request.user.full_name,
                'role': request.user.role,
                'is_super_admin': request.user.is_super_admin(),
                'is_admin': request.user.is_admin(),
                'can_manage_users': request.user.can_manage_users(),
                'can_view_reports': request.user.can_view_reports(),
                'can_print_reports': request.user.can_print_reports(),
                'can_delete_data': request.user.can_delete_data(),
            })
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['post'])
    def create_admin_session(self, request):
        """Create Django Admin session for Super Admin users"""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Not authenticated'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if user is Super Admin
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Access denied. Super Admin privileges required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create Django Admin session
        try:
            # Ensure user has Django admin permissions
            if not request.user.is_staff:
                request.user.is_staff = True
                request.user.save()
            
            # Login user to Django admin session
            login(request, request.user)
            
            # Get CSRF token for admin
            from django.middleware.csrf import get_token
            csrf_token = get_token(request)
            
            # Create a special admin token for direct access
            import secrets
            admin_token = secrets.token_urlsafe(32)
            
            # Store admin token in session for later verification
            request.session['admin_access_token'] = admin_token
            request.session['admin_user_id'] = str(request.user.id)
            
            return Response({
                'success': True,
                'admin_url': f'/admin/?admin_token={admin_token}',
                'csrf_token': csrf_token,
                'session_key': request.session.session_key,
                'admin_token': admin_token,
                'message': 'Django Admin session created successfully'
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to create admin session: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip