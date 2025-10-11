#!/usr/bin/env python
"""
Script to fix migrations and create proper database schema
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

def fix_migrations():
    """Fix migrations and create proper database schema"""
    print("🔧 Fixing migrations and database schema...")
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    # Delete existing migrations (optional - be careful!)
    print("⚠️  This will delete existing migrations and recreate them")
    response = input("Are you sure? (y/N): ")
    if response.lower() != 'y':
        print("❌ Operation cancelled")
        return False
    
    # Delete migrations
    try:
        import shutil
        import glob
        
        # Delete migration files
        for app in ['accounts', 'api']:
            migration_dir = f"{app}/migrations"
            if os.path.exists(migration_dir):
                migration_files = glob.glob(f"{migration_dir}/0*.py")
                for file in migration_files:
                    if file != f"{migration_dir}/__init__.py":
                        os.remove(file)
                        print(f"🗑️  Deleted {file}")
        
        print("✅ Existing migrations deleted")
    except Exception as e:
        print(f"❌ Error deleting migrations: {e}")
        return False
    
    # Create new migrations
    try:
        execute_from_command_line(['manage.py', 'makemigrations'])
        print("✅ New migrations created successfully")
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
    
    print("🎉 Migrations fixed successfully!")
    return True

if __name__ == '__main__':
    success = fix_migrations()
    sys.exit(0 if success else 1)