@echo off
echo ========================================
echo Library Management System Database Setup
echo ========================================
echo.

REM Check if MySQL is installed
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL is not installed or not in PATH
    echo Please install MySQL first and add it to your PATH
    echo Download from: https://dev.mysql.com/downloads/installer/
    pause
    exit /b 1
)

echo MySQL found! Starting database setup...
echo.

REM Prompt for MySQL root password
set /p mysql_password="Enter MySQL root password: "

echo.
echo Creating database and user...
mysql -u root -p%mysql_password% < setup-database.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Database setup completed!
    echo ========================================
    echo.
    echo Database: library_management_system
    echo Username: library_app
    echo Password: secure_password_123
    echo.
    echo You can now:
    echo 1. Update your application configuration
    echo 2. Start the Flask app: python flask_app.py
    echo 3. Test the API endpoints
    echo.
    echo Test connection with:
    echo mysql -u library_app -p library_management_system
    echo.
) else (
    echo.
    echo ERROR: Database setup failed!
    echo Please check your MySQL root password and try again.
    echo.
)

pause
