#!/usr/bin/env python3

import requests
import json

def show_all_data():
    try:
        print("🔍 Fetching all data from your Library Management System...")
        print("=" * 60)
        
        response = requests.get("http://localhost:5000/api/test/data")
        data = response.json()
        
        # Show Statistics
        print("\n📊 DATABASE STATISTICS:")
        print("-" * 30)
        stats = data['stats']
        print(f"📚 Total Books: {stats['total_books']}")
        print(f"👥 Total Users: {stats['total_users']}")
        print(f"📖 Total Issues/Loans: {stats['total_issues']}")
        print(f"👨‍💼 Total Admins: {stats['total_admins']}")
        
        # Show Books
        print(f"\n📚 ALL BOOKS ({len(data['books'])} books):")
        print("-" * 50)
        for book in data['books']:
            print(f"ID: {book['book_id']:2d} | {book['title']:30s} | Stock: {book['stock']:2d} | Available: {book['available_stock']:2d} | Price: ${book['price']}")
        
        # Show Users
        print(f"\n👥 ALL USERS ({len(data['users'])} users):")
        print("-" * 50)
        for user in data['users']:
            status = "Active" if user['is_active'] else "Inactive"
            print(f"ID: {user['user_id']:2d} | {user['name']:20s} | {user['email']:25s} | {user['membership_type']:8s} | {status}")
        
        # Show Issues/Loans
        print(f"\n📖 ALL ISSUES/LOANS ({len(data['issues'])} loans):")
        print("-" * 60)
        for issue in data['issues']:
            print(f"ID: {issue['issue_id']:2d} | User: {issue['user_id']:2d} | Book: {issue['book_id']:2d} | Status: {issue['status']:8s} | Due: {issue['due_date']}")
        
        # Show Admins
        print(f"\n👨‍💼 ALL ADMINS ({len(data['admins'])} admins):")
        print("-" * 40)
        for admin in data['admins']:
            print(f"ID: {admin['admin_id']:2d} | {admin['name']:20s} | {admin['email']:25s}")
        
        print("\n" + "=" * 60)
        print("✅ All data successfully retrieved from MySQL database!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    show_all_data()

