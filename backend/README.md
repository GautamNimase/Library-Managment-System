# Library Management System - Backend

This directory contains the backend components for the Library Management System, including both Flask (Python) and PHP implementations.

## Project Structure

```
backend/
├── database/
│   └── schema.sql              # MySQL database schema
├── flask_app.py                # Main Flask application
├── php/
│   ├── config/
│   │   └── database.php         # Database configuration
│   ├── api/
│   │   └── auth.php            # Authentication API endpoints
│   └── utils/
│       ├── auth.php            # Authentication utilities
│       └── response.php         # Response utilities
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## Database Setup

### Prerequisites
- MySQL 8.0 or higher
- Python 3.8+ (for Flask)
- PHP 7.4+ (for PHP backend)

### Installation

1. **Create MySQL Database**
   ```sql
   CREATE DATABASE library_management_system;
   ```

2. **Run Database Schema**
   ```bash
   mysql -u root -p library_management_system < database/schema.sql
   ```

3. **Update Database Configuration**
   - Edit `php/config/database.php` and update database credentials
   - Edit `flask_app.py` and update `DB_CONFIG` dictionary

## Flask Backend Setup

### Installation
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the Flask application
python flask_app.py
```

The Flask API will be available at `http://localhost:5000`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

#### Books
- `GET /api/books` - Get all books
- `GET /api/books/<id>` - Get specific book
- `GET /api/books/search?q=<query>` - Search books
- `POST /api/admin/books` - Add book (Admin only)
- `PUT /api/admin/books/<id>` - Update book (Admin only)
- `DELETE /api/admin/books/<id>` - Delete book (Admin only)

#### Issues (Book Borrowing)
- `POST /api/issues` - Issue a book
- `PUT /api/issues/<id>/return` - Return a book
- `GET /api/issues/user/<user_id>` - Get user's issues

#### Feedback
- `POST /api/feedback` - Add book feedback
- `GET /api/feedback/book/<book_id>` - Get book feedback

#### Notifications
- `GET /api/notifications/user/<user_id>` - Get user notifications
- `PUT /api/notifications/<id>/read` - Mark notification as read

#### Admin
- `GET /api/admin/stats` - Get admin dashboard statistics

## PHP Backend Setup

### Installation
```bash
# Ensure PHP and MySQL extensions are installed
# Configure web server (Apache/Nginx) to serve PHP files
# Update database configuration in config/database.php
```

### API Endpoints
The PHP backend provides similar endpoints to Flask:
- `POST /api/auth.php?action=register` - Register user
- `POST /api/auth.php?action=login` - User login
- `POST /api/auth.php?action=admin_login` - Admin login
- `GET /api/auth.php?action=verify` - Verify token

## Authentication

Both backends use JWT (JSON Web Tokens) for authentication:

1. **Login/Register** - Returns JWT token
2. **Protected Routes** - Include `Authorization: Bearer <token>` header
3. **Token Expiration** - Tokens expire after 24 hours

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_NAME=library_management_system
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_ALGORITHM=HS256

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here
```

## Security Features

- Password hashing using bcrypt
- JWT token authentication
- SQL injection prevention with prepared statements
- CORS configuration
- Input validation and sanitization
- Rate limiting (recommended for production)

## Database Features

- Comprehensive schema with all required entities
- Indexes for performance optimization
- Views for common queries
- Stored procedures for complex operations
- Triggers for data consistency
- Sample data for testing

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": 400,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Development Notes

- Both Flask and PHP backends are provided for flexibility
- Choose one based on your deployment preferences
- Flask is recommended for Python environments
- PHP is recommended for traditional web hosting
- Both backends share the same database schema
- API endpoints are designed to be RESTful

## Production Deployment

### Flask
- Use Gunicorn or uWSGI as WSGI server
- Configure reverse proxy with Nginx
- Use environment variables for configuration
- Enable HTTPS with SSL certificates

### PHP
- Configure web server (Apache/Nginx)
- Set appropriate file permissions
- Enable PHP error logging
- Use HTTPS in production

## Testing

Test the API endpoints using tools like:
- Postman
- curl
- Insomnia
- Thunder Client (VS Code extension)

Example curl command:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```
