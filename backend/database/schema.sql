-- Library Management System Database Schema
-- Created for MySQL Database

-- Create database
CREATE DATABASE IF NOT EXISTS library_management_system;
USE library_management_system;

-- Users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Books table
CREATE TABLE books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    authors VARCHAR(300) NOT NULL,
    publishers VARCHAR(200),
    year INT,
    price DECIMAL(10,2),
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_available BOOLEAN DEFAULT TRUE
);

-- Issues table (Book borrowing/returning)
CREATE TABLE issues (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    issue_date DATE NOT NULL,
    return_date DATE,
    due_date DATE NOT NULL,
    status ENUM('issued', 'returned', 'overdue') DEFAULT 'issued',
    fine DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

-- Feedback table
CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

-- Admin table
CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Notifications table
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    send_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fine DECIMAL(10,2) DEFAULT 0.00,
    due_date DATE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_authors ON books(authors);
CREATE INDEX idx_issues_user_id ON issues(user_id);
CREATE INDEX idx_issues_book_id ON issues(book_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_book_id ON feedback(book_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Insert sample data

-- Sample Users
INSERT INTO users (name, email, password, phone) VALUES
('John Doe', 'john.doe@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+1234567890'),
('Jane Smith', 'jane.smith@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+1234567891'),
('Mike Johnson', 'mike.johnson@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+1234567892'),
('Sarah Wilson', 'sarah.wilson@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+1234567893'),
('David Brown', 'david.brown@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+1234567894');

-- Sample Books
INSERT INTO books (title, authors, publishers, year, price, stock) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 1925, 12.99, 5),
('To Kill a Mockingbird', 'Harper Lee', 'J.B. Lippincott & Co.', 1960, 14.99, 3),
('1984', 'George Orwell', 'Secker & Warburg', 1949, 13.99, 4),
('Pride and Prejudice', 'Jane Austen', 'T. Egerton, Whitehall', 1813, 11.99, 6),
('The Catcher in the Rye', 'J.D. Salinger', 'Little, Brown and Company', 1951, 13.99, 2),
('Lord of the Flies', 'William Golding', 'Faber and Faber', 1954, 12.99, 4),
('The Hobbit', 'J.R.R. Tolkien', 'George Allen & Unwin', 1937, 15.99, 3),
('Harry Potter and the Philosopher\'s Stone', 'J.K. Rowling', 'Bloomsbury', 1997, 16.99, 7),
('The Chronicles of Narnia', 'C.S. Lewis', 'Geoffrey Bles', 1950, 18.99, 2),
('Dune', 'Frank Herbert', 'Chilton Books', 1965, 17.99, 3);

-- Sample Admin
INSERT INTO admin (name, email, password) VALUES
('Admin User', 'admin@libraryms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2');

-- Sample Issues
INSERT INTO issues (user_id, book_id, issue_date, due_date, status) VALUES
(1, 1, '2024-01-15', '2024-02-15', 'issued'),
(2, 3, '2024-01-20', '2024-02-20', 'issued'),
(3, 5, '2024-01-10', '2024-02-10', 'returned'),
(1, 7, '2024-01-25', '2024-02-25', 'issued'),
(4, 2, '2024-01-05', '2024-02-05', 'overdue');

-- Sample Feedback
INSERT INTO feedback (user_id, book_id, rating, comment) VALUES
(1, 1, 5, 'Excellent book! Highly recommend it.'),
(2, 3, 4, 'Great dystopian novel, very thought-provoking.'),
(3, 5, 3, 'Good read but not my favorite.'),
(1, 7, 5, 'Amazing fantasy adventure!'),
(4, 2, 5, 'A classic that everyone should read.');

-- Sample Notifications
INSERT INTO notifications (user_id, message, fine, due_date) VALUES
(1, 'Your book "The Great Gatsby" is due for return on 2024-02-15', 0.00, '2024-02-15'),
(2, 'Your book "1984" is due for return on 2024-02-20', 0.00, '2024-02-20'),
(4, 'Your book "To Kill a Mockingbird" is overdue. Please return it immediately.', 5.00, '2024-02-05'),
(1, 'Your book "The Hobbit" is due for return on 2024-02-25', 0.00, '2024-02-25');

-- Create views for common queries

-- View for book availability
CREATE VIEW book_availability AS
SELECT 
    b.book_id,
    b.title,
    b.authors,
    b.publishers,
    b.year,
    b.price,
    b.stock,
    (b.stock - COALESCE(issued_count.issued_books, 0)) as available_copies,
    CASE 
        WHEN (b.stock - COALESCE(issued_count.issued_books, 0)) > 0 THEN TRUE 
        ELSE FALSE 
    END as is_available
FROM books b
LEFT JOIN (
    SELECT book_id, COUNT(*) as issued_books
    FROM issues 
    WHERE status = 'issued'
    GROUP BY book_id
) issued_count ON b.book_id = issued_count.book_id;

-- View for user reading history
CREATE VIEW user_reading_history AS
SELECT 
    u.user_id,
    u.name,
    u.email,
    i.issue_id,
    b.title,
    b.authors,
    i.issue_date,
    i.return_date,
    i.due_date,
    i.status,
    i.fine
FROM users u
JOIN issues i ON u.user_id = i.user_id
JOIN books b ON i.book_id = b.book_id
ORDER BY u.user_id, i.issue_date DESC;

-- View for book ratings summary
CREATE VIEW book_ratings_summary AS
SELECT 
    b.book_id,
    b.title,
    b.authors,
    COUNT(f.feedback_id) as total_reviews,
    AVG(f.rating) as average_rating,
    MIN(f.rating) as min_rating,
    MAX(f.rating) as max_rating
FROM books b
LEFT JOIN feedback f ON b.book_id = f.book_id
GROUP BY b.book_id, b.title, b.authors;

-- Stored procedures

-- Procedure to issue a book
DELIMITER //
CREATE PROCEDURE IssueBook(
    IN p_user_id INT,
    IN p_book_id INT,
    IN p_due_days INT
)
BEGIN
    DECLARE available_copies INT;
    DECLARE due_date DATE;
    
    -- Check available copies
    SELECT (stock - COALESCE(issued_count.issued_books, 0)) INTO available_copies
    FROM books b
    LEFT JOIN (
        SELECT book_id, COUNT(*) as issued_books
        FROM issues 
        WHERE status = 'issued'
        GROUP BY book_id
    ) issued_count ON b.book_id = issued_count.book_id
    WHERE b.book_id = p_book_id;
    
    -- Calculate due date
    SET due_date = DATE_ADD(CURDATE(), INTERVAL p_due_days DAY);
    
    -- Issue book if available
    IF available_copies > 0 THEN
        INSERT INTO issues (user_id, book_id, issue_date, due_date, status)
        VALUES (p_user_id, p_book_id, CURDATE(), due_date, 'issued');
        
        SELECT 'Book issued successfully' as message;
    ELSE
        SELECT 'Book not available' as message;
    END IF;
END //
DELIMITER ;

-- Procedure to return a book
DELIMITER //
CREATE PROCEDURE ReturnBook(
    IN p_issue_id INT
)
BEGIN
    DECLARE fine_amount DECIMAL(10,2) DEFAULT 0.00;
    DECLARE days_overdue INT DEFAULT 0;
    
    -- Calculate fine if overdue
    SELECT DATEDIFF(CURDATE(), due_date) INTO days_overdue
    FROM issues 
    WHERE issue_id = p_issue_id AND status = 'issued';
    
    IF days_overdue > 0 THEN
        SET fine_amount = days_overdue * 1.00; -- $1 per day overdue
    END IF;
    
    -- Update issue record
    UPDATE issues 
    SET return_date = CURDATE(),
        status = 'returned',
        fine = fine_amount
    WHERE issue_id = p_issue_id;
    
    SELECT CONCAT('Book returned successfully. Fine: $', fine_amount) as message;
END //
DELIMITER ;

-- Procedure to send overdue notifications
DELIMITER //
CREATE PROCEDURE SendOverdueNotifications()
BEGIN
    INSERT INTO notifications (user_id, message, fine, due_date)
    SELECT 
        i.user_id,
        CONCAT('Your book "', b.title, '" is overdue. Please return it immediately.'),
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
        AND DATE(n.send_date) = CURDATE()
    );
END //
DELIMITER ;

-- Create triggers

-- Trigger to update book availability when book is issued
DELIMITER //
CREATE TRIGGER after_book_issued
AFTER INSERT ON issues
FOR EACH ROW
BEGIN
    UPDATE books 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE book_id = NEW.book_id;
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
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE book_id = NEW.book_id;
    END IF;
END //
DELIMITER ;

-- Grant permissions (adjust as needed for your environment)
-- GRANT ALL PRIVILEGES ON library_management_system.* TO 'library_user'@'localhost' IDENTIFIED BY 'library_password';
-- FLUSH PRIVILEGES;
