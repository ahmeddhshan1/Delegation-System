#!/usr/bin/env python
"""
Final script to fix user authentication
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def fix_user():
    """Fix user authentication"""
    print("Checking user authentication...")
    
    try:
        # Check if user exists
        user = User.objects.filter(username='najibe').first()
        
        if not user:
            print("User 'najibe' not found. Creating...")
            # Create user
            user = User.objects.create_user(
                username='najibe',
                password='722003',
                full_name='احمد نيجب',
                role='SUPER_ADMIN',
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            print("User 'najibe' created successfully!")
        else:
            print("User 'najibe' found. Updating...")
            
            # Update user details
            user.set_password('722003')
            user.full_name = 'احمد نيجب'
            user.role = 'SUPER_ADMIN'
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()
            print("User 'najibe' updated successfully!")
        
        # Test authentication
        print("\nTesting authentication...")
        test_user = User.objects.get(username='najibe')
        
        if test_user.check_password('722003'):
            print("Password verification successful!")
        else:
            print("Password verification failed! Resetting...")
            test_user.set_password('722003')
            test_user.save()
            print("Password reset successful!")
        
        # Print user details (without Arabic text)
        print(f"\nUser Details:")
        print(f"   ID: {test_user.id}")
        print(f"   Username: {test_user.username}")
        print(f"   Role: {test_user.role}")
        print(f"   Is Staff: {test_user.is_staff}")
        print(f"   Is Superuser: {test_user.is_superuser}")
        print(f"   Is Active: {test_user.is_active}")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    try:
        print("User Authentication Fix Tool")
        print("=" * 50)
        
        success = fix_user()
        
        if success:
            print("\nAll operations completed successfully!")
            print("\nYou can now login with:")
            print("   Username: najibe")
            print("   Password: 722003")
        else:
            print("\nSome operations failed!")
            sys.exit(1)
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
