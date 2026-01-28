# Tutorial para Administrador PBX - Configuración Cloudflare Tunnel

## Información del Proyecto

- **Servidor:** Rocky Linux 8
- **PBX:** Asterisk/FreePBX (Issabel)
- **IP Privada:** 172.17.16.24
- **Puerto WebSocket:** 8089
- **Tunnel ID (ya creado):** f407aef2-7a56-4f0b-b32c-4933c69dc676
- **Nombre del Tunnel:** quironix-pbx

**Objetivo:** Configurar el servidor PBX para que los clientes web puedan conectarse sin VPN usando Cloudflare Tunnel.

**Tiempo estimado:** 2 horas

---

## PARTE 1: INSTALACIÓN DE CLOUDFLARE TUNNEL

### Paso 1.1: Conectarse al Servidor PBX

```bash
ssh root@172.17.16.24
```

O usar el método que uses habitualmente para acceder al servidor.

---

### Paso 1.2: Descargar e Instalar cloudflared

```bash
# Ir al directorio temporal
cd /tmp

# Descargar cloudflared para Rocky Linux/RHEL
curl -L -o cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm

# Instalar
sudo rpm -i cloudflared.rpm

# Verificar instalación
cloudflared --version
```

**Resultado esperado:**

```
cloudflared version 2024.x.x (built xxxx-xx-xx)
```

✅ Si ves la versión, continúa al siguiente paso.

---

### Paso 1.3: Obtener el Token del Tunnel

**Token del tunnel**

```bash
eyJhIjoiYTBjY2M5YTg5MWI2MDhmYjk4YzUyMWE0NGY4OGU4MGIiLCJ0IjoiZjQwN2FlZjItN2E1Ni00ZjBiLWIzMmMtNDkzM2M2OWRjNjc2IiwicyI6Ik16azVPR0ZrTUdNdFpUUTFNaTAwTldVeExUbGlZMkV0WW1Fd05HVmpaVGN4TWpOaiJ9
```

---

### Paso 1.4: Instalar el Tunnel con el Token

Una vez que recibas el token, ejecuta:

```bash
sudo cloudflared service install eyJhIjoiYTBjY2M5YTg5MWI2MDhmYjk4YzUyMWE0NGY4OGU4MGIiLCJ0IjoiZjQwN2FlZjItN2E1Ni00ZjBiLWIzMmMtNDkzM2M2OWRjNjc2IiwicyI6Ik16azVPR0ZrTUdNdFpUUTFNaTAwTldVeExUbGlZMkV0WW1Fd05HVmpaVGN4TWpOaiJ9
```

**Resultado esperado:**

```
Successfully installed cloudflared service
```

---

### Paso 1.5: Iniciar y Habilitar el Servicio

```bash
# Habilitar inicio automático
sudo systemctl enable cloudflared

# Iniciar el servicio
sudo systemctl start cloudflared

# Verificar estado
sudo systemctl status cloudflared
```

**Resultado esperado:**

```
● cloudflared.service - Cloudflare Tunnel
   Loaded: loaded (/etc/systemd/system/cloudflared.service; enabled)
   Active: active (running) since ...
```

✅ Si dice "active (running)", el tunnel está funcionando correctamente.

---

### Paso 1.6: Verificar Conexión del Tunnel

```bash
# Ver los últimos logs
sudo journalctl -u cloudflared -n 50
```

**Busca estas líneas:**

```
INF Connection registered connIndex=0
INF Connection registered connIndex=1
INF Connection registered connIndex=2
INF Connection registered connIndex=3
```

✅ Si ves 4 conexiones registradas, el tunnel está conectado a Cloudflare.

---

## PARTE 2: CONFIGURACIÓN DE ASTERISK/FREEPBX PARA TURN

### Paso 2.1: Verificar Configuración Actual de WebSocket

```bash
# Entrar a la consola de Asterisk
sudo asterisk -rvvv

# Verificar transporte WebSocket
pjsip show transports

# Salir de la consola
exit
```

**Busca:** Un transport con tipo "wss" en puerto 8089.

✅ Si existe, continúa. Si no, necesitas configurar WebRTC primero en FreePBX.

---

### Paso 2.2: Hacer Respaldo de Configuración

