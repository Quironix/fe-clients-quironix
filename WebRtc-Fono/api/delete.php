<?php
// api/delete.php
session_start();
require_once __DIR__ . '/../db.php';
if (empty($_SESSION['admin_logged'])) { http_response_code(401); echo json_encode(['status'=>'error','message'=>'No autorizado']); exit; }

$input = json_decode(file_get_contents('php://input'), true);
$id = intval($input['id'] ?? 0);
if(!$id){ http_response_code(400); echo json_encode(['status'=>'error','message'=>'Missing id']); exit; }

$stmt = $pdo->prepare('DELETE FROM webrtc_users WHERE id=?');
try{ $stmt->execute([$id]); echo json_encode(['status'=>'ok']); }catch(Exception $e){ http_response_code(500); echo json_encode(['status'=>'error','message'=>$e->getMessage()]); }

