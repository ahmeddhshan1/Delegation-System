#!/usr/bin/env python
"""
Script to fix users table and create proper schema - Version 2
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

def fix_users_table2():
    """Fix users table and create proper schema - Version 2"""
    print("🔧 Fixing users table - Version 2...")
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    # Check if users table exists and fix structure
    try:
        with connection.cursor() as cursor:
            # Check if users table exists
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
            
            # Check if password_hash column exists
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'password_hash'
                )
            """)
            has_password_hash = cursor.fetchone()[0]
            
            # Check if password column exists
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'password'
                )
            """)
            has_password = cursor.fetchone()[0]
            
            print(f"📋 Password columns: password_hash={has_password_hash}, password={has_password}")
            
            # If we have password_hash but no password, rename it
            if has_password_hash and not has_password:
                print("🔄 Renaming password_hash to password...")
                cursor.execute("ALTER TABLE users RENAME COLUMN password_hash TO password")
                print("✅ Column renamed successfully")
            elif has_password:
                print("✅ Password column already exists")
            else:
                print("❌ No password column found")
                return False
            
            # Check if we need to add missing columns
            cursor.execute("""
                SELECT column_name
                FROM information_schema.columns 
                WHERE table_name = 'users'
            """)
            existing_columns = [row[0] for row in cursor.fetchall()]
            print(f"📋 Existing columns: {existing_columns}")
            
            # Add missing columns if needed
            required_columns = {
                'is_staff': 'boolean DEFAULT false',
                'is_superuser': 'boolean DEFAULT false',
                'last_login': 'timestamp with time zone',
                'date_joined': 'timestamp with time zone DEFAULT CURRENT_TIMESTAMP',
                'email': 'varchar(254)',
                'first_name': 'varchar(30)',
                'last_name': 'varchar(150)'
            }
            
            for column, definition in required_columns.items():
                if column not in existing_columns:
                    print(f"➕ Adding missing column: {column}")
                    cursor.execute(f"ALTER TABLE users ADD COLUMN {column} {definition}")
                    print(f"✅ Column {column} added successfully")
                else:
                    print(f"✅ Column {column} already exists")
                    
    except Exception as e:
        print(f"❌ Error checking/fixing users table: {e}")
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
    success = fix_users_table2()
    sys.exit(0 if success else 1)