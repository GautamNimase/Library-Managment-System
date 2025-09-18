// Dashboard JavaScript for Library Management System

let currentUser = null;
let userIssues = [];
let userNotifications = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    currentUser = getCurrentUser();
    
    if (!currentUser) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Update UI with user data
    updateUserInfo();
    
    // Load dashboard data
    loadDashboardData();
    
    // Set up event listeners
    setupEventListeners();
});

// Update user information in UI
function updateUserInfo() {
    const userNameElement = document.getElementById('userName');
    if (userNameElement && currentUser) {
        userNameElement.textContent = currentUser.name || 'User';
    }
}

// Load all dashboard data
async function loadDashboardData() {
    try {
        await Promise.all([
            loadUserIssues(),
            loadUserNotifications(),
            updateStats()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Load user's book issues
async function loadUserIssues() {
    try {
        const response = await fetch(`http://localhost:5000/api/issues/user/${currentUser.user_id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            userIssues = data.issues || [];
            displayUserIssues();
        } else {
            throw new Error('Failed to load issues');
        }
    } catch (error) {
        console.error('Error loading issues:', error);
        // Show fallback data
        displayUserIssues();
    }
}

// Display user's issues
function displayUserIssues() {
    const issuesList = document.getElementById('issuesList');
    
    if (!issuesList) return;
    
    if (userIssues.length === 0) {
        issuesList.innerHTML = `
            <div class="no-issues">
                <i class="fas fa-book-open"></i>
                <h3>No books borrowed yet</h3>
                <p>Start exploring our collection!</p>
                <a href="books.html" class="btn btn-primary">Browse Books</a>
            </div>
        `;
        return;
    }
    
    issuesList.innerHTML = userIssues.map(issue => {
        const dueDate = new Date(issue.due_date);
        const today = new Date();
        const isOverdue = dueDate < today && issue.status === 'issued';
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="issue-item ${isOverdue ? 'overdue' : ''}">
                <div class="issue-header">
                    <div class="issue-title">${issue.title}</div>
                    <div class="issue-status ${issue.status}">${issue.status}</div>
                </div>
                <div class="issue-details">
                    <span>Author: ${issue.authors}</span>
                    <span>Due: ${formatDate(issue.due_date)}</span>
                </div>
                ${issue.status === 'issued' ? `
                    <div class="issue-actions">
                        <button class="btn-return" onclick="returnBook(${issue.issue_id})">
                            Return Book
                        </button>
                        ${isOverdue ? `<span class="overdue-warning">Overdue by ${Math.abs(daysUntilDue)} days</span>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Load user notifications
async function loadUserNotifications() {
    try {
        const response = await fetch(`http://localhost:5000/api/notifications/user/${currentUser.user_id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            userNotifications = data.notifications || [];
        } else {
            throw new Error('Failed to load notifications');
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        // Show sample notifications
        userNotifications = [
            {
                notification_id: 1,
                message: 'Welcome to your library dashboard!',
                send_date: new Date().toISOString(),
                is_read: false
            }
        ];
    }
}

// Update dashboard statistics
function updateStats() {
    const borrowedBooks = userIssues.filter(issue => issue.status === 'issued').length;
    const dueBooks = userIssues.filter(issue => {
        const dueDate = new Date(issue.due_date);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        return issue.status === 'issued' && daysUntilDue <= 3 && daysUntilDue >= 0;
    }).length;
    const overdueBooks = userIssues.filter(issue => {
        const dueDate = new Date(issue.due_date);
        const today = new Date();
        return issue.status === 'issued' && dueDate < today;
    }).length;
    const reviewsGiven = userIssues.filter(issue => issue.status === 'returned').length;
    
    // Update stat elements
    updateStatElement('borrowedBooks', borrowedBooks);
    updateStatElement('dueBooks', dueBooks);
    updateStatElement('overdueBooks', overdueBooks);
    updateStatElement('reviewsGiven', reviewsGiven);
}

// Update individual stat element
function updateStatElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        // Animate the number change
        animateNumber(element, parseInt(element.textContent) || 0, value);
    }
}

// Animate number change
function animateNumber(element, start, end) {
    const duration = 1000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.round(start + (end - start) * progress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Return a book
async function returnBook(issueId) {
    try {
        const response = await fetch(`http://localhost:5000/api/issues/${issueId}/return`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
        
        if (response.ok) {
            showNotification('Book returned successfully!', 'success');
            // Reload issues
            await loadUserIssues();
            updateStats();
        } else {
            const data = await response.json();
            showNotification(data.message || 'Failed to return book', 'error');
        }
    } catch (error) {
        console.error('Error returning book:', error);
        showNotification('Failed to return book. Please try again.', 'error');
    }
}

// Show notifications modal
function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    const modalBody = document.getElementById('notificationsBody');
    
    if (!modal || !modalBody) return;
    
    if (userNotifications.length === 0) {
        modalBody.innerHTML = `
            <div class="no-notifications">
                <i class="fas fa-bell-slash"></i>
                <h3>No notifications</h3>
                <p>You're all caught up!</p>
            </div>
        `;
    } else {
        modalBody.innerHTML = userNotifications.map(notification => `
            <div class="notification-item ${notification.is_read ? '' : 'unread'}">
                <div class="notification-header">
                    <div class="notification-title">Library Notification</div>
                    <div class="notification-time">${formatDate(notification.send_date)}</div>
                </div>
                <div class="notification-message">${notification.message}</div>
            </div>
        `).join('');
    }
    
    modal.style.display = 'block';
}

// Close notifications modal
function closeNotifications() {
    const modal = document.getElementById('notificationsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('notificationsModal');
        if (e.target === modal) {
            closeNotifications();
        }
    });
    
    // Handle logout
    const logoutLinks = document.querySelectorAll('[onclick="logout()"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    window.location.href = 'index.html';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}
