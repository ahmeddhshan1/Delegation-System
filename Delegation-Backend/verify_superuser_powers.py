#!/usr/bin/env python
"""
Final verification of superuser powers
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.admin.sites import site
from django.contrib.auth.models import Permission

User = get_user_model()

def verify_superuser_powers():
    """Verify superuser has all powers"""
    print("SUPERUSER POWERS VERIFICATION")
    print("=" * 50)
    
    try:
        # Get superuser
        user = User.objects.get(username='najibe')
        print(f"User: {user.username}")
        print(f"Role: {user.role}")
        print(f"Is Superuser: {user.is_superuser}")
        print(f"Is Staff: {user.is_staff}")
        print(f"Is Active: {user.is_active}")
        
        # Test Django Admin access
        can_access_admin = user.is_staff and user.is_active
        print(f"Can Access Django Admin: {'YES' if can_access_admin else 'NO'}")
        
        # Count permissions
        user_permissions = user.user_permissions.count()
        group_permissions = sum(user.groups.values_list('permissions', flat=True).distinct().count() for group in user.groups.all())
        total_permissions = Permission.objects.count()
        
        print(f"\nPermission Count:")
        print(f"  Direct permissions: {user_permissions}")
        print(f"  Group permissions: {group_permissions}")
        print(f"  Total system permissions: {total_permissions}")
        
        # Test specific powers
        print(f"\nSPECIFIC POWERS:")
        
        # User management
        can_add_user = user.has_perm('accounts.add_user')
        can_change_user = user.has_perm('accounts.change_user')
        can_delete_user = user.has_perm('accounts.delete_user')
        can_view_user = user.has_perm('accounts.view_user')
        
        print(f"  User Management:")
        print(f"    - Add Users: {'YES' if can_add_user else 'NO'}")
        print(f"    - Edit Users: {'YES' if can_change_user else 'NO'}")
        print(f"    - Delete Users: {'YES' if can_delete_user else 'NO'}")
        print(f"    - View Users: {'YES' if can_view_user else 'NO'}")
        
        # Event management
        can_add_event = user.has_perm('api.add_mainevent')
        can_change_event = user.has_perm('api.change_mainevent')
        can_delete_event = user.has_perm('api.delete_mainevent')
        can_view_event = user.has_perm('api.view_mainevent')
        
        print(f"  Event Management:")
        print(f"    - Add Events: {'YES' if can_add_event else 'NO'}")
        print(f"    - Edit Events: {'YES' if can_change_event else 'NO'}")
        print(f"    - Delete Events: {'YES' if can_delete_event else 'NO'}")
        print(f"    - View Events: {'YES' if can_view_event else 'NO'}")
        
        # Delegation management
        can_add_delegation = user.has_perm('api.add_delegation')
        can_change_delegation = user.has_perm('api.change_delegation')
        can_delete_delegation = user.has_perm('api.delete_delegation')
        can_view_delegation = user.has_perm('api.view_delegation')
        
        print(f"  Delegation Management:")
        print(f"    - Add Delegations: {'YES' if can_add_delegation else 'NO'}")
        print(f"    - Edit Delegations: {'YES' if can_change_delegation else 'NO'}")
        print(f"    - Delete Delegations: {'YES' if can_delete_delegation else 'NO'}")
        print(f"    - View Delegations: {'YES' if can_view_delegation else 'NO'}")
        
        # Member management
        can_add_member = user.has_perm('api.add_member')
        can_change_member = user.has_perm('api.change_member')
        can_delete_member = user.has_perm('api.delete_member')
        can_view_member = user.has_perm('api.view_member')
        
        print(f"  Member Management:")
        print(f"    - Add Members: {'YES' if can_add_member else 'NO'}")
        print(f"    - Edit Members: {'YES' if can_change_member else 'NO'}")
        print(f"    - Delete Members: {'YES' if can_delete_member else 'NO'}")
        print(f"    - View Members: {'YES' if can_view_member else 'NO'}")
        
        # Check if user can do everything
        all_powers = all([
            can_add_user, can_change_user, can_delete_user, can_view_user,
            can_add_event, can_change_event, can_delete_event, can_view_event,
            can_add_delegation, can_change_delegation, can_delete_delegation, can_view_delegation,
            can_add_member, can_change_member, can_delete_member, can_view_member
        ])
        
        print(f"\nOVERALL RESULT:")
        if all_powers and user.is_superuser:
            print("STATUS: SUPERUSER HAS ALL POWERS!")
            print("\nThe superuser can:")
            print("  - Add, edit, delete, and view ALL users")
            print("  - Add, edit, delete, and view ALL events")
            print("  - Add, edit, delete, and view ALL delegations")
            print("  - Add, edit, delete, and view ALL members")
            print("  - Access Django Admin with full control")
            print("  - Manage the entire system")
            return True
        else:
            print("STATUS: SOME POWERS MISSING!")
            return False
        
    except User.DoesNotExist:
        print("ERROR: User 'najibe' not found!")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def main():
    """Main function"""
    success = verify_superuser_powers()
    
    print("\n" + "=" * 50)
    if success:
        print("SUPERUSER IS READY!")
        print("\nAccess Django Admin:")
        print("  URL: http://localhost:8000/admin")
        print("  Username: najibe")
        print("  Password: 722003")
        print("\nYou can now:")
        print("  - Add anything")
        print("  - Edit anything")
        print("  - Delete anything")
        print("  - View everything")
        print("  - Control the entire system")
    else:
        print("SUPERUSER NEEDS MORE POWERS!")
    
    return success

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
