#!/usr/bin/env python3
import sys
import mysql.connector

DB_CONFIG = {
    'host': 'localhost',
    'database': 'library_management_system',
    'user': 'root',
    'password': 'Gautam@012',
    'port': 3306
}

def main():
    if len(sys.argv) < 2:
        print('Usage: python backend/query_admin_row.py <email>')
        sys.exit(1)
    email = sys.argv[1]
    conn = mysql.connector.connect(**DB_CONFIG)
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT admin_id, name, email, created_at FROM admin WHERE email=%s", (email,))
    rows = cur.fetchall()
    print(rows)
    cur.close()
    conn.close()

if __name__ == '__main__':
    main()
