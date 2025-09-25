// Books Page JavaScript
// Fallback mock data; real data will be fetched from backend
const fallbackBooks = [
    {
        id: 1,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        category: "fiction",
        year: 1960,
        publisher: "J.B. Lippincott & Co.",
        price: 14.99,
        stock: 3,
        rating: 4.8,
        reviews: 1234,
        downloads: 15200,
        readTime: "8h",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        description: "A gripping tale of racial injustice and childhood innocence in the American South.",
        badge: "Bestseller",
        status: "available"
    },
    {
        id: 2,
        title: "Digital Dreams",
        author: "Sarah Johnson",
        category: "non-fiction",
        year: 2023,
        publisher: "Tech Press",
        price: 19.99,
        stock: 5,
        rating: 4.7,
        reviews: 892,
        downloads: 8700,
        readTime: "6h",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        description: "An insightful exploration of how technology is reshaping our world.",
        badge: "New",
        status: "available"
    },
    {
        id: 3,
        title: "Future Technology",
        author: "Mike Chen",
        category: "technology",
        year: 2023,
        publisher: "Innovation Books",
        price: 24.99,
        stock: 2,
        rating: 4.9,
        reviews: 567,
        downloads: 12100,
        readTime: "10h",
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        description: "A visionary look at emerging technologies that will shape our future.",
        badge: "Trending",
        status: "available"
    },
    {
        id: 4,
        title: "Mystery of the Lost City",
        author: "Emma Wilson",
        category: "fiction",
        year: 2022,
        publisher: "Adventure Press",
        price: 16.99,
        stock: 4,
        rating: 4.6,
        reviews: 743,
        downloads: 9800,
        readTime: "7h",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        description: "An thrilling adventure novel that takes readers on a journey through ancient civilizations.",
        badge: "Popular",
        status: "borrowed"
    },
    {
        id: 5,
        title: "The Art of Learning",
        author: "David Lee",
        category: "non-fiction",
        year: 2022,
        publisher: "Education Books",
        price: 18.99,
        stock: 6,
        rating: 4.8,
        reviews: 1156,
        downloads: 11300,
        readTime: "5h",
        image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        description: "A comprehensive guide to effective learning strategies and techniques.",
        badge: "Recommended",
        status: "available"
    },
    {
        id: 6,
        title: "AI Revolution",
        author: "Alex Rodriguez",
        category: "technology",
        year: 2024,
        publisher: "Future Tech",
        price: 22.99,
        stock: 1,
        rating: 4.9,
        reviews: 2341,
        downloads: 18700,
        readTime: "12h",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        description: "An in-depth analysis of artificial intelligence and its revolutionary impact on society.",
        badge: "New",
        status: "available"
    }
];

let allBooks = [];
let currentBooks = [];
let currentPage = 1;
const booksPerPage = 6;

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadHeroStats();
    loadBooksFromApi();
});

async function loadHeroStats() {
    try {
        const data = await window.apiService.makeRequest('/test/data');
        const stats = data?.stats || {};
        const booksEl = document.getElementById('booksHeroTotalBooks');
        const catEl = document.getElementById('booksHeroTotalCategories');
        const usersEl = document.getElementById('booksHeroTotalUsers');
        if (booksEl) booksEl.setAttribute('data-target', Number(stats.total_books || 0));
        if (catEl) catEl.setAttribute('data-target', Number(stats.total_categories || 0));
        if (usersEl) usersEl.setAttribute('data-target', Number(stats.total_users || 0));
        animateCounters();
    } catch (e) {
        console.warn('Failed to load hero stats', e);
    }
}

async function loadBooksFromApi() {
    try {
        const data = await window.apiService.getBooks();
        const rows = Array.isArray(data.books) ? data.books : [];
    allBooks = rows.map(row => ({
            id: row.book_id,
            title: row.title,
        author: (row.authors || row.author || ''),
            category: 'general',
            year: row.publication_date ? new Date(row.publication_date).getFullYear() : (row.year || ''),
            publisher: row.publishers || '',
            price: Number(row.price || 0).toFixed(2),
            stock: (row.available_copies ?? row.available_stock ?? row.stock ?? 0),
            rating: Number(row.average_rating || 0),
            reviews: Number(row.total_reviews || 0),
            downloads: 0,
            readTime: '-',
            image: row.cover_image || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
            preview_url: row.digital_copy_url || '',
            description: row.description || '',
            badge: row.is_featured ? 'Featured' : (row.is_digital ? 'Digital' : 'Book'),
            status: ((row.is_available === true) || ((row.available_copies ?? row.available_stock ?? 0) > 0)) ? 'available' : 'borrowed'
        }));
    } catch (e) {
        console.warn('Falling back to mock books data', e);
        allBooks = [...fallbackBooks];
    }
    currentBooks = [...allBooks];
    currentPage = 1;
    displayBooks(currentBooks.slice(0, booksPerPage));
    updateLoadMoreButton();
}