```bash
# Crear directorio de respaldos
sudo mkdir -p /root/backups/asterisk

# Respaldar archivo principal
sudo cp /etc/asterisk/pjsip.conf /root/backups/asterisk/pjsip.conf.backup.$(date +%Y%m%d)

# Verificar respaldo
ls -la /root/backups/asterisk/
```

✅ Guarda la ubicación del respaldo por si necesitas revertir cambios.

---

### Paso 2.3: Editar Configuración PJSIP

```bash
# Editar archivo de configuración
sudo nano /etc/asterisk/pjsip.conf
```

**Busca la sección `[global]`** (puede estar al inicio del archivo).

**Si NO existe, agrégala al inicio del archivo:**

```ini
[global]
type=global
max_forwards=70
user_agent=Asterisk PBX
keep_alive_interval=90
disable_multi_domain=no
```

**Dentro de la sección `[global]`, agrega estas líneas al final:**

```ini
; Configuración ICE/STUN/TURN para Cloudflare
ice_support=yes
media_use_received_transport=no
rtcp_mux=yes

; Servidor STUN de Cloudflare (GRATIS, ilimitado)
stun_server=stun.cloudflare.com:3478

; Configuración para NAT traversal
external_media_address=turn.cloudflare.com
external_signaling_address=turn.cloudflare.com
```

**Guardar archivo:**

- Presiona `Ctrl + X`
- Presiona `Y` (para confirmar)
- Presiona `Enter`

---

### Paso 2.4: Recargar Configuración de Asterisk

```bash
# Recargar PJSIP
sudo asterisk -rx "pjsip reload"

# Verificar que se aplicaron los cambios
sudo asterisk -rx "pjsip show settings" | grep -i stun
```

**Resultado esperado:**

```
stun_server=stun.cloudflare.com:3478
```

✅ Si ves esta línea, la configuración se aplicó correctamente.

---

## PARTE 3: CONFIGURACIÓN DE FIREWALL

### Paso 3.1: Permitir Tráfico a Servidores TURN de Cloudflare

```bash
# Permitir puertos TURN salientes (UDP y TCP)
sudo firewall-cmd --permanent --add-port=3478/udp
sudo firewall-cmd --permanent --add-port=3478/tcp
sudo firewall-cmd --permanent --add-port=5349/tcp
sudo firewall-cmd --permanent --add-port=53/udp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp

# Aplicar cambios
sudo firewall-cmd --reload

# Verificar
sudo firewall-cmd --list-ports
```

**Resultado esperado:** Deberías ver todos los puertos listados.

✅ El firewall ahora permite conexiones salientes a Cloudflare TURN.

---

### Paso 3.2: Verificar Conectividad a Cloudflare

```bash
# Probar conexión a STUN
ping -c 3 stun.cloudflare.com

# Probar conexión a TURN
ping -c 3 turn.cloudflare.com
```

**Resultado esperado:** Deberías recibir respuestas de ping.

✅ Si recibes respuestas, la conectividad es correcta.

---

## PARTE 4: GENERAR CREDENCIALES TURN

### Paso 4.1: Obtener Credenciales de Cloudflare

**Este paso requiere credenciales de la cuenta de Cloudflare.**

Necesitas pedirle al equipo frontend:

- **Account ID de Cloudflare**
- **API Token de Cloudflare**

**ESPERA AQUÍ hasta recibir estas credenciales.**

---

### Paso 4.2: Generar Credenciales TURN (OMITIR PASO)

```JSON
{
    "iceServers": [
        {
            "urls": [
                "stun:stun.cloudflare.com:3478",
                "stun:stun.cloudflare.com:53"
            ]
        },
        {
            "urls": [
                "turn:turn.cloudflare.com:3478?transport=udp",
                "turn:turn.cloudflare.com:3478?transport=tcp",
                "turns:turn.cloudflare.com:5349?transport=tcp",
                "turn:turn.cloudflare.com:53?transport=udp",
                "turn:turn.cloudflare.com:80?transport=tcp",
                "turns:turn.cloudflare.com:443?transport=tcp"
            ],
            "username": "g0b8b5f2782a709fcf6781f2897dcebaf91ac2af0b110f940ee140cf94efa678",
            "credential": "86fefaea81192f041a7852a91924daecf36666fe68e1aecbcd00e9ded1816a34"
        }
    ]
}
```

