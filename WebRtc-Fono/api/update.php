<?php
// api/update.php
session_start();
require_once __DIR__ . '/../db.php';
if (empty($_SESSION['admin_logged'])) { http_response_code(401); echo json_encode(['status'=>'error','message'=>'No autorizado']); exit; }

$input = json_decode(file_get_contents('php://input'), true);
$id = intval($input['id'] ?? 0);
if(!$id){ http_response_code(400); echo json_encode(['status'=>'error','message'=>'Missing id']); exit; }

$fields = [];
$params = [];

if(isset($input['sip_user'])){ $fields[]='sip_user=?'; $params[] = $input['sip_user']; }
if(isset($input['sip_pass'])){ $fields[]='sip_pass=?'; $params[] = $input['sip_pass']; }
if(isset($input['sip_domain'])){ $fields[]='sip_domain=?'; $params[] = $input['sip_domain']; }
if(isset($input['ws_uri'])){ $fields[]='ws_uri=?'; $params[] = $input['ws_uri']; }
if(isset($input['status'])){ $fields[]='status=?'; $params[] = $input['status']; }
if(isset($input['password']) && $input['password'] !== ''){ $fields[]='password=?'; $params[] = password_hash($input['password'], PASSWORD_DEFAULT); }

if(empty($fields)){ echo json_encode(['status'=>'ok']); exit; }

$params[] = $id;
$sql = 'UPDATE webrtc_users SET ' . implode(',', $fields) . ' WHERE id=?';
$stmt = $pdo->prepare($sql);
try { $stmt->execute($params); echo json_encode(['status'=>'ok']); } catch(Exception $e){ http_response_code(500); echo json_encode(['status'=>'error','message'=>$e->getMessage()]); }

