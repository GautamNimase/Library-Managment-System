# Library Management System - Database Setup Instructions

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [MySQL Installation](#mysql-installation)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

## 🔧 Prerequisites

### Required Software:
- **MySQL Server 8.0+** (or MariaDB 10.3+)
- **MySQL Workbench** (recommended for GUI management)
- **Command Line Access** (Terminal/Command Prompt)

### System Requirements:
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: At least 1GB free space
- **OS**: Windows 10+, macOS 10.14+, or Linux

## 🚀 MySQL Installation

### Windows Installation:

1. **Download MySQL Installer:**
   - Go to [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
   - Download "MySQL Installer for Windows"

2. **Run the Installer:**
   ```bash
   # Run as Administrator
   mysql-installer-community-8.0.xx.x.msi
   ```

3. **Choose Setup Type:**
   - Select "Developer Default" (includes MySQL Server, Workbench, etc.)

4. **Configuration:**
   - **Authentication Method**: Use Strong Password Encryption
   - **Root Password**: Create a strong password (remember this!)
   - **Windows Service**: Start MySQL Server at System Startup

5. **Complete Installation:**
   - Click "Execute" to install all components
   - Note down the root password

### macOS Installation:

1. **Using Homebrew (Recommended):**
   ```bash
   # Install Homebrew if not already installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install MySQL
   brew install mysql
   
   # Start MySQL service
   brew services start mysql
   ```

2. **Using MySQL Installer:**
   - Download from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
   - Run the `.dmg` file
   - Follow the installation wizard

### Linux Installation:

1. **Ubuntu/Debian:**
   ```bash
   # Update package list
   sudo apt update
   
   # Install MySQL Server
   sudo apt install mysql-server
   
   # Start MySQL service
   sudo systemctl start mysql
   sudo systemctl enable mysql
   
   # Secure installation
   sudo mysql_secure_installation
   ```

2. **CentOS/RHEL:**
   ```bash
   # Install MySQL Server
   sudo yum install mysql-server
   
   # Start MySQL service
   sudo systemctl start mysqld
   sudo systemctl enable mysqld
   
   # Get temporary password
   sudo grep 'temporary password' /var/log/mysqld.log
   ```

## 🗄️ Database Setup

### Method 1: Using MySQL Command Line

1. **Connect to MySQL:**
   ```bash
   # Windows/Linux
   mysql -u root -p
   
   # macOS (if installed via Homebrew)
   mysql -u root -p
   ```

2. **Create Database and User:**
   ```sql
   -- Create database
   CREATE DATABASE library_management_system 
   CHARACTER SET utf8mb4 
   COLLATE utf8mb4_unicode_ci;
   
   -- Create application user
   CREATE USER 'library_app'@'localhost' IDENTIFIED BY 'secure_password_123';
   
   -- Grant permissions
   GRANT ALL PRIVILEGES ON library_management_system.* TO 'library_app'@'localhost';
   FLUSH PRIVILEGES;
   
   -- Use the database
   USE library_management_system;
   ```

3. **Import Schema:**
   ```bash
   # Exit MySQL first
   exit
   
   # Import the enhanced schema
   mysql -u library_app -p library_management_system < enhanced-schema.sql
   ```

### Method 2: Using MySQL Workbench

1. **Open MySQL Workbench:**
   - Launch MySQL Workbench
   - Connect to your MySQL server

2. **Create New Schema:**
   - Click "Create a new schema" (database icon)
   - Name: `library_management_system`
   - Character Set: `utf8mb4`
   - Collation: `utf8mb4_unicode_ci`

3. **Import SQL File:**
   - Go to `File` → `Open SQL Script`
   - Select `enhanced-schema.sql`
   - Click the "Execute" button (lightning bolt icon)

### Method 3: Using Command Line (Alternative)

```bash
# Create database and import in one command
mysql -u root -p -e "CREATE DATABASE library_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
mysql -u root -p library_management_system < enhanced-schema.sql

# Create application user
mysql -u root -p -e "CREATE USER 'library_app'@'localhost' IDENTIFIED BY 'secure_password_123'; GRANT ALL PRIVILEGES ON library_management_system.* TO 'library_app'@'localhost'; FLUSH PRIVILEGES;"
```

## ⚙️ Configuration

### Update Application Configuration

1. **Update Flask App Configuration:**
   ```python
   # In backend/flask_app.py
   DB_CONFIG = {
       'host': 'localhost',
       'database': 'library_management_system',
       'user': 'library_app',  # Change from 'root'
       'password': 'secure_password_123'  # Change to your password
   }
   ```

2. **Update Mock Server Configuration:**
   ```javascript
   // In backend/mock-server.js (if using MySQL)
   const mysql = require('mysql2');
   
   const connection = mysql.createConnection({
       host: 'localhost',
       user: 'library_app',
       password: 'secure_password_123',
       database: 'library_management_system'
   });
   ```

### Environment Variables (Recommended)

Create a `.env` file in the backend directory:

```bash
# Database Configuration
DB_HOST=localhost
DB_NAME=library_management_system
DB_USER=library_app
DB_PASSWORD=secure_password_123
DB_PORT=3306

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256

# Application Configuration
APP_PORT=5000
APP_DEBUG=true
```

## 🧪 Testing

### Test Database Connection

1. **Using MySQL Command Line:**
   ```bash
   mysql -u library_app -p library_management_system
   ```

2. **Test Queries:**
   ```sql
   -- Check if tables exist
   SHOW TABLES;
   
   -- Check sample data
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM books;
   SELECT COUNT(*) FROM issues;
   
   -- Test views
   SELECT * FROM library_statistics;
   
   -- Test procedures
   CALL IssueBook(1, 1, 30);
   ```

3. **Test Application Connection:**
   ```bash
   # Start the Flask app
   cd backend
   python flask_app.py
   
   # Test API endpoints
   curl http://localhost:5000/api/health
   curl http://localhost:5000/api/books
   ```

### Sample Test Data

The schema includes sample data:
- **5 Users** (John Doe, Jane Smith, etc.)
- **10 Books** (The Great Gatsby, 1984, etc.)
- **5 Issues** (some active, some returned)
- **5 Reviews** (feedback on books)
- **4 Notifications** (due dates, overdue notices)
- **3 Admin Users** (Super Admin, Librarian, Assistant)

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Connection Refused
```bash
# Error: Can't connect to MySQL server
# Solution: Start MySQL service
sudo systemctl start mysql  # Linux
brew services start mysql   # macOS
# Windows: Start MySQL service from Services
```

#### 2. Access Denied
```bash
# Error: Access denied for user 'library_app'@'localhost'
# Solution: Check user permissions
mysql -u root -p
GRANT ALL PRIVILEGES ON library_management_system.* TO 'library_app'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. Character Set Issues
```sql
-- Check database character set
SHOW CREATE DATABASE library_management_system;

-- Fix if needed
ALTER DATABASE library_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 4. Port Already in Use
```bash
# Error: Port 3306 already in use
# Solution: Find and kill the process
sudo lsof -i :3306  # Find process
sudo kill -9 <PID>   # Kill process
```

#### 5. Python MySQL Connector Issues
```bash
# Install required packages
pip install mysql-connector-python
pip install PyMySQL
pip install cryptography
```

### Performance Optimization

1. **Enable Query Cache:**
   ```sql
   -- Add to MySQL configuration
   query_cache_type = 1
   query_cache_size = 64M
   ```

2. **Optimize Indexes:**
   ```sql
   -- Analyze tables
   ANALYZE TABLE users, books, issues, feedback;
   
   -- Check index usage
   SHOW INDEX FROM books;
   ```

3. **Regular Maintenance:**
   ```sql
   -- Optimize tables
   OPTIMIZE TABLE users, books, issues, feedback;
   
   -- Update statistics
   UPDATE mysql.innodb_table_stats SET last_update = NOW();
   ```

## 🔄 Maintenance

### Regular Maintenance Tasks

1. **Daily Tasks:**
   ```sql
   -- Send overdue notifications
   CALL SendOverdueNotifications();
   
   -- Update overdue status
   UPDATE issues SET status = 'overdue' 
   WHERE status = 'issued' AND due_date < CURDATE();
   ```

2. **Weekly Tasks:**
   ```sql
   -- Clean up expired reservations
   UPDATE reservations SET status = 'expired' 
   WHERE status = 'active' AND expires_at < NOW();
   
   -- Optimize tables
   OPTIMIZE TABLE users, books, issues, feedback;
   ```

3. **Monthly Tasks:**
   ```sql
   -- Archive old notifications
   DELETE FROM notifications 
   WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
   
   -- Generate reports
   SELECT * FROM library_statistics;
   ```

### Backup and Recovery

1. **Create Backup:**
   ```bash
   # Full database backup
   mysqldump -u library_app -p library_management_system > backup_$(date +%Y%m%d).sql
   
   # Backup specific tables
   mysqldump -u library_app -p library_management_system users books issues > core_tables_backup.sql
   ```

2. **Restore Backup:**
   ```bash
   # Restore full database
   mysql -u library_app -p library_management_system < backup_20241201.sql
   
   # Restore specific tables
   mysql -u library_app -p library_management_system < core_tables_backup.sql
   ```

### Monitoring

1. **Check Database Size:**
   ```sql
   SELECT 
       table_schema AS 'Database',
       ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
   FROM information_schema.tables 
   WHERE table_schema = 'library_management_system'
   GROUP BY table_schema;
   ```

2. **Monitor Performance:**
   ```sql
   -- Check slow queries
   SHOW VARIABLES LIKE 'slow_query_log';
   
   -- Check connections
   SHOW STATUS LIKE 'Threads_connected';
   ```

## 📞 Support

### Getting Help

1. **MySQL Documentation**: [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)
2. **Community Forums**: [MySQL Forums](https://forums.mysql.com/)
3. **Stack Overflow**: Tag questions with `mysql`, `python`, `flask`

### Useful Commands Reference

```bash
# MySQL Service Management
sudo systemctl start mysql      # Start MySQL
sudo systemctl stop mysql       # Stop MySQL
sudo systemctl restart mysql    # Restart MySQL
sudo systemctl status mysql     # Check status

# Connection Commands
mysql -u root -p               # Connect as root
mysql -u library_app -p       # Connect as app user
mysql -h localhost -P 3306 -u library_app -p  # Connect with specific host/port

# Database Management
SHOW DATABASES;                # List all databases
USE database_name;             # Switch to database
SHOW TABLES;                   # List tables in current database
DESCRIBE table_name;           # Show table structure
```

---

## ✅ Quick Setup Checklist

- [ ] MySQL Server installed and running
- [ ] Database `library_management_system` created
- [ ] User `library_app` created with proper permissions
- [ ] Schema imported successfully
- [ ] Sample data loaded
- [ ] Application configuration updated
- [ ] Connection tested
- [ ] API endpoints working
- [ ] Frontend connecting to backend

**🎉 Congratulations! Your Library Management System database is ready to use!**
