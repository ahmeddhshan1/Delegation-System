#!/usr/bin/env python
"""
Create admin user for testing
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_admin_user():
    """Create admin user"""
    print("👤 Creating admin user...")
    
    try:
        # Check if admin exists
        admin_user = User.objects.filter(username='admin').first()
        
        if admin_user:
            print("✅ Admin user already exists")
            print(f"   Username: {admin_user.username}")
            print(f"   Full name: {admin_user.full_name}")
            print(f"   Role: {admin_user.role}")
            print(f"   Is active: {admin_user.is_active}")
            
            # Reset password
            admin_user.set_password('admin123')
            admin_user.save()
            print("   ✅ Password reset to: admin123")
            
        else:
            # Create new admin user
            admin_user = User.objects.create_user(
                username='admin',
                password='admin123',
                full_name='مدير النظام',
                role='SUPER_ADMIN',
                is_active=True
            )
            print("✅ Created new admin user")
            print(f"   Username: admin")
            print(f"   Password: admin123")
            print(f"   Role: SUPER_ADMIN")
        
        # Test login
        print("\n🧪 Testing login...")
        if admin_user.check_password('admin123'):
            print("✅ Password verification successful!")
        else:
            print("❌ Password verification failed!")
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    create_admin_user()



