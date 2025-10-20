#!/usr/bin/env python
"""
Clean all audit triggers and functions
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.db import connection

def clean_all_audit():
    """Clean all audit triggers and functions"""
    print("🧹 Cleaning all audit triggers and functions...")
    
    with connection.cursor() as cursor:
        # Drop all triggers
        print("🗑️  Dropping all triggers...")
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
        
        # Drop old triggers
        cursor.execute("""
            DROP TRIGGER IF EXISTS audit_users ON api_user;
            DROP TRIGGER IF EXISTS audit_nationalities ON api_nationality;
            DROP TRIGGER IF EXISTS audit_airports ON api_airport;
            DROP TRIGGER IF EXISTS audit_airlines ON api_airline;
            DROP TRIGGER IF EXISTS audit_military_positions ON api_militaryposition;
            DROP TRIGGER IF EXISTS audit_main_events ON api_mainevent;
            DROP TRIGGER IF EXISTS audit_sub_events ON api_subevent;
            DROP TRIGGER IF EXISTS audit_delegations ON api_delegation;
            DROP TRIGGER IF EXISTS audit_members ON api_member;
            DROP TRIGGER IF EXISTS audit_departure_sessions ON api_departuresession;
        """)
        
        # Drop function
        print("🗑️  Dropping function...")
        cursor.execute("DROP FUNCTION IF EXISTS create_audit_log() CASCADE;")
        
        print("✅ All audit triggers and functions cleaned!")

if __name__ == '__main__':
    clean_all_audit()



