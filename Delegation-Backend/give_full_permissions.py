#!/usr/bin/env python
"""
Script to give full permissions to superuser
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission, Group
from django.contrib.contenttypes.models import ContentType

User = get_user_model()

def give_full_permissions():
    """Give full permissions to superuser"""
    print("Giving full permissions to superuser...")
    
    try:
        # Get the superuser
        user = User.objects.get(username='najibe')
        print(f"Found user: {user.username}")
        
        # Ensure user is superuser and staff
        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
        user.save()
        print("User set as superuser and staff")
        
        # Get all permissions
        all_permissions = Permission.objects.all()
        print(f"Found {all_permissions.count()} permissions")
        
        # Give all permissions to user directly
        user.user_permissions.set(all_permissions)
        print("All permissions assigned to user")
        
        # Create or get super_admin group
        super_admin_group, created = Group.objects.get_or_create(name='super_admin')
        if created:
            print("Created super_admin group")
        else:
            print("Found existing super_admin group")
        
        # Add all permissions to super_admin group
        super_admin_group.permissions.set(all_permissions)
        print("All permissions assigned to super_admin group")
        
        # Add user to super_admin group
        user.groups.add(super_admin_group)
        print("User added to super_admin group")
        
        # Verify permissions
        print("\nVerifying permissions...")
        
        # Test specific permissions for all models
        models_to_test = [
            'accounts.user',
            'api.mainevent', 
            'api.subevent',
            'api.delegation',
            'api.member',
            'api.nationality',
            'api.militaryposition',
            'api.airport',
            'api.airline',
            'api.departuresession',
            'accounts.loginsession',
            'accounts.auditlog'
        ]
        
        for model in models_to_test:
            app_label, model_name = model.split('.')
            
            add_perm = f'{app_label}.add_{model_name}'
            change_perm = f'{app_label}.change_{model_name}'
            delete_perm = f'{app_label}.delete_{model_name}'
            view_perm = f'{app_label}.view_{model_name}'
            
            can_add = user.has_perm(add_perm)
            can_change = user.has_perm(change_perm)
            can_delete = user.has_perm(delete_perm)
            can_view = user.has_perm(view_perm)
            
            print(f"  {model}:")
            print(f"    - Add: {'YES' if can_add else 'NO'}")
            print(f"    - Change: {'YES' if can_change else 'NO'}")
            print(f"    - Delete: {'YES' if can_delete else 'NO'}")
            print(f"    - View: {'YES' if can_view else 'NO'}")
        
        # Test superuser permissions
        print(f"\nSuperuser status: {user.is_superuser}")
        print(f"Staff status: {user.is_staff}")
        print(f"Active status: {user.is_active}")
        
        # Test Django Admin access
        can_access_admin = user.is_staff and user.is_active
        print(f"Can access Django Admin: {'YES' if can_access_admin else 'NO'}")
        
        return True
        
    except User.DoesNotExist:
        print("ERROR: User 'najibe' not found!")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_admin_groups():
    """Create admin groups with specific permissions"""
    print("\nCreating admin groups...")
    
    try:
        # Get all content types
        content_types = ContentType.objects.all()
        
        # Create different admin groups
        groups_config = {
            'super_admin': {
                'description': 'Full system access',
                'permissions': 'all'
            },
            'admin': {
                'description': 'Admin access without user management',
                'permissions': ['api']
            },
            'user_manager': {
                'description': 'User management only',
                'permissions': ['accounts']
            }
        }
        
        for group_name, config in groups_config.items():
            group, created = Group.objects.get_or_create(name=group_name)
            
            if created:
                print(f"Created group: {group_name}")
            else:
                print(f"Found existing group: {group_name}")
            
            # Assign permissions based on configuration
            if config['permissions'] == 'all':
                # All permissions
                all_permissions = Permission.objects.all()
                group.permissions.set(all_permissions)
                print(f"  Assigned all permissions to {group_name}")
            else:
                # Specific app permissions
                for app_label in config['permissions']:
                    app_permissions = Permission.objects.filter(content_type__app_label=app_label)
                    for perm in app_permissions:
                        group.permissions.add(perm)
                    print(f"  Assigned {app_permissions.count()} permissions from {app_label} to {group_name}")
        
        return True
        
    except Exception as e:
        print(f"ERROR creating groups: {e}")
        return False

if __name__ == "__main__":
    try:
        print("Full Permissions Setup Tool")
        print("=" * 40)
        
        success1 = give_full_permissions()
        success2 = create_admin_groups()
        
        if success1 and success2:
            print("\nSUCCESS!")
            print("Superuser 'najibe' now has full permissions!")
            print("Can add, edit, delete, and view everything in Django Admin.")
            print("\nAccess Django Admin at: http://localhost:8000/admin")
            print("Login with: najibe / 722003")
        else:
            print("\nFAILED!")
            sys.exit(1)
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
