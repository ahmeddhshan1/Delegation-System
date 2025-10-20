#!/usr/bin/env python
"""
Remove audit function completely
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.db import connection

def remove_audit_function():
    """Remove audit function completely"""
    print("🔧 Removing audit function...")
    
    with connection.cursor() as cursor:
        # Drop function
        cursor.execute("DROP FUNCTION IF EXISTS create_audit_log();")
        print("✅ Audit function removed!")

if __name__ == '__main__':
    remove_audit_function()



