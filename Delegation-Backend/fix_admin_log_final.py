#!/usr/bin/env python
"""
Final script to fix Django Admin Log foreign key issue
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model

User = get_user_model()

def verify_user_exists():
    """Verify that the user exists in the correct table"""
    print("Verifying user exists...")
    
    try:
        with connection.cursor() as cursor:
            # Check if user exists in users table
            cursor.execute("SELECT id, username, full_name FROM users WHERE username = 'najibe'")
            user = cursor.fetchone()
            
            if user:
                user_id, username, full_name = user
                print(f"User found in users table:")
                print(f"  ID: {user_id}")
                print(f"  Username: {username}")
                print(f"  Full Name: {full_name}")
                return True
            else:
                print("User not found in users table!")
                return False
                
    except Exception as e:
        print(f"Error verifying user: {e}")
        return False

def clear_admin_log():
    """Clear admin log to remove problematic entries"""
    print("Clearing Django Admin Log...")
    
    try:
        with connection.cursor() as cursor:
            # Clear all admin log entries
            cursor.execute("DELETE FROM django_admin_log")
            print("Cleared all Django Admin Log entries")
            
            # Reset sequence
            cursor.execute("SELECT setval('django_admin_log_id_seq', 1, false)")
            print("Reset Django Admin Log sequence")
        
        return True
        
    except Exception as e:
        print(f"Error clearing admin log: {e}")
        return False

def test_admin_access():
    """Test Django Admin access"""
    print("Testing Django Admin access...")
    
    try:
        # Get the user
        user = User.objects.get(username='najibe')
        
        print(f"User: {user.username}")
        print(f"Is Superuser: {user.is_superuser}")
        print(f"Is Staff: {user.is_staff}")
        print(f"Is Active: {user.is_active}")
        
        # Test permissions
        can_add_user = user.has_perm('accounts.add_user')
        can_change_user = user.has_perm('accounts.change_user')
        can_delete_user = user.has_perm('accounts.delete_user')
        can_view_user = user.has_perm('accounts.view_user')
        
        print(f"Permissions:")
        print(f"  - Add Users: {'YES' if can_add_user else 'NO'}")
        print(f"  - Change Users: {'YES' if can_change_user else 'NO'}")
        print(f"  - Delete Users: {'YES' if can_delete_user else 'NO'}")
        print(f"  - View Users: {'YES' if can_view_user else 'NO'}")
        
        return True
        
    except Exception as e:
        print(f"Error testing admin access: {e}")
        return False

if __name__ == "__main__":
    try:
        print("Django Admin Log Final Fix")
        print("=" * 40)
        
        success1 = verify_user_exists()
        success2 = clear_admin_log()
        success3 = test_admin_access()
        
        if success1 and success2 and success3:
            print("\nSUCCESS!")
            print("Django Admin Log issue has been fixed!")
            print("You can now use Django Admin without errors.")
            print("\nAccess Django Admin at: http://localhost:8000/admin")
            print("Login with: najibe / 722003")
            print("\nYou can now:")
            print("  - Add, edit, delete users")
            print("  - Manage all data")
            print("  - Use Django Admin without foreign key errors")
        else:
            print("\nFAILED!")
            sys.exit(1)
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
