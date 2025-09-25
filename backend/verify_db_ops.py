#!/usr/bin/env python3

import mysql.connector
from mysql.connector import Error
from datetime import datetime, timedelta

DB_CONFIG = {
    'host': 'localhost',
    'database': 'library_management_system',
    'user': 'root',
    'password': 'Gautam@012',
    'port': 3306
}

def main():
    suffix = datetime.now().strftime('%Y%m%d%H%M%S')
    user_email = f'test.user+{suffix}@example.com'
    admin_email = f'test.admin+{suffix}@example.com'

    try:
        print('Connecting to MySQL...')
        conn = mysql.connector.connect(**DB_CONFIG)
        cur = conn.cursor()

        # Verify connection and list tables
        cur.execute('SELECT DATABASE();')
        print('Connected to database:', cur.fetchone()[0])
        cur.execute('SHOW TABLES;')
        print('Tables:', [t[0] for t in cur.fetchall()])

        # Insert user
        cur.execute(
            "INSERT INTO users (name, email, password, phone) VALUES (%s,%s,%s,%s)",
            (f'Test User {suffix}', user_email, '$2b$12$abcdefghijklmnopqrstuv', '9999999999')
        )
        user_id = cur.lastrowid

        # Insert admin
        cur.execute(
            "INSERT INTO admin (name, email, password) VALUES (%s,%s,%s)",
            (f'Test Admin {suffix}', admin_email, '$2b$12$abcdefghijklmnopqrstuv')
        )
        admin_id = cur.lastrowid

        # Insert issue for existing book_id 1 (assumes seed data present)
        issue_date = datetime.now().date()
        due_date = (datetime.now() + timedelta(days=14)).date()
        cur.execute(
            "INSERT INTO issues (user_id, book_id, issue_date, due_date, status) VALUES (%s,%s,%s,%s,'issued')",
            (user_id, 1, issue_date, due_date)
        )
        issue_id = cur.lastrowid

        # Insert feedback
        cur.execute(
            "INSERT INTO feedback (user_id, book_id, rating, comment) VALUES (%s,%s,%s,%s)",
            (user_id, 1, 5, f'Great book! ({suffix})')
        )
        feedback_id = cur.lastrowid

        # Insert notification
        cur.execute(
            "INSERT INTO notifications (user_id, message, fine, due_date) VALUES (%s,%s,%s,%s)",
            (user_id, f'Reminder test ({suffix})', 0.00, due_date)
        )
        notification_id = cur.lastrowid

        conn.commit()

        # Verify inserts
        cur.execute('SELECT COUNT(*) FROM users WHERE email = %s', (user_email,))
        user_count = cur.fetchone()[0]
        cur.execute('SELECT COUNT(*) FROM admin WHERE email = %s', (admin_email,))
        admin_count = cur.fetchone()[0]
        cur.execute('SELECT COUNT(*) FROM issues WHERE issue_id = %s', (issue_id,))
        issue_count = cur.fetchone()[0]
        cur.execute('SELECT COUNT(*) FROM feedback WHERE feedback_id = %s', (feedback_id,))
        feedback_count = cur.fetchone()[0]
        cur.execute('SELECT COUNT(*) FROM notifications WHERE notification_id = %s', (notification_id,))
        notification_count = cur.fetchone()[0]

        print('Inserted IDs:', {
            'user_id': user_id,
            'admin_id': admin_id,
            'issue_id': issue_id,
            'feedback_id': feedback_id,
            'notification_id': notification_id,
        })
        print('Verification counts:', {
            'user_row_matches': user_count,
            'admin_row_matches': admin_count,
            'issue_row_matches': issue_count,
            'feedback_row_matches': feedback_count,
            'notification_row_matches': notification_count,
        })

        # Sample totals
        cur.execute('SELECT COUNT(*) FROM users')
        total_users = cur.fetchone()[0]
        cur.execute('SELECT COUNT(*) FROM admin')
        total_admins = cur.fetchone()[0]
        cur.execute('SELECT COUNT(*) FROM issues')
        total_issues = cur.fetchone()[0]
        cur.execute('SELECT COUNT(*) FROM feedback')
        total_feedback = cur.fetchone()[0]
        cur.execute('SELECT COUNT(*) FROM notifications')
        total_notifications = cur.fetchone()[0]

        print('Totals:', {
            'users': total_users,
            'admins': total_admins,
            'issues': total_issues,
            'feedback': total_feedback,
            'notifications': total_notifications,
        })

        cur.close()
        conn.close()
        print('✅ Verification complete.')

    except Error as e:
        print('❌ MySQL Error:', e)
    except Exception as e:
        print('❌ Error:', e)

if __name__ == '__main__':
    main()


