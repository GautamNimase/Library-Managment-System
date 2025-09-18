-- Enhanced Library Management System Database Schema
-- Created for MySQL Database
-- Version: 2.0
-- Last Updated: 2024

-- =====================================================
-- DATABASE CREATION AND CONFIGURATION
-- =====================================================

-- Create database with proper character set
CREATE DATABASE IF NOT EXISTS library_management_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE library_management_system;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (Library Members)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    membership_type ENUM('student', 'faculty', 'staff', 'public') DEFAULT 'public',
    membership_start_date DATE DEFAULT (CURDATE()),
    membership_end_date DATE,
    max_books_allowed INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    profile_image VARCHAR(255),
    INDEX idx_users_email (email),
    INDEX idx_users_membership (membership_type),
    INDEX idx_users_active (is_active)
);

-- Categories table (Book Categories)
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_categories_name (name)
);

-- Authors table (Book Authors)
CREATE TABLE authors (
    author_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    biography TEXT,
    birth_date DATE,
    death_date DATE,
    nationality VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_authors_name (name)
);

-- Publishers table (Book Publishers)
CREATE TABLE publishers (
    publisher_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    contact_info VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_publishers_name (name)
);

-- Books table (Enhanced)
CREATE TABLE books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(20) UNIQUE,
    title VARCHAR(300) NOT NULL,
    subtitle VARCHAR(300),
    description TEXT,
    language VARCHAR(50) DEFAULT 'English',
    page_count INT,
    edition VARCHAR(50),
    publication_date DATE,
    price DECIMAL(10,2),
    stock INT DEFAULT 0,
    available_stock INT DEFAULT 0,
    location VARCHAR(100), -- Shelf location
    cover_image VARCHAR(255),
    digital_copy_url VARCHAR(255),
    is_digital BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_books_title (title),
    INDEX idx_books_isbn (isbn),
    INDEX idx_books_active (is_active),
    INDEX idx_books_featured (is_featured)
);

-- Book-Author relationship (Many-to-Many)
CREATE TABLE book_authors (
    book_id INT,
    author_id INT,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(author_id) ON DELETE CASCADE
);

-- Book-Category relationship (Many-to-Many)
CREATE TABLE book_categories (
    book_id INT,
    category_id INT,
    PRIMARY KEY (book_id, category_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- Book-Publisher relationship
CREATE TABLE book_publishers (
    book_id INT,
    publisher_id INT,
    PRIMARY KEY (book_id, publisher_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    FOREIGN KEY (publisher_id) REFERENCES publishers(publisher_id) ON DELETE CASCADE
);

-- Issues table (Book borrowing/returning) - Enhanced
CREATE TABLE issues (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    issue_date DATE NOT NULL,
    return_date DATE NULL,
    due_date DATE NOT NULL,
    status ENUM('issued', 'returned', 'overdue', 'lost', 'damaged') DEFAULT 'issued',
    fine DECIMAL(10,2) DEFAULT 0.00,
    fine_paid BOOLEAN DEFAULT FALSE,
    renewal_count INT DEFAULT 0,
    max_renewals INT DEFAULT 2,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    INDEX idx_issues_user_id (user_id),
    INDEX idx_issues_book_id (book_id),
    INDEX idx_issues_status (status),
    INDEX idx_issues_due_date (due_date)
);

-- Reservations table (Book reservations)
CREATE TABLE reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notification_sent BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    status ENUM('active', 'fulfilled', 'expired', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    INDEX idx_reservations_user_id (user_id),
    INDEX idx_reservations_book_id (book_id),
    INDEX idx_reservations_status (status)
);

-- Feedback table (Enhanced)
CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_votes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    INDEX idx_feedback_user_id (user_id),
    INDEX idx_feedback_book_id (book_id),
    INDEX idx_feedback_rating (rating)
);

-- Admin table (Enhanced)
CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'librarian', 'assistant') DEFAULT 'librarian',
    permissions JSON, -- Store specific permissions
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    INDEX idx_admin_email (email),
    INDEX idx_admin_role (role)
);

