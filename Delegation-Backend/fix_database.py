#!/usr/bin/env python
"""
Script to fix database issues
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.core.management import execute_from_command_line

def fix_database():
    """Fix database issues"""
    print("Fixing database issues...")
    
    try:
        # First, create all missing migrations
        print("1. Creating migrations...")
        execute_from_command_line(['manage.py', 'makemigrations'])
        
        # Apply all migrations
        print("2. Applying migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        # Create superuser if needed
        print("3. Creating superuser...")
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            if not User.objects.filter(username='najibe').exists():
                user = User.objects.create_user(
                    username='najibe',
                    password='722003',
                    full_name='احمد نيجب',
                    role='SUPER_ADMIN',
                    is_staff=True,
                    is_superuser=True,
                    is_active=True
                )
                print("   Superuser 'najibe' created successfully!")
            else:
                user = User.objects.get(username='najibe')
                user.is_superuser = True
                user.is_staff = True
                user.is_active = True
                user.save()
                print("   Superuser 'najibe' updated successfully!")
                
        except Exception as e:
            print(f"   Error creating superuser: {e}")
        
        print("4. Database fix completed!")
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    try:
        print("Database Fix Tool")
        print("=" * 30)
        
        success = fix_database()
        
        if success:
            print("\nSUCCESS!")
            print("Database has been fixed!")
            print("You can now access Django Admin without errors.")
        else:
            print("\nFAILED!")
            sys.exit(1)
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)