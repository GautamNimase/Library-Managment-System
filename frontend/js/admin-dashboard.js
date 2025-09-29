// Modern Admin Dashboard JavaScript

class AdminDashboard {
    constructor() {
        this.isInitialized = false;
        this.animationObserver = null;
        this.statsInterval = null;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.initializeComponents();
            this.setupAnimations();
            this.loadAdminData();
            this.startStatsUpdates();
            loadUsersData(); // Load real users from database
            this.isInitialized = true;
        });
    }

    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Action cards
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleActionCardClick(e));
            card.addEventListener('mouseenter', (e) => this.handleCardHover(e, true));
            card.addEventListener('mouseleave', (e) => this.handleCardHover(e, false));
        });

        // Notification button
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => this.showNotifications());
        }

        // Settings button
        const settingsBtn = document.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // Modal close
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeNotifications());
        }

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('notificationsModal');
            if (e.target === modal) {
                this.closeNotifications();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    initializeComponents() {
        this.setupSidebarToggle();
        this.setupStatsCards();
        this.setupActivityItems();
        this.setupStatusIndicators();
    }

    setupSidebarToggle() {
        const sidebar = document.querySelector('.admin-sidebar');
        const main = document.querySelector('.admin-main');
        
        if (!sidebar || !main) return;

        // Check if sidebar should be collapsed on mobile
        if (window.innerWidth <= 1024) {
            sidebar.classList.add('collapsed');
            main.classList.add('sidebar-collapsed');
        }

        // Restore sidebar state from localStorage
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed && window.innerWidth > 1024) {
            sidebar.classList.add('collapsed');
            main.classList.add('sidebar-collapsed');
        }
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        const main = document.querySelector('.admin-main');
        
        if (sidebar && main) {
            sidebar.classList.toggle('collapsed');
            main.classList.toggle('sidebar-collapsed');
            
            // Save preference
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        }
    }

    setupStatsCards() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            // Add staggered animation delay
            card.style.animationDelay = `${index * 100}ms`;
            
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupActivityItems() {
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 150}ms`;
        });
    }

    setupStatusIndicators() {
        const indicators = document.querySelectorAll('.status-indicator');
        indicators.forEach(indicator => {
            // Add pulsing animation for online status
            if (indicator.classList.contains('online')) {
                indicator.style.animation = 'pulse 2s infinite';
            }
        });
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        this.animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-on-scroll', 'animated');
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements for animation
        document.querySelectorAll('.stat-card, .action-card, .activity-item').forEach(el => {
            this.animationObserver.observe(el);
        });

        // Stagger animations for initial load
        this.staggerAnimations();
    }

    staggerAnimations() {
        const animatedElements = document.querySelectorAll('[data-delay]');
        animatedElements.forEach((element) => {
            const delay = parseInt(element.dataset.delay) || 0;
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0) translateX(0)';
            }, delay);
        });
    }

    handleActionCardClick(e) {
        const card = e.currentTarget;
        const action = card.querySelector('h4').textContent;
        
        // Add click animation
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 150);

        // Open appropriate modal based on action
        this.openActionModal(action);
        
        // Add ripple effect
        this.createRippleEffect(e);
    }

    openActionModal(action) {
        const modalMap = {
            'Add New Book': 'addBookModal',
            'Manage Users': 'manageUsersModal',
            'Loan Management': 'loanManagementModal',
            'Reports': 'reportsModal'
        };

        const modalId = modalMap[action];
        if (modalId) {
            this.showModal(modalId);
        } else {
            this.showToast(`${action} feature coming soon!`, 'info');
        }
    }

    handleCardHover(e, isEntering) {
        const card = e.currentTarget;
        if (isEntering) {
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        } else {
            card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
    }

    createRippleEffect(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    loadAdminData() {
        const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
        
        if (adminData.name) {
            const nameElements = document.querySelectorAll('#adminName, #adminNameTop');
            nameElements.forEach(el => {
                if (el) el.textContent = adminData.name;
            });
        }
        
        // Remove skip-login messaging
    }

    startStatsUpdates() {
        // Initial update
        this.updateStats();
        
        // Set up interval for periodic updates
        this.statsInterval = setInterval(() => {
            this.updateStats();
        }, 30000); // Update every 30 seconds
    }

    async updateStats() {
        try {
            // Fetch real stats from API
            const response = await window.apiService.getAdminStats();
            const stats = response.stats;
            
            // Animate number changes
            this.animateNumber('totalBooks', stats.total_books);
            this.animateNumber('totalUsers', stats.total_users);
            this.animateNumber('activeLoans', stats.active_issues);
            this.animateNumber('overdueBooks', stats.overdue_books);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            // Fallback to mock data if API fails
            const stats = {
                totalBooks: Math.floor(Math.random() * 50) + 1200,
                totalUsers: Math.floor(Math.random() * 20) + 880,
                activeLoans: Math.floor(Math.random() * 10) + 150,
                overdueBooks: Math.floor(Math.random() * 5) + 20
            };
            
            // Animate number changes
            this.animateNumber('totalBooks', stats.totalBooks);
            this.animateNumber('totalUsers', stats.totalUsers);
            this.animateNumber('activeLoans', stats.activeLoans);
            this.animateNumber('overdueBooks', stats.overdueBooks);
        }
    }

    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easing function for smooth animation
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(currentValue + (targetValue - currentValue) * easeOutCubic);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        
        requestAnimationFrame(updateNumber);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('animate__animated', 'animate__fadeIn');
            document.body.style.overflow = 'hidden';
            // Persist UI state
            try { localStorage.setItem('adminUI_openModal', modalId); } catch (_) {}

            // When opening Loan Management, load current data
        if (modalId === 'loanManagementModal') {
                // Skip: loan modal removed
                return;
            } else if (modalId === 'billsModal') {
                loadBills('active');
                loadBills('overdue');
                loadBills('paid');
                loadBills('history');
                // Ensure first tab visible
                switchBillsTab('active-bills');
            } else if (modalId === 'overdueBooksModal') {
                loadOverdueBooks();
            } else if (modalId === 'reportsModal') {
                // Populate reports & analytics with real data
                loadReportsAnalytics();
            }
        }
    }


    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('animate__animated', 'animate__fadeOut');
            document.body.style.overflow = '';
            // Clear persisted state if same modal
            try {
                const saved = localStorage.getItem('adminUI_openModal');
                if (saved === modalId) localStorage.removeItem('adminUI_openModal');
            } catch (_) {}
            
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('animate__animated', 'animate__fadeOut');
            }, 300);
        }
    }

    showNotifications() {
        this.showModal('notificationsModal');
    }

    closeNotifications() {
        this.closeModal('notificationsModal');
    }

    showSettings() {
        this.showModal('settingsModal');
        this.loadSettings();
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + B: Toggle sidebar
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            this.toggleSidebar();
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            this.closeNotifications();
        }
        
        // Ctrl/Cmd + N: Show notifications
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.showNotifications();
        }
    }

    handleResize() {
        const sidebar = document.querySelector('.admin-sidebar');
        const main = document.querySelector('.admin-main');
        
        if (window.innerWidth <= 1024) {
            sidebar?.classList.add('collapsed');
            main?.classList.add('sidebar-collapsed');
        } else {
            // Restore sidebar state from localStorage
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (!isCollapsed) {
                sidebar?.classList.remove('collapsed');
                main?.classList.remove('sidebar-collapsed');
            }
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const iconMap = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${iconMap[type]}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    adminLogout() {
        if (confirm('Are you sure you want to logout from the admin panel?')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            this.showToast('Logged out successfully', 'success');
            
            setTimeout(() => {
                window.location.href = 'admin-login.html';
            }, 1000);
        }
    }

    // Cleanup method
    destroy() {
        if (this.animationObserver) {
            this.animationObserver.disconnect();
        }
        
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
        }
        
        this.isInitialized = false;
    }
}

// Initialize the dashboard
const adminDashboard = new AdminDashboard();

// Global functions for HTML onclick handlers
function adminLogout() {
    adminDashboard.adminLogout();
}

function showNotifications() {
    adminDashboard.showNotifications();
}

function closeNotifications() {
    adminDashboard.closeNotifications();
}

function closeModal(modalId) {
    adminDashboard.closeModal(modalId);
}

function showModal(modalId) {
    adminDashboard.showModal(modalId);
}

// Form handling functions
async function handleAddBookForm(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Map UI fields to backend expectations
    const title = (formData.get('title') || '').toString().trim();
    const authors = (formData.get('author') || '').toString().trim();
    const copies = parseInt(formData.get('copies') || '1', 10);
    const category = (formData.get('category') || '').toString().trim();

    if (!title || !authors) {
        adminDashboard.showToast('Please provide both Title and Author.', 'error');
        return;
    }

    const bookData = {
        title: title,
        authors: authors,
        publishers: category || null,
        year: null,
        price: 0,
        stock: isNaN(copies) ? 1 : copies
    };
    
    try {
        const response = await window.apiService.addBook(bookData);
        adminDashboard.showToast('Book added successfully!', 'success');
        adminDashboard.closeModal('addBookModal');
        e.target.reset();
        adminDashboard.updateStats();
    } catch (error) {
        console.error('Error adding book:', error);
        adminDashboard.showToast('Failed to add book: ' + (error.message || 'Unknown error'), 'error');
    }
}

function switchTab(tabName, btn) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked tab
    if (btn) {
        btn.classList.add('active');
    } else {
        // Try to find the matching button by its onclick attribute
        const guessBtn = document.querySelector(`.loan-tabs .tab-btn[onclick*="${tabName}"]`);
        if (guessBtn) guessBtn.classList.add('active');
    }
    
    // Show corresponding content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    const activeContent = document.getElementById(tabName);
    if (activeContent) {
        activeContent.style.display = 'block';
        // Load data when switching tabs
        // Loans containers removed; no-op

        // Persist selected tab
        try { localStorage.setItem('adminUI_loansActiveTab', tabName); } catch (_) {}
    }
}

function returnBook(loanId) {
    if (confirm('Are you sure you want to return this book?')) {
        (async () => {
            try {
                await window.apiService.makeRequest(`/issues/${loanId}/return`, { method: 'PUT' });
                adminDashboard.showToast('Book returned successfully!', 'success');
                loadLoans('active');
                adminDashboard.updateStats();
            } catch (e) {
                adminDashboard.showToast('Failed to return book: ' + (e.message || 'Unknown error'), 'error');
            }
        })();
    }
}

function renewBook(loanId) {
    adminDashboard.showToast('Renew API not implemented', 'info');
}

// Loans loader
async function loadLoans(kind) {
    try {
        // We only have endpoints for user-specific issues; for admin view, use /api/test/data
        const data = await window.apiService.makeRequest('/test/data');
        let issues = Array.isArray(data.issues) ? data.issues : [];
        let booksById = new Map((data.books || []).map(b => [b.book_id, b]));
        let usersById = new Map((data.users || []).map(u => [u.user_id, u]));

        // If no real data, fallback to mock
        if (issues.length === 0) {
            const mock = getMockLoansData();
            issues = mock.issues;
            booksById = new Map(mock.books.map(b => [b.book_id, b]));
            usersById = new Map(mock.users.map(u => [u.user_id, u]));
        }

        const now = new Date();
        const parseDate = (d) => {
            if (!d) return null;
            // Handle possible MySQL date strings like 'Wed, 24 Sep 2025 00:00:00 GMT'
            const parsed = new Date(d);
            if (!isNaN(parsed)) return parsed;
            // Try YYYY-MM-DD
            try {
                const s = String(d).slice(0,10);
                const iso = new Date(s);
                return isNaN(iso) ? null : iso;
            } catch (_) {
                return null;
            }
        };
        let filtered = issues;
        if (kind === 'active') {
            filtered = issues.filter(i => i.status === 'issued');
        }
        if (kind === 'overdue') {
            filtered = issues.filter(i => i.status === 'overdue' || (i.status === 'issued' && (()=>{const dd=parseDate(i.due_date); return dd && dd < now;})()));
        }
        if (kind === 'history') {
            filtered = issues.filter(i => i.status !== 'issued');
        }

        const containerId = kind === 'active' ? 'active-loans' : (kind === 'overdue' ? 'overdue-loans' : 'loan-history');
        let tbody = document.querySelector(`#${containerId} tbody`);
        if (!tbody) {
            const table = document.querySelector(`#${containerId} table`);
            if (table) {
                tbody = document.createElement('tbody');
                table.appendChild(tbody);
            } else {
                // Inject a minimal table if markup was not rendered yet
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `
                        <div class="loans-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Book</th>
                                        <th>Issue Date</th>
                                        <th>Due Date</th>
                                        ${kind === 'history' ? '<th>Status</th>' : '<th>Actions</th>'}
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>`;
                    tbody = container.querySelector('tbody');
                } else {
                    console.warn('Loans container/table not found for', containerId);
                    return;
                }
            }
        }

        if (filtered.length === 0) {
            const colspan = kind === 'history' ? 5 : 5;
            tbody.innerHTML = `<tr><td colspan="${colspan}">No records found.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(i => {
            const user = usersById.get(i.user_id) || { name: `User #${i.user_id}` };
            const book = booksById.get(i.book_id) || { title: `Book #${i.book_id}` };
            if (kind === 'history') {
                return `
                    <tr>
                        <td>${user.name || user.email || ('User #' + i.user_id)}</td>
                        <td>${book.title}</td>
                        <td>${(i.issue_date || '').toString().slice(0,10)}</td>
                        <td>${(i.due_date || '').toString().slice(0,10)}</td>
                        <td>${i.status}</td>
                    </tr>
                `;
            } else {
                const actions = i.status === 'issued' ? `
                    <button class=\"btn btn-success btn-sm\" onclick=\"returnBook(${i.issue_id})\">Return</button>
                ` : '';
                return `
                    <tr>
                        <td>${user.name || user.email || ('User #' + i.user_id)}</td>
                        <td>${book.title}</td>
                        <td>${(i.issue_date || '').toString().slice(0,10)}</td>
                        <td>${(i.due_date || '').toString().slice(0,10)}</td>
                        <td>${actions}</td>
                    </tr>
                `;
            }
        }).join('');
    } catch (e) {
        console.error('Failed to load loans', e);
        // Use mock data on failure
        try {
            const mock = getMockLoansData();
            ['active','overdue','history'].forEach(kind => {
                const containerId = kind === 'active' ? 'active-loans' : (kind === 'overdue' ? 'overdue-loans' : 'loan-history');
                const tbody = document.querySelector(`#${containerId} tbody`);
                if (!tbody) return;
                const issues = mock.issues.filter(i => {
                    if (kind === 'active') return i.status === 'issued';
                    if (kind === 'overdue') return i.status === 'issued' && new Date(i.due_date) < new Date();
                    return i.status !== 'issued';
                });
                const booksById = new Map(mock.books.map(b => [b.book_id, b]));
                const usersById = new Map(mock.users.map(u => [u.user_id, u]));
                tbody.innerHTML = issues.map(i => {
                    const user = usersById.get(i.user_id) || { name: `User #${i.user_id}` };
                    const book = booksById.get(i.book_id) || { title: `Book #${i.book_id}` };
                    if (kind === 'history') {
                        return `
                            <tr>
                                <td>${user.name}</td>
                                <td>${book.title}</td>
                                <td>${i.issue_date}</td>
                                <td>${i.due_date}</td>
                                <td>${i.status}</td>
                            </tr>
                        `;
                    }
                    return `
                        <tr>
                            <td>${user.name}</td>
                            <td>${book.title}</td>
                            <td>${i.issue_date}</td>
                            <td>${i.due_date}</td>
                            <td><button class=\"btn btn-success btn-sm\" disabled>Return</button></td>
                        </tr>
                    `;
                }).join('');
            });
        } catch (_) {
            ['active-loans','overdue-loans','loan-history'].forEach(id => {
                const tb = document.querySelector(`#${id} tbody`);
                if (tb) tb.innerHTML = '<tr><td colspan="5">Failed to load loans.</td></tr>';
            });
        }
    }
}

