#!/usr/bin/env python
"""
Script to fix password field issues in User model
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection
from django.contrib.auth import get_user_model

def fix_password_field():
    """Fix password field issues"""
    print("🔧 Fixing password field issues...")
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    # Check if users table exists and has password_hash column
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name IN ('password', 'password_hash')
            """)
            columns = cursor.fetchall()
            print(f"📋 Found columns: {columns}")
            
            if not columns:
                print("❌ Users table not found or no password columns found")
                return False
            
            # Check if we need to rename password_hash to password
            has_password_hash = any(col[0] == 'password_hash' for col in columns)
            has_password = any(col[0] == 'password' for col in columns)
            
            if has_password_hash and not has_password:
                print("🔄 Renaming password_hash to password...")
                cursor.execute("ALTER TABLE users RENAME COLUMN password_hash TO password")
                print("✅ Column renamed successfully")
            elif has_password:
                print("✅ Password column already exists")
            else:
                print("❌ No password column found")
                return False
                
    except Exception as e:
        print(f"❌ Error checking/renaming password column: {e}")
        return False
    
    # Create migrations
    try:
        execute_from_command_line(['manage.py', 'makemigrations'])
        print("✅ Migrations created successfully")
    except Exception as e:
        print(f"❌ Error creating migrations: {e}")
        return False
    
    # Apply migrations
    try:
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migrations applied successfully")
    except Exception as e:
        print(f"❌ Error applying migrations: {e}")
        return False
    
    # Create superuser
    try:
        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
            print("👤 Creating superuser...")
            User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123',
                full_name='مدير النظام',
                role='SUPER_ADMIN'
            )
            print("✅ Superuser created successfully")
        else:
            print("✅ Superuser already exists")
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")
        return False
    
    print("🎉 Password field fixed successfully!")
    return True

if __name__ == '__main__':
    success = fix_password_field()
    sys.exit(0 if success else 1)