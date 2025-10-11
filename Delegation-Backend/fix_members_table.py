import psycopg2
import sys

def add_missing_members_columns():
    try:
        conn = psycopg2.connect(
            host='localhost',
            database='delegation_system',
            user='postgres',
            password='722003'
        )
        cur = conn.cursor()

        columns_to_add = {
            'created_by_id': 'UUID NULL',
            'updated_by_id': 'UUID NULL',
            'device_info': 'JSONB NOT NULL DEFAULT \'{}\''
        }

        for column, definition in columns_to_add.items():
            try:
                cur.execute(f"ALTER TABLE members ADD COLUMN {column} {definition};")
                conn.commit()
                print(f"✅ Added {column} column to members table")
            except psycopg2.errors.DuplicateColumn:
                print(f"ℹ️ Column {column} already exists in members table, skipping.")
                conn.rollback()
            except Exception as e:
                print(f"❌ Error adding {column} column to members table: {e}")
                conn.rollback()

        print("🎉 All columns added successfully to members table!")
        cur.close()
        conn.close()

    except psycopg2.Error as e:
        print(f"❌ Database connection error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    add_missing_members_columns()
