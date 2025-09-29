const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = 'your-jwt-secret-key';

// Mock Database (in-memory)
let users = [
    {
        user_id: 1,
        name: 'John Doe',
        email: 'john.doe@email.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        phone: '+1234567890',
        created_at: new Date(),
        is_active: true
    },
    {
        user_id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        phone: '+1234567891',
        created_at: new Date(),
        is_active: true
    }
];

let books = [
    {
        book_id: 1,
        title: 'The Great Gatsby',
        authors: 'F. Scott Fitzgerald',
        publishers: 'Scribner',
        year: 1925,
        price: 12.99,
        stock: 5,
        created_at: new Date(),
        is_available: true
    },
    {
        book_id: 2,
        title: 'To Kill a Mockingbird',
        authors: 'Harper Lee',
        publishers: 'J.B. Lippincott & Co.',
        year: 1960,
        price: 14.99,
        stock: 3,
        created_at: new Date(),
        is_available: true
    },
    {
        book_id: 3,
        title: '1984',
        authors: 'George Orwell',
        publishers: 'Secker & Warburg',
        year: 1949,
        price: 13.99,
        stock: 4,
        created_at: new Date(),
        is_available: true
    },
    {
        book_id: 4,
        title: 'Pride and Prejudice',
        authors: 'Jane Austen',
        publishers: 'T. Egerton, Whitehall',
        year: 1813,
        price: 11.99,
        stock: 6,
        created_at: new Date(),
        is_available: true
    },
    {
        book_id: 5,
        title: 'The Catcher in the Rye',
        authors: 'J.D. Salinger',
        publishers: 'Little, Brown and Company',
        year: 1951,
        price: 13.99,
        stock: 2,
        created_at: new Date(),
        is_available: true
    },
    {
        book_id: 6,
        title: 'Lord of the Flies',
        authors: 'William Golding',
        publishers: 'Faber and Faber',
        year: 1954,
        price: 12.99,
        stock: 4,
        created_at: new Date(),
        is_available: true
    }
];

let issues = [];
let feedback = [];
let notifications = [];

let admins = [
    {
        admin_id: 1,
        name: 'Admin User',
        email: 'admin@libraryms.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        created_at: new Date(),
        is_active: true
    }
];

// Helper function to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            user_id: users.length + 1,
            name,
            email,
            password: hashedPassword,
            phone: phone || null,
            created_at: new Date(),
            is_active: true
        };
        
        users.push(newUser);
        
        // Generate JWT token
        const token = jwt.sign(
            { user_id: newUser.user_id, email: newUser.email, role: 'user' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user_id: newUser.user_id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }
        
        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: 'user' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/auth/admin/register', async (req, res) => {
    try {
        const { name, email, password, admin_key } = req.body;
        
        // Validate required fields
        if (!name || !email || !password || !admin_key) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Validate admin key
        if (admin_key !== 'admin123') {
            return res.status(403).json({ message: 'Invalid admin key' });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        
        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        
        // Check if admin already exists
        const existingAdmin = admins.find(a => a.email === email);
        if (existingAdmin) {
            return res.status(409).json({ message: 'Admin with this email already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new admin
        const newAdmin = {
            admin_id: admins.length + 1,
            name,
            email,
            password: hashedPassword,
            created_at: new Date().toISOString()
        };
        
        admins.push(newAdmin);
        
        // Generate JWT token
        const token = jwt.sign(
            { admin_id: newAdmin.admin_id, email: newAdmin.email, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            message: 'Admin registration successful',
            token,
            admin: {
                admin_id: newAdmin.admin_id,
                name: newAdmin.name,
                email: newAdmin.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/auth/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }
        
        // Find admin
        const admin = admins.find(a => a.email === email);
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { admin_id: admin.admin_id, email: admin.email, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Admin login successful',
            token,
            admin: {
                admin_id: admin.admin_id,
                name: admin.name,
                email: admin.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Books Routes
app.get('/api/books', (req, res) => {
    const booksWithAvailability = books.map(book => ({
        ...book,
        available_copies: book.stock,
        is_available: book.stock > 0
    }));
    
    res.json({ books: booksWithAvailability });
});

app.get('/api/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = books.find(b => b.book_id === bookId);
    
    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }
    
    const bookWithAvailability = {
        ...book,
        available_copies: book.stock,
        is_available: book.stock > 0
    };
    
    res.json({ book: bookWithAvailability });
});

app.get('/api/books/search', (req, res) => {
    const query = req.query.q || '';
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.authors.toLowerCase().includes(query.toLowerCase())
    );
    
    const booksWithAvailability = filteredBooks.map(book => ({
        ...book,
        available_copies: book.stock,
        is_available: book.stock > 0
    }));
    
    res.json({ books: booksWithAvailability });
});

// Issues Routes
app.post('/api/issues', verifyToken, (req, res) => {
    try {
        const { book_id, due_days = 30 } = req.body;
        const userId = req.user.user_id;
        
        if (!book_id) {
            return res.status(400).json({ message: 'Book ID required' });
        }
        
        const book = books.find(b => b.book_id === parseInt(book_id));
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        if (book.stock <= 0) {
            return res.status(400).json({ message: 'Book not available' });
        }
        
        // Create issue
        const newIssue = {
            issue_id: issues.length + 1,
            user_id: userId,
            book_id: parseInt(book_id),
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + due_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'issued',
            fine: 0,
            created_at: new Date()
        };
        
        issues.push(newIssue);
        
        // Reduce book stock
        book.stock -= 1;
        
        res.status(201).json({
            message: 'Book issued successfully',
            issue_id: newIssue.issue_id,
            due_date: newIssue.due_date
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/issues/user/:userId', verifyToken, (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (req.user.user_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const userIssues = issues
        .filter(issue => issue.user_id === userId)
        .map(issue => {
            const book = books.find(b => b.book_id === issue.book_id);
            return {
                ...issue,
                title: book?.title || 'Unknown Book',
                authors: book?.authors || 'Unknown Author'
            };
        });
    
    res.json({ issues: userIssues });
});

// Feedback Routes
app.post('/api/feedback', verifyToken, (req, res) => {
    try {
        const { book_id, rating, comment = '' } = req.body;
        const userId = req.user.user_id;
        
        if (!book_id || !rating) {
            return res.status(400).json({ message: 'Book ID and rating required' });
        }
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }
        
        // Check if user already reviewed this book
        const existingFeedback = feedback.find(f => f.user_id === userId && f.book_id === parseInt(book_id));
        if (existingFeedback) {
            return res.status(409).json({ message: 'You have already reviewed this book' });
        }
        
        const newFeedback = {
            feedback_id: feedback.length + 1,
            user_id: userId,
            book_id: parseInt(book_id),
            rating,
            comment,
            created_at: new Date()
        };
        
        feedback.push(newFeedback);
        
        res.status(201).json({
            message: 'Feedback added successfully',
            feedback_id: newFeedback.feedback_id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/feedback/book/:bookId', (req, res) => {
    const bookId = parseInt(req.params.bookId);
    
    const bookFeedback = feedback
        .filter(f => f.book_id === bookId)
        .map(f => {
            const user = users.find(u => u.user_id === f.user_id);
            return {
                ...f,
                user_name: user?.name || 'Anonymous'
            };
        });
    
    const averageRating = bookFeedback.length > 0 
        ? bookFeedback.reduce((sum, f) => sum + f.rating, 0) / bookFeedback.length 
        : 0;
    
    res.json({
        feedbacks: bookFeedback,
        average_rating: Math.round(averageRating * 10) / 10,
        total_reviews: bookFeedback.length
    });
});

// Notifications Routes
app.get('/api/notifications/user/:userId', verifyToken, (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (req.user.user_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const userNotifications = notifications.filter(n => n.user_id === userId);
    res.json({ notifications: userNotifications });
});

// Admin Routes
app.get('/api/admin/stats', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    const stats = {
        total_books: books.length,
        total_users: users.length,
        active_issues: issues.filter(i => i.status === 'issued').length,
        overdue_books: issues.filter(i => i.status === 'issued' && new Date(i.due_date) < new Date()).length,
        total_fines: issues.reduce((sum, i) => sum + (i.fine || 0), 0)
    };
    
    res.json({ stats });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Library Management System API is running',
        timestamp: new Date().toISOString()
    });
});

// Test data and stats for homepage
app.get('/api/test/data', (req, res) => {
    try {
        const stats = {
            total_books: books.length,
            total_categories: 0, // categories not modeled in mock
            total_users: users.length,
            total_issues: issues.length,
            total_admins: admins.length
        };

        res.json({
            books,
            users,
            issues,
            admins,
            stats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Library Management System API running on http://localhost:${PORT}`);
    console.log(`📚 Mock database initialized with ${books.length} books and ${users.length} users`);
    console.log(`👤 Test user: john.doe@email.com / password`);
    console.log(`👨‍💼 Test admin: admin@libraryms.com / password`);
});

module.exports = app;
