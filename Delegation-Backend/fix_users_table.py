#!/usr/bin/env python
"""
Script to fix users table and create proper schema
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

def fix_users_table():
    """Fix users table and create proper schema"""
    print("🔧 Fixing users table...")
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    # Check if users table exists
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'users'
                )
            """)
            table_exists = cursor.fetchone()[0]
            
            if not table_exists:
                print("❌ Users table does not exist")
                return False
            
            print("✅ Users table exists")
            
            # Check table structure
            cursor.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'users'
                ORDER BY ordinal_position
            """)
            columns = cursor.fetchall()
            print(f"📋 Table structure: {columns}")
            
    except Exception as e:
        print(f"❌ Error checking users table: {e}")
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
    
    print("🎉 Users table fixed successfully!")
    return True

if __name__ == '__main__':
    success = fix_users_table()
    sys.exit(0 if success else 1)