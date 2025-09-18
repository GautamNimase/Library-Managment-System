#!/usr/bin/env python3

import mysql.connector
from mysql.connector import Error

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'library_management_system',
    'user': 'root',
    'password': 'Gautam@012',
    'port': 3306
}

def test_connection():
    try:
        print("Testing database connection...")
        connection = mysql.connector.connect(**DB_CONFIG)
        
        if connection.is_connected():
            print("✅ Database connection successful!")
            
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE();")
            database_name = cursor.fetchone()
            print(f"📊 Connected to database: {database_name[0]}")
            
            # Test books table
            cursor.execute("SHOW TABLES;")
            tables = cursor.fetchall()
            print(f"📚 Available tables: {[table[0] for table in tables]}")
            
            # Test books count
            cursor.execute("SELECT COUNT(*) FROM books;")
            book_count = cursor.fetchone()
            print(f"📖 Total books in database: {book_count[0]}")
            
            cursor.close()
            connection.close()
            print("✅ Connection closed successfully!")
            return True
            
    except Error as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    test_connection()
