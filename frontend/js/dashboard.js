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

    // Restore persisted stats to avoid zeros flash on reload
    try {
        const saved = JSON.parse(localStorage.getItem('dashboardStats') || 'null');
        if (saved) {
            updateStatElement('borrowedBooks', Number(saved.borrowedBooks) || 0);
            updateStatElement('dueBooks', Number(saved.dueBooks) || 0);
            updateStatElement('overdueBooks', Number(saved.overdueBooks) || 0);
            updateStatElement('reviewsGiven', Number(saved.reviewsGiven) || 0);
        }
    } catch (_) {}
    
    // Set up event listeners
    setupEventListeners();

    // Initial counts update placeholder
    updateNotificationBadges(0);
    // Try to preload books quietly for the Books section
    try { loadBooks(); } catch (_) {}
});

// Update user information in UI
async function updateUserInfo() {
    try {
        // Hydrate with full profile when needed
        if (!currentUser || !currentUser.name || !currentUser.email) {
            try {
                const data = await window.apiService.makeRequest('/user/me');
                if (data && data.user) {
                    currentUser = { ...(currentUser||{}), ...data.user };
                    localStorage.setItem('userData', JSON.stringify(currentUser));
                }
            } catch (_) {}
        }

        const name = (currentUser && (currentUser.name || currentUser.full_name || 'User'));
        const email = (currentUser && (currentUser.email || ''));
        const role = (currentUser && (currentUser.membership_type || currentUser.role || 'Member'));

        // Update name across header/sidebar/profile
        ['userName','sidebarUserName','topUserName','dropdownUserName','profileUserName']
            .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = name; });

        // Emails where present
        ['dropdownUserEmail','profileUserEmail','profileUserEmailDetail']
            .forEach(id => { const el = document.getElementById(id); if (el && email) el.textContent = email; });

        // Role in the top header if available
        const topRoleEl = document.getElementById('topUserRole');
        if (topRoleEl) topRoleEl.textContent = role;
    } catch (e) {
        console.warn('Failed to update user info', e);
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
        const response = await window.apiService.makeRequest(`/issues/user/${currentUser.user_id}`);
        
        userIssues = response.issues || [];
        displayUserIssues();
        renderMyBooks();
        renderHistory();
        renderRecentActivity();
    } catch (error) {
        console.error('Error loading issues:', error);
        // Show fallback data
        displayUserIssues();
        renderMyBooks();
        renderRecentActivity();
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
        const response = await window.apiService.makeRequest(`/notifications/user/${currentUser.user_id}`);
        
        if (response.ok) {
            const data = await response.json();
            userNotifications = data.notifications || [];
            updateNotificationBadges(userNotifications.filter(n => !n.is_read).length);
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
        updateNotificationBadges(1);
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
    
    // Persist and update stat elements
    const stats = { borrowedBooks, dueBooks, overdueBooks, reviewsGiven, updated_at: Date.now() };
    try { localStorage.setItem('dashboardStats', JSON.stringify(stats)); } catch (_) {}
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
        const response = await window.apiService.makeRequest(`/issues/${issueId}/return`, { method: 'PUT' });
        showNotification('Book returned successfully!', 'success');
        // Reload issues
        await loadUserIssues();
        updateStats();
    } catch (error) {
        console.error('Error returning book:', error);
        showNotification('Failed to return book. Please try again.', 'error');
    }
}

// Notifications: state, rendering, and actions
let notificationsFilterState = 'all'; // all | unread | due | fines

async function refreshNotifications() {
    try {
        const data = await window.apiService.getUserNotifications(currentUser.user_id);
        userNotifications = Array.isArray(data.notifications) ? data.notifications : [];
        updateNotificationBadges(userNotifications.filter(n => !n.is_read).length);
        renderNotifications();
    } catch (e) {
        console.error('Failed to refresh notifications', e);
        renderNotifications();
    }
}

function setNotificationsFilter(filter) {
    notificationsFilterState = filter || 'all';
    renderNotifications();
}

