from flask import Flask, request, jsonify, session
from flask_cors import CORS
from bcrypt import hashpw, gensalt, checkpw
from datetime import datetime, timedelta
import mysql.connector
from mysql.connector import Error
import os
from functools import wraps
import jwt
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
# Enable CORS for all routes with explicit headers and methods
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=False,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)
# bcrypt functions are imported directly

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'library_management_system',
    'user': 'root',
    'password': 'Gautam@012',
    'port': 3306
}

# JWT configuration
JWT_SECRET_KEY = 'your-jwt-secret-key'
JWT_ALGORITHM = 'HS256'

def get_db_connection():
    """Create database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def token_required(f):
    """Decorator to require JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            current_user_id = data['user_id']
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator to require admin privileges"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            if data.get('role') != 'admin':
                return jsonify({'message': 'Admin privileges required'}), 403
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(*args, **kwargs)
    return decorated

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone')
        
        if not all([name, email, password]):
            return jsonify({'message': 'Missing required fields'}), 400
        
        # Hash password
        hashed_password = hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({'message': 'User already exists'}), 409
        
        # Insert new user
        cursor.execute(
            "INSERT INTO users (name, email, password, phone) VALUES (%s, %s, %s, %s)",
            (name, email, hashed_password, phone)
        )
        connection.commit()
        
        user_id = cursor.lastrowid
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_id,
            'email': email,
            'role': 'user'
        }, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user_id': user_id
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not all([email, password]):
            return jsonify({'message': 'Email and password required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Check user credentials
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user or not checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user['user_id'],
            'email': user['email'],
            'role': 'user'
        }, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'user_id': user['user_id'],
                'name': user['name'],
                'email': user['email'],
                'phone': user['phone']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/admin/register', methods=['POST'])
def admin_register():
    """Register new admin"""
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        admin_key = data.get('admin_key')
        
        # Validate required fields
        if not all([name, email, password, admin_key]):
            return jsonify({'message': 'All fields are required'}), 400
        
        # Validate admin key (you can change this to a more secure method)
        if admin_key != 'admin123':
            return jsonify({'message': 'Invalid admin key'}), 403
        
        # Validate email format
        import re
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'message': 'Invalid email format'}), 400
        
        # Validate password strength
        if len(password) < 8:
            return jsonify({'message': 'Password must be at least 8 characters long'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Check if admin already exists
        cursor.execute("SELECT admin_id FROM admin WHERE email = %s", (email,))
        existing_admin = cursor.fetchone()
        
        if existing_admin:
            cursor.close()
            connection.close()
            return jsonify({'message': 'Admin with this email already exists'}), 409
        
        # Hash password
        hashed_password = hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')
        
        # Insert new admin
        cursor.execute(
            "INSERT INTO admin (name, email, password) VALUES (%s, %s, %s)",
            (name, email, hashed_password)
        )
        
        admin_id = cursor.lastrowid
        
        # Persist the new admin to the database
        connection.commit()
        
        # Generate JWT token
        token = jwt.encode({
            'admin_id': admin_id,
            'email': email,
            'role': 'admin'
        }, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Admin registration successful',
            'token': token,
            'admin': {
                'admin_id': admin_id,
                'name': name,
                'email': email
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/admin/login', methods=['POST'])
def admin_login():
    """Login admin"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not all([email, password]):
            return jsonify({'message': 'Email and password required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Check admin credentials
        cursor.execute("SELECT * FROM admin WHERE email = %s", (email,))
        admin = cursor.fetchone()
        
        if not admin or not checkpw(password.encode('utf-8'), admin['password'].encode('utf-8')):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = jwt.encode({
            'admin_id': admin['admin_id'],
            'email': admin['email'],
            'role': 'admin'
        }, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Admin login successful',
            'token': token,
            'admin': {
                'admin_id': admin['admin_id'],
                'name': admin['name'],
                'email': admin['email']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Book Routes
@app.route('/api/books', methods=['GET'])
def get_books():
    """Get all books with availability"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Get books with availability
        cursor.execute("""
            SELECT 
                b.book_id,
                b.isbn,
                b.title,
                b.subtitle,
                b.description,
                b.language,
                b.page_count,
                b.edition,
                b.publication_date,
                b.price,
                b.stock,
                b.available_stock,
                b.location,
                b.cover_image,
                b.digital_copy_url,
                b.is_digital,
                b.is_featured,
                CASE 
                    WHEN b.available_stock > 0 THEN TRUE 
                    ELSE FALSE 
                END as is_available,
                b.available_stock as available_copies
            FROM books b
            WHERE b.is_active = 1
            ORDER BY b.title
        """)
        
        books = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({'books': books}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    """Get a specific book"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                b.book_id,
                b.isbn,
                b.title,
                b.subtitle,
                b.description,
                b.language,
                b.page_count,
                b.edition,
                b.publication_date,
                b.price,
                b.stock,
                b.available_stock,
                b.location,
                b.cover_image,
                b.digital_copy_url,
                b.is_digital,
                b.is_featured,
                CASE 
                    WHEN b.available_stock > 0 THEN TRUE 
                    ELSE FALSE 
                END as is_available,
                b.available_stock as available_copies
            FROM books b
            WHERE b.book_id = %s AND b.is_active = 1
        """, (book_id,))
        
        book = cursor.fetchone()
        
        if not book:
            return jsonify({'message': 'Book not found'}), 404
        
        cursor.close()
        connection.close()
        
        return jsonify({'book': book}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/books/search', methods=['GET'])
def search_books():
    """Search books by title or author"""
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({'message': 'Search query required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        search_term = f"%{query}%"
        cursor.execute("""
            SELECT 
                b.book_id,
                b.isbn,
                b.title,
                b.subtitle,
                b.description,
                b.language,
                b.page_count,
                b.edition,
                b.publication_date,
                b.price,
                b.stock,
                b.available_stock,
                b.location,
                b.cover_image,
                b.digital_copy_url,
                b.is_digital,
                b.is_featured,
                CASE 
                    WHEN b.available_stock > 0 THEN TRUE 
                    ELSE FALSE 
                END as is_available,
                b.available_stock as available_copies
            FROM books b
            WHERE b.is_active = 1 AND (b.title LIKE %s OR b.description LIKE %s)
            ORDER BY b.title
        """, (search_term, search_term))
        
        books = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({'books': books}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Issue Routes
@app.route('/api/issues', methods=['POST'])
@token_required
def issue_book(current_user_id):
    """Issue a book to a user"""
    try:
        data = request.get_json()
        book_id = data.get('book_id')
        due_days = data.get('due_days', 30)  # Default 30 days
        
        if not book_id:
            return jsonify({'message': 'Book ID required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Check if book is available
        cursor.execute("""
            SELECT (b.stock - COALESCE(issued_count.issued_books, 0)) as available_copies
            FROM books b
            LEFT JOIN (
                SELECT book_id, COUNT(*) as issued_books
                FROM issues 
                WHERE status = 'issued'
                GROUP BY book_id
            ) issued_count ON b.book_id = issued_count.book_id
            WHERE b.book_id = %s
        """, (book_id,))
        
        result = cursor.fetchone()
        if not result or result[0] <= 0:
            return jsonify({'message': 'Book not available'}), 400
        
        # Issue the book
        due_date = datetime.now() + timedelta(days=due_days)
        cursor.execute(
            "INSERT INTO issues (user_id, book_id, issue_date, due_date, status) VALUES (%s, %s, %s, %s, 'issued')",
            (current_user_id, book_id, datetime.now().date(), due_date.date())
        )
        
        connection.commit()
        issue_id = cursor.lastrowid
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Book issued successfully',
            'issue_id': issue_id,
            'due_date': due_date.date().isoformat()
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/issues/<int:issue_id>/return', methods=['PUT'])
@token_required
def return_book(current_user_id, issue_id):
    """Return a book"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Check if issue exists and belongs to user
        cursor.execute(
            "SELECT * FROM issues WHERE issue_id = %s AND user_id = %s AND status = 'issued'",
            (issue_id, current_user_id)
        )
        issue = cursor.fetchone()
        
        if not issue:
            return jsonify({'message': 'Issue not found or already returned'}), 404
        
        # Calculate fine if overdue
        due_date = issue['due_date']
        days_overdue = max(0, (datetime.now().date() - due_date).days)
        fine_amount = days_overdue * 1.00  # $1 per day overdue
        
        # Update issue
        cursor.execute(
            "UPDATE issues SET return_date = %s, status = 'returned', fine = %s WHERE issue_id = %s",
            (datetime.now().date(), fine_amount, issue_id)
        )
        
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Book returned successfully',
            'fine': fine_amount,
            'days_overdue': days_overdue
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/issues/user/<int:user_id>', methods=['GET'])
@token_required
def get_user_issues(current_user_id, user_id):
    """Get issues for a specific user"""
    try:
        # Users can only view their own issues
        if current_user_id != user_id:
            return jsonify({'message': 'Access denied'}), 403
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                i.issue_id,
                i.book_id,
                b.title,
                GROUP_CONCAT(a.name SEPARATOR ', ') AS authors,
                i.issue_date,
                i.return_date,
                i.due_date,
                i.status,
                i.fine
            FROM issues i
            JOIN books b ON i.book_id = b.book_id
            LEFT JOIN book_authors ba ON b.book_id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.author_id
            WHERE i.user_id = %s
            GROUP BY i.issue_id, i.book_id, b.title, i.issue_date, i.return_date, i.due_date, i.status, i.fine
            ORDER BY i.issue_date DESC
        """, (user_id,))
        
        issues = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({'issues': issues}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Feedback Routes
@app.route('/api/feedback', methods=['POST'])
@token_required
def add_feedback(current_user_id):
    """Add feedback for a book"""
    try:
        data = request.get_json()
        book_id = data.get('book_id')
        rating = data.get('rating')
        comment = data.get('comment', '')
        
        if not all([book_id, rating]):
            return jsonify({'message': 'Book ID and rating required'}), 400
        
        if not (1 <= rating <= 5):
            return jsonify({'message': 'Rating must be between 1 and 5'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Check if user has already reviewed this book
        cursor.execute(
            "SELECT feedback_id FROM feedback WHERE user_id = %s AND book_id = %s",
            (current_user_id, book_id)
        )
        if cursor.fetchone():
            return jsonify({'message': 'You have already reviewed this book'}), 409
        
        # Add feedback
        cursor.execute(
            "INSERT INTO feedback (user_id, book_id, rating, comment) VALUES (%s, %s, %s, %s)",
            (current_user_id, book_id, rating, comment)
        )
        
        connection.commit()
        feedback_id = cursor.lastrowid
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Feedback added successfully',
            'feedback_id': feedback_id
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ---------------- User self-service routes -----------------
@app.route('/api/user/me', methods=['GET'])
@token_required
def get_me(current_user_id):
    """Return current user's profile from DB"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT user_id, name, email, phone, created_at, is_active, membership_type
            FROM users
            WHERE user_id = %s
        """, (current_user_id,))
        user = cursor.fetchone()
        cursor.close(); connection.close()
        if not user:
            return jsonify({'message': 'User not found'}), 404
        # Format
        user['created_at'] = user['created_at'].strftime('%Y-%m-%d') if user.get('created_at') else None
        user['status'] = 'active' if user.get('is_active') else 'inactive'
        return jsonify({'user': user}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/user/me', methods=['PUT'])
@token_required
def update_me(current_user_id):
    """Update current user's basic profile"""
    try:
        data = request.get_json() or {}
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        new_password = data.get('password')

        if not any([name, email, phone, new_password]):
            return jsonify({'message': 'No fields to update'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        cursor = connection.cursor(dictionary=True)

        # If email is changing ensure unique
        if email:
            cursor.execute("SELECT user_id FROM users WHERE email = %s AND user_id <> %s", (email, current_user_id))
            if cursor.fetchone():
                cursor.close(); connection.close()
                return jsonify({'message': 'Email already in use'}), 409

        # Build dynamic update
        fields = []
        values = []
        if name is not None:
            fields.append('name = %s'); values.append(name)
        if email is not None:
            fields.append('email = %s'); values.append(email)
        if phone is not None:
            fields.append('phone = %s'); values.append(phone)
        if new_password:
            hashed = hashpw(new_password.encode('utf-8'), gensalt()).decode('utf-8')
            fields.append('password = %s'); values.append(hashed)

        if not fields:
            cursor.close(); connection.close()
            return jsonify({'message': 'No fields to update'}), 400

        values.append(current_user_id)
        cursor.execute(f"UPDATE users SET {', '.join(fields)} WHERE user_id = %s", values)
        connection.commit()
        cursor.close(); connection.close()
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/feedback/book/<int:book_id>', methods=['GET'])
def get_book_feedback(book_id):
    """Get feedback for a specific book"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                f.feedback_id,
                f.user_id,
                u.name as user_name,
                f.rating,
                f.comment,
                f.created_at
            FROM feedback f
            JOIN users u ON f.user_id = u.user_id
            WHERE f.book_id = %s
            ORDER BY f.created_at DESC
        """, (book_id,))
        
        feedbacks = cursor.fetchall()
        
        # Calculate average rating
        cursor.execute(
            "SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM feedback WHERE book_id = %s",
            (book_id,)
        )
        stats = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'feedbacks': feedbacks,
            'average_rating': float(stats['avg_rating']) if stats['avg_rating'] else 0,
            'total_reviews': stats['total_reviews']
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Notification Routes
@app.route('/api/notifications/user/<int:user_id>', methods=['GET'])
@token_required
def get_user_notifications(current_user_id, user_id):
    """Get notifications for a specific user"""
    try:
        # Users can only view their own notifications
        if current_user_id != user_id:
            return jsonify({'message': 'Access denied'}), 403
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                notification_id,
                message,
                send_date,
                fine,
                due_date,
                is_read
            FROM notifications
            WHERE user_id = %s
            ORDER BY send_date DESC
        """, (user_id,))
        
        notifications = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({'notifications': notifications}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
@token_required
def mark_notification_read(current_user_id, notification_id):
    """Mark a notification as read"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Check if notification belongs to user
        cursor.execute(
            "SELECT user_id FROM notifications WHERE notification_id = %s",
            (notification_id,)
        )
        result = cursor.fetchone()
        
        if not result or result[0] != current_user_id:
            return jsonify({'message': 'Notification not found or access denied'}), 404
        
        # Mark as read
        cursor.execute(
            "UPDATE notifications SET is_read = TRUE WHERE notification_id = %s",
            (notification_id,)
        )
        
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Notification marked as read'}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/notifications/user/<int:user_id>/read-all', methods=['PUT'])
@token_required
def mark_all_notifications_read(current_user_id, user_id):
    """Mark all notifications for a user as read"""
    try:
        if current_user_id != user_id:
            return jsonify({'message': 'Access denied'}), 403

        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500

        cursor = connection.cursor()
        cursor.execute("UPDATE notifications SET is_read = TRUE WHERE user_id = %s", (user_id,))
        connection.commit()
        cursor.close(); connection.close()
        return jsonify({'message': 'All notifications marked as read'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/notifications/<int:notification_id>', methods=['DELETE'])
@token_required
def delete_notification(current_user_id, notification_id):
    """Delete a single notification that belongs to the current user"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        cursor = connection.cursor()
        # Ensure it belongs to current user
        cursor.execute("SELECT user_id FROM notifications WHERE notification_id = %s", (notification_id,))
        row = cursor.fetchone()
        if not row or row[0] != current_user_id:
            cursor.close(); connection.close()
            return jsonify({'message': 'Notification not found or access denied'}), 404
        cursor.execute("DELETE FROM notifications WHERE notification_id = %s", (notification_id,))
        connection.commit()
        cursor.close(); connection.close()
        return jsonify({'message': 'Notification deleted'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/notifications/user/<int:user_id>', methods=['DELETE'])
@token_required
def delete_all_notifications(current_user_id, user_id):
    """Delete all notifications for the current user"""
    try:
        if current_user_id != user_id:
            return jsonify({'message': 'Access denied'}), 403
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        cursor = connection.cursor()
        cursor.execute("DELETE FROM notifications WHERE user_id = %s", (user_id,))
        connection.commit()
        cursor.close(); connection.close()
        return jsonify({'message': 'All notifications cleared'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Admin Routes
@app.route('/api/admin/books', methods=['POST'])
@admin_required
def add_book():
    """Add a new book (Admin only)"""
    try:
        data = request.get_json()
        title = data.get('title')
        authors = data.get('authors')  # string, may be comma-separated
        category_or_publisher = data.get('publishers')  # UI sends category label here
        price = data.get('price', 0)
        stock = int(data.get('stock', 0) or 0)
        
        if not title:
            return jsonify({'message': 'Title required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Insert into enhanced books table (no authors column). available_stock mirrors stock.
        cursor.execute(
            """
            INSERT INTO books (title, price, stock, available_stock, is_active)
            VALUES (%s, %s, %s, %s, TRUE)
            """,
            (title, price or 0, stock, stock)
        )
        
        connection.commit()
        book_id = cursor.lastrowid

        # Optionally create author(s) and mapping
        if authors:
            for author_name in [a.strip() for a in authors.split(',') if a.strip()]:
                cursor.execute("SELECT author_id FROM authors WHERE name = %s", (author_name,))
                row = cursor.fetchone()
                if row:
                    author_id = row['author_id']
                else:
                    cursor.execute("INSERT INTO authors (name) VALUES (%s)", (author_name,))
                    author_id = cursor.lastrowid
                # Map
                cursor.execute(
                    "INSERT IGNORE INTO book_authors (book_id, author_id) VALUES (%s, %s)",
                    (book_id, author_id)
                )

        # Optionally create category and mapping (using incoming 'publishers' value as category label from UI)
        if category_or_publisher:
            cursor.execute("SELECT category_id FROM categories WHERE name = %s", (category_or_publisher,))
            row = cursor.fetchone()
            if row:
                category_id = row['category_id']
            else:
                cursor.execute("INSERT INTO categories (name) VALUES (%s)", (category_or_publisher,))
                category_id = cursor.lastrowid
            cursor.execute(
                "INSERT IGNORE INTO book_categories (book_id, category_id) VALUES (%s, %s)",
                (book_id, category_id)
            )
        
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Book added successfully',
            'book_id': book_id
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/books/<int:book_id>', methods=['PUT'])
@admin_required
def update_book(book_id):
    """Update a book (Admin only)"""
    try:
        data = request.get_json()
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Build dynamic update query
        update_fields = []
        values = []
        
        for field in ['title', 'authors', 'publishers', 'year', 'price', 'stock']:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])
        
        if not update_fields:
            return jsonify({'message': 'No fields to update'}), 400
        
        values.append(book_id)
        query = f"UPDATE books SET {', '.join(update_fields)} WHERE book_id = %s"
        
        cursor.execute(query, values)
        
        if cursor.rowcount == 0:
            return jsonify({'message': 'Book not found'}), 404
        
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Book updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/books/<int:book_id>', methods=['DELETE'])
@admin_required
def delete_book(book_id):
    """Delete a book (Admin only)"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        cursor.execute("DELETE FROM books WHERE book_id = %s", (book_id,))
        
        if cursor.rowcount == 0:
            return jsonify({'message': 'Book not found'}), 404
        
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Book deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    """Get admin dashboard statistics"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Get various statistics
        stats = {}
        
        # Total books
        cursor.execute("SELECT COUNT(*) as total_books FROM books")
        stats['total_books'] = cursor.fetchone()['total_books']
        
        # Total users
        cursor.execute("SELECT COUNT(*) as total_users FROM users")
        stats['total_users'] = cursor.fetchone()['total_users']
        
        # Active issues
        cursor.execute("SELECT COUNT(*) as active_issues FROM issues WHERE status = 'issued'")
        stats['active_issues'] = cursor.fetchone()['active_issues']
        
        # Overdue books
        cursor.execute("SELECT COUNT(*) as overdue_books FROM issues WHERE status = 'issued' AND due_date < CURDATE()")
        stats['overdue_books'] = cursor.fetchone()['overdue_books']
        
        # Total fine amount
        cursor.execute("SELECT SUM(fine) as total_fines FROM issues WHERE fine > 0")
        result = cursor.fetchone()
        stats['total_fines'] = float(result['total_fines']) if result['total_fines'] else 0
        
        cursor.close()
        connection.close()
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_users():
    """Get all users for admin management"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Get users with their loan statistics
        cursor.execute("""
            SELECT 
                u.user_id,
                u.name,
                u.email,
                u.membership_type as role,
                u.is_active as status,
                u.created_at as joinDate,
                COUNT(i.issue_id) as booksBorrowed,
                COUNT(CASE WHEN i.status = 'issued' THEN 1 END) as currentLoans,
                COUNT(CASE WHEN i.status = 'issued' AND i.due_date < CURDATE() THEN 1 END) as overdueBooks
            FROM users u
            LEFT JOIN issues i ON u.user_id = i.user_id
            GROUP BY u.user_id, u.name, u.email, u.membership_type, u.is_active, u.created_at
            ORDER BY u.created_at DESC
        """)
        
        users = cursor.fetchall()
        
        # Format the data for frontend
        formatted_users = []
        for user in users:
            formatted_users.append({
                'id': user['user_id'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role'],
                'status': 'active' if user['status'] else 'inactive',
                'joinDate': user['joinDate'].strftime('%Y-%m-%d') if user['joinDate'] else '',
                'booksBorrowed': user['booksBorrowed'] or 0,
                'currentLoans': user['currentLoans'] or 0,
                'overdueBooks': user['overdueBooks'] or 0
            })
        
        cursor.close()
        connection.close()
        
        return jsonify({'users': formatted_users}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/users', methods=['POST'])
@admin_required
def add_user():
    """Add a new user"""
    try:
        data = request.get_json()
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Check if email already exists
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            return jsonify({'message': 'Email already exists'}), 400
        
        # Hash password
        hashed_password = hashpw(data['password'].encode('utf-8'), gensalt()).decode('utf-8')
        
        # Insert new user
        cursor.execute("""
            INSERT INTO users (name, email, password, membership_type, is_active)
            VALUES (%s, %s, %s, %s, %s)
        """, (data['name'], data['email'], hashed_password, data['role'], data['status'] == 'active'))
        
        connection.commit()
        user_id = cursor.lastrowid
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'User added successfully', 'user_id': user_id}), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user information"""
    try:
        data = request.get_json()
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Check if user exists
        cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
        if not cursor.fetchone():
            return jsonify({'message': 'User not found'}), 404
        
        # Update user
        cursor.execute("""
            UPDATE users 
            SET name = %s, email = %s, membership_type = %s, is_active = %s
            WHERE user_id = %s
        """, (data['name'], data['email'], data['role'], data['status'] == 'active', user_id))
        
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'User updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete a user"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Check if user exists
        cursor.execute("SELECT name FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Check if user has active loans
        cursor.execute("SELECT COUNT(*) as active_loans FROM issues WHERE user_id = %s AND status = 'issued'", (user_id,))
        active_loans = cursor.fetchone()['active_loans']
        
        if active_loans > 0:
            return jsonify({'message': 'Cannot delete user with active loans'}), 400
        
        # Delete user
        cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': f'User "{user["name"]}" deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/test/data', methods=['GET'])
def get_test_data():
    """Get all data for testing (no auth required)"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Get all books
        cursor.execute("SELECT * FROM books ORDER BY title")
        books = cursor.fetchall()
        
        # Get all users
        cursor.execute("SELECT * FROM users ORDER BY name")
        users = cursor.fetchall()
        
        # Get all issues/loans
        cursor.execute("SELECT * FROM issues ORDER BY issue_date DESC")
        issues = cursor.fetchall()
        
        # Get admin users
        cursor.execute("SELECT * FROM admin")
        admins = cursor.fetchall()
        
        # Get statistics
        stats = {}
        cursor.execute("SELECT COUNT(*) as total_books FROM books")
        stats['total_books'] = cursor.fetchone()['total_books']
        
        # Total categories
        try:
            cursor.execute("SELECT COUNT(*) as total_categories FROM categories")
            stats['total_categories'] = cursor.fetchone()['total_categories']
        except Exception:
            stats['total_categories'] = 0

        cursor.execute("SELECT COUNT(*) as total_users FROM users")
        stats['total_users'] = cursor.fetchone()['total_users']
        
        cursor.execute("SELECT COUNT(*) as total_issues FROM issues")
        stats['total_issues'] = cursor.fetchone()['total_issues']
        
        cursor.execute("SELECT COUNT(*) as total_admins FROM admin")
        stats['total_admins'] = cursor.fetchone()['total_admins']
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'books': books,
            'users': users,
            'issues': issues,
            'admins': admins,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
