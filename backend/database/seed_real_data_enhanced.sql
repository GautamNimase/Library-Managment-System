-- Seed data for Enhanced Schema (matches enhanced-schema.sql)
-- Clears existing rows and inserts 10 entries where applicable

USE library_management_system;
SET FOREIGN_KEY_CHECKS = 0;

-- Clear dependent tables first
TRUNCATE TABLE audit_log;
TRUNCATE TABLE reservations;
TRUNCATE TABLE issues;
TRUNCATE TABLE feedback;
TRUNCATE TABLE notifications;
TRUNCATE TABLE book_authors;
TRUNCATE TABLE book_categories;
TRUNCATE TABLE book_publishers;
TRUNCATE TABLE authors;
TRUNCATE TABLE categories;
TRUNCATE TABLE publishers;
TRUNCATE TABLE admin;
TRUNCATE TABLE users;
TRUNCATE TABLE books;

SET FOREIGN_KEY_CHECKS = 1;

-- Categories (10)
INSERT INTO categories (name, description) VALUES
('Software Engineering','SE books'),
('Programming','Coding books'),
('Databases','Database systems'),
('Operating Systems','OS concepts'),
('Algorithms','Data structures & algorithms'),
('Networking','Computer networks'),
('Security','InfoSec'),
('AI/ML','Artificial Intelligence'),
('Web','Web development'),
('DevOps','Operations');

-- Authors (10)
INSERT INTO authors (name, biography, nationality) VALUES
('Robert C. Martin','Author of Clean Code','American'),
('Andrew Hunt','Pragmatic Programmer co-author','American'),
('David Thomas','Pragmatic Programmer co-author','British'),
('Martin Fowler','Author of Refactoring','British'),
('Erich Gamma','GoF Design Patterns','Swiss'),
('Luciano Ramalho','Author of Fluent Python','Brazilian'),
('Thomas H. Cormen','CLRS','American'),
('Abraham Silberschatz','DB/OS author','American'),
('Kyle Simpson','YDKJS','American'),
('Eric Matthes','Python Crash Course','American');

-- Publishers (10)
INSERT INTO publishers (name, address, contact_info) VALUES
('Prentice Hall',NULL,NULL),
('Addison-Wesley',NULL,NULL),
('O\'Reilly Media',NULL,NULL),
('MIT Press',NULL,NULL),
('McGraw-Hill',NULL,NULL),
('Wiley',NULL,NULL),
('No Starch Press',NULL,NULL),
('Pearson',NULL,NULL),
('Apress',NULL,NULL),
('Manning',NULL,NULL);

-- Books (10) - provide available_stock and is_active
INSERT INTO books (isbn, title, subtitle, description, language, page_count, edition, publication_date, price, stock, available_stock, location, is_digital, is_featured, is_active)
VALUES
('9780132350884','Clean Code',NULL,'A Handbook of Agile Software Craftsmanship','English',464,'1st','2008-08-11',34.99,8,8,'SE-A1',FALSE,TRUE,TRUE),
('9780201616224','The Pragmatic Programmer',NULL,'Journey to Mastery','English',352,'20th Anniversary','1999-10-30',39.99,10,10,'SE-A2',FALSE,TRUE,TRUE),
('9780201485677','Refactoring',NULL,'Improving the Design of Existing Code','English',448,'1st','1999-07-08',42.50,6,6,'SE-A3',FALSE,FALSE,TRUE),
('9780201633610','Design Patterns',NULL,'Elements of Reusable OO Software','English',395,'1st','1994-10-21',44.99,7,7,'SE-A4',FALSE,TRUE,TRUE),
('9781492056355','Fluent Python',NULL,'Clear, Concise, and Effective','English',792,'2nd','2022-05-01',49.99,9,9,'PY-B1',FALSE,FALSE,TRUE),
('9780262033848','Introduction to Algorithms',NULL,'CLRS','English',1312,'3rd','2009-07-31',79.99,5,5,'ALG-C1',FALSE,FALSE,TRUE),
('9780073523323','Database System Concepts',NULL,'Classic DB text','English',1376,'6th','2011-01-01',69.99,4,4,'DB-D1',FALSE,FALSE,TRUE),
('9781119456339','Operating System Concepts',NULL,'The Dinosaur Book','English',976,'10th','2018-05-01',64.99,6,6,'OS-E1',FALSE,FALSE,TRUE),
('9781098122604','You Don\'t Know JS Yet',NULL,'Modern JS','English',350,'1st','2020-01-01',29.99,12,12,'JS-F1',FALSE,FALSE,TRUE),
('9781593276034','Python Crash Course',NULL,'A Hands-On, Project-Based Intro','English',560,'2nd','2015-11-01',34.95,10,10,'PY-F2',FALSE,TRUE,TRUE);