function renderNotifications() {
    const modal = document.getElementById('notificationsModal');
    const modalBody = document.getElementById('notificationsBody');
    if (!modal || !modalBody) return;

    // Controls header
    const unreadCount = userNotifications.filter(n => !n.is_read).length;
    const headerHtml = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="display:flex;gap:8px">
                <button class="btn-secondary" style="padding:6px 10px;border-radius:8px;${notificationsFilterState==='all'?'background:#eef2ff;color:#3730a3':''}" onclick="setNotificationsFilter('all')">All</button>
                <button class="btn-secondary" style="padding:6px 10px;border-radius:8px;${notificationsFilterState==='unread'?'background:#eef2ff;color:#3730a3':''}" onclick="setNotificationsFilter('unread')">Unread (${unreadCount})</button>
                <button class="btn-secondary" style="padding:6px 10px;border-radius:8px;${notificationsFilterState==='due'?'background:#eef2ff;color:#3730a3':''}" onclick="setNotificationsFilter('due')">Due</button>
                <button class="btn-secondary" style="padding:6px 10px;border-radius:8px;${notificationsFilterState==='fines'?'background:#eef2ff;color:#3730a3':''}" onclick="setNotificationsFilter('fines')">Fines</button>
            </div>
            <div style="display:flex;gap:8px">
                <button class="btn-secondary" onclick="markAllNotificationsRead()"><i class="fas fa-check-double"></i> Mark all read</button>
                <button class="btn-secondary" onclick="clearAllNotifications()"><i class="fas fa-trash"></i> Clear all</button>
            </div>
        </div>
    `;

    // Apply filter
    const filtered = (userNotifications || []).filter(n => {
        if (notificationsFilterState === 'all') return true;
        if (notificationsFilterState === 'unread') return !n.is_read;
        if (notificationsFilterState === 'due') return !!n.due_date;
        if (notificationsFilterState === 'fines') return (n.fine || 0) > 0;
        return true;
    });

    const listHtml = filtered.length ? filtered.map(n => {
        const isDue = !!n.due_date;
        const hasFine = (n.fine || 0) > 0;
        const badge = isDue ? '<span class="badge" style="background:#fef3c7;color:#92400e;padding:3px 8px;border-radius:999px">Due</span>' : (hasFine ? '<span class="badge" style="background:#fee2e2;color:#991b1b;padding:3px 8px;border-radius:999px">Fine</span>' : '');
        return `
            <div class="notification-item ${n.is_read ? '' : 'unread'}" style="border:1px solid #e5e7eb;border-radius:10px;padding:12px;margin-bottom:10px;background:${n.is_read?'#fff':'#f8fafc'}">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
                    <div style="display:flex;align-items:center;gap:8px">
                        <div style="width:10px;height:10px;border-radius:50%;background:${n.is_read?'#9ca3af':'#6366f1'}"></div>
                        <div style="font-weight:600;color:#111827">${badge || 'Notification'}</div>
                    </div>
                    <div style="color:#6b7280;font-size:.85rem">${formatDate(n.send_date)}</div>
                </div>
                <div style="margin-top:6px;color:#374151">${n.message || ''}</div>
                <div style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end">
                    ${!n.is_read ? `<button class="btn-secondary" onclick="markNotificationRead(${n.notification_id})">Mark read</button>` : ''}
                    <button class="btn-secondary" onclick="deleteNotification(${n.notification_id})"><i class=\"fas fa-trash\"></i></button>
                </div>
            </div>
        `;
    }).join('') : `
        <div class="no-notifications">
            <i class="fas fa-bell-slash"></i>
            <h3>No notifications</h3>
            <p>${notificationsFilterState==='unread' ? "You're all caught up!" : 'Nothing to show here.'}</p>
        </div>
    `;

    modalBody.innerHTML = headerHtml + listHtml;
}

// Show notifications modal (fetch fresh first)
async function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    if (!modal) return;
    await refreshNotifications();
    modal.style.display = 'block';
}

async function markNotificationRead(notificationId) {
    try {
        await window.apiService.markNotificationRead(notificationId);
        // Update local state
        userNotifications = userNotifications.map(n => n.notification_id === notificationId ? { ...n, is_read: true } : n);
        updateNotificationBadges(userNotifications.filter(n => !n.is_read).length);
        renderNotifications();
    } catch (e) { adminToast('Failed to mark read', 'error'); }
}

async function markAllNotificationsRead() {
    try {
        await window.apiService.markAllNotificationsRead(currentUser.user_id);
        userNotifications = userNotifications.map(n => ({ ...n, is_read: true }));
        updateNotificationBadges(0);
        renderNotifications();
    } catch (e) { adminToast('Failed to mark all as read', 'error'); }
}

async function deleteNotification(notificationId) {
    try {
        await window.apiService.deleteNotification(notificationId);
        userNotifications = userNotifications.filter(n => n.notification_id !== notificationId);
        updateNotificationBadges(userNotifications.filter(n => !n.is_read).length);
        renderNotifications();
    } catch (e) { adminToast('Failed to delete', 'error'); }
}

async function clearAllNotifications() {
    try {
        await window.apiService.clearAllNotifications(currentUser.user_id);
        userNotifications = [];
        updateNotificationBadges(0);
        renderNotifications();
    } catch (e) { adminToast('Failed to clear', 'error'); }
}

// Update notification badges across the UI
function updateNotificationBadges(count) {
    const ids = ['notificationCount','topNotificationCount','sidebarNotificationCount','dropdownNotificationCount'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = String(count);
    });
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

    // Profile form (if made editable later)
    const profileForm = document.querySelector('#profileModal .profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = (document.getElementById('profileName')||{}).value || undefined;
            const email = (document.getElementById('profileEmail')||{}).value || undefined;
            const phone = (document.getElementById('profilePhone')||{}).value || undefined;
            try {
                await window.apiService.makeRequest('/user/me', { method:'PUT', body: JSON.stringify({ name, email, phone }) });
                adminToast('Profile updated', 'success');
                closeProfileModal();
                showUserProfile();
            } catch (err) {
                adminToast(err.message || 'Failed to update profile', 'error');
            }
        });
    }
}

// --------- Profile modal open/close helpers ---------
async function showProfileModal() {
    try {
        const data = await window.apiService.makeRequest('/user/me');
        const u = data.user || {};
        const nameInput = document.getElementById('profileName');
        const emailInput = document.getElementById('profileEmail');
        const phoneInput = document.getElementById('profilePhone');
        if (nameInput) nameInput.value = u.name || '';
        if (emailInput) emailInput.value = u.email || '';
        if (phoneInput) phoneInput.value = u.phone || '';
    } catch (_) {}
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'block';
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'none';
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

function formatRelativeTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const seconds = Math.round(diffMs / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes} minute${minutes===1?'':'s'} ago`;
    if (hours < 24) return `${hours} hour${hours===1?'':'s'} ago`;
    return `${days} day${days===1?'':'s'} ago`;
}