function getMockLoansData() {
    // Simple deterministic mock set
    const users = [
        { user_id: 1, name: 'John Doe', email: 'john@example.com' },
        { user_id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        { user_id: 3, name: 'Mike Johnson', email: 'mike@example.com' }
    ];
    const books = [
        { book_id: 101, title: 'The Great Gatsby' },
        { book_id: 102, title: '1984' },
        { book_id: 103, title: 'To Kill a Mockingbird' }
    ];
    const today = new Date();
    const fmt = (d) => d.toISOString().slice(0,10);
    const twoWeeksAgo = new Date(today); twoWeeksAgo.setDate(today.getDate()-14);
    const oneWeekAgo = new Date(today); oneWeekAgo.setDate(today.getDate()-7);
    const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
    const lastMonth = new Date(today); lastMonth.setDate(today.getDate()-30);
    const issues = [
        { issue_id: 5001, user_id: 1, book_id: 101, issue_date: fmt(oneWeekAgo), due_date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate()+7)), status: 'issued' },
        { issue_id: 5002, user_id: 2, book_id: 102, issue_date: fmt(twoWeeksAgo), due_date: fmt(yesterday), status: 'issued' },
        { issue_id: 5003, user_id: 3, book_id: 103, issue_date: fmt(lastMonth), due_date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate()-10)), return_date: fmt(yesterday), status: 'returned' }
    ];
    return { users, books, issues };
}

