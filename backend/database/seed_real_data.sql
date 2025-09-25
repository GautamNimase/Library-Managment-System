-- Seed real data: clears existing rows and inserts 10 entries per table
-- WARNING: This will delete existing data in these tables

SET FOREIGN_KEY_CHECKS = 0;

USE library_management_system;

-- Truncate in FK-safe order
TRUNCATE TABLE issues;
TRUNCATE TABLE feedback;
TRUNCATE TABLE notifications;
TRUNCATE TABLE admin;
TRUNCATE TABLE users;
TRUNCATE TABLE books;

SET FOREIGN_KEY_CHECKS = 1;

-- Insert 10 Books
INSERT INTO books (title, authors, publishers, year, price, stock) VALUES
('Clean Code', 'Robert C. Martin', 'Prentice Hall', 2008, 34.99, 8),
('The Pragmatic Programmer', 'Andrew Hunt; David Thomas', 'Addison-Wesley', 1999, 39.99, 10),
('Design Patterns', 'Erich Gamma; Richard Helm; Ralph Johnson; John Vlissides', 'Addison-Wesley', 1994, 44.99, 7),
('Refactoring', 'Martin Fowler', 'Addison-Wesley', 1999, 42.50, 6),
('You Don\'t Know JS Yet', 'Kyle Simpson', 'O\'Reilly Media', 2020, 29.99, 12),
('Introduction to Algorithms', 'Thomas H. Cormen; others', 'MIT Press', 2009, 79.99, 5),
('Database System Concepts', 'Abraham Silberschatz; others', 'McGraw-Hill', 2011, 69.99, 4),
('Operating System Concepts', 'Abraham Silberschatz; others', 'Wiley', 2018, 64.99, 6),
('Fluent Python', 'Luciano Ramalho', 'O\'Reilly Media', 2015, 49.99, 9),
('Python Crash Course', 'Eric Matthes', 'No Starch Press', 2015, 34.95, 10);

-- Common bcrypt hash for password: "password" (same as earlier seed)
-- $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2

-- Insert 10 Users
INSERT INTO users (name, email, password, phone) VALUES
('Aarav Sharma', 'aarav.sharma@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+911100000001'),
('Isha Kapoor', 'isha.kapoor@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+911100000002'),
('Rohan Mehta', 'rohan.mehta@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+911100000003'),
('Priya Verma', 'priya.verma@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+911100000004'),
('Karan Patel', 'karan.patel@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+911100000005'),
('Neha Gupta', 'neha.gupta@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+911100000006'),
('Vikram Singh', 'vikram.singh@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+911100000007'),
('Ananya Rao', 'ananya.rao@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+911100000008'),
('Kabir Joshi', 'kabir.joshi@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+911100000009'),
('Meera Nair', 'meera.nair@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2', '+911100000010');

-- Insert 10 Admins
INSERT INTO admin (name, email, password) VALUES
('Lib Admin 1', 'admin1@libraryms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2'),
('Lib Admin 2', 'admin2@libraryms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2'),
('Lib Admin 3', 'admin3@libraryms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2'),
('Lib Admin 4', 'admin4@libraryms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2'),
('Lib Admin 5', 'admin5@libraryms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2'),
('Lib Admin 6', 'admin6@libraryms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2'),
('Lib Admin 7', 'admin7@libraryms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2'),
('Lib Admin 8', 'admin8@libraryms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2'),
('Lib Admin 9', 'admin9@libraryms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2'),
('Lib Admin 10', 'admin10@libraryms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2');

-- Insert 10 Issues (assumes user IDs 1-10 and book IDs 1-10 exist from inserts above)
INSERT INTO issues (user_id, book_id, issue_date, due_date, status, fine) VALUES
(1, 1, CURDATE()-INTERVAL 20 DAY, CURDATE()-INTERVAL 5 DAY, 'returned', 0.00),
(2, 2, CURDATE()-INTERVAL 15 DAY, CURDATE()-INTERVAL 1 DAY, 'issued', 0.00),
(3, 3, CURDATE()-INTERVAL 40 DAY, CURDATE()-INTERVAL 10 DAY, 'returned', 2.00),
(4, 4, CURDATE()-INTERVAL 5 DAY, CURDATE()+INTERVAL 25 DAY, 'issued', 0.00),
(5, 5, CURDATE()-INTERVAL 12 DAY, CURDATE()+INTERVAL 18 DAY, 'issued', 0.00),
(6, 6, CURDATE()-INTERVAL 30 DAY, CURDATE()-INTERVAL 2 DAY, 'overdue', 2.00),
(7, 7, CURDATE()-INTERVAL 9 DAY, CURDATE()+INTERVAL 21 DAY, 'issued', 0.00),
(8, 8, CURDATE()-INTERVAL 2 DAY, CURDATE()+INTERVAL 28 DAY, 'issued', 0.00),
(9, 9, CURDATE()-INTERVAL 60 DAY, CURDATE()-INTERVAL 30 DAY, 'returned', 0.00),
(10, 10, CURDATE(), CURDATE()+INTERVAL 30 DAY, 'issued', 0.00);

-- Insert 10 Feedback rows (users reviewing books)
INSERT INTO feedback (user_id, book_id, rating, comment) VALUES
(1, 1, 5, 'Must-read for clean coding.'),
(2, 2, 5, 'Timeless software wisdom.'),
(3, 3, 4, 'Patterns are powerful.'),
(4, 4, 4, 'Great refactoring insights.'),
(5, 5, 5, 'Modern JS knowledge.'),
(6, 6, 4, 'Comprehensive algorithms book.'),
(7, 7, 4, 'Solid database concepts.'),
(8, 8, 3, 'Good OS overview.'),
(9, 9, 5, 'Excellent Python deep dive.'),
(10, 10, 4, 'Great for beginners.');

-- Insert 10 Notifications
INSERT INTO notifications (user_id, message, fine, due_date, is_read) VALUES
(1, 'Your loan is due soon for Clean Code.', 0.00, CURDATE()+INTERVAL 3 DAY, 0),
(2, 'Pragmatic Programmer is due tomorrow.', 0.00, CURDATE()+INTERVAL 1 DAY, 0),
(3, 'Design Patterns overdue notice.', 3.00, CURDATE()-INTERVAL 2 DAY, 0),
(4, 'Refactoring due in 10 days.', 0.00, CURDATE()+INTERVAL 10 DAY, 0),
(5, 'YDKJS Yet due next week.', 0.00, CURDATE()+INTERVAL 7 DAY, 0),
(6, 'Algorithms overdue. Please return.', 5.00, CURDATE()-INTERVAL 5 DAY, 0),
(7, 'Database Concepts due in 14 days.', 0.00, CURDATE()+INTERVAL 14 DAY, 0),
(8, 'OS Concepts reserved copy ready.', 0.00, CURDATE()+INTERVAL 2 DAY, 0),
(9, 'Fluent Python due in 20 days.', 0.00, CURDATE()+INTERVAL 20 DAY, 0),
(10, 'Python Crash Course due in 25 days.', 0.00, CURDATE()+INTERVAL 25 DAY, 0);


