#!/usr/bin/env python
"""
Script to create ADMIN user
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from accounts.models import User

def create_admin_user():
    """
    Create ADMIN user
    """
    try:
        # Check if admin already exists
        if User.objects.filter(username='admin').exists():
            print("❌ Admin user already exists!")
            return False
        
        # Create admin user
        admin_user = User.objects.create_user(
            username='admin',
            full_name='مدير النظام',
            password='123456',  # Change this to a secure password
            role='ADMIN',
            is_active=True,
            is_staff=True,  # ADMIN needs staff access for some features
            is_superuser=False  # ADMIN is not superuser
        )
        
        print(f"✅ Admin user created successfully!")
        print(f"   Username: {admin_user.username}")
        print(f"   Full Name: {admin_user.full_name}")
        print(f"   Role: {admin_user.role}")
        print(f"   Password: 123456")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return False

if __name__ == "__main__":
    create_admin_user()