// ----------------- Navigation helpers -----------------
function switchSection(sectionId, title) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');
    const bc = document.getElementById('breadcrumbCurrent');
    const pt = document.getElementById('pageTitle');
    if (bc) bc.textContent = title;
    if (pt) pt.textContent = title;
}

function showUserDashboard() { switchSection('dashboardSection', 'Dashboard'); }
function showUserBooks() { switchSection('booksSection', 'Books'); try { loadBooks(); } catch(_){} }
function showMyBooks() { switchSection('myBooksSection', 'My Books'); renderMyBooks(); }
async function showUserProfile() {
    switchSection('profileSection', 'Profile');
    try {
        const data = await window.apiService.makeRequest('/user/me');
        const u = data.user || {};
        const name = u.name || 'User';
        const email = u.email || '';
        document.getElementById('profileUserName') && (document.getElementById('profileUserName').textContent = name);
        document.getElementById('profileUserEmail') && (document.getElementById('profileUserEmail').textContent = email);
        document.getElementById('profileUserEmailDetail') && (document.getElementById('profileUserEmailDetail').textContent = email);
        document.getElementById('profileUserPhone') && (document.getElementById('profileUserPhone').textContent = u.phone || '');
        // Fill stats from current issues we already loaded
        const issues = Array.isArray(userIssues) ? userIssues : [];
        const borrowed = issues.filter(i => i.status === 'issued').length;
        const returned = issues.filter(i => i.status === 'returned').length;
        // Approximate reading hours as total days borrowed (issued or returned)
        const now = new Date();
        let totalDays = 0;
        issues.forEach(i => {
            const start = i.issue_date ? new Date(i.issue_date) : null;
            const end = i.return_date ? new Date(i.return_date) : now;
            if (start) {
                const days = Math.max(0, Math.round((end - start) / (1000*60*60*24)));
                totalDays += days;
            }
        });
        const readingHours = totalDays; // 1 hour/day estimate
        // Member days from created_at
        let memberDays = 0;
        if (u.created_at) {
            const created = new Date(u.created_at);
            memberDays = Math.max(0, Math.round((now - created) / (1000*60*60*24)));
        }
        document.getElementById('profileBooksBorrowed') && (document.getElementById('profileBooksBorrowed').textContent = String(borrowed));
        document.getElementById('profileReviewsGiven') && (document.getElementById('profileReviewsGiven').textContent = String(returned));
        document.getElementById('profileReadingHours') && (document.getElementById('profileReadingHours').textContent = String(readingHours));
        document.getElementById('profileMemberDays') && (document.getElementById('profileMemberDays').textContent = String(memberDays));
    } catch (e) {
        adminToast('Failed to load profile', 'error');
    }
}
function showUserHistory() { switchSection('historySection', 'History'); }
function showUserHistory() { switchSection('historySection', 'History'); renderHistory(); }
function showUserNotifications() { showNotifications(); }

