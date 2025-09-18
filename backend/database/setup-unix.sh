#!/bin/bash

echo "========================================"
echo "Library Management System Database Setup"
echo "========================================"
echo

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "ERROR: MySQL is not installed or not in PATH"
    echo "Please install MySQL first:"
    echo "  Ubuntu/Debian: sudo apt install mysql-server"
    echo "  CentOS/RHEL: sudo yum install mysql-server"
    echo "  macOS: brew install mysql"
    exit 1
fi

echo "MySQL found! Starting database setup..."
echo

# Prompt for MySQL root password
read -s -p "Enter MySQL root password: " mysql_password
echo

# Test connection
mysql -u root -p$mysql_password -e "SELECT 1;" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: Cannot connect to MySQL with provided password"
    echo "Please check your MySQL root password and try again"
    exit 1
fi

echo "Creating database and user..."
mysql -u root -p$mysql_password < setup-database.sql

if [ $? -eq 0 ]; then
    echo
    echo "========================================"
    echo "SUCCESS! Database setup completed!"
    echo "========================================"
    echo
    echo "Database: library_management_system"
    echo "Username: library_app"
    echo "Password: secure_password_123"
    echo
    echo "You can now:"
    echo "1. Update your application configuration"
    echo "2. Start the Flask app: python flask_app.py"
    echo "3. Test the API endpoints"
    echo
    echo "Test connection with:"
    echo "mysql -u library_app -p library_management_system"
    echo
else
    echo
    echo "ERROR: Database setup failed!"
    echo "Please check your MySQL root password and try again"
    echo
    exit 1
fi
