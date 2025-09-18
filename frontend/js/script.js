// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animated Counter for Statistics
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    updateCounter();
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Animate counters when stats section is visible
            if (entry.target.classList.contains('stats')) {
                const counters = entry.target.querySelectorAll('.stat-number');
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    animateCounter(counter, target);
                });
            }
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in class to elements
    const elementsToAnimate = document.querySelectorAll('.feature-card, .book-card, .stat-item');
    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Load featured books
    loadFeaturedBooks();
});

// Featured Books Data (This would normally come from an API)
const featuredBooks = [
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 2,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 3,
        title: "1984",
        author: "George Orwell",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 4,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 5,
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 6,
        title: "Lord of the Flies",
        author: "William Golding",
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    }
];

// Load Featured Books
function loadFeaturedBooks() {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;
    
    booksGrid.innerHTML = '';
    
    featuredBooks.forEach(book => {
        const bookCard = createBookCard(book);
        booksGrid.appendChild(bookCard);
    });
}

// Create Book Card Element
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card fade-in';
    
    const stars = '★'.repeat(Math.floor(book.rating)) + '☆'.repeat(5 - Math.floor(book.rating));
    
    card.innerHTML = `
        <div class="book-image">
            <i class="fas fa-book"></i>
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">by ${book.author}</p>
            <div class="book-rating">
                <span class="stars">${stars}</span>
                <span>${book.rating}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Search Functionality (for future implementation)
function searchBooks(query) {
    // This would integrate with the backend API
    console.log('Searching for:', query);
}

// Form Validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

// Show Loading State
function showLoading(element) {
    element.innerHTML = '<div class="loading"></div>';
}

// Hide Loading State
function hideLoading(element, content) {
    element.innerHTML = content;
}

// Notification System
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

// API Helper Functions
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showNotification('Something went wrong. Please try again.', 'error');
        throw error;
    }
}

// User Authentication Helpers
function isLoggedIn() {
    return localStorage.getItem('userToken') !== null;
}

function getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
}

// Book Management Functions
function addToFavorites(bookId) {
    if (!isLoggedIn()) {
        showNotification('Please login to add books to favorites', 'warning');
        return;
    }
    
    // This would call the backend API
    showNotification('Book added to favorites!', 'success');
}

function borrowBook(bookId) {
    if (!isLoggedIn()) {
        showNotification('Please login to borrow books', 'warning');
        return;
    }
    
    // This would call the backend API
    showNotification('Book borrowing request submitted!', 'success');
}

// Responsive Image Loading
function loadResponsiveImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadResponsiveImages();
    updateLoginStatus();
    
    // Add click handlers for interactive elements
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-favorite')) {
            const bookId = e.target.dataset.bookId;
            addToFavorites(bookId);
        }
        
        if (e.target.classList.contains('borrow-book')) {
            const bookId = e.target.dataset.bookId;
            borrowBook(bookId);
        }
    });
});

// Update login status in navigation
function updateLoginStatus() {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;
    
    const currentUser = getCurrentUser();
    if (currentUser) {
        loginBtn.innerHTML = `
            <i class="fas fa-user"></i>
            ${currentUser.name}
        `;
        loginBtn.href = 'dashboard.html';
        loginBtn.classList.remove('login-btn');
        loginBtn.classList.add('user-btn');
    }
}

// Export functions for use in other scripts
window.LibraryMS = {
    searchBooks,
    validateForm,
    showNotification,
    apiCall,
    isLoggedIn,
    getCurrentUser,
    logout,
    addToFavorites,
    borrowBook
};
