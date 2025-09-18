# Library Management System

A comprehensive digital library management system built with modern web technologies. This project provides both frontend and backend components for managing books, users, borrowing, feedback, and notifications.

## 🚀 Features

### User Features
- **User Registration & Authentication** - Secure user accounts with JWT tokens
- **Book Browsing & Search** - Find books by title, author, or keywords
- **Book Borrowing** - Issue and return books with automatic due date tracking
- **Reading History** - Track all borrowed books and reading activity
- **Feedback System** - Rate and review books (1-5 stars with comments)
- **Notifications** - Receive alerts for due dates, overdue books, and fines
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### Admin Features
- **Book Management** - Add, edit, and delete books from the catalog
- **User Management** - View and manage user accounts
- **Issue Tracking** - Monitor all book borrowings and returns
- **Fine Management** - Calculate and track overdue fines
- **Dashboard Analytics** - View system statistics and reports
- **Notification Management** - Send notifications to users

### Technical Features
- **Dual Backend Support** - Both Flask (Python) and PHP implementations
- **MySQL Database** - Robust relational database with optimized queries
- **RESTful API** - Clean, well-documented API endpoints
- **JWT Authentication** - Secure token-based authentication
- **Responsive UI** - Modern, mobile-first design
- **Real-time Updates** - Dynamic content loading and updates

## 🏗️ Project Structure

```
LibraySYS/
├── frontend/                 # Frontend application
│   ├── index.html            # Homepage
│   ├── login.html            # User login page
│   ├── css/                  # Stylesheets
│   │   ├── style.css         # Main styles
│   │   └── auth.css          # Authentication pages styles
│   ├── js/                   # JavaScript files
│   │   ├── script.js         # Main application logic
│   │   └── auth.js           # Authentication logic
│   └── images/               # Images and assets
├── backend/                  # Backend services
│   ├── database/
│   │   └── schema.sql        # MySQL database schema
│   ├── flask_app.py          # Flask (Python) backend
│   ├── php/                  # PHP backend
│   │   ├── config/
│   │   ├── api/
│   │   └── utils/
│   ├── requirements.txt      # Python dependencies
│   └── README.md            # Backend documentation
└── README.md                # This file
```

## 🗄️ Database Schema

The system uses MySQL with the following entities:

### Core Entities
- **Users** - User accounts with authentication
- **Books** - Book catalog with metadata
- **Issues** - Book borrowing/returning records
- **Feedback** - User reviews and ratings
- **Admin** - Administrator accounts
- **Notifications** - System notifications and alerts

### Key Features
- **Foreign Key Relationships** - Data integrity and consistency
- **Indexes** - Optimized query performance
- **Views** - Pre-built queries for common operations
- **Stored Procedures** - Complex business logic
- **Triggers** - Automatic data updates
- **Sample Data** - Ready-to-use test data

## 🚀 Quick Start

### Prerequisites
- **Web Server** - Apache, Nginx, or similar
- **MySQL** - Version 8.0 or higher
- **Python** - Version 3.8+ (for Flask backend)
- **PHP** - Version 7.4+ (for PHP backend)

### Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd LibraySYS
   ```

2. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE library_management_system;
   
   # Import schema
   mysql -u root -p library_management_system < backend/database/schema.sql
   ```

3. **Backend Configuration**
   
   **For Flask Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   # Edit flask_app.py and update DB_CONFIG
   python flask_app.py
   ```
   
   **For PHP Backend:**
   ```bash
   # Update backend/php/config/database.php with your credentials
   # Configure web server to serve PHP files
   ```

4. **Frontend Setup**
   ```bash
   # Serve frontend files using any web server
   # Update API endpoints in JavaScript files to match your backend URL
   ```

5. **Add Images**
   - Add images to `frontend/images/` directory
   - See `frontend/images/README.md` for required images

## 🔧 Configuration

### Database Configuration
Update database credentials in:
- `backend/flask_app.py` (Flask)
- `backend/php/config/database.php` (PHP)

### API Endpoints
Update API base URLs in:
- `frontend/js/script.js`
- `frontend/js/auth.js`

### Environment Variables
Create `.env` file in backend directory:
```env
DB_HOST=localhost
DB_NAME=library_management_system
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-jwt-secret-key
```

## 📱 Usage

### For Users
1. **Register** - Create an account with email and password
2. **Login** - Access your personal dashboard
3. **Browse Books** - Search and filter the book catalog
4. **Borrow Books** - Issue books for reading
5. **Return Books** - Return books before due date
6. **Leave Feedback** - Rate and review books
7. **Check Notifications** - Stay updated on due dates and fines

### For Administrators
1. **Admin Login** - Access admin dashboard
2. **Manage Books** - Add, edit, or remove books
3. **Monitor Issues** - Track all book borrowings
4. **View Statistics** - Analyze system usage
5. **Send Notifications** - Communicate with users

## 🔒 Security Features

- **Password Hashing** - Bcrypt encryption for passwords
- **JWT Tokens** - Secure authentication tokens
- **SQL Injection Prevention** - Prepared statements
- **Input Validation** - Server-side validation
- **CORS Configuration** - Cross-origin request handling
- **HTTPS Ready** - SSL/TLS support for production

## 🎨 Design Features

- **Modern UI** - Clean, professional design
- **Responsive Layout** - Mobile-first approach
- **Smooth Animations** - CSS transitions and effects
- **Accessibility** - WCAG compliant design
- **Dark/Light Theme Ready** - Theme switching capability
- **Progressive Enhancement** - Works without JavaScript

## 🧪 Testing

### Sample Data
The database includes sample data for testing:
- 5 sample users
- 10 sample books
- Sample issues and feedback
- Admin account (admin@libraryms.com / password)

### API Testing
Use tools like Postman or curl to test endpoints:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@email.com","password":"password123"}'
```

## 🚀 Deployment

### Development
- Use Flask development server or PHP built-in server
- Enable debug mode for development
- Use local MySQL database

### Production
- Use Gunicorn/uWSGI for Flask or Apache/Nginx for PHP
- Configure production MySQL database
- Enable HTTPS with SSL certificates
- Set up proper logging and monitoring
- Use environment variables for configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For support and questions:
- Check the documentation in `backend/README.md`
- Review the code comments
- Create an issue in the repository

## 🔮 Future Enhancements

- **Mobile App** - React Native or Flutter app
- **Advanced Search** - Full-text search with Elasticsearch
- **Recommendation Engine** - AI-powered book recommendations
- **Social Features** - User profiles and reading groups
- **E-book Support** - Digital book reading
- **Analytics Dashboard** - Advanced reporting and analytics
- **Multi-language Support** - Internationalization
- **API Versioning** - Versioned API endpoints

---

**Built with ❤️ for modern library management**
