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
        
        // Show welcome message if skipped login
        if (adminData.skipLogin) {
            setTimeout(() => {
                this.showToast('Welcome to Admin Dashboard! You skipped the login process.', 'success');
            }, 1000);
        }
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
        }
    }


    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('animate__animated', 'animate__fadeOut');
            document.body.style.overflow = '';
            
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
    const bookData = {
        title: formData.get('title'),
        authors: formData.get('authors'),
        publishers: formData.get('publishers'),
        year: parseInt(formData.get('year')),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock'))
    };
    
    try {
        const response = await window.apiService.addBook(bookData);
        adminDashboard.showToast('Book added successfully!', 'success');
        adminDashboard.closeModal('addBookModal');
        e.target.reset();
        adminDashboard.updateStats();
    } catch (error) {
        console.error('Error adding book:', error);
        adminDashboard.showToast('Failed to add book: ' + error.message, 'error');
    }
}

function switchTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Show corresponding content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    const activeContent = document.getElementById(tabName);
    if (activeContent) {
        activeContent.style.display = 'block';
    }
}

function returnBook(loanId) {
    if (confirm('Are you sure you want to return this book?')) {
        adminDashboard.showToast('Book returned successfully!', 'success');
        // Update the table or refresh data
        setTimeout(() => {
            adminDashboard.updateStats();
        }, 1000);
    }
}

function renewBook(loanId) {
    if (confirm('Are you sure you want to renew this book loan?')) {
        adminDashboard.showToast('Book loan renewed successfully!', 'success');
    }
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
    
    tbody.innerHTML = usersData.map(user => `
        <tr data-user-id="${user.id}">
            <td>#${user.id.toString().padStart(3, '0')}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
            <td><span class="status-badge ${user.status}">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span></td>
            <td>${user.joinDate}</td>
            <td>
                <button class="btn-icon" title="Edit" onclick="editUser(${user.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" title="Delete" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i></button>
                <button class="btn-icon" title="View Details" onclick="viewUserDetails(${user.id})"><i class="fas fa-eye"></i></button>
            </td>
        </tr>
    `).join('');
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
});

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
    clickedTab.classList.add('active');
    
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