function initializePage() {}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const closeModal = document.getElementById('closeModal');
    const closeReviewModal = document.getElementById('closeReviewModal');
    const addReviewBtn = document.getElementById('addReviewBtn');
    const cancelReview = document.getElementById('cancelReview');
    const reviewForm = document.getElementById('reviewForm');
    
    if (searchInput) searchInput.addEventListener('input', handleSearch);
    if (categoryFilter) categoryFilter.addEventListener('change', handleFilter);
    if (sortFilter) sortFilter.addEventListener('change', handleFilter);
    if (availabilityFilter) availabilityFilter.addEventListener('change', handleFilter);
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMoreBooks);
    if (closeModal) closeModal.addEventListener('click', closeBookModal);
    if (closeReviewModal) closeReviewModal.addEventListener('click', closeReviewModalFunc);
    if (cancelReview) cancelReview.addEventListener('click', closeReviewModalFunc);
    if (addReviewBtn) addReviewBtn.addEventListener('click', openReviewModal);
    if (reviewForm) reviewForm.addEventListener('submit', handleReviewSubmit);
}

function displayBooks(books) {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;
    
    booksGrid.innerHTML = '';
    
    books.forEach((book, index) => {
        const bookCard = createBookCard(book);
        bookCard.style.animationDelay = `${index * 0.1}s`;
        booksGrid.appendChild(bookCard);
    });
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.setAttribute('data-category', book.category);
    card.setAttribute('data-status', book.status);
    
    card.innerHTML = `
        <div class="book-cover">
            <img src="${book.image}" alt="${book.title}" loading="lazy">
            <div class="book-overlay">
                <button class="read-btn" onclick="openBookModal(${book.id})">
                    <i class="fas fa-eye"></i>
                    <span>View Details</span>
                </button>
                <button class="read-btn" onclick="previewBook(${book.id})" style="margin-top:8px">
                    <i class="fas fa-book-reader"></i>
                    <span>Preview</span>
                </button>
            </div>
            <div class="book-badge ${book.badge.toLowerCase().replace(' ', '-')}">${book.badge}</div>
        </div>
        <div class="book-info">
            <div class="book-category">${(book.category||'general').toString().charAt(0).toUpperCase() + (book.category||'general').toString().slice(1)}</div>
            <h3>${book.title || 'Untitled'}</h3>
            <p class="author">${book.author ? 'by ' + book.author : ''}</p>
            <div class="book-meta">
                <div class="rating">
                    ${generateStars(book.rating)}
                    <span>${book.rating}</span>
                    <span class="review-count">(${Number(book.reviews||0).toLocaleString()} reviews)</span>
                </div>
                <div class="book-stats">
                    <span><i class="fas fa-download"></i> ${((book.downloads||0) / 1000).toFixed(1)}k</span>
                    <span><i class="fas fa-clock"></i> ${book.readTime}</span>
                </div>
            </div>
            <div class="book-price">
                <span class="price">$${book.price}</span>
            </div>
        </div>
    `;
    
    return card;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function handleSearch() {
    filterBooks();
}

function handleFilter() {
    filterBooks();
}

function filterBooks() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');
    
    if (!searchInput || !categoryFilter || !sortFilter || !availabilityFilter) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const sortBy = sortFilter.value;
    const availability = availabilityFilter.value;
    
    let filteredBooks = [...allBooks];
    
    if (searchTerm) {
        filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm)
        );
    }
    
    if (category !== 'all') {
        filteredBooks = filteredBooks.filter(book => book.category === category);
    }
    
    if (availability !== 'all') {
        filteredBooks = filteredBooks.filter(book => book.status === availability);
    }
    
    switch (sortBy) {
        case 'title':
            filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'author':
            filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
            break;
        case 'rating':
            filteredBooks.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            filteredBooks.sort((a, b) => b.year - a.year);
            break;
        case 'popular':
            filteredBooks.sort((a, b) => b.downloads - a.downloads);
            break;
    }
    
    currentBooks = filteredBooks;
    currentPage = 1;
    displayBooks(currentBooks.slice(0, booksPerPage));
    updateLoadMoreButton();
}

function loadMoreBooks() {
    const startIndex = currentPage * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const moreBooks = currentBooks.slice(startIndex, endIndex);
    
    if (moreBooks.length > 0) {
        const booksGrid = document.getElementById('booksGrid');
        if (!booksGrid) return;
        
        // Add loading animation to button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Loading...</span>';
            loadMoreBtn.disabled = true;
        }
        
        // Simulate loading delay for smooth animation
        setTimeout(() => {
            moreBooks.forEach((book, index) => {
                const bookCard = createBookCard(book);
                bookCard.style.animationDelay = `${index * 0.1}s`;
                booksGrid.appendChild(bookCard);
            });
            
            // Reset button
            if (loadMoreBtn) {
                loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i><span>Load More Books</span>';
                loadMoreBtn.disabled = false;
            }
            
            currentPage++;
            updateLoadMoreButton();
        }, 500);
    }
}

function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    
    const totalBooks = currentBooks.length;
    const displayedBooks = currentPage * booksPerPage;
    
    if (displayedBooks >= totalBooks) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
    }
}

