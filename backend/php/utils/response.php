<?php
/**
 * Response utilities for Library Management System API
 */

function sendSuccess($data = null, $statusCode = 200) {
    http_response_code($statusCode);
    
    $response = [
        'success' => true,
        'timestamp' => date('c'),
        'data' => $data
    ];
    
    echo json_encode($response);
    exit;
}

function sendError($message, $statusCode = 400, $details = null) {
    http_response_code($statusCode);
    
    $response = [
        'success' => false,
        'error' => [
            'message' => $message,
            'code' => $statusCode,
            'timestamp' => date('c')
        ]
    ];
    
    if ($details !== null) {
        $response['error']['details'] = $details;
    }
    
    echo json_encode($response);
    exit;
}

function sendValidationError($errors) {
    sendError('Validation failed', 422, $errors);
}

function sendNotFound($message = 'Resource not found') {
    sendError($message, 404);
}

function sendUnauthorized($message = 'Unauthorized access') {
    sendError($message, 401);
}

function sendForbidden($message = 'Access forbidden') {
    sendError($message, 403);
}

function sendMethodNotAllowed($message = 'Method not allowed') {
    sendError($message, 405);
}

function sendInternalError($message = 'Internal server error') {
    sendError($message, 500);
}

function validateRequired($data, $requiredFields) {
    $errors = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[$field] = ucfirst($field) . ' is required';
        }
    }
    
    if (!empty($errors)) {
        sendValidationError($errors);
    }
}

function validateEmail($email) {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendValidationError(['email' => 'Invalid email format']);
    }
}

function validatePassword($password, $minLength = 6) {
    if (strlen($password) < $minLength) {
        sendValidationError(['password' => "Password must be at least {$minLength} characters long"]);
    }
}

function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

function formatDate($date, $format = 'Y-m-d H:i:s') {
    if (is_string($date)) {
        $date = new DateTime($date);
    }
    
    return $date->format($format);
}

function calculateFine($dueDate, $returnDate = null) {
    $due = new DateTime($dueDate);
    $return = $returnDate ? new DateTime($returnDate) : new DateTime();
    
    if ($return <= $due) {
        return 0;
    }
    
    $daysOverdue = $return->diff($due)->days;
    return $daysOverdue * 1.00; // $1 per day overdue
}

function generateRandomString($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

function logActivity($userId, $action, $details = null) {
    // This would typically write to a log file or database
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'user_id' => $userId,
        'action' => $action,
        'details' => $details,
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ];
    
    // For now, just write to a simple log file
    $logFile = '../logs/activity.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);
}
?>
