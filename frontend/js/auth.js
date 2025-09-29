// Authentication JavaScript for Library Management System

// Toggle password visibility
function togglePassword(inputId = 'password') {
    const passwordInput = document.getElementById(inputId);
    if (!passwordInput) return;
    const group = passwordInput.parentElement || document;
    const toggleBtn = group.querySelector('.password-toggle');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        if (toggleBtn) { toggleBtn.classList.remove('fa-eye'); toggleBtn.classList.add('fa-eye-slash'); }
    } else {
        passwordInput.type = 'password';
        if (toggleBtn) { toggleBtn.classList.remove('fa-eye-slash'); toggleBtn.classList.add('fa-eye'); }
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('passwordStrengthText');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let feedback = '';
    
    // Length check
    if (password.length >= 8) strength += 25;
    else feedback = 'Use at least 8 characters';
    
    // Lowercase check
    if (/[a-z]/.test(password)) strength += 25;
    else feedback = 'Include lowercase letters';
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 25;
    else feedback = 'Include uppercase letters';
    
    // Number check
    if (/[0-9]/.test(password)) strength += 25;
    else feedback = 'Include numbers';
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    
    // Update strength bar
    strengthBar.className = 'password-strength';
    if (strength < 25) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Weak password';
    } else if (strength < 50) {
        strengthBar.classList.add('fair');
        strengthText.textContent = 'Fair password';
    } else if (strength < 75) {
        strengthBar.classList.add('good');
        strengthText.textContent = 'Good password';
    } else {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Strong password';
    }
}

// Form validation
function validateForm(formData) {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
        errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
    }
    
    return errors;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Display form errors
function displayErrors(errors) {
    // Clear previous errors
    clearErrors();
    
    Object.keys(errors).forEach(field => {
        const input = document.getElementById(field);
        const formGroup = input.closest('.form-group');
        
        // Add error class
        formGroup.classList.add('error');
        
        // Create error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errors[field]}`;
        
        // Insert error message
        formGroup.appendChild(errorMessage);
    });
}

// Clear form errors
function clearErrors() {
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error', 'success');
        const errorMsg = group.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    });
}

