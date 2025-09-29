// Homepage API Service for Real Data
class HomepageAPI {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
    }

    async makeRequest(endpoint, options = {}) {
        try {
            const method = (options.method || 'GET').toUpperCase();

            // Build headers conditionally to avoid triggering preflight for simple GET
            const headers = { ...(options.headers || {}) };
            if (method !== 'GET' && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                method,
                headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Get all books
    async getBooks() {
        return this.makeRequest('/books');
    }

    // Get featured books (books with is_featured = 1)
    async getFeaturedBooks() {
        try {
            const data = await this.getBooks();
            return data.books.filter(book => book.is_featured === 1).slice(0, 6);
        } catch (error) {
            console.error('Failed to fetch featured books:', error);
            return [];
        }
    }

    // Get library statistics
    async getLibraryStats() {
        try {
            const data = await this.makeRequest('/test/data');
            return data.stats;
        } catch (error) {
            console.error('Failed to fetch library stats:', error);
            return {
                total_books: 0,
                total_categories: 0,
                total_users: 0,
                total_issues: 0,
                total_admins: 0
            };
        }
    }

    // Get book feedback/reviews for testimonials
    async getBookFeedback(bookId) {
        try {
            const data = await this.makeRequest(`/feedback/book/${bookId}`);
            return data.feedbacks || [];
        } catch (error) {
            console.error('Failed to fetch book feedback:', error);
            return [];
        }
    }

    // Get recent book feedback for testimonials
    async getRecentFeedback() {
        try {
            const booksData = await this.getBooks();
            const allFeedback = [];
            
            // Get feedback from first few books
            for (let i = 0; i < Math.min(3, booksData.books.length); i++) {
                const book = booksData.books[i];
                const feedback = await this.getBookFeedback(book.book_id);
                allFeedback.push(...feedback.map(f => ({
                    ...f,
                    book_title: book.title
                })));
            }
            
            // Sort by date and return latest 3
            return allFeedback
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 3);
        } catch (error) {
            console.error('Failed to fetch recent feedback:', error);
            return [];
        }
    }

    // Get books by category
    async getBooksByCategory(category) {
        try {
            const data = await this.getBooks();
            if (category === 'all') return data.books;
            
            // Map categories to book properties
            const categoryMap = {
                'fiction': 'Fiction',
                'non-fiction': 'Non-Fiction', 
                'tech': 'Technology',
                'science': 'Science',
                'history': 'History',
                'biography': 'Biography'
            };
            
            return data.books.filter(book => 
                book.description && 
                book.description.toLowerCase().includes(categoryMap[category]?.toLowerCase() || category.toLowerCase())
            );
        } catch (error) {
            console.error('Failed to fetch books by category:', error);
            return [];
        }
    }
}

// Initialize API service
window.homepageAPI = new HomepageAPI();