**Estos datos ya lo tenemos en el equipo de frontend.**

---

## PARTE 5: PRUEBAS Y VERIFICACIÓN

### Paso 5.1: Verificar Estado del Tunnel

```bash
# Ver estado del servicio
sudo systemctl status cloudflared

# Ver logs en tiempo real
sudo journalctl -u cloudflared -f
```

**Presiona `Ctrl + C` para salir de los logs.**

✅ El servicio debe estar "active (running)".

---

### Paso 5.2: Verificar Endpoint WebSocket Local

```bash
# Verificar que el puerto 8089 está escuchando
sudo netstat -tlnp | grep 8089
```

**Resultado esperado:**

```
tcp   0   0 0.0.0.0:8089   0.0.0.0:*   LISTEN   xxxx/asterisk
```

✅ Si ves esta línea, el WebSocket está funcionando.

---

### Paso 5.3: Prueba de Conectividad WebSocket (Opcional)

Si tienes `websocat` instalado:

```bash
# Instalar websocat (opcional)
sudo yum install -y websocat

# Probar WebSocket localmente
websocat wss://127.0.0.1:8089/ws --insecure
```

**Si se conecta, verás datos binarios o mensajes SIP.**

Presiona `Ctrl + C` para salir.

---

## PARTE 6: INFORMACIÓN PARA EQUIPO FRONTEND

### Paso 6.1: Recopilar Información

Completa este formulario con la información del servidor:

```
===============================================
CONFIGURACIÓN COMPLETADA - PBX SERVER
===============================================

INFORMACIÓN DEL TUNNEL:
-----------------------
✅ Cloudflared instalado: SÍ
✅ Servicio activo: SÍ
✅ Tunnel ID: f407aef2-7a56-4f0b-b32c-4933c69dc676
✅ Nombre del tunnel: quironix-pbx

CONFIGURACIÓN DE ASTERISK:
--------------------------
✅ STUN configurado: stun.cloudflare.com:3478
✅ TURN configurado: turn.cloudflare.com
✅ ICE support: Habilitado
✅ WebSocket puerto: 8089

CREDENCIALES TURN GENERADAS:
----------------------------
Username (key): _____________________________
Credential (secret): _____________________________

CONFIGURACIÓN DE RED:
---------------------
IP Privada servidor: 172.17.16.24
Puerto WebSocket: 8089
Firewall: Configurado

ESTADO ACTUAL:
--------------
Fecha de configuración: _______________
Realizado por: _______________
Tunnel Status: ACTIVO
WebSocket Status: ACTIVO

PRÓXIMOS PASOS PARA FRONTEND:
------------------------------
1. Configurar hostname route en Cloudflare
2. Configurar DNS (en GoDaddy o Cloudflare)
3. Actualizar código frontend con credenciales TURN
4. Probar conexión sin VPN

===============================================
```

### Paso 6.2: Enviar Información

**Envía este formulario completo al equipo de frontend**, especialmente:

- Las credenciales TURN (username y credential)
- Confirmación de que el tunnel está activo

---

## PARTE 7: MONITOREO Y MANTENIMIENTO

### Monitoreo Diario

```bash
# Ver estado del tunnel
sudo systemctl status cloudflared

# Ver últimos logs
sudo journalctl -u cloudflared -n 50

# Ver estado de Asterisk
sudo asterisk -rx "pjsip show endpoints"
```

---

### Monitoreo de Logs en Tiempo Real

```bash
# Ver logs del tunnel
sudo journalctl -u cloudflared -f

# En otra terminal, ver logs de Asterisk
sudo tail -f /var/log/asterisk/full
```

---

### Comandos Útiles de Diagnóstico

```bash
# Ver transporte WebSocket
sudo asterisk -rx "pjsip show transports"

# Ver configuración STUN/TURN
sudo asterisk -rx "pjsip show settings" | grep -E "stun|turn|ice"

# Ver endpoints activos
sudo asterisk -rx "pjsip show endpoints"

# Ver llamadas activas
sudo asterisk -rx "core show channels"
```

---

### Reiniciar Servicios (Si es Necesario)