// Quick Start button scrolls to actions panel
function showQuickActions() {
    try {
        showUserDashboard();
        const el = document.querySelector('.actions-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (_) {}
}

// ----------------- Books rendering -----------------
let cachedBooks = [];
let booksFilterCategory = 'all';
let booksSortKey = 'title';
async function loadBooks() {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;
    try {
        const data = await window.apiService.getBooks();
        const rows = Array.isArray(data.books) ? data.books : [];
        // Normalize and enrich with availability and rough category guess
        cachedBooks = rows.map(b => {
            const available = b.is_available === true || (b.available_copies ?? 0) > 0 || (b.available_stock ?? 0) > 0;
            const copies = (b.available_copies ?? b.available_stock ?? 0) || 0;
            const text = `${b.title||''} ${b.description||''}`.toLowerCase();
            let category = 'general';
            if (/ai|tech|technology|software|program|computer/.test(text)) category = 'technology';
            else if (/history|guide|biography|non[- ]fiction|science|learn|how to/.test(text)) category = 'non-fiction';
            else category = 'fiction';
            return { ...b, __available: available, __copies: copies, __category: category };
        });
        renderBooks(applyBookFilters(cachedBooks));
    } catch (e) {
        console.error('Failed to load books', e);
        grid.innerHTML = '<p>Failed to load books.</p>';
    }
}

function renderBooks(books) {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;
    if (!books.length) {
        grid.innerHTML = '<p>No books available.</p>';
        return;
    }
    grid.innerHTML = books.map(b => {
        const available = b.__available === true || b.is_available === true || (b.available_copies ?? 0) > 0 || (b.available_stock ?? 0) > 0;
        const authors = b.authors || '';
        const title = b.title || 'Untitled';
        const copies = (b.__copies ?? (b.available_copies ?? b.available_stock ?? 0));
        const bookId = b.book_id;
        const previewUrl = b.digital_copy_url || '';
        return `
            <div class="book-card" style="display:flex;flex-direction:column;border-radius:12px;background:#ffffff;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,.08)">
                <div class="book-cover" style="height:140px;border-radius:10px;background:linear-gradient(135deg,#2b2d55,#1a1a2e);display:flex;align-items:center;justify-content:center;color:#a0aec0;font-size:32px">
                    <i class="fas fa-book"></i>
                </div>
                <div class="book-info" style="margin-top:12px">
                    <h3 class="book-title" style="margin:0 0 4px 0;font-size:1rem;color:#1f2937">${title}</h3>
                    <p class="book-author" style="margin:0 0 8px 0;color:#4a5568;font-size:.9rem">${authors}</p>
                    <div style="margin:8px 0;height:8px;border-radius:6px;background:#2d3748;overflow:hidden">
                        <div style="width:${available ? Math.min(100, Math.max(8, Math.round((copies||1)/(copies||1)*100))) : 0}%;height:100%;background:#48bb78"></div>
                    </div>
                    <p class="book-status ${available ? 'available' : 'unavailable'}" style="margin:0;color:${available ? '#48bb78' : '#f56565'}">${available ? 'Available' : 'Unavailable'}${available ? ` • ${copies} left` : ''}</p>
                </div>
                <div class="book-actions" style="margin-top:12px;display:flex;gap:8px">
                    <button class="btn btn-secondary" style="flex:1;padding:8px 10px;border-radius:8px;background:#2d3748;color:#e2e8f0;border:0;cursor:pointer" onclick="previewBookFromDashboard(${bookId})">
                        <i class="fas fa-book-reader"></i> Preview
                    </button>
                    <button class="btn btn-primary" style="flex:1;padding:8px 10px;border-radius:8px;background:${available ? '#4f46e5' : '#475569'};color:white;border:0;cursor:${available ? 'pointer' : 'not-allowed'}" ${available ? '' : 'disabled'} onclick="borrowBookFromDashboard(${bookId})">
                        <i class="fas fa-book-open"></i> Borrow
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ---- Books filtering/sorting for dashboard Books section ----
function applyBookFilters(list) {
    let items = Array.isArray(list) ? [...list] : [];
    // Filter
    if (booksFilterCategory && booksFilterCategory !== 'all') {
        if (booksFilterCategory === 'available') {
            items = items.filter(b => b.__available === true || b.is_available === true || (b.available_copies ?? b.available_stock ?? 0) > 0);
        } else {
            items = items.filter(b => (b.__category || 'general') === booksFilterCategory);
        }
    }
    // Sort
    switch ((booksSortKey||'title')) {
        case 'author': items.sort((a,b)=> (a.authors||'').localeCompare(b.authors||'')); break;
        case 'category': items.sort((a,b)=> (a.__category||'general').localeCompare(b.__category||'general')); break;
        case 'available': items.sort((a,b)=> (b.__available===true)-(a.__available===true) || (b.__copies||0)-(a.__copies||0)); break;
        default: items.sort((a,b)=> (a.title||'').localeCompare(b.title||''));
    }
    return items;
}

function setActiveFilterButton() {
    const buttons = document.querySelectorAll('.filter-buttons .filter-btn');
    buttons.forEach(btn => {
        const val = btn.getAttribute('data-filter');
        if (!val) return;
        if (val === booksFilterCategory) btn.classList.add('active'); else btn.classList.remove('active');
    });
}

function filterBooks(category) {
    booksFilterCategory = category || 'all';
    setActiveFilterButton();
    renderBooks(applyBookFilters(cachedBooks));
}

function sortBooks(key) {
    booksSortKey = key || 'title';
    renderBooks(applyBookFilters(cachedBooks));
}

// ----------------- My Books rendering -----------------
function renderMyBooks() {
    const grid = document.getElementById('myBooksGrid');
    const countEl = document.getElementById('myBooksCount');
    if (!grid) return;
    const issues = Array.isArray(userIssues) ? userIssues : [];
    const withBookMeta = issues.map(i => {
        const b = (cachedBooks || []).find(x => x.book_id === i.book_id) || {};
        return { issue: i, book: b };
    });
    if (countEl) countEl.textContent = `${withBookMeta.length} total`;
    if (!withBookMeta.length) {
        grid.innerHTML = '<p>No books yet. Borrow one from the list.</p>';
        return;
    }
    grid.innerHTML = withBookMeta.map(({issue, book}) => {
        const title = issue.title || book.title || `Book #${issue.book_id}`;
        const authors = issue.authors || book.authors || '';
        const status = issue.status;
        const due = issue.due_date ? new Date(issue.due_date).toISOString().slice(0,10) : '';
        const returned = !!issue.return_date;
        return `
            <div class="book-card" style="display:flex;flex-direction:column;border-radius:12px;background:#ffffff;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,.08)">
                <div class="book-cover" style="height:120px;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#06b6d4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px">
                    <i class="fas fa-book"></i>
                </div>
                <div class="book-info" style="margin-top:12px">
                    <h3 class="book-title" style="margin:0 0 4px 0;font-size:1rem;color:#1f2937">${title}</h3>
                    <p class="book-author" style="margin:0 0 8px 0;color:#4a5568;font-size:.9rem">${authors}</p>
                    <p class="book-status ${status}" style="margin:0;color:${status==='returned'?'#10b981':'#2563eb'}">${status}${due?` • Due ${due}`:''}${returned?` • Returned`:''}</p>
                </div>
                <div class="book-actions" style="margin-top:12px;display:flex;gap:8px">
                    ${status==='issued' ? `<button class="btn btn-primary" style="flex:1;padding:8px 10px;border-radius:8px;background:#4f46e5;color:white;border:0;cursor:pointer" onclick="returnBook(${issue.issue_id})"><i class=\"fas fa-undo\"></i> Return</button>` : ''}
                    <button class="btn btn-secondary" style="flex:1;padding:8px 10px;border-radius:8px;background:#2d3748;color:#e2e8f0;border:0;cursor:pointer" onclick="previewBookFromDashboard(${issue.book_id})"><i class="fas fa-eye"></i> Preview</button>
                </div>
            </div>
        `;
    }).join('');
}

// ----------------- History rendering -----------------
let historyFilterState = 'all';
let historySortState = 'recent';

function filterHistory(value) {
    historyFilterState = value || 'all';
    renderHistory();
}

function sortHistory(value) {
    historySortState = value || 'recent';
    renderHistory();
}

function renderHistory() {
    // Stats
    const issues = Array.isArray(userIssues) ? userIssues : [];
    const booksRead = issues.filter(i => i.status === 'returned').length;
    let totalDays = 0;
    issues.forEach(i => {
        const start = i.issue_date ? new Date(i.issue_date) : null;
        const end = i.return_date ? new Date(i.return_date) : new Date();
        if (start) totalDays += Math.max(0, Math.round((end - start)/(1000*60*60*24)));
    });
    const hoursRead = totalDays; // 1hr/day
    const avgRating = 0; // not tracked per-issue yet
    const activeDays = [...new Set(issues.map(i => (i.issue_date || '').toString().slice(0,10)))].length;
    const setNum = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v); };
    setNum('historyBooksRead', booksRead);
    setNum('historyReadingTime', hoursRead);
    setNum('historyAverageRating', avgRating);
    setNum('historyActiveDays', activeDays);

    // Timeline
    const container = document.getElementById('historyTimelineContent');
    if (!container) return;
    if (!issues.length) { container.innerHTML = '<p>No history yet.</p>'; return; }
    
    // Apply filter
    const normalizedFilter = (historyFilterState || 'all').toLowerCase();
    const filtered = issues.filter(i => {
        const status = (i.status || '').toLowerCase();
        if (normalizedFilter === 'all') return true;
        if (normalizedFilter === 'borrowed') return status === 'issued' || status === 'borrowed';
        if (normalizedFilter === 'returned') return status === 'returned';
        if (normalizedFilter === 'renewed') return status === 'renewed';
        if (normalizedFilter === 'reviewed') {
            // No explicit reviewed flag in data; approximate as returned
            return status === 'returned' || i.reviewed === true;
        }
        return true;
    });

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
        const sortKey = (historySortState || 'recent').toLowerCase();
        if (sortKey === 'book') {
            return (a.title || '').localeCompare(b.title || '');
        }
        if (sortKey === 'rating') {
            // rating not tracked; fall back to title to keep deterministic
            return (a.rating || 0) - (b.rating || 0) || (a.title || '').localeCompare(b.title || '');
        }
        // Choose the most relevant date for comparisons
        const dateA = new Date(a.return_date || a.issue_date || 0);
        const dateB = new Date(b.return_date || b.issue_date || 0);
        if (sortKey === 'oldest') return dateA - dateB;
        // 'recent' default: newest first
        return dateB - dateA;
    });

    container.innerHTML = sorted
      .map(i => {
        const title = i.title || `Book #${i.book_id}`;
        const start = i.issue_date ? new Date(i.issue_date).toISOString().slice(0,10) : '';
        const due = i.due_date ? new Date(i.due_date).toISOString().slice(0,10) : '';
        const ret = i.return_date ? new Date(i.return_date).toISOString().slice(0,10) : '';
        const badge = i.status === 'returned' ? 'Returned' : (i.status === 'issued' ? 'Borrowed' : i.status);
        return `
          <div class="history-item" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #e5e7eb">
            <div style="width:10px;height:10px;border-radius:50%;background:${i.status==='returned'?'#10b981':'#6366f1'}"></div>
            <div style="flex:1">
              <div style="font-weight:600;color:#111827">${title}</div>
              <div style="color:#6b7280;font-size:.9rem">${badge} • Issued ${start}${ret?` • Returned ${ret}`:''}${due?` • Due ${due}`:''}</div>
            </div>
          </div>`;
      }).join('');
}

// ----------------- Recent Activity (Dashboard card) -----------------
function renderRecentActivity() {
    const container = document.getElementById('activityTimeline');
    if (!container) return;
    const issues = Array.isArray(userIssues) ? userIssues.slice() : [];
    if (!issues.length) {
        container.innerHTML = '<div class="loading-state"><p>No recent activity.</p></div>';
        return;
    }
    // Build activity entries for borrow/return events
    const activities = [];
    issues.forEach(i => {
        if (i.issue_date) {
            activities.push({
                type: 'borrowed',
                title: 'Book Borrowed',
                book: i.title || `Book #${i.book_id}`,
                at: i.issue_date
            });
        }
        if (i.return_date) {
            activities.push({
                type: 'returned',
                title: 'Book Returned',
                book: i.title || `Book #${i.book_id}`,
                at: i.return_date
            });
        }
    });
    activities.sort((a,b)=> new Date(b.at) - new Date(a.at));
    const iconFor = t => t==='returned' ? 'fas fa-undo' : (t==='review' ? 'fas fa-star' : 'fas fa-book');
    container.innerHTML = activities.slice(0, 5).map(a => `
        <div class="activity-item">
            <div class="activity-icon"><i class="${iconFor(a.type)}"></i></div>
            <div class="activity-content">
                <h4>${a.title}</h4>
                <p>${a.book}</p>
                <span class="activity-time">${formatRelativeTime(a.at)}</span>
            </div>
        </div>
    `).join('');
}

// exposed for header buttons
function refreshBooks() { loadBooks(); }
function refreshActivity() { loadUserIssues(); }
function performGlobalSearch(value) {
    const v = (value||'').trim().toLowerCase();
    if (!v) { renderBooks(cachedBooks); document.getElementById('searchClear')?.style.setProperty('display','none'); return; }
    document.getElementById('searchClear')?.style.setProperty('display','block');
    renderBooks(cachedBooks.filter(b => `${b.title||''} ${b.authors||''}`.toLowerCase().includes(v)));
}
function clearGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    if (input) input.value = '';
    renderBooks(cachedBooks);
    document.getElementById('searchClear')?.style.setProperty('display','none');
}

// Borrow/Preview actions from dashboard books list
async function borrowBookFromDashboard(bookId) {
    try {
        await window.apiService.issueBook(bookId, 30);
        adminToast('Book issued successfully');
        // Refresh list and stats after short delay to allow backend commit
        setTimeout(async () => {
            await loadBooks();
            await loadUserIssues();
            updateStats();
        }, 300);
    } catch (e) {
        adminToast(e.message || 'Borrow failed', 'error');
    }
}

function previewBookFromDashboard(urlOrId) {
    const modal = document.getElementById('previewModal');
    if (!modal) return;
    // Find the book in cachedBooks by id if a number was passed
    let book = null;
    if (typeof urlOrId === 'number') {
        book = (cachedBooks || []).find(b => b.book_id === urlOrId) || null;
    }
    const titleEl = document.getElementById('pvTitle');
    const titleTextEl = document.getElementById('pvTitleText');
    const aEl = document.getElementById('pvAuthors');
    const iEl = document.getElementById('pvIsbn');
    const avEl = document.getElementById('pvAvail');
    const pEl = document.getElementById('pvPrice');
    const locEl = document.getElementById('pvLocation');
    const dEl = document.getElementById('pvDesc');
    if (book) {
        const titleText = book.title || 'Book Details';
        titleEl && (titleEl.textContent = 'Book Details');
        titleTextEl && (titleTextEl.textContent = titleText);
        aEl && (aEl.textContent = (book.authors || '—'));
        iEl && (iEl.textContent = (book.isbn || '—'));
        const available = book.is_available === true || (book.available_copies ?? 0) > 0 || (book.available_stock ?? 0) > 0;
        const copies = (book.available_copies ?? book.available_stock ?? 0);
        avEl && (avEl.textContent = available ? `Available • ${copies} left` : 'Unavailable');
        pEl && (pEl.textContent = book.price != null ? `$${Number(book.price).toFixed(2)}` : '—');
        locEl && (locEl.textContent = book.location || '—');
        dEl && (dEl.textContent = book.description || '—');
    }
    modal.style.display = 'block';
}

function closeDashboardPreview() {
    const modal = document.getElementById('previewModal');
    if (modal) modal.style.display = 'none';
}

function adminToast(msg, type='success') {
    const div = document.createElement('div');
    div.className = `toast toast-${type}`;
    div.style.position = 'fixed';
    div.style.bottom = '20px';
    div.style.right = '20px';
    div.style.padding = '10px 14px';
    div.style.borderRadius = '8px';
    div.style.background = type==='error' ? '#ef4444' : (type==='warning' ? '#f59e0b' : '#22c55e');
    div.style.color = 'white';
    div.style.zIndex = '9999';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(()=>div.remove(), 2200);
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
