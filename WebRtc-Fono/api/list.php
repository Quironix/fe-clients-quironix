<?php
// api/list.php
session_start();
require_once __DIR__ . '/../db.php';

// check admin session
if (empty($_SESSION['admin_logged'])) {
    http_response_code(401);
    echo json_encode(['status'=>'error','message'=>'No autorizado']);
    exit;
}

$stmt = $pdo->query('SELECT id, username, sip_user, sip_domain, status, created_at FROM webrtc_users ORDER BY id DESC');
$rows = $stmt->fetchAll();
echo json_encode(['status'=>'ok','data'=>$rows]);

