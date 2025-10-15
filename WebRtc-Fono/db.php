<?php
// db.php
// Configura aquí tus credenciales de base de datos
$DB_HOST = '127.0.0.1';
$DB_NAME = 'webrtc';
$DB_USER = 'root';
$DB_PASS = 'xk3957xk3957';
$DSN = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($DSN, $DB_USER, $DB_PASS, $options);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'DB connection error']);
    exit;
}