```bash
# Reiniciar tunnel
sudo systemctl restart cloudflared

# Reiniciar Asterisk
sudo systemctl restart asterisk

# Verificar ambos
sudo systemctl status cloudflared
sudo systemctl status asterisk
```

---

## TROUBLESHOOTING

### Problema: Tunnel no se conecta

**Síntomas:**

```bash
sudo systemctl status cloudflared
# Muestra: failed o inactive
```

**Solución:**

```bash
# Ver logs de error
sudo journalctl -u cloudflared -n 100

# Verificar que el token es correcto
sudo nano /etc/systemd/system/cloudflared.service
# Verifica que el token está completo

# Reinstalar si es necesario
sudo cloudflared service uninstall
sudo cloudflared service install <TOKEN_CORRECTO>
sudo systemctl start cloudflared
```

---

### Problema: STUN/TURN no funciona

**Verificar configuración:**

```bash
# Ver configuración actual
sudo asterisk -rx "pjsip show settings" | grep -i stun

# Si no aparece, revisar archivo
sudo nano /etc/asterisk/pjsip.conf

# Buscar: stun_server=stun.cloudflare.com:3478
# Si no está, agregarlo y recargar:
sudo asterisk -rx "pjsip reload"
```

---

### Problema: Puerto 8089 no responde

**Verificar:**

```bash
# Ver si Asterisk está escuchando
sudo netstat -tlnp | grep 8089

# Si no hay salida, verificar FreePBX
# Ir a: Settings → Asterisk SIP Settings → WebRTC Settings
# Verificar que WebRTC está habilitado en puerto 8089

# Reiniciar Asterisk
sudo systemctl restart asterisk
```

---

### Problema: Firewall bloqueando conexiones

**Verificar reglas:**

```bash
# Ver todas las reglas
sudo firewall-cmd --list-all

# Ver puertos permitidos
sudo firewall-cmd --list-ports

# Si faltan puertos, agregar:
sudo firewall-cmd --permanent --add-port=3478/udp
sudo firewall-cmd --reload
```

---

## ROLLBACK (Revertir Cambios)

Si necesitas revertir la configuración:

### Paso 1: Detener Tunnel

```bash
sudo systemctl stop cloudflared
sudo systemctl disable cloudflared
```

### Paso 2: Restaurar Configuración de Asterisk

```bash
# Restaurar backup
sudo cp /root/backups/asterisk/pjsip.conf.backup.YYYYMMDD /etc/asterisk/pjsip.conf

# Recargar
sudo asterisk -rx "pjsip reload"
```

### Paso 3: Remover Reglas de Firewall (Opcional)

```bash
sudo firewall-cmd --permanent --remove-port=3478/udp
sudo firewall-cmd --permanent --remove-port=3478/tcp
sudo firewall-cmd --permanent --remove-port=5349/tcp
sudo firewall-cmd --reload
```

---

## CHECKLIST FINAL

Antes de notificar al equipo frontend, verifica:

- [ ] `sudo systemctl status cloudflared` muestra "active (running)"
- [ ] `sudo journalctl -u cloudflared -n 10` muestra 4 conexiones registradas
- [ ] `sudo asterisk -rx "pjsip show settings" | grep stun` muestra `stun.cloudflare.com:3478`
- [ ] `sudo netstat -tlnp | grep 8089` muestra que Asterisk está escuchando
- [ ] Tienes las credenciales TURN (username y credential) guardadas
- [ ] Has completado el formulario de información para frontend
- [ ] Firewall permite puertos 3478/udp, 3478/tcp, 5349/tcp

**Si todos los checks están ✅, la configuración del servidor está completa.**

---

## CONTACTO Y SOPORTE

**En caso de problemas:**

1. Revisar esta guía en sección "Troubleshooting"
2. Contactar al equipo de desarrollo frontend
3. Revisar logs: `sudo journalctl -u cloudflared -f`

**Archivos importantes:**

- Configuración tunnel: `/etc/systemd/system/cloudflared.service`
- Configuración Asterisk: `/etc/asterisk/pjsip.conf`
- Backup: `/root/backups/asterisk/pjsip.conf.backup.*`
- Logs tunnel: `sudo journalctl -u cloudflared`
- Logs Asterisk: `/var/log/asterisk/full`

---

**FIN DEL TUTORIAL - PARTE SERVIDOR PBX**
