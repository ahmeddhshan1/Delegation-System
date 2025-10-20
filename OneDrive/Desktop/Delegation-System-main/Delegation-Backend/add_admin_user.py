#!/usr/bin/env python
"""
Script to add admin user without clearing database
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def add_admin_user():
    """Add admin user to the database"""
    print("👤 Adding admin user...")
    
    try:
        # Check if najibe user already exists
        if User.objects.filter(username='najibe').exists():
            print("   User 'najibe' already exists, updating...")
            user = User.objects.get(username='najibe')
            user.set_password('722003')
            user.full_name = 'احمد نيجب'
            user.role = 'SUPER_ADMIN'
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()
            print("✅ User 'najibe' updated successfully!")
        else:
            # Create new user
            admin_user = User.objects.create_user(
                username='najibe',
                password='722003',
                full_name='احمد نيجب',
                role='SUPER_ADMIN',
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            print("✅ User 'najibe' created successfully!")
        
        print("\n📋 User Details:")
        print("   Username: najibe")
        print("   Password: 722003")
        print("   Full Name: احمد نيجب")
        print("   Role: SUPER_ADMIN")
        print("   Status: Active")
        
        return True
        
    except Exception as e:
        print(f"❌ Error adding admin user: {e}")
        return False

if __name__ == "__main__":
    try:
        success = add_admin_user()
        
        if success:
            print("\n🎉 Admin user setup completed successfully!")
            print("\n📝 You can now login with:")
            print("   Username: najibe")
            print("   Password: 722003")
        else:
            print("\n❌ Failed to add admin user")
            sys.exit(1)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
