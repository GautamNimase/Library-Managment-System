#!/usr/bin/env python3
import mysql.connector
from mysql.connector import Error
from pathlib import Path

DB_CONFIG = {
    'host': 'localhost',
    'database': 'library_management_system',
    'user': 'root',
    'password': 'Gautam@012',
    'port': 3306,
}

# Try enhanced seed first (matches enhanced schema). Fallback to basic seed.
SEED_PATHS = [
    Path(__file__).parent / 'database' / 'seed_real_data_enhanced.sql',
    Path(__file__).parent / 'database' / 'seed_real_data.sql',
]

def run_seed():
    seed_path = None
    for p in SEED_PATHS:
        if p.exists():
            seed_path = p
            break
    if not seed_path:
        print('❌ No seed file found.')
        return
    print(f'Loading seed file: {seed_path}')
    sql_text = seed_path.read_text(encoding='utf-8')
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cur = conn.cursor()
        # Execute statements one-by-one (no DELIMITER used in seed file)
        statements = [s.strip() for s in sql_text.split(';') if s.strip()]
        for stmt in statements:
            cur.execute(stmt)
        conn.commit()
        cur.close()
        conn.close()
        print('✅ Seed executed successfully.')
    except Error as e:
        print('❌ MySQL Error:', e)

if __name__ == '__main__':
    run_seed()