function openBookModal(bookId) {
    const book = (allBooks.find(b => b.id === bookId));
    if (!book) return;
    
    const bookModal = document.getElementById('bookModal');
    if (!bookModal) return;
    
    document.getElementById('modalBookImage').src = book.image;
    document.getElementById('modalBookTitle').textContent = book.title;
    document.getElementById('modalBookAuthor').textContent = `by ${book.author}`;
    document.getElementById('modalBookYear').textContent = book.year;
    document.getElementById('modalBookPublisher').textContent = book.publisher;
    document.getElementById('modalBookPrice').textContent = `$${book.price}`;
    document.getElementById('modalBookStock').textContent = `${book.stock} available`;
    document.getElementById('modalBookRating').textContent = `${book.rating} (${book.reviews.toLocaleString()} reviews)`;
    document.getElementById('modalBookDescription').textContent = book.description;
    
    const bookStatus = document.getElementById('bookStatus');
    if (book.status === 'available') {
        bookStatus.innerHTML = '<i class="fas fa-check-circle"></i><span>Available</span>';
        bookStatus.className = 'book-status available';
    } else {
        bookStatus.innerHTML = '<i class="fas fa-clock"></i><span>Currently Borrowed</span>';
        bookStatus.className = 'book-status borrowed';
    }
    
    const starsContainer = document.querySelector('.book-rating-large .stars');
    if (starsContainer) {
        starsContainer.innerHTML = generateStars(book.rating);
    }
    
    const reviewCount = document.getElementById('reviewCount');
    if (reviewCount) reviewCount.textContent = book.reviews;
    
    // Wire borrow button
    const borrowBtn = document.getElementById('borrowBtn');
    if (borrowBtn) {
        borrowBtn.onclick = () => borrowBook(book.id);
        borrowBtn.disabled = book.status !== 'available';
    }

    // Wire add review button visibility by login
    const addReviewBtn = document.getElementById('addReviewBtn');
    if (addReviewBtn) addReviewBtn.style.display = localStorage.getItem('userToken') ? 'inline-flex' : 'none';

    bookModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeBookModal() {
    const bookModal = document.getElementById('bookModal');
    if (bookModal) {
        bookModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function openReviewModal() {
    const reviewModal = document.getElementById('reviewModal');
    if (reviewModal) {
        reviewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeReviewModalFunc() {
    const reviewModal = document.getElementById('reviewModal');
    const reviewForm = document.getElementById('reviewForm');
    
    if (reviewModal) {
        reviewModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    if (reviewForm) {
        reviewForm.reset();
    }
}

function handleReviewSubmit(e) {
    e.preventDefault();
    
    const rating = document.querySelector('input[name="rating"]:checked');
    const title = document.getElementById('reviewTitle');
    const text = document.getElementById('reviewText');
    
    if (!rating || !title?.value || !text?.value) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    submitReview(Number(document.getElementById('modalBookYear')?.textContent) || 0, Number(rating.value), text.value).catch(()=>{});
    showNotification('Thank you for your review!', 'success');
    closeReviewModalFunc();

    const currentCount = parseInt(document.getElementById('reviewCount')?.textContent || '0');
    const reviewCount = document.getElementById('reviewCount');
    if (reviewCount) reviewCount.textContent = currentCount + 1;
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };
        
        updateCounter();
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

window.openBookModal = openBookModal;
window.previewBook = previewBook;

// ---------------- Real actions ----------------
async function borrowBook(bookId) {
    try {
        const token = localStorage.getItem('userToken');
        if (!token) { showNotification('Please login to borrow books', 'error'); return; }
        await window.apiService.issueBook(bookId, 30);
        showNotification('Book issued successfully', 'success');
        closeBookModal();
    } catch (e) {
        console.error('Borrow failed', e);
        showNotification(e.message || 'Borrow failed', 'error');
    }
}

async function submitReview(bookId, rating, comment) {
    try {
        const token = localStorage.getItem('userToken');
        if (!token) { showNotification('Please login to add reviews', 'error'); return; }
        await window.apiService.addFeedback(bookId, rating, comment || '');
    } catch (e) {
        console.warn('Add review failed', e);
    }
}

// --------------- Preview support ---------------
function previewBook(bookId) {
    const book = allBooks.find(b => b.id === bookId) || fallbackBooks.find(b=>b.id===bookId);
    const modal = document.getElementById('previewModal');
    const frame = document.getElementById('previewFrame');
    const unavailable = document.getElementById('previewUnavailable');
    if (!modal || !frame || !unavailable) return;
    const url = book?.preview_url || book?.digital_copy_url || book?.image || '';
    if (url) {
        frame.src = url;
        frame.style.display = 'block';
        unavailable.style.display = 'none';
    } else {
        frame.src = '';
        frame.style.display = 'none';
        unavailable.style.display = 'block';
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePreview() {
    const modal = document.getElementById('previewModal');
    const frame = document.getElementById('previewFrame');
    if (modal) modal.classList.remove('active');
    if (frame) frame.src = '';
    document.body.style.overflow = 'auto';
}