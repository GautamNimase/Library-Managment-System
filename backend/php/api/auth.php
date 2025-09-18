<?php
/**
 * Authentication API endpoints for Library Management System
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
require_once '../utils/auth.php';
require_once '../utils/response.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($method) {
        case 'POST':
            $action = $_GET['action'] ?? '';
            
            switch ($action) {
                case 'register':
                    registerUser($input);
                    break;
                case 'login':
                    loginUser($input);
                    break;
                case 'admin_register':
                    registerAdmin($input);
                    break;
                case 'admin_login':
                    loginAdmin($input);
                    break;
                default:
                    sendError('Invalid action', 400);
            }
            break;
            
        case 'GET':
            $action = $_GET['action'] ?? '';
            
            switch ($action) {
                case 'verify':
                    verifyToken();
                    break;
                default:
                    sendError('Invalid action', 400);
            }
            break;
            
        default:
            sendError('Method not allowed', 405);
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}

function registerUser($data) {
    global $db;
    
    // Validate input
    if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
        sendError('Name, email, and password are required', 400);
    }
    
    $name = trim($data['name']);
    $email = trim($data['email']);
    $password = $data['password'];
    $phone = $data['phone'] ?? null;
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email format', 400);
    }
    
    // Validate password strength
    if (strlen($password) < 6) {
        sendError('Password must be at least 6 characters long', 400);
    }
    
    // Check if user already exists
    $existingUser = $db->fetchOne(
        "SELECT user_id FROM users WHERE email = ?",
        [$email]
    );
    
    if ($existingUser) {
        sendError('User already exists with this email', 409);
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $userId = $db->insert('users', [
        'name' => $name,
        'email' => $email,
        'password' => $hashedPassword,
        'phone' => $phone
    ]);
    
    // Generate JWT token
    $token = generateJWT([
        'user_id' => $userId,
        'email' => $email,
        'role' => 'user'
    ]);
    
    sendSuccess([
        'message' => 'User registered successfully',
        'token' => $token,
        'user_id' => $userId
    ], 201);
}

function loginUser($data) {
    global $db;
    
    // Validate input
    if (!isset($data['email']) || !isset($data['password'])) {
        sendError('Email and password are required', 400);
    }
    
    $email = trim($data['email']);
    $password = $data['password'];
    
    // Get user from database
    $user = $db->fetchOne(
        "SELECT user_id, name, email, password, phone, is_active FROM users WHERE email = ?",
        [$email]
    );
    
    if (!$user || !password_verify($password, $user['password'])) {
        sendError('Invalid credentials', 401);
    }
    
    if (!$user['is_active']) {
        sendError('Account is deactivated', 403);
    }
    
    // Generate JWT token
    $token = generateJWT([
        'user_id' => $user['user_id'],
        'email' => $user['email'],
        'role' => 'user'
    ]);
    
    // Remove password from response
    unset($user['password']);
    
    sendSuccess([
        'message' => 'Login successful',
        'token' => $token,
        'user' => $user
    ]);
}

function registerAdmin($data) {
    global $db;
    
    // Validate input
    if (!isset($data['name']) || !isset($data['email']) || !isset($data['password']) || !isset($data['admin_key'])) {
        sendError('All fields are required', 400);
    }
    
    $name = trim($data['name']);
    $email = trim($data['email']);
    $password = $data['password'];
    $adminKey = $data['admin_key'];
    
    // Validate admin key
    if ($adminKey !== 'admin123') {
        sendError('Invalid admin key', 403);
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email format', 400);
    }
    
    // Validate password strength
    if (strlen($password) < 8) {
        sendError('Password must be at least 8 characters long', 400);
    }
    
    // Check if admin already exists
    $existingAdmin = $db->fetchOne(
        "SELECT admin_id FROM admin WHERE email = ?",
        [$email]
    );
    
    if ($existingAdmin) {
        sendError('Admin with this email already exists', 409);
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new admin
    $adminId = $db->insert(
        "INSERT INTO admin (name, email, password) VALUES (?, ?, ?)",
        [$name, $email, $hashedPassword]
    );
    
    // Generate JWT token
    $token = generateJWT([
        'admin_id' => $adminId,
        'email' => $email,
        'role' => 'admin'
    ]);
    
    sendSuccess([
        'message' => 'Admin registration successful',
        'token' => $token,
        'admin' => [
            'admin_id' => $adminId,
            'name' => $name,
            'email' => $email
        ]
    ]);
}

function loginAdmin($data) {
    global $db;
    
    // Validate input
    if (!isset($data['email']) || !isset($data['password'])) {
        sendError('Email and password are required', 400);
    }
    
    $email = trim($data['email']);
    $password = $data['password'];
    
    // Get admin from database
    $admin = $db->fetchOne(
        "SELECT admin_id, name, email, password, is_active FROM admin WHERE email = ?",
        [$email]
    );
    
    if (!$admin || !password_verify($password, $admin['password'])) {
        sendError('Invalid credentials', 401);
    }
    
    if (!$admin['is_active']) {
        sendError('Account is deactivated', 403);
    }
    
    // Generate JWT token
    $token = generateJWT([
        'admin_id' => $admin['admin_id'],
        'email' => $admin['email'],
        'role' => 'admin'
    ]);
    
    // Remove password from response
    unset($admin['password']);
    
    sendSuccess([
        'message' => 'Admin login successful',
        'token' => $token,
        'admin' => $admin
    ]);
}

function verifyToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        sendError('Token is missing', 401);
    }
    
    $token = $matches[1];
    
    try {
        $payload = verifyJWT($token);
        sendSuccess([
            'valid' => true,
            'payload' => $payload
        ]);
    } catch (Exception $e) {
        sendError('Invalid token', 401);
    }
}
?>