// User management functions
let usersData = [];

// Load users from database
async function loadUsersData() {
    try {
        const response = await window.apiService.getUsers();
        usersData = response.users || [];
        updateUsersTable();
    } catch (error) {
        console.error('Error loading users:', error);
        // Fallback to empty array if API fails
        usersData = [];
        updateUsersTable();
    }
}

function showAddUserModal() {
    document.getElementById('userModalTitle').textContent = 'Add New User';
    document.getElementById('userSubmitBtn').textContent = 'Add User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    adminDashboard.showModal('addUserModal');
}

function editUser(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('userModalTitle').textContent = 'Edit User';
    document.getElementById('userSubmitBtn').textContent = 'Update User';
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;
    document.getElementById('userPassword').value = '******'; // Placeholder
    
    adminDashboard.showModal('addUserModal');
}

async function deleteUser(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;
    
    if (confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
        try {
            const response = await window.apiService.deleteUser(userId);
            adminDashboard.showToast(response.message, 'success');
            await loadUsersData(); // Reload users from database
        } catch (error) {
            console.error('Error deleting user:', error);
            adminDashboard.showToast('Failed to delete user: ' + error.message, 'error');
        }
    }
}

function viewUserDetails(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('detailUserName').textContent = user.name;
    document.getElementById('detailUserEmail').textContent = user.email;
    document.getElementById('detailUserRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('detailUserStatus').textContent = user.status.charAt(0).toUpperCase() + user.status.slice(1);
    document.getElementById('detailUserJoinDate').textContent = `Joined: ${user.joinDate}`;
    document.getElementById('booksBorrowed').textContent = user.booksBorrowed;
    document.getElementById('currentLoans').textContent = user.currentLoans;
    document.getElementById('overdueBooks').textContent = user.overdueBooks;
    
    adminDashboard.showModal('userDetailsModal');
}

function updateUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = usersData.map(user => {
        const id = (user.user_id ?? user.id ?? 0);
        const name = user.name || '';
        const email = user.email || '';
        const role = (user.role || 'user');
        const status = (user.status || (user.is_active === false ? 'inactive' : 'active'));
        const joinDate = user.joinDate || (user.created_at ? new Date(user.created_at).toISOString().slice(0,10) : '');
        const idDisplay = String(id).padStart(3, '0');
        const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
        const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
        return `
        <tr data-user-id="${id}">
            <td>#${idDisplay}</td>
            <td>${name}</td>
            <td>${email}</td>
            <td>${roleDisplay}</td>
            <td><span class="status-badge ${status}">${statusDisplay}</span></td>
            <td>${joinDate}</td>
            <td>
                <button class="btn-icon" title="Edit" onclick="editUser(${id})"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" title="Delete" onclick="deleteUser(${id})"><i class="fas fa-trash"></i></button>
                <button class="btn-icon" title="View Details" onclick="viewUserDetails(${id})"><i class="fas fa-eye"></i></button>
            </td>
        </tr>`;
    }).join('');
}