-- Map books to authors
INSERT INTO book_authors (book_id, author_id) VALUES
(1,1),(2,2),(2,3),(3,4),(4,5),(5,6),(6,7),(7,8),(8,8),(9,9),(10,10);

-- Map books to publishers
INSERT INTO book_publishers (book_id, publisher_id) VALUES
(1,1),(2,2),(3,2),(4,2),(5,3),(6,4),(7,5),(8,6),(9,3),(10,7);

-- Map books to categories
INSERT INTO book_categories (book_id, category_id) VALUES
(1,1),(2,1),(3,1),(4,1),(5,2),(6,5),(7,3),(8,4),(9,9),(10,2);

-- Users (10)
INSERT INTO users (name, email, password, phone, membership_type, max_books_allowed) VALUES
('Aarav Sharma','aarav.sharma@example.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','+911100000001','student',10),
('Isha Kapoor','isha.kapoor@example.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','+911100000002','faculty',15),
('Rohan Mehta','rohan.mehta@example.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','+911100000003','public',5),
('Priya Verma','priya.verma@example.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','+911100000004','public',5),
('Karan Patel','karan.patel@example.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','+911100000005','staff',8),
('Neha Gupta','neha.gupta@example.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','+911100000006','student',10),
('Vikram Singh','vikram.singh@example.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','+911100000007','public',5),
('Ananya Rao','ananya.rao@example.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','+911100000008','faculty',15),
('Kabir Joshi','kabir.joshi@example.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','+911100000009','public',5),
('Meera Nair','meera.nair@example.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','+911100000010','student',10);

-- Admins (10 minimal fields)
INSERT INTO admin (name, email, password, role, permissions, phone) VALUES
('Lib Admin 1','admin1@libraryms.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','admin','{"books":true,"users":true}','+91112220001'),
('Lib Admin 2','admin2@libraryms.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','admin','{"books":true}','+91112220002'),
('Lib Admin 3','admin3@libraryms.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','librarian','{"issues":true}','+91112220003'),
('Lib Admin 4','admin4@libraryms.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','librarian','{"notifications":true}','+91112220004'),
('Lib Admin 5','admin5@libraryms.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','assistant','{"books":true}','+91112220005'),
('Lib Admin 6','admin6@libraryms.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','assistant','{"issues":true}','+91112220006'),
('Lib Admin 7','admin7@libraryms.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','admin','{"users":true}','+91112220007'),
('Lib Admin 8','admin8@libraryms.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','admin','{"books":true,"issues":true}','+91112220008'),
('Lib Admin 9','admin9@libraryms.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','librarian','{"users":true}','+91112220009'),
('Lib Admin 10','admin10@libraryms.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8Qz8K8K2','admin','{"all":true}','+91112220010');

-- Issues (10)
INSERT INTO issues (user_id, book_id, issue_date, due_date, status, fine) VALUES
(1,1,CURDATE()-INTERVAL 20 DAY,CURDATE()-INTERVAL 5 DAY,'returned',0.00),
(2,2,CURDATE()-INTERVAL 15 DAY,CURDATE()-INTERVAL 1 DAY,'issued',0.00),
(3,3,CURDATE()-INTERVAL 40 DAY,CURDATE()-INTERVAL 10 DAY,'returned',2.00),
(4,4,CURDATE()-INTERVAL 5 DAY,CURDATE()+INTERVAL 25 DAY,'issued',0.00),
(5,5,CURDATE()-INTERVAL 12 DAY,CURDATE()+INTERVAL 18 DAY,'issued',0.00),
(6,6,CURDATE()-INTERVAL 30 DAY,CURDATE()-INTERVAL 2 DAY,'overdue',2.00),
(7,7,CURDATE()-INTERVAL 9 DAY,CURDATE()+INTERVAL 21 DAY,'issued',0.00),
(8,8,CURDATE()-INTERVAL 2 DAY,CURDATE()+INTERVAL 28 DAY,'issued',0.00),
(9,9,CURDATE()-INTERVAL 60 DAY,CURDATE()-INTERVAL 30 DAY,'returned',0.00),
(10,10,CURDATE(),CURDATE()+INTERVAL 30 DAY,'issued',0.00);