-- Notifications table (Enhanced)
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'error', 'success', 'overdue', 'reservation') DEFAULT 'info',
    send_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_date TIMESTAMP NULL,
    fine DECIMAL(10,2) DEFAULT 0.00,
    due_date DATE,
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_type (type)
);

-- System Settings table
CREATE TABLE system_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Audit Log table (Track all important changes)
CREATE TABLE audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    admin_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user_id (user_id),
    INDEX idx_audit_admin_id (admin_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created_at (created_at)
);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert Categories
INSERT INTO categories (name, description) VALUES
('Fiction', 'Novels, short stories, and other fictional works'),
('Non-Fiction', 'Biographies, essays, and factual works'),
('Science Fiction', 'Speculative fiction with scientific elements'),
('Fantasy', 'Fantasy novels and magical realism'),
('Mystery', 'Detective stories and crime fiction'),
('Romance', 'Romantic novels and love stories'),
('History', 'Historical accounts and biographies'),
('Science', 'Scientific works and research'),
('Technology', 'Technology and computer science books'),
('Art', 'Art history, techniques, and criticism');

-- Insert Authors
INSERT INTO authors (name, biography, birth_date, nationality) VALUES
('F. Scott Fitzgerald', 'American novelist and short story writer', '1896-09-24', 'American'),
('Harper Lee', 'American novelist best known for To Kill a Mockingbird', '1926-04-28', 'American'),
('George Orwell', 'English novelist, essayist, and critic', '1903-06-25', 'British'),
('Jane Austen', 'English novelist known for social commentary', '1775-12-16', 'British'),
('J.D. Salinger', 'American writer known for The Catcher in the Rye', '1919-01-01', 'American'),
('William Golding', 'British novelist and Nobel Prize winner', '1911-09-19', 'British'),
('J.R.R. Tolkien', 'English writer and philologist', '1892-01-03', 'British'),
('J.K. Rowling', 'British author of the Harry Potter series', '1965-07-31', 'British'),
('C.S. Lewis', 'British writer and theologian', '1898-11-29', 'British'),
('Frank Herbert', 'American science fiction author', '1920-10-08', 'American');

-- Insert Publishers
INSERT INTO publishers (name, address, contact_info) VALUES
('Scribner', '1230 Avenue of the Americas, New York, NY', 'contact@scribner.com'),
('J.B. Lippincott & Co.', 'Philadelphia, PA', 'info@lippincott.com'),
('Secker & Warburg', 'London, UK', 'contact@secker.co.uk'),
('T. Egerton, Whitehall', 'London, UK', 'info@egerton.co.uk'),
('Little, Brown and Company', 'Boston, MA', 'contact@littlebrown.com'),
('Faber and Faber', 'London, UK', 'info@faber.co.uk'),
('George Allen & Unwin', 'London, UK', 'contact@allenunwin.co.uk'),
('Bloomsbury', 'London, UK', 'info@bloomsbury.com'),
('Geoffrey Bles', 'London, UK', 'contact@bles.co.uk'),
('Chilton Books', 'Philadelphia, PA', 'info@chilton.com');

-- Insert Sample Users
INSERT INTO users (name, email, password, phone, membership_type, max_books_allowed) VALUES
('John Doe', 'john.doe@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+1234567890', 'student', 10),
('Jane Smith', 'jane.smith@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+1234567891', 'faculty', 15),
('Mike Johnson', 'mike.johnson@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+1234567892', 'staff', 8),
('Sarah Wilson', 'sarah.wilson@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+1234567893', 'public', 5),
('David Brown', 'david.brown@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+1234567894', 'student', 10);