async function handleUserForm(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData);
    
    const userId = userData.userId;
    const isEdit = userId && userId !== '';
    
    try {
        if (isEdit) {
            // Update existing user
            const response = await window.apiService.updateUser(userId, userData);
            adminDashboard.showToast(response.message, 'success');
        } else {
            // Add new user
            const response = await window.apiService.addUser(userData);
            adminDashboard.showToast(response.message, 'success');
        }
        
        await loadUsersData(); // Reload users from database
        adminDashboard.closeModal('addUserModal');
        e.target.reset();
    } catch (error) {
        console.error('Error saving user:', error);
        adminDashboard.showToast('Failed to save user: ' + error.message, 'error');
    }
}

// Initialize form handlers
document.addEventListener('DOMContentLoaded', function() {
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', handleAddBookForm);
    }
    
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserForm);
    }
    
    // Add search functionality for users
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const tableRows = document.querySelectorAll('#usersTableBody tr');
            
            tableRows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    // Initialize users table
    updateUsersTable();
    
    // Load saved settings
    loadSavedSettings();
    
    // Add real-time theme switching
    setupThemeSwitching();
    
    // Add form validation
    setupFormValidation();

    // Wire up report buttons if present
    const libBtn = document.getElementById('generateLibraryStatsReportBtn');
    if (libBtn) libBtn.addEventListener('click', () => generateReportCSV('library'));
    const popBtn = document.getElementById('generatePopularBooksReportBtn');
    if (popBtn) popBtn.addEventListener('click', () => generateReportCSV('popular'));
    const userActBtn = document.getElementById('generateUserActivityReportBtn');
    if (userActBtn) userActBtn.addEventListener('click', () => generateReportCSV('userActivity'));

    // Preload loan tables so modal has data immediately after page load
    try {
        // Loans modal/containers removed; do not preload
        // Preload bills so modal is never blank
        loadBills('active');
        loadBills('overdue');
        loadBills('paid');
        loadBills('history');
    } catch (e) {
        console.warn('Preload bills failed', e);
    }

    // Restore previously open modal and selected loans tab
    try {
        const openModal = localStorage.getItem('adminUI_openModal');
        if (openModal) {
            // Defer to ensure DOM is ready
            setTimeout(() => {
                showModal(openModal);
                const rememberedTab = localStorage.getItem('adminUI_loansActiveTab');
                if (openModal === 'loanManagementModal' && rememberedTab) {
                    switchTab(rememberedTab);
                }
                if (openModal === 'billsModal') {
                    const rememberedBillsTab = localStorage.getItem('adminUI_billsActiveTab');
                    if (rememberedBillsTab) switchBillsTab(rememberedBillsTab);
                }
                if (openModal === 'overdueBooksModal') {
                    loadOverdueBooks();
                }
            }, 0);
        }
    } catch (_) {}
});