-- Feedback (10) requires title
INSERT INTO feedback (user_id, book_id, rating, title, comment, is_verified) VALUES
(1,1,5,'Excellent','Must-read for clean coding.',TRUE),
(2,2,5,'Timeless','Pragmatic advice.',TRUE),
(3,3,4,'Useful','Patterns are powerful.',FALSE),
(4,4,4,'Insightful','Great refactoring insights.',FALSE),
(5,9,5,'Modern JS','Very helpful.',TRUE),
(6,6,4,'Deep','Comprehensive algorithms book.',FALSE),
(7,7,4,'Classic','Solid database concepts.',FALSE),
(8,8,3,'Good','Good OS overview.',FALSE),
(9,5,5,'Python','Excellent Python deep dive.',TRUE),
(10,10,4,'Beginner','Great for beginners.',FALSE);

-- Notifications (10) requires title and type
INSERT INTO notifications (user_id, title, message, type, fine, due_date, is_read) VALUES
(1,'Due Soon','Your loan is due soon for Clean Code.','warning',0.00,CURDATE()+INTERVAL 3 DAY,0),
(2,'Due Tomorrow','Pragmatic Programmer is due tomorrow.','warning',0.00,CURDATE()+INTERVAL 1 DAY,0),
(3,'Overdue','Design Patterns overdue notice.','error',3.00,CURDATE()-INTERVAL 2 DAY,0),
(4,'Reminder','Refactoring due in 10 days.','info',0.00,CURDATE()+INTERVAL 10 DAY,0),
(5,'Reminder','YDKJS Yet due next week.','info',0.00,CURDATE()+INTERVAL 7 DAY,0),
(6,'Overdue','Algorithms overdue. Please return.','error',5.00,CURDATE()-INTERVAL 5 DAY,0),
(7,'Reminder','Database Concepts due in 14 days.','info',0.00,CURDATE()+INTERVAL 14 DAY,0),
(8,'Reservation','OS Concepts reserved copy ready.','reservation',0.00,CURDATE()+INTERVAL 2 DAY,0),
(9,'Reminder','Fluent Python due in 20 days.','info',0.00,CURDATE()+INTERVAL 20 DAY,0),
(10,'Reminder','Python Crash Course due in 25 days.','info',0.00,CURDATE()+INTERVAL 25 DAY,0);

-- Ensure Bills visibility: add representative rows if missing

-- Active Bills: at least one issued or unpaid fine
INSERT INTO issues (user_id, book_id, issue_date, due_date, status, fine, fine_paid)
SELECT 1, 2, CURDATE()-INTERVAL 3 DAY, CURDATE()+INTERVAL 27 DAY, 'issued', 0.00, 0
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM issues 
    WHERE status = 'issued' 
       OR (fine > 0 AND (COALESCE(fine_paid, 0) = 0))
    LIMIT 1
);

-- Overdue Bills: at least one overdue or issued past due
INSERT INTO issues (user_id, book_id, issue_date, due_date, status, fine, fine_paid)
SELECT 2, 3, CURDATE()-INTERVAL 20 DAY, CURDATE()-INTERVAL 2 DAY, 'overdue', 2.50, 0
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM issues 
    WHERE status = 'overdue' 
       OR (status = 'issued' AND due_date < CURDATE())
    LIMIT 1
);

-- Paid Bills: at least one paid fine
INSERT INTO issues (user_id, book_id, issue_date, due_date, return_date, status, fine, fine_paid)
SELECT 3, 4, CURDATE()-INTERVAL 25 DAY, CURDATE()-INTERVAL 10 DAY, CURDATE()-INTERVAL 1 DAY, 'returned', 4.75, 1
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM issues 
    WHERE fine > 0 AND COALESCE(fine_paid, 0) = 1
    LIMIT 1
);

-- Bills History: at least one returned or fined record
INSERT INTO issues (user_id, book_id, issue_date, due_date, return_date, status, fine, fine_paid)
SELECT 4, 5, CURDATE()-INTERVAL 35 DAY, CURDATE()-INTERVAL 15 DAY, CURDATE()-INTERVAL 5 DAY, 'returned', 0.00, 0
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM issues 
    WHERE status = 'returned' OR fine > 0
    LIMIT 1
);

