#!/usr/bin/env python
"""
Simple script to create superuser
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model

def create_superuser():
    """Create superuser if it doesn't exist"""
    User = get_user_model()
    
    username = 'admin'
    email = 'admin@example.com'
    password = 'admin123'
    
    if User.objects.filter(username=username).exists():
        print(f"✅ Superuser '{username}' already exists")
        return True
    
    try:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            full_name='مدير النظام',
            role='SUPER_ADMIN'
        )
        print(f"✅ Superuser '{username}' created successfully")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
        return True
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")
        return False

if __name__ == '__main__':
    create_superuser()