// ---------------- Bills & Fines -----------------
function switchBillsTab(tabName, btn) {
    document.querySelectorAll('#billsModal .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.querySelectorAll('#billsModal .tab-content').forEach(c => c.style.display = 'none');
    const activeContent = document.getElementById(tabName);
    if (activeContent) activeContent.style.display = 'block';
    try { localStorage.setItem('adminUI_billsActiveTab', tabName); } catch (_) {}
    if (tabName === 'active-bills') loadBills('active');
    if (tabName === 'overdue-bills') loadBills('overdue');
    if (tabName === 'paid-bills') loadBills('paid');
    if (tabName === 'bills-history') loadBills('history');
}

async function loadBills(kind) {
    try {
        const data = await window.apiService.makeRequest('/test/data');
        const issues = Array.isArray(data.issues) ? data.issues : [];
        const booksById = new Map((data.books || []).map(b => [b.book_id, b]));
        const usersById = new Map((data.users || []).map(u => [u.user_id, u]));
        const now = new Date();
        const parseDate = (d) => d ? new Date(d) : null;
        // Normalize types for safe comparisons
        const normalized = issues.map(i => ({
            ...i,
            fine_num: (i.fine == null ? 0 : Number(i.fine)),
            fine_paid_bool: (i.fine_paid === 1 || i.fine_paid === true)
        }));
        let filtered = normalized;
        if (kind === 'active') {
            filtered = normalized.filter(i => (i.fine_num > 0 && !i.fine_paid_bool) || i.status === 'issued');
        } else if (kind === 'overdue') {
            filtered = normalized.filter(i => i.status === 'overdue' || (i.status === 'issued' && (()=>{const dd=parseDate(i.due_date); return dd && dd < now;})()));
        } else if (kind === 'paid') {
            filtered = normalized.filter(i => Number(i.fine_num) > 0 && i.fine_paid_bool);
        } else if (kind === 'history') {
            filtered = normalized.filter(i => i.status === 'returned' || Number(i.fine_num) > 0);
        }

        const containerId = kind === 'active' ? 'active-bills' : (kind === 'overdue' ? 'overdue-bills' : (kind === 'paid' ? 'paid-bills' : 'bills-history'));
        const container = document.getElementById(containerId);
        if (!container) return;
        // Rebuild the table markup to avoid stale/missing tbody issues
        container.innerHTML = `
            <div class="loans-table">
                <div class="table-meta" style="margin:8px 0; opacity:0.9; font-size:0.9rem;">
                    <span class="bill-count">Loading...</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Book</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                            ${kind === 'history' ? '<th>Status</th>' : ''}
                            <th>Fine</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>`;
        let tbody = container.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
        }

        // Update count/meta
        const countEl = container.querySelector('.bill-count');
        if (countEl) countEl.textContent = `${filtered.length} record${filtered.length===1?'':'s'}`;

        if (!filtered.length) {
            tbody.innerHTML = `<tr><td colspan="${kind==='history'?6:5}">No records found.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(i => {
            const user = usersById.get(i.user_id) || { name: `User #${i.user_id}` };
            const book = booksById.get(i.book_id) || { title: `Book #${i.book_id}` };
            // Normalize date strings
            const issueDate = i.issue_date ? new Date(i.issue_date) : null;
            const dueDate = i.due_date ? new Date(i.due_date) : null;
            const fmt = (d) => d ? d.toISOString().slice(0,10) : '';
            // MySQL connector may return fine as string; normalize
            const fine = Number(i.fine != null ? i.fine : i.fine_num || 0).toFixed(2);
            const base = `
                <td>${user.name || user.email || ('User #' + i.user_id)}</td>
                <td>${book.title}</td>
                <td>${fmt(issueDate)}</td>
                <td>${fmt(dueDate)}</td>`;
            if (kind === 'history') {
                return `<tr>${base}<td>${i.status}</td><td>${fine}</td></tr>`;
            }
            return `<tr>${base}<td>${fine}</td></tr>`;
        }).join('');
    } catch (e) {
        console.error('Failed to load bills', e);
        ['active-bills','overdue-bills','paid-bills','bills-history'].forEach(id => {
            const tb = document.querySelector(`#${id} tbody`);
            if (tb) tb.innerHTML = '<tr><td colspan="6">Failed to load bills.</td></tr>';
        });
    }
}

