<?php
/**
 * Authentication utilities for Library Management System
 */

// JWT Secret Key (should be in environment variables in production)
define('JWT_SECRET', 'your-jwt-secret-key');
define('JWT_ALGORITHM', 'HS256');

function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => JWT_ALGORITHM]);
    $payload['iat'] = time();
    $payload['exp'] = time() + (24 * 60 * 60); // 24 hours
    $payload = json_encode($payload);
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    
    if (count($parts) !== 3) {
        throw new Exception('Invalid token format');
    }
    
    list($base64Header, $base64Payload, $base64Signature) = $parts;
    
    // Verify signature
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
    $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    if (!hash_equals($expectedSignature, $base64Signature)) {
        throw new Exception('Invalid token signature');
    }
    
    // Decode payload
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64Payload)), true);
    
    if (!$payload) {
        throw new Exception('Invalid token payload');
    }
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        throw new Exception('Token has expired');
    }
    
    return $payload;
}

function requireAuth() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        throw new Exception('Token is missing', 401);
    }
    
    $token = $matches[1];
    
    try {
        return verifyJWT($token);
    } catch (Exception $e) {
        throw new Exception('Invalid token', 401);
    }
}

function requireAdmin() {
    $payload = requireAuth();
    
    if ($payload['role'] !== 'admin') {
        throw new Exception('Admin privileges required', 403);
    }
    
    return $payload;
}

function getCurrentUserId() {
    $payload = requireAuth();
    return $payload['user_id'] ?? null;
}

function getCurrentAdminId() {
    $payload = requireAdmin();
    return $payload['admin_id'] ?? null;
}
?>
