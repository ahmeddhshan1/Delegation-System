#!/usr/bin/env python
"""
Script to give full admin permissions to najibe user
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType

User = get_user_model()

def give_admin_permissions():
    """Give full admin permissions to najibe user"""
    print("Giving admin permissions to najibe user...")
    
    try:
        # Get the user
        user = User.objects.get(username='najibe')
        print(f"Found user: {user.username}")
        
        # Make sure user is superuser and staff
        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
        user.save()
        print("User set as superuser and staff")
        
        # Get all permissions
        all_permissions = Permission.objects.all()
        print(f"Found {all_permissions.count()} permissions")
        
        # Give all permissions to user
        user.user_permissions.set(all_permissions)
        print("All permissions assigned to user")
        
        # Also add user to admin group if exists
        from django.contrib.auth.models import Group
        try:
            admin_group = Group.objects.get(name='admin')
            user.groups.add(admin_group)
            print("User added to admin group")
        except Group.DoesNotExist:
            print("Admin group not found, creating...")
            admin_group = Group.objects.create(name='admin')
            admin_group.permissions.set(all_permissions)
            user.groups.add(admin_group)
            print("Admin group created and user added")
        
        # Verify permissions
        user_permissions = user.user_permissions.all()
        group_permissions = user.groups.values_list('permissions', flat=True)
        
        print(f"\nUser has {user_permissions.count()} direct permissions")
        print(f"User has {len(set(group_permissions))} group permissions")
        
        # Test specific permissions
        can_change_user = user.has_perm('accounts.change_user')
        can_delete_user = user.has_perm('accounts.delete_user')
        can_add_user = user.has_perm('accounts.add_user')
        can_view_user = user.has_perm('accounts.view_user')
        
        print(f"\nUser permissions:")
        print(f"  Can change user: {can_change_user}")
        print(f"  Can delete user: {can_delete_user}")
        print(f"  Can add user: {can_add_user}")
        print(f"  Can view user: {can_view_user}")
        
        # Check if user can access admin
        can_access_admin = user.is_staff and user.is_active
        print(f"  Can access admin: {can_access_admin}")
        
        return True
        
    except User.DoesNotExist:
        print("Error: User 'najibe' not found!")
        return False
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_admin_group():
    """Create admin group with all permissions"""
    print("\nCreating admin group...")
    
    try:
        from django.contrib.auth.models import Group
        from django.contrib.auth.models import Permission
        
        # Create or get admin group
        admin_group, created = Group.objects.get_or_create(name='admin')
        
        if created:
            print("Admin group created")
        else:
            print("Admin group already exists")
        
        # Add all permissions to admin group
        all_permissions = Permission.objects.all()
        admin_group.permissions.set(all_permissions)
        
        print(f"Added {all_permissions.count()} permissions to admin group")
        
        return True
        
    except Exception as e:
        print(f"Error creating admin group: {e}")
        return False

if __name__ == "__main__":
    try:
        print("Admin Permissions Setup Tool")
        print("=" * 50)
        
        success1 = create_admin_group()
        success2 = give_admin_permissions()
        
        if success1 and success2:
            print("\nAll operations completed successfully!")
            print("\nUser 'najibe' now has full admin permissions!")
            print("You can access Django Admin and modify/delete anything.")
        else:
            print("\nSome operations failed!")
            sys.exit(1)
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
