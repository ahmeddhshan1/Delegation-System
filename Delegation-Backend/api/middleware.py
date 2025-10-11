from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.sessions.models import Session
import re

User = get_user_model()


class CSRFExemptMiddleware(MiddlewareMixin):
    """
    Middleware to exempt API endpoints from CSRF protection
    """
    
    def process_request(self, request):
        # Check if the URL matches any CSRF exempt patterns
        path = request.path_info
        
        # Exempt all API URLs from CSRF
        if path.startswith('/api/'):
            request._dont_enforce_csrf_checks = True
        
        return None


class AdminSessionMiddleware(MiddlewareMixin):
    """
    Middleware to handle admin session authentication from frontend
    """
    
    def process_request(self, request):
        # Check if this is an admin request with admin_token parameter
        if request.path.startswith('/admin/') and request.GET.get('admin_token'):
            admin_token = request.GET.get('admin_token')
            
            try:
                # Find session with matching admin token
                sessions = Session.objects.all()
                for session in sessions:
                    session_data = session.get_decoded()
                    stored_token = session_data.get('admin_access_token')
                    user_id = session_data.get('admin_user_id')
                    
                    if stored_token == admin_token and user_id:
                        # Get user and authenticate
                        user = User.objects.get(id=user_id)
                        if user.is_active and user.is_super_admin():
                            # Set the user in the request
                            request.user = user
                            request._admin_session_authenticated = True
                            break
                        
            except (Session.DoesNotExist, User.DoesNotExist, KeyError):
                pass
        
        return None
