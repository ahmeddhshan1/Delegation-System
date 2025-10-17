from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Q
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
import json

User = get_user_model()
from django.utils import timezone
from rest_framework.authtoken.models import Token
from .models import (
    MainEvent, SubEvent, Nationality, Cities,
    AirLine, AirPort, EquivalentJob, Delegation, Member, CheckOut
)
from .serializers import (
    MainEventSerializer, SubEventSerializer, NationalitySerializer,
    CitiesSerializer, AirLineSerializer, AirPortSerializer, EquivalentJobSerializer,
    DelegationSerializer, MemberSerializer, CheckOutSerializer,
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
            queryset = queryset.filter(event_name__icontains=search)
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        instance = serializer.save(updated_by=self.request.user)
    
    def perform_destroy(self, instance):
        instance.delete()


class SubEventViewSet(viewsets.ModelViewSet):
    queryset = SubEvent.objects.all()
    serializer_class = SubEventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = SubEvent.objects.all().select_related('main_event_id')
        main_event_id = self.request.query_params.get('main_event_id', None)
        search = self.request.query_params.get('search', None)
        
        if main_event_id:
            queryset = queryset.filter(main_event_id=main_event_id)
        if search:
            queryset = queryset.filter(event_name__icontains=search)
        
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


class CitiesViewSet(viewsets.ModelViewSet):
    queryset = Cities.objects.all()
    serializer_class = CitiesSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Cities.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(city_name__icontains=search)
        return queryset.order_by('city_name')


class AirLineViewSet(viewsets.ModelViewSet):
    queryset = AirLine.objects.all()
    serializer_class = AirLineSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = AirLine.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset.order_by('name')


class AirPortViewSet(viewsets.ModelViewSet):
    queryset = AirPort.objects.all()
    serializer_class = AirPortSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = AirPort.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset.order_by('name')


class EquivalentJobViewSet(viewsets.ModelViewSet):
    queryset = EquivalentJob.objects.all()
    serializer_class = EquivalentJobSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = EquivalentJob.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset.order_by('name')


class DelegationViewSet(viewsets.ModelViewSet):
    queryset = Delegation.objects.all()
    serializer_class = DelegationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Delegation.objects.all().select_related(
            'nationality_id', 'sub_event_id__main_event_id'
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
            queryset = queryset.filter(delegation_leader_name__icontains=search)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        instance = serializer.save(updated_by=self.request.user)
    
    def perform_destroy(self, instance):
        instance.delete()


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Member.objects.all().select_related(
            'delegation_id__nationality_id', 'delegation_id__sub_event_id'
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
    
    def perform_update(self, serializer):
        instance = serializer.save(updated_by=self.request.user)
    
    def perform_destroy(self, instance):
        instance.delete()


class CheckOutViewSet(viewsets.ModelViewSet):
    queryset = CheckOut.objects.all()
    serializer_class = CheckOutSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = CheckOut.objects.all().select_related(
            'delegation_id__nationality_id', 'delegation_id__sub_event_id'
        )
        
        # Filters
        delegation_id = self.request.query_params.get('delegation_id', None)
        checkout_date = self.request.query_params.get('checkout_date', None)
        
        if delegation_id:
            queryset = queryset.filter(delegation_id=delegation_id)
        if checkout_date:
            queryset = queryset.filter(checkout_date=checkout_date)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        # Revert members that were removed from this session to NOT_DEPARTED
        instance: CheckOut = self.get_object()
        old_member_ids = set()
        try:
            old_member_ids = set([str(m) for m in instance.members]) if instance.members else set()
        except Exception:
            old_member_ids = set()

        # Save updates (DB trigger will mark NEW members as DEPARTED)
        instance = serializer.save(updated_by=self.request.user)

        try:
            new_member_ids = set([str(m) for m in instance.members]) if instance.members else set()
        except Exception:
            new_member_ids = set()

        removed_ids = old_member_ids - new_member_ids
        if removed_ids:
            Member.objects.filter(id__in=list(removed_ids), delegation_id=instance.delegation_id).update(
                status='NOT_DEPARTED', departure_date=None
            )
    
    def perform_destroy(self, instance):
        # Before delete: revert members in this session to NOT_DEPARTED
        try:
            member_ids = [str(m) for m in (instance.members or [])]
        except Exception:
            member_ids = []
        if member_ids:
            Member.objects.filter(id__in=member_ids, delegation_id=instance.delegation_id).update(
                status='NOT_DEPARTED', departure_date=None
            )
        instance.delete()


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
            'total_check_outs': CheckOut.objects.count(),
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
            'nationality_id', 'sub_event_id__main_event_id'
        ).order_by('-created_at')[:10]
        
        recent_members = Member.objects.select_related(
            'delegation_id__nationality_id'
        ).order_by('-created_at')[:10]
        
        recent_check_outs = CheckOut.objects.select_related(
            'delegation_id__nationality_id'
        ).order_by('-created_at')[:10]
        
        data = {
            'event_stats': event_stats,
            'delegation_stats': delegation_stats,
            'member_stats': member_stats,
            'recent_delegations': DelegationSerializer(recent_delegations, many=True).data,
            'recent_members': MemberSerializer(recent_members, many=True).data,
            'recent_check_outs': CheckOutSerializer(recent_check_outs, many=True).data,
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
                
                # Create login log
                from accounts.models import LoginLogs
                LoginLogs.objects.create(
                    user=user,
                    device=request.data.get('device_info', {}).get('device', ''),
                    ip_address=self.get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    success=True
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
            # Log failed login attempt
            try:
                user = User.objects.get(username=username)
                from accounts.models import LoginLogs
                LoginLogs.objects.create(
                    user=user,
                    device=request.data.get('device_info', {}).get('device', ''),
                    ip_address=self.get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    success=False
                )
            except User.DoesNotExist:
                pass
            
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """User logout"""
        if request.user.is_authenticated:
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
    
    @action(detail=False, methods=['get'])
    def check_permission(self, request):
        """Check if user has specific permission"""
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
        permission = request.query_params.get('permission')
        if not permission:
            return Response({'error': 'Permission parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        has_permission = request.user.has_perm(permission) if permission else False
        
        return Response({
            'has_permission': has_permission,
            'permission': permission,
            'user_role': request.user.role
        })
    
    @action(detail=False, methods=['get'])
    def user_permissions(self, request):
        """Get all permissions for current user"""
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
        permissions = {
            'is_super_admin': request.user.is_super_admin(),
            'is_admin': request.user.is_admin(),
            'can_manage_users': request.user.can_manage_users(),
            'can_view_reports': request.user.can_view_reports(),
            'can_print_reports': request.user.can_print_reports(),
            'can_delete_data': request.user.can_delete_data(),
            'role': request.user.role,
        }
        
        return Response(permissions)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip