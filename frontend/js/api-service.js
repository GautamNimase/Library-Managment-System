// API Service for Library Management System
class APIService {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    // Make HTTP request with authentication
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authentication token if available
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication Methods
    async register(userData) {
        return await this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(email, password) {
        const response = await this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    async adminRegister(adminData) {
        return await this.makeRequest('/auth/admin/register', {
            method: 'POST',
            body: JSON.stringify(adminData)
        });
    }

    async adminLogin(email, password) {
        const response = await this.makeRequest('/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    // Book Methods
    async getBooks() {
        return await this.makeRequest('/books');
    }

    async getBook(bookId) {
        return await this.makeRequest(`/books/${bookId}`);
    }

    async searchBooks(query) {
        return await this.makeRequest(`/books/search?q=${encodeURIComponent(query)}`);
    }

    async addBook(bookData) {
        return await this.makeRequest('/admin/books', {
            method: 'POST',
            body: JSON.stringify(bookData)
        });
    }

    async updateBook(bookId, bookData) {
        return await this.makeRequest(`/admin/books/${bookId}`, {
            method: 'PUT',
            body: JSON.stringify(bookData)
        });
    }

    async deleteBook(bookId) {
        return await this.makeRequest(`/admin/books/${bookId}`, {
            method: 'DELETE'
        });
    }

    // Issue Methods
    async issueBook(bookId, dueDays = 30) {
        return await this.makeRequest('/issues', {
            method: 'POST',
            body: JSON.stringify({ book_id: bookId, due_days: dueDays })
        });
    }

    async returnBook(issueId) {
        return await this.makeRequest(`/issues/${issueId}/return`, {
            method: 'PUT'
        });
    }

    async getUserIssues(userId) {
        return await this.makeRequest(`/issues/user/${userId}`);
    }

    // Feedback Methods
    async addFeedback(bookId, rating, comment = '') {
        return await this.makeRequest('/feedback', {
            method: 'POST',
            body: JSON.stringify({ book_id: bookId, rating, comment })
        });
    }

    async getBookFeedback(bookId) {
        return await this.makeRequest(`/feedback/book/${bookId}`);
    }

    // Notification Methods
    async getUserNotifications(userId) {
        return await this.makeRequest(`/notifications/user/${userId}`);
    }

    async markNotificationRead(notificationId) {
        return await this.makeRequest(`/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
    }

    // Admin Methods
    async getAdminStats() {
        return await this.makeRequest('/admin/stats');
    }

    // --- User Management (Admin) ---
    async getUsers() {
        return await this.makeRequest('/admin/users');
    }

    async getUser(userId) {
        return await this.makeRequest(`/admin/users/${userId}`);
    }

    async addUser(userData) {
        return await this.makeRequest('/admin/users', { method: 'POST', body: JSON.stringify(userData) });
    }

    async updateUser(userId, userData) {
        return await this.makeRequest(`/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(userData) });
    }

    async deleteUser(userId) {
        return await this.makeRequest(`/admin/users/${userId}`, { method: 'DELETE' });
    }

    // Health Check
    async healthCheck() {
        return await this.makeRequest('/health');
    }
}

// Create global API service instance
window.apiService = new APIService();
