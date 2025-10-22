<?php
require 'db.php'; // conexión a la base de datos
$users = $pdo->query("SELECT * FROM webrtc_users")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Panel de Administración</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-4">

<div class="container">
  <h2 class="mb-4">Usuarios</h2>
  <button class="btn btn-success mb-3" onclick="openCreate()">Crear nuevo</button>

  <table class="table table-bordered table-striped">
    <thead>
      <tr>
        <th>ID</th>
        <th>Provision User</th>
        <th>SIP Ext</th>
        <th>SIP Domain</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach($users as $u): ?>
      <tr>
        <td><?= htmlspecialchars($u['id']) ?></td>
        <td><?= htmlspecialchars($u['username']) ?></td>
        <td><?= htmlspecialchars($u['sip_user']) ?></td>
        <td><?= htmlspecialchars($u['sip_domain']) ?></td>
        <td><?= htmlspecialchars($u['status']) ?></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick='openEdit(<?= json_encode($u) ?>)'>Editar</button>
        </td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>

<!-- Modal Crear/Editar -->
<div class="modal fade" id="modalEdit" tabindex="-1">
  <div class="modal-dialog"><div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title">Crear / Editar</h5>
      <button class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <div class="modal-body">
      <form id="formEdit">
        <input type="hidden" name="id" id="m_id">
        <div class="mb-2"><label class="form-label">Provision user</label><input id="m_user" name="username" class="form-control"></div>
        <div class="mb-2"><label class="form-label">Provision pass (plaintext)</label><input id="m_pass" name="password" class="form-control"></div>
        <div class="mb-2"><label class="form-label">SIP ext</label><input id="m_sipuser" name="sip_user" class="form-control"></div>
        <div class="mb-2"><label class="form-label">SIP pass</label><input id="m_sippass" name="sip_pass" class="form-control"></div>
        <div class="mb-2"><label class="form-label">SIP domain</label><input id="m_domain" name="sip_domain" class="form-control"></div>
        <div class="mb-2"><label class="form-label">WS URI</label><input id="m_ws" name="ws_uri" class="form-control"></div>
        <div class="mb-2">
          <label class="form-label">Status</label>
          <select id="m_status" name="status" class="form-select">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
      <button id="saveBtn" class="btn btn-primary">Guardar</button>
    </div>
  </div></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script>
async function api(path, data){
  const res = await fetch('/Phone/api/'+path, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(data||{})
  });
  return res.json();
}

const modal = new bootstrap.Modal(document.getElementById('modalEdit'));

function openCreate(){
  document.getElementById('formEdit').reset();
  document.getElementById('m_id').value = "";
  modal.show();
}

function openEdit(user){
  document.getElementById('m_id').value = user.id;
  document.getElementById('m_user').value = user.username;
  document.getElementById('m_pass').value = user.password;
  document.getElementById('m_sipuser').value = user.sip_user;
  document.getElementById('m_sippass').value = user.sip_pass;
  document.getElementById('m_domain').value = user.sip_domain;
  document.getElementById('m_ws').value = user.ws_uri;
  document.getElementById('m_status').value = user.status;
  modal.show();
}

document.getElementById('saveBtn').addEventListener('click', async () => {
  const data = {
    action: document.getElementById('m_id').value ? 'update' : 'create',
    id: document.getElementById('m_id').value,
    username: document.getElementById('m_user').value,
    password: document.getElementById('m_pass').value,
    sip_user: document.getElementById('m_sipuser').value,
    sip_pass: document.getElementById('m_sippass').value,
    sip_domain: document.getElementById('m_domain').value,
    ws_uri: document.getElementById('m_ws').value,
    status: document.getElementById('m_status').value
  };

  const res = await api('users.php', data);
  if(res.ok){
    alert(res.msg);
    location.reload();
  } else {
    alert("Error: "+res.msg);
  }
});
</script>
</body>
</html>

