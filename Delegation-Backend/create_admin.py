#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Create SUPER_ADMIN user 'najibe'
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_admin():
    try:
        # Check if user exists
        if User.objects.filter(username='najibe').exists():
            user = User.objects.get(username='najibe')
            user.set_password('722003')
            user.role = 'SUPER_ADMIN'
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()
            print("User 'najibe' updated successfully!")
        else:
            user = User.objects.create_user(
                username='najibe',
                password='722003',
                full_name='Najibe Admin',
                email='najibe@admin.com',
                role='SUPER_ADMIN',
                is_active=True,
                is_staff=True,
                is_superuser=True
            )
            print("User 'najibe' created successfully!")
        
        print("Username: najibe")
        print("Password: 722003")
        print("Role: SUPER_ADMIN")
        print("Admin URL: http://localhost:8000/admin/")
        print("SUCCESS: User is ready!")
        
    except Exception as e:
        print("ERROR: " + str(e))

if __name__ == '__main__':
    create_admin()
