#!/usr/bin/env python
"""
Script to create USER
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from accounts.models import User

def create_user():
    """
    Create USER
    """
    try:
        # Check if user already exists
        if User.objects.filter(username='user').exists():
            print("❌ User already exists!")
            return False
        
        # Create user
        user = User.objects.create_user(
            username='user',
            full_name='مستخدم عادي',
            password='123456',  # Change this to a secure password
            role='USER',
            is_active=True,
            is_staff=False,  # USER doesn't need staff access
            is_superuser=False  # USER is not superuser
        )
        
        print(f"✅ User created successfully!")
        print(f"   Username: {user.username}")
        print(f"   Full Name: {user.full_name}")
        print(f"   Role: {user.role}")
        print(f"   Password: 123456")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return False

if __name__ == "__main__":
    create_user()