// Show success message
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const form = document.querySelector('.auth-form');
    form.insertBefore(messageDiv, form.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Set loading state
function setLoadingState(loading) {
    const btn = document.querySelector('.auth-btn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    
    if (loading) {
        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'block';
    } else {
        btn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

// API call helper
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // If we can't parse the error response, use the status text
                console.log('Could not parse error response:', e);
            }
            throw new Error(errorMessage);
        }
        
        // Check if response has content before parsing JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Login function
async function loginUser(formData) {
    try {
        setLoadingState(true);
        
        const response = await apiCall('https://library-system-js3a.onrender.com/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        // Store token and user data
        localStorage.setItem('userToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        showMessage('Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setLoadingState(false);
    }
}

// Register function
async function registerUser(formData) {
    try {
        setLoadingState(true);
        
        console.log('Attempting registration with data:', formData);
        
        const response = await apiCall('https://library-system-js3a.onrender.com/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        console.log('Registration response:', response);
        
        // Store token and user data
        if (response.token) {
            localStorage.setItem('userToken', response.token);
            localStorage.setItem('userData', JSON.stringify({
                user_id: response.user_id,
                email: formData.email,
                name: formData.name
            }));
            
            showMessage('Registration successful! Redirecting...', 'success');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            throw new Error('No token received from server');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        showMessage(`Registration failed: ${error.message}`, 'error');
    } finally {
        setLoadingState(false);
    }
}

// Admin registration function
async function adminRegister(formData) {
    try {
        setLoadingState(true);
        
        const response = await apiCall('https://library-system-js3a.onrender.com/api/auth/admin/register', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        // Store admin token and data
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminData', JSON.stringify(response.admin));
        
        showMessage('Admin registration successful! Redirecting...', 'success');
        
        // Redirect to admin dashboard
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 2000);
        
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setLoadingState(false);
    }
}

// Admin login function
async function adminLogin(formData) {
    try {
        setLoadingState(true);
        
        const response = await apiCall('https://library-system-js3a.onrender.com/api/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        // Store admin token and data
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminData', JSON.stringify(response.admin));
        
        showMessage('Admin login successful! Redirecting...', 'success');
        
        // Redirect to admin dashboard
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1500);
        
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setLoadingState(false);
    }
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('userToken') !== null;
}

function isAdminLoggedIn() {
    return localStorage.getItem('adminToken') !== null;
}

// Get current user
function getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

function getCurrentAdmin() {
    const adminData = localStorage.getItem('adminData');
    return adminData ? JSON.parse(adminData) : null;
}

// Logout function
function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    window.location.href = 'index.html';
}

// Redirect if already logged in
function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = 'dashboard.html';
    }
}

function redirectIfAdminLoggedIn() {
    if (isAdminLoggedIn()) {
        window.location.href = 'admin-dashboard.html';
    }
}

// Redirect if not logged in
function redirectIfNotLoggedIn() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

function redirectIfNotAdminLoggedIn() {
    if (!isAdminLoggedIn()) {
        window.location.href = 'admin-login.html';
    }
}

// Form submission handlers
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };
            
            // Validate form
            const errors = validateForm(formData);
            if (Object.keys(errors).length > 0) {
                displayErrors(errors);
                return;
            }
            
            // Clear errors
            clearErrors();
            
            // Attempt login
            await loginUser(formData);
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        // Add password strength checking
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                checkPasswordStrength(this.value);
            });
        }
        
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value,
                phone: document.getElementById('phone').value
            };
            
            console.log('Form submitted with data:', formData);
            
            // Validate form
            const errors = validateRegisterForm(formData);
            if (Object.keys(errors).length > 0) {
                displayErrors(errors);
                return;
            }
            
            // Clear errors
            clearErrors();
            
            // Remove confirmPassword from data sent to server
            delete formData.confirmPassword;
            
            console.log('Sending registration data:', formData);
            
            // Attempt registration
            await registerUser(formData);
        });
    }
    
    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };
            
            // Validate form
            const errors = validateForm(formData);
            if (Object.keys(errors).length > 0) {
                displayErrors(errors);
                return;
            }
            
            // Clear errors
            clearErrors();
            
            // Attempt admin login
            await adminLogin(formData);
        });
    }
    
    // Check for redirects on page load
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'login.html' || currentPage === 'register.html') {
        redirectIfLoggedIn();
    } else if (currentPage === 'admin-login.html') {
        redirectIfAdminLoggedIn();
    }
});

// Register form validation
function validateRegisterForm(formData) {
    const errors = {};
    
    // Name validation
    if (!formData.name) {
        errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
        errors.name = 'Name must be at least 2 characters long';
    }
    
    // Email validation
    if (!formData.email) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
        errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }
    
    // Phone validation (optional)
    if (formData.phone && !isValidPhone(formData.phone)) {
        errors.phone = 'Please enter a valid phone number';
    }
    
    return errors;
}

// Phone validation helper
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Social login handlers (placeholder)
function handleGoogleLogin() {
    showMessage('Google login integration coming soon!', 'warning');
}

function handleFacebookLogin() {
    showMessage('Facebook login integration coming soon!', 'warning');
}

// Add social login event listeners
document.addEventListener('DOMContentLoaded', function() {
    const googleBtn = document.querySelector('.google-btn');
    const facebookBtn = document.querySelector('.facebook-btn');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleLogin);
    }
    
    if (facebookBtn) {
        facebookBtn.addEventListener('click', handleFacebookLogin);
    }
});

// Export functions for use in other scripts
window.Auth = {
    loginUser,
    registerUser,
    adminLogin,
    logout,
    isLoggedIn,
    isAdminLoggedIn,
    getCurrentUser,
    getCurrentAdmin,
    redirectIfLoggedIn,
    redirectIfAdminLoggedIn,
    redirectIfNotLoggedIn,
    redirectIfNotAdminLoggedIn
};
