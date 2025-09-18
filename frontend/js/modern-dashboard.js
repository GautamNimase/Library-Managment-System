// Modern Dashboard Class
class ModernDashboard {
    constructor() {
        this.currentUser = null;
        this.userIssues = [];
        this.userNotifications = [];
        this.activityData = [];
        this.favorites = new Set();
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadUserData();
            this.setupEventListeners();
            this.loadDashboardData();
            this.isInitialized = true;
        });
    }

    loadUserData() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.name) {
            this.currentUser = userData;
            this.updateUserDisplay();
        }
    }

    updateUserDisplay() {
        const userNameElement = document.getElementById('userName');
        const homeUserNameElement = document.getElementById('homeUserName');
        
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.name || 'User';
        }
        
        if (homeUserNameElement && this.currentUser) {
            homeUserNameElement.textContent = this.currentUser.name || 'User';
        }
    }

    async loadBooksContent() {
        const booksGrid = document.getElementById('booksGrid');
        if (!booksGrid) return;

        try {
            // Show loading state
            booksGrid.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading books...</p>
                </div>
            `;

            // Fetch books from API
            const response = await window.apiService.getBooks();
            const books = response.books.map(book => ({
                id: book.book_id,
                title: book.title,
                author: book.authors,
                category: 'fiction', // Default category
                available: book.is_available,
                image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                rating: 4.0, // Default rating
                reviewCount: 0, // Default reviews
                downloads: Math.floor(Math.random() * 10000) + 1000,
                readTime: '6h',
                badge: book.is_available ? 'Available' : 'Out of Stock',
                description: `A ${book.year} book by ${book.authors}`,
                stock: book.stock,
                available_copies: book.available_copies
            }));

            this.renderBooks(books);
        } catch (error) {
            console.error('Error loading books:', error);
            // Fallback to mock data if API fails
            const books = [
                { 
                    id: 1, 
                    title: 'The Great Adventure', 
                    author: 'John Smith', 
                    category: 'fiction',
                    available: true,
                    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                    rating: 4.9,
                    reviewCount: 1234,
                    downloads: 15200,
                    readTime: '8h',
                    badge: 'Bestseller',
                    description: 'An epic adventure story that takes readers on a journey through mystical lands and ancient secrets.'
                },
                { 
                    id: 2, 
                    title: 'Digital Dreams', 
                    author: 'Sarah Johnson', 
                    category: 'non-fiction',
                    available: true,
                    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                    rating: 4.8,
                    reviewCount: 892,
                    downloads: 8700,
                    readTime: '6h',
                    badge: 'New',
                    description: 'An exploration of how digital technology is reshaping our world, from artificial intelligence to virtual reality.'
                }
            ];

            this.renderBooks(books);
        }
    }

    renderBooks(books) {
        const booksGrid = document.getElementById('booksGrid');
        if (!booksGrid) return;

        booksGrid.innerHTML = books.map(book => `
            <div class="book-card" data-category="${book.category}" data-available="${book.available}">
                <div class="book-cover">
                    <img src="${book.image}" alt="${book.title}" class="book-image">
                    <div class="book-overlay">
                        <button class="favorite-btn" onclick="toggleFavorite(${book.id})">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="quick-view-btn" onclick="viewBook(${book.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">by ${book.author}</p>
                    <div class="book-meta">
                        <span class="book-category">${book.category}</span>
                        <span class="book-year">${book.year || 'N/A'}</span>
                    </div>
                    <div class="book-stats">
                        <div class="rating">
                            <span class="stars">${'★'.repeat(Math.floor(book.rating))}</span>
                            <span class="rating-value">${book.rating}</span>
                            <span class="review-count">(${book.reviews || 0})</span>
                        </div>
                        <div class="downloads">
                            <i class="fas fa-download"></i>
                            <span>${book.downloads.toLocaleString()}</span>
                        </div>
                    </div>
                    <p class="book-description">${book.description}</p>
                    <div class="book-actions">
                        <button class="btn btn-primary" onclick="borrowBook(${book.id})" ${!book.available ? 'disabled' : ''}>
                            <i class="fas fa-book"></i>
                            ${book.available ? 'Borrow Now' : 'Out of Stock'}
                        </button>
                        <button class="btn btn-secondary" onclick="viewBook(${book.id})">
                            <i class="fas fa-info-circle"></i>
                            Details
                        </button>
                    </div>
                    <div class="book-badge">${book.badge}</div>
                </div>
            </div>
        `).join('');

        // Add event listeners for filtering
        this.setupBookFilters();
    }

    setupBookFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const searchInput = document.getElementById('bookSearch');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const category = btn.dataset.category;
                this.filterBooks(category);
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchBooks(e.target.value);
            });
        }
    }

    filterBooks(category) {
        const bookCards = document.querySelectorAll('.book-card');
        
        bookCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    searchBooks(query) {
        const bookCards = document.querySelectorAll('.book-card');
        const searchTerm = query.toLowerCase();
        
        bookCards.forEach(card => {
            const title = card.querySelector('.book-title').textContent.toLowerCase();
            const author = card.querySelector('.book-author').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || author.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    async loadDashboardData() {
        try {
            await Promise.all([
                this.loadUserIssues(),
                this.loadUserNotifications(),
                this.loadActivityData(),
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async loadUserIssues() {
        try {
            if (!this.currentUser?.user_id) return;
            
            const response = await window.apiService.getUserIssues(this.currentUser.user_id);
            this.userIssues = response.issues || [];
            this.updateIssuesDisplay();
        } catch (error) {
            console.error('Error loading user issues:', error);
            // Fallback to mock data
            this.userIssues = [];
            this.updateIssuesDisplay();
        }
    }

    async loadUserNotifications() {
        try {
            if (!this.currentUser?.user_id) return;
            
            const response = await window.apiService.getUserNotifications(this.currentUser.user_id);
            this.userNotifications = response.notifications || [];
            this.updateNotificationsDisplay();
        } catch (error) {
            console.error('Error loading notifications:', error);
            // Fallback to mock data
            this.userNotifications = [];
            this.updateNotificationsDisplay();
        }
    }

    loadActivityData() {
        // Mock activity data
        this.activityData = [
            {
                id: 1,
                type: 'book_borrowed',
                title: 'Book Borrowed',
                description: 'You borrowed "The Great Adventure"',
                timestamp: new Date().toISOString(),
                icon: 'fas fa-book-open'
            },
            {
                id: 2,
                type: 'book_returned',
                title: 'Book Returned',
                description: 'You returned "Digital Dreams"',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                icon: 'fas fa-book'
            }
        ];
        this.updateActivityDisplay();
    }

    updateIssuesDisplay() {
        const issuesList = document.getElementById('issuesList');
        if (!issuesList) return;

        if (this.userIssues.length === 0) {
            issuesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h3>No books borrowed</h3>
                    <p>Start exploring our collection!</p>
                </div>
            `;
            return;
        }

        issuesList.innerHTML = this.userIssues.map(issue => `
            <div class="issue-item">
                <div class="issue-info">
                    <h4>${issue.title || 'Unknown Book'}</h4>
                    <p>by ${issue.authors || 'Unknown Author'}</p>
                    <div class="issue-meta">
                        <span class="issue-date">Issued: ${issue.issue_date}</span>
                        <span class="due-date">Due: ${issue.due_date}</span>
                    </div>
                </div>
                <div class="issue-status ${issue.status}">
                    <span>${issue.status}</span>
                </div>
            </div>
        `).join('');
    }

    updateNotificationsDisplay() {
        const notificationsList = document.getElementById('notificationsList');
        if (!notificationsList) return;

        if (this.userNotifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell"></i>
                    <h3>No notifications</h3>
                    <p>You're all caught up!</p>
                </div>
            `;
            return;
        }

        notificationsList.innerHTML = this.userNotifications.map(notification => `
            <div class="notification-item ${notification.is_read ? 'read' : 'unread'}">
                <div class="notification-icon">
                    <i class="fas fa-bell"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.message}</h4>
                    <p>${notification.send_date}</p>
                </div>
            </div>
        `).join('');
    }

    updateActivityDisplay() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        activityList.innerHTML = this.activityData.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                    <span class="activity-time">${this.formatTime(activity.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        return `${Math.floor(diff / 86400000)} days ago`;
    }

    switchSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[onclick*="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Load section content
        this.loadSectionContent(sectionId);
    }

    loadSectionContent(sectionId) {
        switch (sectionId) {
            case 'dashboardSection':
                this.loadDashboardData();
                break;
            case 'booksSection':
                this.loadBooksContent();
                break;
            case 'profileSection':
                this.loadProfileContent();
                break;
            case 'historySection':
                this.loadHistoryContent();
                break;
            case 'notificationsSection':
                this.loadNotificationsContent();
                break;
        }
    }

    loadProfileContent() {
        // Load profile content
        const profileSection = document.getElementById('profileSection');
        if (!profileSection) return;

        // Update profile information
        if (this.currentUser) {
            const nameInput = document.getElementById('profileName');
            const emailInput = document.getElementById('profileEmail');
            const phoneInput = document.getElementById('profilePhone');

            if (nameInput) nameInput.value = this.currentUser.name || '';
            if (emailInput) emailInput.value = this.currentUser.email || '';
            if (phoneInput) phoneInput.value = this.currentUser.phone || '';
        }
    }

    loadHistoryContent() {
        // Load history content
        this.updateIssuesDisplay();
    }

    loadNotificationsContent() {
        // Load notifications content
        this.updateNotificationsDisplay();
    }

    setupEventListeners() {
        // Navigation event listeners
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = item.dataset.section;
                if (sectionId) {
                    this.switchSection(sectionId);
                }
            });
        });

        // Profile form submission
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }
    }

    updateProfile() {
        const formData = new FormData(document.getElementById('profileForm'));
        const updatedUser = {
            ...this.currentUser,
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone')
        };

        this.currentUser = updatedUser;
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        this.updateUserDisplay();
        this.showToast('Profile updated successfully!', 'success');
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    logout() {
        // Clear user data
        this.currentUser = null;
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        
        // Clear API token
        if (window.apiService) {
            window.apiService.clearToken();
        }

        // Redirect to login
        window.location.href = 'index.html';
    }

    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown.style.display === 'none' || dropdown.style.display === '') {
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new ModernDashboard();
});

// Global functions for HTML onclick handlers
function logout() {
    if (window.dashboard) {
        window.dashboard.logout();
    }
}

function showUserDashboard() {
    if (window.dashboard) {
        window.dashboard.switchSection('dashboardSection');
    }
}

function showUserBooks() {
    if (window.dashboard) {
        window.dashboard.switchSection('booksSection');
    }
}

function showUserProfile() {
    if (window.dashboard) {
        window.dashboard.switchSection('profileSection');
    }
}

function showUserHistory() {
    if (window.dashboard) {
        window.dashboard.switchSection('historySection');
    }
}

function showUserNotifications() {
    if (window.dashboard) {
        window.dashboard.switchSection('notificationsSection');
    }
}

async function borrowBook(bookId) {
    try {
        if (!window.apiService.token) {
            alert('Please login to borrow books');
            return;
        }

        const response = await window.apiService.issueBook(bookId);
        alert('Book borrowed successfully! Due date: ' + response.due_date);
        
        // Refresh the books list
        if (window.dashboard) {
            window.dashboard.loadBooksContent();
        }
    } catch (error) {
        console.error('Error borrowing book:', error);
        alert('Failed to borrow book: ' + error.message);
    }
}

function toggleFavorite(bookId) {
    if (window.dashboard) {
        window.dashboard.toggleFavorite(bookId);
    }
}

function viewBook(bookId) {
    if (window.dashboard) {
        window.dashboard.viewBook(bookId);
    }
}

function toggleUserMenu() {
    if (window.dashboard) {
        window.dashboard.toggleUserMenu();
    }
}