async function loadOverdueBooks() {
    try {
        const data = await window.apiService.makeRequest('/test/data');
        const issues = Array.isArray(data.issues) ? data.issues : [];
        const booksById = new Map((data.books || []).map(b => [b.book_id, b]));
        const usersById = new Map((data.users || []).map(u => [u.user_id, u]));
        const now = new Date();
        const parseDate = (d) => d ? new Date(d) : null;
        const overdue = issues.filter(i => i.status === 'overdue' || (i.status === 'issued' && (()=>{const dd=parseDate(i.due_date); return dd && dd < now;})()));

        const tbody = document.getElementById('overdueBooksTableBody');
        if (!tbody) return;
        if (!overdue.length) {
            tbody.innerHTML = '<tr><td colspan="6">No overdue books found.</td></tr>';
            return;
        }
        tbody.innerHTML = overdue.map(i => {
            const user = usersById.get(i.user_id) || { name: `User #${i.user_id}` };
            const book = booksById.get(i.book_id) || { title: `Book #${i.book_id}` };
            const due = parseDate(i.due_date);
            const days = due ? Math.max(0, Math.ceil((now - due) / (1000*60*60*24))) : 0;
            const fine = (i.fine != null) ? Number(i.fine).toFixed(2) : '0.00';
            return `
                <tr>
                    <td>${user.name || user.email || ('User #' + i.user_id)}</td>
                    <td>${book.title}</td>
                    <td>${(i.issue_date || '').toString().slice(0,10)}</td>
                    <td>${(i.due_date || '').toString().slice(0,10)}</td>
                    <td>${days}</td>
                    <td>${fine}</td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        console.error('Failed to load overdue books', e);
        const tbody = document.getElementById('overdueBooksTableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6">Failed to load overdue books.</td></tr>';
    }
}

// Settings functionality
let settingsData = {
    library: {
        name: 'Central Library',
        address: '123 Library Street, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'info@centrallibrary.com'
    },
    loans: {
        duration: 14,
        maxLoans: 5,
        renewalLimit: 2,
        fineAmount: 0.50
    },
    notifications: {
        overdueReminders: true,
        dueDateNotifications: true,
        welcomeEmails: true,
        lowStockAlerts: true,
        maintenanceAlerts: true
    },
    security: {
        minPasswordLength: 8,
        passwordExpiry: 90,
        requireSpecialChars: true,
        sessionTimeout: 30,
        rememberMe: true
    },
    appearance: {
        theme: 'dark',
        compactMode: false,
        showAnimations: true
    }
};

function switchSettingsTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.settings-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked tab
    const clickedTab = event.target;
    if (clickedTab && clickedTab.classList) clickedTab.classList.add('active');
    
    // Show corresponding content
    document.querySelectorAll('#settingsModal .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById(tabName + '-settings');
    if (activeContent) {
        activeContent.classList.add('active');
        // Add animation effect
        activeContent.style.opacity = '0';
        activeContent.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            activeContent.style.opacity = '1';
            activeContent.style.transform = 'translateY(0)';
        }, 50);
    }
}

function loadSettings() {
    // Load library information
    document.getElementById('libraryName').value = settingsData.library.name;
    document.getElementById('libraryAddress').value = settingsData.library.address;
    document.getElementById('libraryPhone').value = settingsData.library.phone;
    document.getElementById('libraryEmail').value = settingsData.library.email;
    
    // Load loan settings
    document.getElementById('loanDuration').value = settingsData.loans.duration;
    document.getElementById('maxLoans').value = settingsData.loans.maxLoans;
    document.getElementById('renewalLimit').value = settingsData.loans.renewalLimit;
    document.getElementById('fineAmount').value = settingsData.loans.fineAmount;
    
    // Load notification settings
    document.getElementById('overdueReminders').checked = settingsData.notifications.overdueReminders;
    document.getElementById('dueDateNotifications').checked = settingsData.notifications.dueDateNotifications;
    document.getElementById('welcomeEmails').checked = settingsData.notifications.welcomeEmails;
    document.getElementById('lowStockAlerts').checked = settingsData.notifications.lowStockAlerts;
    document.getElementById('maintenanceAlerts').checked = settingsData.notifications.maintenanceAlerts;
    
    // Load security settings
    document.getElementById('minPasswordLength').value = settingsData.security.minPasswordLength;
    document.getElementById('passwordExpiry').value = settingsData.security.passwordExpiry;
    document.getElementById('requireSpecialChars').checked = settingsData.security.requireSpecialChars;
    document.getElementById('sessionTimeout').value = settingsData.security.sessionTimeout;
    document.getElementById('rememberMe').checked = settingsData.security.rememberMe;
    
    // Load appearance settings
    document.querySelector(`input[name="theme"][value="${settingsData.appearance.theme}"]`).checked = true;
    document.getElementById('compactMode').checked = settingsData.appearance.compactMode;
    document.getElementById('showAnimations').checked = settingsData.appearance.showAnimations;
}

function loadSavedSettings() {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
        settingsData = JSON.parse(savedSettings);
        applyTheme(settingsData.appearance.theme);
    }
}

function saveSettings() {
    try {
        // Validate required fields
        const libraryName = document.getElementById('libraryName').value.trim();
        if (!libraryName) {
            adminDashboard.showToast('Library name is required!', 'error');
            return;
        }
        
        // Save library information
        settingsData.library.name = libraryName;
        settingsData.library.address = document.getElementById('libraryAddress').value.trim();
        settingsData.library.phone = document.getElementById('libraryPhone').value.trim();
        settingsData.library.email = document.getElementById('libraryEmail').value.trim();
        
        // Validate email format
        const email = settingsData.library.email;
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            adminDashboard.showToast('Please enter a valid email address!', 'error');
            return;
        }
        
        // Save loan settings with validation
        const loanDuration = parseInt(document.getElementById('loanDuration').value);
        const maxLoans = parseInt(document.getElementById('maxLoans').value);
        const renewalLimit = parseInt(document.getElementById('renewalLimit').value);
        const fineAmount = parseFloat(document.getElementById('fineAmount').value);
        
        if (loanDuration < 1 || loanDuration > 365) {
            adminDashboard.showToast('Loan duration must be between 1 and 365 days!', 'error');
            return;
        }
        
        if (maxLoans < 1 || maxLoans > 20) {
            adminDashboard.showToast('Maximum loans must be between 1 and 20!', 'error');
            return;
        }
        
        if (fineAmount < 0) {
            adminDashboard.showToast('Fine amount cannot be negative!', 'error');
            return;
        }
        
        settingsData.loans.duration = loanDuration;
        settingsData.loans.maxLoans = maxLoans;
        settingsData.loans.renewalLimit = renewalLimit;
        settingsData.loans.fineAmount = fineAmount;
        
        // Save notification settings
        settingsData.notifications.overdueReminders = document.getElementById('overdueReminders').checked;
        settingsData.notifications.dueDateNotifications = document.getElementById('dueDateNotifications').checked;
        settingsData.notifications.welcomeEmails = document.getElementById('welcomeEmails').checked;
        settingsData.notifications.lowStockAlerts = document.getElementById('lowStockAlerts').checked;
        settingsData.notifications.maintenanceAlerts = document.getElementById('maintenanceAlerts').checked;
        
        // Save security settings with validation
        const minPasswordLength = parseInt(document.getElementById('minPasswordLength').value);
        const passwordExpiry = parseInt(document.getElementById('passwordExpiry').value);
        const sessionTimeout = parseInt(document.getElementById('sessionTimeout').value);
        
        if (minPasswordLength < 6 || minPasswordLength > 20) {
            adminDashboard.showToast('Password length must be between 6 and 20 characters!', 'error');
            return;
        }
        
        if (passwordExpiry < 30 || passwordExpiry > 365) {
            adminDashboard.showToast('Password expiry must be between 30 and 365 days!', 'error');
            return;
        }
        
        if (sessionTimeout < 5 || sessionTimeout > 480) {
            adminDashboard.showToast('Session timeout must be between 5 and 480 minutes!', 'error');
            return;
        }
        
        settingsData.security.minPasswordLength = minPasswordLength;
        settingsData.security.passwordExpiry = passwordExpiry;
        settingsData.security.requireSpecialChars = document.getElementById('requireSpecialChars').checked;
        settingsData.security.sessionTimeout = sessionTimeout;
        settingsData.security.rememberMe = document.getElementById('rememberMe').checked;
        
        // Save appearance settings
        const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
        settingsData.appearance.theme = selectedTheme;
        settingsData.appearance.compactMode = document.getElementById('compactMode').checked;
        settingsData.appearance.showAnimations = document.getElementById('showAnimations').checked;
        
        // Save to localStorage
        localStorage.setItem('adminSettings', JSON.stringify(settingsData));
        
        // Apply theme changes
        applyTheme(selectedTheme);
        
        // Show success message
        adminDashboard.showToast('Settings saved successfully!', 'success');
        
        // Close modal after a short delay
        setTimeout(() => {
            adminDashboard.closeModal('settingsModal');
        }, 1000);
        
    } catch (error) {
        console.error('Error saving settings:', error);
        adminDashboard.showToast('Error saving settings. Please try again.', 'error');
    }
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
        // Reset to default values
        settingsData = {
            library: {
                name: 'Central Library',
                address: '123 Library Street, City, State 12345',
                phone: '+1 (555) 123-4567',
                email: 'info@centrallibrary.com'
            },
            loans: {
                duration: 14,
                maxLoans: 5,
                renewalLimit: 2,
                fineAmount: 0.50
            },
            notifications: {
                overdueReminders: true,
                dueDateNotifications: true,
                welcomeEmails: true,
                lowStockAlerts: true,
                maintenanceAlerts: true
            },
            security: {
                minPasswordLength: 8,
                passwordExpiry: 90,
                requireSpecialChars: true,
                sessionTimeout: 30,
                rememberMe: true
            },
            appearance: {
                theme: 'dark',
                compactMode: false,
                showAnimations: true
            }
        };
        
        loadSettings();
        adminDashboard.showToast('Settings reset to default values!', 'info');
    }
}

function applyTheme(theme) {
    try {
        const body = document.body;
        const root = document.documentElement;
        
        // Remove existing theme classes
        body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        // Add new theme class
        body.classList.add(`theme-${theme}`);
        
        // Define theme colors
        const themes = {
            light: {
                '--bg-primary': '#ffffff',
                '--bg-secondary': '#f8f9fa',
                '--bg-card': '#ffffff',
                '--text-primary': '#2d3748',
                '--text-secondary': '#718096',
                '--border-color': '#e2e8f0',
                '--shadow-color': 'rgba(0, 0, 0, 0.1)'
            },
            dark: {
                '--bg-primary': '#0f0f23',
                '--bg-secondary': '#1a1a2e',
                '--bg-card': '#16213e',
                '--text-primary': '#ffffff',
                '--text-secondary': '#a0aec0',
                '--border-color': '#2d3748',
                '--shadow-color': 'rgba(0, 0, 0, 0.3)'
            },
            auto: {
                '--bg-primary': window.matchMedia('(prefers-color-scheme: dark)').matches ? '#0f0f23' : '#ffffff',
                '--bg-secondary': window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1a1a2e' : '#f8f9fa',
                '--bg-card': window.matchMedia('(prefers-color-scheme: dark)').matches ? '#16213e' : '#ffffff',
                '--text-primary': window.matchMedia('(prefers-color-scheme: dark)').matches ? '#ffffff' : '#2d3748',
                '--text-secondary': window.matchMedia('(prefers-color-scheme: dark)').matches ? '#a0aec0' : '#718096',
                '--border-color': window.matchMedia('(prefers-color-scheme: dark)').matches ? '#2d3748' : '#e2e8f0',
                '--shadow-color': window.matchMedia('(prefers-color-scheme: dark)').matches ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'
            }
        };
        
        // Apply theme colors
        const selectedTheme = themes[theme];
        if (selectedTheme) {
            Object.entries(selectedTheme).forEach(([property, value]) => {
                root.style.setProperty(property, value);
            });
        }
        
        // Update theme indicator in settings
        updateThemeIndicator(theme);
        
        // Show theme change notification
        adminDashboard.showToast(`Theme changed to ${theme.charAt(0).toUpperCase() + theme.slice(1)}`, 'info');
        
    } catch (error) {
        console.error('Error applying theme:', error);
        adminDashboard.showToast('Error applying theme. Using default theme.', 'error');
    }
}

function updateThemeIndicator(theme) {
    // Update the theme selection in settings modal if it's open
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.checked = radio.value === theme;
    });
}

function setupThemeSwitching() {
    // Add event listeners for theme radio buttons
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                applyTheme(this.value);
                // Update settings data immediately
                settingsData.appearance.theme = this.value;
                localStorage.setItem('adminSettings', JSON.stringify(settingsData));
            }
        });
    });
}

function setupFormValidation() {
    // Add real-time validation for library name
    const libraryNameInput = document.getElementById('libraryName');
    if (libraryNameInput) {
        libraryNameInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (value.length < 2) {
                this.style.borderColor = '#e53e3e';
                showFieldError(this, 'Library name must be at least 2 characters');
            } else {
                this.style.borderColor = '#48bb78';
                hideFieldError(this);
            }
        });
    }
    
    // Add real-time validation for email
    const emailInput = document.getElementById('libraryEmail');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const value = this.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (value && !emailRegex.test(value)) {
                this.style.borderColor = '#e53e3e';
                showFieldError(this, 'Please enter a valid email address');
            } else {
                this.style.borderColor = '#48bb78';
                hideFieldError(this);
            }
        });
    }
    
    // Add real-time validation for loan duration
    const loanDurationInput = document.getElementById('loanDuration');
    if (loanDurationInput) {
        loanDurationInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (value < 1 || value > 365) {
                this.style.borderColor = '#e53e3e';
                showFieldError(this, 'Loan duration must be between 1 and 365 days');
            } else {
                this.style.borderColor = '#48bb78';
                hideFieldError(this);
            }
        });
    }
    
    // Add real-time validation for max loans
    const maxLoansInput = document.getElementById('maxLoans');
    if (maxLoansInput) {
        maxLoansInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (value < 1 || value > 20) {
                this.style.borderColor = '#e53e3e';
                showFieldError(this, 'Maximum loans must be between 1 and 20');
            } else {
                this.style.borderColor = '#48bb78';
                hideFieldError(this);
            }
        });
    }
}

function showFieldError(input, message) {
    // Remove existing error message
    hideFieldError(input);
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e53e3e';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    
    // Insert after the input
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
}

function hideFieldError(input) {
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
`;
document.head.appendChild(style);

// ---------------- Reports & Analytics -----------------
async function loadReportsAnalytics() {
    try {
        // Stats from protected admin endpoint
        const { stats } = await window.apiService.getAdminStats();
        const totalBooksEl = document.getElementById('libTotalBooks');
        const activeUsersEl = document.getElementById('libActiveUsers');
        const booksOnLoanEl = document.getElementById('libBooksOnLoan');
        const overdueBooksEl = document.getElementById('libOverdueBooks');
        if (totalBooksEl) totalBooksEl.textContent = (stats.total_books ?? '-').toLocaleString();
        if (activeUsersEl) activeUsersEl.textContent = (stats.total_users ?? '-').toLocaleString();
        if (booksOnLoanEl) booksOnLoanEl.textContent = (stats.active_issues ?? '-').toLocaleString();
        if (overdueBooksEl) overdueBooksEl.textContent = (stats.overdue_books ?? '-').toLocaleString();

        // For popular books and user activity, leverage /api/test/data for now
        const testData = await window.apiService.makeRequest('/test/data');
        const issues = Array.isArray(testData.issues) ? testData.issues : [];
        const books = Array.isArray(testData.books) ? testData.books : [];
        const users = Array.isArray(testData.users) ? testData.users : [];

        // Popular books by loans this month
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const monthlyIssued = issues.filter(i => i.status && i.issue_date && new Date(i.issue_date).getMonth() === month && new Date(i.issue_date).getFullYear() === year);
        const counts = new Map();
        monthlyIssued.forEach(i => counts.set(i.book_id, (counts.get(i.book_id) || 0) + 1));
        const top = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
        const bookById = new Map(books.map(b=>[b.book_id, b]));
        const popularUl = document.getElementById('popularBooksList');
        if (popularUl) {
            popularUl.innerHTML = top.length ? top.map(([bookId, cnt]) => {
                const title = (bookById.get(bookId)?.title) || `Book #${bookId}`;
                return `<li>${title} - ${cnt} loans</li>`;
            }).join('') : '<li>No data</li>';
        }

        // User activity
        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
        const newRegs = users.filter(u => u.created_at ? new Date(u.created_at) >= weekAgo : false).length;
        const activeBorrowers = new Set(issues.filter(i => i.status === 'issued').map(i => i.user_id)).size;
        const durations = issues.map(i => {
            const start = i.issue_date ? new Date(i.issue_date) : null;
            const end = i.return_date ? new Date(i.return_date) : new Date();
            return start ? Math.max(1, Math.round((end - start)/(1000*60*60*24))) : null;
        }).filter(Boolean);
        const avgDays = durations.length ? Math.round(durations.reduce((a,b)=>a+b,0)/durations.length) : 0;
        const newRegsEl = document.getElementById('newRegistrations');
        const actBorrowersEl = document.getElementById('activeBorrowers');
        const avgLoanDaysEl = document.getElementById('avgLoanDays');
        if (newRegsEl) newRegsEl.textContent = newRegs.toString();
        if (actBorrowersEl) actBorrowersEl.textContent = activeBorrowers.toString();
        if (avgLoanDaysEl) avgLoanDaysEl.textContent = avgDays.toString();
    } catch (e) {
        console.error('Failed to load reports analytics', e);
        adminDashboard.showToast('Failed to load reports data', 'error');
    }
}

function toCSV(rows) {
    if (!rows || !rows.length) return '';
    const headers = Object.keys(rows[0]);
    const escape = (v) => ('"' + String(v ?? '').replace(/"/g,'""') + '"');
    const lines = [headers.join(',')];
    rows.forEach(r => lines.push(headers.map(h => escape(r[h])).join(',')));
    return lines.join('\n');
}

async function generateReportCSV(type) {
    try {
        if (type === 'library') {
            const { stats } = await window.apiService.getAdminStats();
            const rows = [
                { metric: 'Total Books', value: stats.total_books },
                { metric: 'Active Users', value: stats.total_users },
                { metric: 'Books on Loan', value: stats.active_issues },
                { metric: 'Overdue Books', value: stats.overdue_books },
                { metric: 'Total Fines', value: stats.total_fines }
            ];
            downloadCSV('library_statistics.csv', toCSV(rows));
        } else if (type === 'popular') {
            const data = await window.apiService.makeRequest('/test/data');
            const issues = data.issues || [];
            const books = new Map((data.books||[]).map(b=>[b.book_id,b]));
            const counts = new Map();
            issues.forEach(i=>counts.set(i.book_id,(counts.get(i.book_id)||0)+1));
            const rows = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,50).map(([bookId,cnt])=>({
                book_id: bookId,
                title: (books.get(bookId)?.title)||`Book #${bookId}`,
                total_loans: cnt
            }));
            downloadCSV('popular_books.csv', toCSV(rows));
        } else if (type === 'userActivity') {
            const data = await window.apiService.makeRequest('/test/data');
            const issues = data.issues || [];
            const users = new Map((data.users||[]).map(u=>[u.user_id,u]));
            const rows = issues.map(i=>({
                issue_id: i.issue_id,
                user_id: i.user_id,
                user_name: users.get(i.user_id)?.name || '',
                book_id: i.book_id,
                status: i.status,
                issue_date: i.issue_date,
                due_date: i.due_date,
                return_date: i.return_date || ''
            }));
            downloadCSV('user_activity.csv', toCSV(rows));
        }
        adminDashboard.showToast('Report generated', 'success');
    } catch (e) {
        console.error('Failed generating report', e);
        adminDashboard.showToast('Failed to generate report', 'error');
    }
}

function downloadCSV(filename, csv) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
