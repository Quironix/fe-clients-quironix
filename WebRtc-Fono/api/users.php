<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php'; // ajusta la ruta si es necesario

$input = json_decode(file_get_contents("php://input"), true);
$action = $input['action'] ?? '';

try {
    if ($action === 'create') {
        $stmt = $pdo->prepare("INSERT INTO webrtc_users
            (username, password, sip_user, sip_pass, sip_domain, ws_uri, status) 
            VALUES (:username, :password, :sip_user, :sip_pass, :sip_domain, :ws_uri, :status)");
        $stmt->execute([
            ':username' => $input['username'],
            ':password' => $input['password'],
            ':sip_user' => $input['sip_user'],
            ':sip_pass' => $input['sip_pass'],
            ':sip_domain' => $input['sip_domain'],
            ':ws_uri' => $input['ws_uri'],
            ':status' => $input['status']
        ]);
        echo json_encode(['ok' => true, 'msg' => 'Usuario creado']);
        exit;
    }

    if ($action === 'update') {
        $stmt = $pdo->prepare("UPDATE users SET 
            username=:username,
            password=:password,
            sip_user=:sip_user,
            sip_pass=:sip_pass,
            sip_domain=:sip_domain,
            ws_uri=:ws_uri,
            status=:status
            WHERE id=:id");
        $stmt->execute([
            ':id' => $input['id'],
            ':username' => $input['username'],
            ':password' => $input['password'],
            ':sip_user' => $input['sip_user'],
            ':sip_pass' => $input['sip_pass'],
            ':sip_domain' => $input['sip_domain'],
            ':ws_uri' => $input['ws_uri'],
            ':status' => $input['status']
        ]);
        echo json_encode(['ok' => true, 'msg' => 'Usuario actualizado']);
        exit;
    }

    if ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id=:id");
        $stmt->execute([':id' => $input['id']]);
        echo json_encode(['ok' => true, 'msg' => 'Usuario eliminado']);
        exit;
    }

    if ($action === 'list') {
        $stmt = $pdo->query("SELECT * FROM users ORDER BY id DESC");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['ok' => true, 'users' => $users]);
        exit;
    }

    echo json_encode(['ok' => false, 'msg' => 'Acción no válida']);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'msg' => $e->getMessage()]);
}

