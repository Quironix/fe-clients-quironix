<?php
// ========================
// Provision API
// ========================
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ERROR | E_PARSE); // Evitar warnings que rompan JSON

require_once __DIR__ . '/../db.php';

// ------------------------
// Leer datos de POST
// ------------------------
$user = $_POST['username'] ?? '';
$pass = $_POST['password'] ?? '';

// Si POST tradicional está vacío, intentar JSON
if(!$user || !$pass){
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);
    $user = $input['username'] ?? $user;
    $pass = $input['password'] ?? $pass;
}

// ------------------------
// Logging de debug
// ------------------------
file_put_contents(__DIR__.'/../logs/provision_debug.log', date('Y-m-d H:i:s') . " - USER=$user PASS=$pass\n", FILE_APPEND);

// ------------------------
// Validar credenciales
// ------------------------
if(!$user || !$pass){
    http_response_code(401);
    echo json_encode(["status"=>"error","message"=>"Missing credentials"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM webrtc_users WHERE username=? AND password=? AND status='active' LIMIT 1");
    $stmt->execute([$user, $pass]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if(!$row){
        http_response_code(401);
        echo json_encode(["status"=>"error","message"=>"Invalid credentials"]);
        exit;
    }

    // ------------------------
    // Respuesta JSON exitosa
    // ------------------------
    echo json_encode([
        "status"    => "ok",
        "sip_user"  => $row['sip_user'],
        "sip_pass"  => $row['sip_pass'],
        "sip_domain"=> $row['sip_domain'],
        "ws_uri"    => $row['ws_uri']
    ]);

} catch(Exception $e){
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Server error"]);
    file_put_contents(__DIR__.'/../logs/provision_debug.log', date('Y-m-d H:i:s') . " - Exception: ".$e->getMessage()."\n", FILE_APPEND);
}
