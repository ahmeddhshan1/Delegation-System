#!/usr/bin/env python
"""
Disable audit triggers temporarily
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.db import connection

def disable_audit_triggers():
    """Disable all audit triggers"""
    print("🔧 Disabling audit triggers...")
    
    with connection.cursor() as cursor:
        # Drop all triggers
        cursor.execute("""
            DROP TRIGGER IF EXISTS create_audit_log_trigger ON api_airline;
            DROP TRIGGER IF EXISTS create_audit_log_trigger ON api_airport;
            DROP TRIGGER IF EXISTS create_audit_log_trigger ON api_delegation;
            DROP TRIGGER IF EXISTS create_audit_log_trigger ON api_departuresession;
            DROP TRIGGER IF EXISTS create_audit_log_trigger ON api_loginsession;
            DROP TRIGGER IF EXISTS create_audit_log_trigger ON api_mainevent;
            DROP TRIGGER IF EXISTS create_audit_log_trigger ON api_member;
            DROP TRIGGER IF EXISTS create_audit_log_trigger ON api_militaryposition;
            DROP TRIGGER IF EXISTS create_audit_log_trigger ON api_nationality;
            DROP TRIGGER IF EXISTS create_audit_log_trigger ON api_subevent;
            DROP TRIGGER IF EXISTS create_audit_log_trigger ON api_user;
        """)
        
        print("✅ All audit triggers disabled!")

if __name__ == '__main__':
    disable_audit_triggers()



