#!/usr/bin/env python
"""
Fix audit log triggers to point to new api_auditlog table
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.db import connection

def fix_audit_triggers():
    """Fix audit log triggers"""
    print("🔧 Fixing audit log triggers...")
    
    with connection.cursor() as cursor:
        # Check current triggers
        cursor.execute("""
            SELECT trigger_name, event_object_table, action_statement 
            FROM information_schema.triggers 
            WHERE trigger_name LIKE '%audit%';
        """)
        
        triggers = cursor.fetchall()
        print("📋 Current audit triggers:")
        for trigger in triggers:
            print(f"   - {trigger[0]} on {trigger[1]}")
        
        # Drop old triggers
        print("\n🗑️  Dropping old triggers...")
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
        
        # Update the trigger function to use api_auditlog
        print("🔧 Updating trigger function...")
        cursor.execute("""
            CREATE OR REPLACE FUNCTION create_audit_log()
            RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO api_auditlog (
                    table_name, record_id, action, old_values, new_values, 
                    user_id, timestamp, device_info
                )
                VALUES (
                    TG_TABLE_NAME, 
                    COALESCE(NEW.id, OLD.id), 
                    TG_OP,
                    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
                    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
                    COALESCE(NEW.created_by, OLD.updated_by),
                    NOW(),
                    COALESCE(NEW.device_info, OLD.device_info, '{}'::jsonb)
                );
                RETURN COALESCE(NEW, OLD);
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        # Recreate triggers on all tables
        print("🔧 Creating new triggers...")
        tables = [
            'api_airline', 'api_airport', 'api_delegation', 'api_departuresession',
            'api_loginsession', 'api_mainevent', 'api_member', 'api_militaryposition',
            'api_nationality', 'api_subevent', 'api_user'
        ]
        
        for table in tables:
            cursor.execute(f"""
                CREATE TRIGGER create_audit_log_trigger
                AFTER INSERT OR UPDATE OR DELETE ON {table}
                FOR EACH ROW EXECUTE FUNCTION create_audit_log();
            """)
            print(f"   ✅ Created trigger for {table}")
        
        print("\n✅ All audit triggers fixed!")

if __name__ == '__main__':
    fix_audit_triggers()



