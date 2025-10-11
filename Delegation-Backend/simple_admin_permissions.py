#!/usr/bin/env python
"""
Simple script to give admin permissions
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def give_admin_permissions():
    """Give admin permissions to najibe user"""
    print("Setting up admin permissions for najibe user...")
    
    try:
        # Get the user
        user = User.objects.get(username='najibe')
        print(f"Found user: {user.username}")
        
        # Make sure user has all admin privileges
        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
        user.save()
        
        print("User permissions updated:")
        print(f"  is_superuser: {user.is_superuser}")
        print(f"  is_staff: {user.is_staff}")
        print(f"  is_active: {user.is_active}")
        
        # Test if user can access admin
        can_access = user.is_staff and user.is_active
        print(f"  Can access admin: {can_access}")
        
        if user.is_superuser:
            print("User has SUPERUSER privileges - can do anything in Django Admin!")
        
        return True
        
    except User.DoesNotExist:
        print("Error: User 'najibe' not found!")
        return False
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    try:
        print("Admin Permissions Setup")
        print("=" * 30)
        
        success = give_admin_permissions()
        
        if success:
            print("\nSUCCESS!")
            print("User 'najibe' now has full admin access!")
            print("You can login to Django Admin and modify/delete anything.")
        else:
            print("\nFAILED!")
            sys.exit(1)
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