-- Insert Sample Books
INSERT INTO books (isbn, title, subtitle, description, language, page_count, edition, publication_date, price, stock, available_stock, location, is_featured) VALUES
('9780743273565', 'The Great Gatsby', 'A Novel', 'A classic American novel set in the Jazz Age', 'English', 180, '1st Edition', '1925-04-10', 12.99, 5, 5, 'Fiction-A1', TRUE),
('9780061120084', 'To Kill a Mockingbird', NULL, 'A powerful story of racial injustice and childhood innocence', 'English', 281, '50th Anniversary Edition', '1960-07-11', 14.99, 3, 3, 'Fiction-A2', TRUE),
('9780451524935', '1984', NULL, 'A dystopian social science fiction novel', 'English', 328, 'Signet Classic', '1949-06-08', 13.99, 4, 4, 'Fiction-A3', FALSE),
('9780141439518', 'Pride and Prejudice', NULL, 'A romantic novel of manners', 'English', 432, 'Penguin Classics', '1813-01-28', 11.99, 6, 6, 'Fiction-A4', TRUE),
('9780316769174', 'The Catcher in the Rye', NULL, 'A coming-of-age story', 'English', 277, 'Little, Brown', '1951-07-16', 13.99, 2, 2, 'Fiction-A5', FALSE),
('9780571056866', 'Lord of the Flies', NULL, 'A novel about British boys stranded on an uninhabited island', 'English', 224, 'Faber and Faber', '1954-09-17', 12.99, 4, 4, 'Fiction-A6', FALSE),
('9780547928227', 'The Hobbit', 'or There and Back Again', 'A fantasy novel about a hobbit\'s adventure', 'English', 310, 'Houghton Mifflin Harcourt', '1937-09-21', 15.99, 3, 3, 'Fantasy-B1', TRUE),
('9780747532699', 'Harry Potter and the Philosopher\'s Stone', NULL, 'The first book in the Harry Potter series', 'English', 223, 'Bloomsbury', '1997-06-26', 16.99, 7, 7, 'Fantasy-B2', TRUE),
('9780064471190', 'The Chronicles of Narnia', 'The Lion, the Witch and the Wardrobe', 'A fantasy novel about children in a magical world', 'English', 206, 'HarperCollins', '1950-10-16', 18.99, 2, 2, 'Fantasy-B3', FALSE),
('9780441172719', 'Dune', NULL, 'A science fiction epic set on the desert planet Arrakis', 'English', 688, 'Ace Books', '1965-08-01', 17.99, 3, 3, 'SciFi-C1', TRUE);

-- Insert Book-Author relationships
INSERT INTO book_authors (book_id, author_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
(6, 6), (7, 7), (8, 8), (9, 9), (10, 10);

-- Insert Book-Category relationships
INSERT INTO book_categories (book_id, category_id) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1),
(6, 1), (7, 4), (8, 4), (9, 4), (10, 3);

