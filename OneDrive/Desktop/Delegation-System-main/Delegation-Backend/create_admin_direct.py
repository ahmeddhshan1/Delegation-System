#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.db import connection
from django.contrib.auth.hashers import make_password
import uuid

def create_admin_user():
    """Create admin user directly in database"""
    try:
        # Check if admin user already exists
        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM users WHERE username = %s", ['admin'])
        count = cursor.fetchone()[0]
        
        if count > 0:
            print("Admin user already exists!")
            return
        
        # Create admin user
        user_id = str(uuid.uuid4())
        password_hash = make_password('admin123')
        
        cursor.execute("""
            INSERT INTO users (id, username, full_name, password_hash, role, is_active, is_staff, is_superuser, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, [user_id, 'admin', 'مدير النظام', password_hash, 'SUPER_ADMIN', True, True, True])
        
        print("Admin user created successfully!")
        print(f"Username: admin")
        print(f"Password: admin123")
        print(f"User ID: {user_id}")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")

if __name__ == "__main__":
    create_admin_user()
