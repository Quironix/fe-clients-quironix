<?php
// logout.php
session_start();
session_unset();
session_destroy();
header('Location: /'); // redirige al home o página de login del softphone
exit;