-- Insert Book-Publisher relationships
INSERT INTO book_publishers (book_id, publisher_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
(6, 6), (7, 7), (8, 8), (9, 9), (10, 10);

-- Insert Sample Admin
INSERT INTO admin (name, email, password, role, permissions) VALUES
('Super Admin', 'admin@libraryms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', 'super_admin', '{"all": true}'),
('Librarian Jane', 'librarian@libraryms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', 'librarian', '{"books": true, "users": true, "issues": true}'),
('Assistant Mike', 'assistant@libraryms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', 'assistant', '{"books": true, "issues": true}');

-- Insert Sample Issues
INSERT INTO issues (user_id, book_id, issue_date, due_date, status) VALUES
(1, 1, '2024-01-15', '2024-02-15', 'issued'),
(2, 3, '2024-01-20', '2024-02-20', 'issued'),
(3, 5, '2024-01-10', '2024-02-10', 'returned'),
(1, 7, '2024-01-25', '2024-02-25', 'issued'),
(4, 2, '2024-01-05', '2024-02-05', 'overdue');

-- Insert Sample Feedback
INSERT INTO feedback (user_id, book_id, rating, title, comment) VALUES
(1, 1, 5, 'Amazing Classic', 'Excellent book! Highly recommend it.'),
(2, 3, 4, 'Thought-provoking', 'Great dystopian novel, very thought-provoking.'),
(3, 5, 3, 'Good but not great', 'Good read but not my favorite.'),
(1, 7, 5, 'Fantasy Masterpiece', 'Amazing fantasy adventure!'),
(4, 2, 5, 'Must Read', 'A classic that everyone should read.');

-- Insert Sample Notifications
INSERT INTO notifications (user_id, title, message, type, fine, due_date) VALUES
(1, 'Book Due Soon', 'Your book "The Great Gatsby" is due for return on 2024-02-15', 'warning', 0.00, '2024-02-15'),
(2, 'Book Due Soon', 'Your book "1984" is due for return on 2024-02-20', 'warning', 0.00, '2024-02-20'),
(4, 'Overdue Book', 'Your book "To Kill a Mockingbird" is overdue. Please return it immediately.', 'error', 5.00, '2024-02-05'),
(1, 'Book Due Soon', 'Your book "The Hobbit" is due for return on 2024-02-25', 'warning', 0.00, '2024-02-25');

-- Insert System Settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('library_name', 'Central Library', 'Name of the library'),
('max_loan_days', '30', 'Maximum number of days for book loan'),
('fine_per_day', '1.00', 'Fine amount per day for overdue books'),
('max_renewals', '2', 'Maximum number of renewals allowed'),
('reservation_expiry_days', '7', 'Number of days before reservation expires'),
('email_notifications', 'true', 'Enable email notifications'),
('sms_notifications', 'false', 'Enable SMS notifications'),
('maintenance_mode', 'false', 'Enable maintenance mode');

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for book availability with detailed information
CREATE VIEW book_availability_detailed AS
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
    (b.stock - COALESCE(issued_count.issued_books, 0)) as available_copies,
    CASE 
        WHEN (b.stock - COALESCE(issued_count.issued_books, 0)) > 0 THEN TRUE 
        ELSE FALSE 
    END as is_available,
    b.location,
    b.cover_image,
    b.is_digital,
    b.is_featured,
    GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as authors,
    GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') as categories,
    GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') as publishers,
    COALESCE(avg_rating.average_rating, 0) as average_rating,
    COALESCE(review_count.total_reviews, 0) as total_reviews
FROM books b
LEFT JOIN book_authors ba ON b.book_id = ba.book_id
LEFT JOIN authors a ON ba.author_id = a.author_id
LEFT JOIN book_categories bc ON b.book_id = bc.book_id
LEFT JOIN categories c ON bc.category_id = c.category_id
LEFT JOIN book_publishers bp ON b.book_id = bp.book_id
LEFT JOIN publishers p ON bp.publisher_id = p.publisher_id
LEFT JOIN (
    SELECT book_id, COUNT(*) as issued_books
    FROM issues 
    WHERE status = 'issued'
    GROUP BY book_id
) issued_count ON b.book_id = issued_count.book_id
LEFT JOIN (
    SELECT book_id, AVG(rating) as average_rating
    FROM feedback
    GROUP BY book_id
) avg_rating ON b.book_id = avg_rating.book_id
LEFT JOIN (
    SELECT book_id, COUNT(*) as total_reviews
    FROM feedback
    GROUP BY book_id
) review_count ON b.book_id = review_count.book_id
WHERE b.is_active = TRUE
GROUP BY b.book_id;

-- View for user reading history with book details
CREATE VIEW user_reading_history_detailed AS
SELECT 
    u.user_id,
    u.name as user_name,
    u.email,
    u.membership_type,
    i.issue_id,
    b.title,
    b.isbn,
    GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as authors,
    i.issue_date,
    i.return_date,
    i.due_date,
    i.status,
    i.fine,
    i.fine_paid,
    i.renewal_count,
    DATEDIFF(COALESCE(i.return_date, CURDATE()), i.issue_date) as days_borrowed,
    CASE 
        WHEN i.status = 'overdue' THEN DATEDIFF(CURDATE(), i.due_date)
        ELSE 0
    END as days_overdue
FROM users u
JOIN issues i ON u.user_id = i.user_id
JOIN books b ON i.book_id = b.book_id
LEFT JOIN book_authors ba ON b.book_id = ba.book_id
LEFT JOIN authors a ON ba.author_id = a.author_id
GROUP BY i.issue_id
ORDER BY u.user_id, i.issue_date DESC;

-- View for library statistics
CREATE VIEW library_statistics AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as total_active_users,
    (SELECT COUNT(*) FROM books WHERE is_active = TRUE) as total_books,
    (SELECT COUNT(*) FROM issues WHERE status = 'issued') as books_currently_borrowed,
    (SELECT COUNT(*) FROM issues WHERE status = 'overdue') as overdue_books,
    (SELECT COUNT(*) FROM reservations WHERE status = 'active') as active_reservations,
    (SELECT SUM(fine) FROM issues WHERE fine > 0 AND fine_paid = FALSE) as total_unpaid_fines,
    (SELECT COUNT(*) FROM feedback) as total_reviews,
    (SELECT AVG(rating) FROM feedback) as average_rating
FROM DUAL;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure to issue a book with enhanced logic
DELIMITER //
CREATE PROCEDURE IssueBook(
    IN p_user_id INT,
    IN p_book_id INT,
    IN p_due_days INT DEFAULT 30
)
BEGIN
    DECLARE available_copies INT;
    DECLARE due_date DATE;
    DECLARE user_max_books INT;
    DECLARE user_current_books INT;
    DECLARE user_membership_type VARCHAR(20);
    
    -- Check if user exists and is active
    SELECT membership_type, max_books_allowed INTO user_membership_type, user_max_books
    FROM users WHERE user_id = p_user_id AND is_active = TRUE;
    
    IF user_membership_type IS NULL THEN
        SELECT 'User not found or inactive' as message, FALSE as success;
        LEAVE;
    END IF;
    
    -- Check current books borrowed by user
    SELECT COUNT(*) INTO user_current_books
    FROM issues 
    WHERE user_id = p_user_id AND status = 'issued';
    
    IF user_current_books >= user_max_books THEN
        SELECT CONCAT('User has reached maximum book limit (', user_max_books, ')') as message, FALSE as success;
        LEAVE;
    END IF;
    
    -- Check available copies
    SELECT available_stock INTO available_copies
    FROM books 
    WHERE book_id = p_book_id AND is_active = TRUE;
    
    IF available_copies IS NULL OR available_copies <= 0 THEN
        SELECT 'Book not available' as message, FALSE as success;
        LEAVE;
    END IF;
    
    -- Calculate due date
    SET due_date = DATE_ADD(CURDATE(), INTERVAL p_due_days DAY);
    
    -- Issue the book
    INSERT INTO issues (user_id, book_id, issue_date, due_date, status)
    VALUES (p_user_id, p_book_id, CURDATE(), due_date, 'issued');
    
    -- Update book available stock
    UPDATE books 
    SET available_stock = available_stock - 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE book_id = p_book_id;
    
    -- Remove any active reservations for this book by this user
    UPDATE reservations 
    SET status = 'fulfilled'
    WHERE user_id = p_user_id AND book_id = p_book_id AND status = 'active';
    
    SELECT 'Book issued successfully' as message, TRUE as success, LAST_INSERT_ID() as issue_id;
END //
DELIMITER ;

-- Procedure to return a book with enhanced logic
DELIMITER //
CREATE PROCEDURE ReturnBook(
    IN p_issue_id INT
)
BEGIN
    DECLARE fine_amount DECIMAL(10,2) DEFAULT 0.00;
    DECLARE days_overdue INT DEFAULT 0;
    DECLARE book_id_var INT;
    DECLARE issue_exists INT DEFAULT 0;
    
    -- Check if issue exists and is currently issued
    SELECT COUNT(*), book_id INTO issue_exists, book_id_var
    FROM issues 
    WHERE issue_id = p_issue_id AND status = 'issued';
    
    IF issue_exists = 0 THEN
        SELECT 'Issue not found or already returned' as message, FALSE as success;
        LEAVE;
    END IF;
    
    -- Calculate fine if overdue
    SELECT DATEDIFF(CURDATE(), due_date) INTO days_overdue
    FROM issues 
    WHERE issue_id = p_issue_id;
    
    IF days_overdue > 0 THEN
        SET fine_amount = days_overdue * 1.00; -- $1 per day overdue
    END IF;
    
    -- Update issue record
    UPDATE issues 
    SET return_date = CURDATE(),
        status = 'returned',
        fine = fine_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE issue_id = p_issue_id;
    
    -- Update book available stock
    UPDATE books 
    SET available_stock = available_stock + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE book_id = book_id_var;
    
    -- Send notification to next user in reservation queue
    INSERT INTO notifications (user_id, title, message, type)
    SELECT 
        r.user_id,
        'Book Available',
        CONCAT('The book you reserved is now available for pickup.'),
        'info'
    FROM reservations r
    WHERE r.book_id = book_id_var 
    AND r.status = 'active'
    ORDER BY r.reservation_date
    LIMIT 1;
    
    SELECT CONCAT('Book returned successfully. Fine: $', fine_amount) as message, TRUE as success;
END //
DELIMITER ;

-- Procedure to renew a book
DELIMITER //
CREATE PROCEDURE RenewBook(
    IN p_issue_id INT,
    IN p_additional_days INT DEFAULT 30
)
BEGIN
    DECLARE current_renewals INT;
    DECLARE max_renewals INT;
    DECLARE new_due_date DATE;
    
    -- Get current renewal count and max renewals
    SELECT renewal_count, max_renewals INTO current_renewals, max_renewals
    FROM issues 
    WHERE issue_id = p_issue_id AND status = 'issued';
    
    IF current_renewals IS NULL THEN
        SELECT 'Issue not found or not currently issued' as message, FALSE as success;
        LEAVE;
    END IF;
    
    IF current_renewals >= max_renewals THEN
        SELECT CONCAT('Maximum renewals reached (', max_renewals, ')') as message, FALSE as success;
        LEAVE;
    END IF;
    
    -- Calculate new due date
    SET new_due_date = DATE_ADD(CURDATE(), INTERVAL p_additional_days DAY);
    
    -- Update issue record
    UPDATE issues 
    SET due_date = new_due_date,
        renewal_count = renewal_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE issue_id = p_issue_id;
    
    SELECT 'Book renewed successfully' as message, TRUE as success, new_due_date as new_due_date;
END //
DELIMITER ;

-- Procedure to send overdue notifications
DELIMITER //
CREATE PROCEDURE SendOverdueNotifications()
BEGIN
    INSERT INTO notifications (user_id, title, message, type, fine, due_date)
    SELECT 
        i.user_id,
        'Overdue Book Notice',
        CONCAT('Your book "', b.title, '" is overdue. Please return it immediately to avoid additional fines.'),
        'error',
        DATEDIFF(CURDATE(), i.due_date) * 1.00,
        i.due_date
    FROM issues i
    JOIN books b ON i.book_id = b.book_id
    WHERE i.status = 'issued' 
    AND i.due_date < CURDATE()
    AND NOT EXISTS (
        SELECT 1 FROM notifications n 
        WHERE n.user_id = i.user_id 
        AND n.message LIKE CONCAT('%', b.title, '%')
        AND n.type = 'error'
        AND DATE(n.send_date) = CURDATE()
    );
    
    -- Update overdue status
    UPDATE issues 
    SET status = 'overdue'
    WHERE status = 'issued' 
    AND due_date < CURDATE();
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update book availability when book is issued
DELIMITER //
CREATE TRIGGER after_book_issued
AFTER INSERT ON issues
FOR EACH ROW
BEGIN
    IF NEW.status = 'issued' THEN
        UPDATE books 
        SET available_stock = available_stock - 1,
            updated_at = CURRENT_TIMESTAMP 
        WHERE book_id = NEW.book_id;
        
        -- Log the action
        INSERT INTO audit_log (user_id, action, table_name, record_id, new_values)
        VALUES (NEW.user_id, 'BOOK_ISSUED', 'issues', NEW.issue_id, 
                JSON_OBJECT('book_id', NEW.book_id, 'issue_date', NEW.issue_date, 'due_date', NEW.due_date));
    END IF;
END //
DELIMITER ;

-- Trigger to update book availability when book is returned
DELIMITER //
CREATE TRIGGER after_book_returned
AFTER UPDATE ON issues
FOR EACH ROW
BEGIN
    IF NEW.status = 'returned' AND OLD.status = 'issued' THEN
        UPDATE books 
        SET available_stock = available_stock + 1,
            updated_at = CURRENT_TIMESTAMP 
        WHERE book_id = NEW.book_id;
        
        -- Log the action
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (NEW.user_id, 'BOOK_RETURNED', 'issues', NEW.issue_id,
                JSON_OBJECT('status', OLD.status, 'return_date', OLD.return_date),
                JSON_OBJECT('status', NEW.status, 'return_date', NEW.return_date, 'fine', NEW.fine));
    END IF;
END //
DELIMITER ;

-- Trigger to update timestamps
DELIMITER //
CREATE TRIGGER before_user_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate fine amount
DELIMITER //
CREATE FUNCTION CalculateFine(due_date DATE, return_date DATE)
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE days_overdue INT;
    DECLARE fine_amount DECIMAL(10,2) DEFAULT 0.00;
    
    SET days_overdue = DATEDIFF(return_date, due_date);
    
    IF days_overdue > 0 THEN
        SET fine_amount = days_overdue * 1.00; -- $1 per day
    END IF;
    
    RETURN fine_amount;
END //
DELIMITER ;

-- Function to check if user can borrow more books
DELIMITER //
CREATE FUNCTION CanUserBorrowMore(user_id INT)
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE current_books INT;
    DECLARE max_books INT;
    
    SELECT COUNT(*) INTO current_books
    FROM issues 
    WHERE user_id = user_id AND status = 'issued';
    
    SELECT max_books_allowed INTO max_books
    FROM users 
    WHERE user_id = user_id AND is_active = TRUE;
    
    RETURN current_books < max_books;
END //
DELIMITER ;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Create a dedicated user for the application
-- GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON library_management_system.* TO 'library_app'@'localhost' IDENTIFIED BY 'secure_password_123';
-- GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON library_management_system.* TO 'library_app'@'%' IDENTIFIED BY 'secure_password_123';
-- FLUSH PRIVILEGES;

-- =====================================================
-- MAINTENANCE QUERIES
-- =====================================================

-- Query to get library statistics
-- SELECT * FROM library_statistics;

-- Query to get overdue books
-- SELECT * FROM user_reading_history_detailed WHERE status = 'overdue';

-- Query to get popular books
-- SELECT b.title, COUNT(i.issue_id) as borrow_count 
-- FROM books b 
-- JOIN issues i ON b.book_id = i.book_id 
-- GROUP BY b.book_id, b.title 
-- ORDER BY borrow_count DESC 
-- LIMIT 10;

-- Query to get user activity
-- SELECT u.name, COUNT(i.issue_id) as total_borrowed, COUNT(CASE WHEN i.status = 'issued' THEN 1 END) as currently_borrowed
-- FROM users u 
-- LEFT JOIN issues i ON u.user_id = i.user_id 
-- GROUP BY u.user_id, u.name 
-- ORDER BY total_borrowed DESC;
