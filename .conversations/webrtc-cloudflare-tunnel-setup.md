# Conversación: Configuración WebRTC con Cloudflare Tunnel

**Fecha:** 27 de Enero de 2026
**Tema:** Eliminación de dependencia de VPN para conexiones WebRTC usando Cloudflare Tunnel + TURN

---

## Resumen de la Implementación

### Objetivo
Configurar el frontend Next.js para conectarse al servidor PBX (Asterisk/FreePBX en Rocky Linux 8) sin necesidad de VPN, usando Cloudflare Tunnel para el WebSocket y Cloudflare TURN para media relay.

---

## Información del Proyecto

### Infraestructura
- **Frontend:** Next.js 15 + React 19 + JsSIP
- **PBX Server:** Rocky Linux 8, Asterisk 18.19.0, IP: 172.17.16.24
- **WebSocket Port:** 8089 (WSS)
- **Dominio:** quironix.com
- **DNS:** Manejado en GoDaddy

### Cloudflare
- **Account ID:** a0ccc9a891b608fb98c521a44f88e80b
- **Tunnel ID:** f407aef2-7a56-4f0b-b32c-4933c69dc676
- **Tunnel Name:** quironix-pbx
- **Public Hostname:** pbx.quironix.com

---

## Archivos de Documentación Creados

1. **WEBRTC_IMPLEMENTATION_GUIDE.md** - Guía completa para desarrollador frontend
2. **TUTORIAL_ADMINISTRADOR_PBX.md** - Tutorial paso a paso para admin del servidor
3. **TUTORIAL_FRONTEND_DEVELOPER.md** - Tutorial específico para frontend (español)
4. **PBX_SERVER_SETUP.md** - Referencia técnica detallada del servidor
5. **SERVER_MANAGER_INSTRUCTIONS.md** - Instrucciones concisas para admin
6. **CLOUDFLARE_TUNNEL_DASHBOARD_GUIDE.md** - Guía de configuración vía dashboard

---

## Configuración Completada

### 1. Frontend (✅ COMPLETADO)

#### `.env.local`
```bash
# WebRTC / Issabel PBX Configuration - Cloudflare Tunnel
NEXT_PUBLIC_WEBRTC_SIP_DOMAIN=172.17.16.24
NEXT_PUBLIC_WEBRTC_WS_URI=wss://pbx.quironix.com/ws
NEXT_PUBLIC_WEBRTC_SIP_PASSWORD=9c8c35689dca898e0cbad7fc622944ca

# Cloudflare TURN Credentials
NEXT_PUBLIC_TURN_USERNAME=g0b8b5f2782a709fcf6781f2897dcebaf91ac2af0b110f940ee140cf94efa678
NEXT_PUBLIC_TURN_CREDENTIAL=86fefaea81192f041a7852a91924daecf36666fe68e1aecbcd00e9ded1816a34
```

#### Archivos Modificados
1. ✅ `src/services/webrtc/types.ts` - Agregado `iceServers?: RTCIceServer[]`
2. ✅ `src/services/webrtc/index.ts` - Configuración ICE_SERVERS completa
3. ✅ `src/hooks/useWebRTCPhone.ts` - Agregado `ice_servers: config.iceServers || []`

### 2. Cloudflare Calls (✅ COMPLETADO)

#### TURN Credentials Generadas
```json
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

### 3. Cloudflare Tunnel (✅ CONFIGURADO, ⚠️ PATH PENDIENTE)

#### Estado del Tunnel en el Servidor
```bash
● cloudflared.service - cloudflared
   Active: active (running) since Sat 2026-01-24 06:29:31 -03; 3 days ago

# 4 conexiones registradas exitosamente:
INF Registered tunnel connection connIndex=0 location=scl02 protocol=quic
INF Registered tunnel connection connIndex=1 location=scl06 protocol=quic
INF Registered tunnel connection connIndex=2 location=scl02 protocol=quic
INF Registered tunnel connection connIndex=3 location=scl04 protocol=quic
```

#### Configuración Actual del Tunnel
```json
{
  "ingress": [
    {
      "hostname": "pbx.quironix.com",
      "originRequest": {"noTLSVerify": true},
      "service": "https://localhost:8089"
    },
    {
      "service": "http_status:404"
    }
  ]
}
```

#### Asterisk Puerto 8089 - Confirmado
```bash
netstat -tlnp | grep 8089
tcp  0.0.0.0:8089  LISTEN  1595/asterisk
```

---

## Problema Actual (⚠️ EN PROGRESO)

### Síntomas
- ✅ Tunnel está activo y saludable
- ✅ cloudflared conectado (4 conexiones)
- ✅ Puerto 8089 escuchando en Asterisk
- ❌ WebSocket devuelve 404

### Logs del Error
```
Unsolicited response received on idle HTTP channel:
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>404 Not Found</title>
</head><body>
<h1>Not Found</h1>
<p>The requested URL was not found on this server.</p>
<hr />
<address>Asterisk/18.19.0</address>
</body></html>
```

### Causa Probable
El **path del WebSocket** podría estar mal configurado:
- Frontend espera: `wss://pbx.quironix.com/ws`
- Asterisk podría esperar: `/ws`, `/`, `/asterisk/ws`, u otro path

### Próximos Pasos para Resolver

1. **Verificar configuración HTTP de Asterisk:**
   ```bash
   sudo asterisk -rx "http show status"
   sudo cat /etc/asterisk/http.conf
   sudo grep -r "ws" /etc/asterisk/http*.conf
   ```

2. **Verificar path correcto:**
   ```bash
   # Probar localmente en el servidor
   curl -I -k https://localhost:8089/ws
   curl -I -k https://localhost:8089/
   curl -I http://localhost:8089/ws
   ```

3. **Ajustar configuración en Cloudflare:**
   - Verificar si necesita path `/ws` explícito
   - Probar HTTP vs HTTPS
   - Confirmar `No TLS Verify: ON`

4. **Testing con wscat:**
   ```bash
   wscat -c wss://pbx.quironix.com/ws
   ```

---

## Credenciales y Tokens

### Cloudflare API
- **Email:** soporte_it@quironix.com
- **Global API Key:** 814187230ab8e8f15a00f372ec46a7950c6af

### Tunnel Token (para reinstalación si necesario)
```
eyJhIjoiYTBjY2M5YTg5MWI2MDhmYjk4YzUyMWE0NGY4OGU4MGIiLCJ0IjoiZjQwN2FlZjItN2E1Ni00ZjBiLWIzMmMtNDkzM2M2OWRjNjc2IiwicyI6Ik16azVPR0ZrTUdNdFpUUTFNaTAwTldVeExUbGlZMkV0WW1Fd05HVmpaVGN4TWpOaiJ9
```

---

## Comandos Útiles

### Verificar Estado del Tunnel
```bash
# En el servidor PBX
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -n 50
sudo journalctl -u cloudflared -f
```

### Testing desde Local
```bash
# Verificar DNS
nslookup pbx.quironix.com

# Probar HTTPS
curl -I https://pbx.quironix.com

# Probar WebSocket
wscat -c wss://pbx.quironix.com/ws
```

### Verificar Asterisk
```bash
# Estado del puerto
sudo netstat -tlnp | grep 8089

# Ver transportes WebRTC
sudo asterisk -rx "pjsip show transports"

# Ver configuración HTTP
sudo asterisk -rx "http show status"
```

---

## Configuración Recomendada para Cloudflare Tunnel

### Opción 1: Con Path Explícito
```yaml
Subdomain: pbx
Domain: quironix.com
Path: /ws
Service Type: HTTPS
URL: localhost:8089
No TLS Verify: ON
Connect Timeout: 30s
TCP Keep-Alive: 30s
```

### Opción 2: Sin Path (Raíz)
```yaml
Subdomain: pbx
Domain: quironix.com
Path: (vacío)
Service Type: HTTPS
URL: localhost:8089
No TLS Verify: ON
Connect Timeout: 30s
TCP Keep-Alive: 30s
```

---

## Testing del Frontend (Cuando esté listo)

### Pasos para Probar
1. **Desconectar VPN**
2. **Iniciar dev server:**
   ```bash
   npm run dev
   ```
3. **Abrir DevTools (F12) → Console**
4. **Navegar al dashboard con WebRTC**

### Logs Esperados
```javascript
🔗 [WebRTC] WebSocket conectado  // ✅ Bueno
✅ Conectado a la central telefónica  // ✅ Bueno

// Al hacer llamada:
ICE: RTCIceCandidate {
  candidate: "... typ relay ..."  // ✅ Usando TURN
}
```

---

## Costos

| Servicio | Costo |
|----------|-------|
| Cloudflare Tunnel | GRATIS (ilimitado) |
| Cloudflare STUN | GRATIS (ilimitado) |
| Cloudflare TURN | GRATIS hasta 1TB/mes |
| **Estimado uso mensual** | ~120-200 GB |
| **Costo actual** | $0 |

---

## Solución de Problemas Comunes

### Error 502 Bad Gateway
- Tunnel configurado pero no tiene Public Hostname
- **Solución:** Configurar ruta en Cloudflare Dashboard

### Error 404 Not Found
- cloudflared no está corriendo en el servidor
- O el path del WebSocket es incorrecto
- **Solución:** Verificar `systemctl status cloudflared` y path de Asterisk

### WebSocket se conecta pero llamada falla
- Credenciales TURN incorrectas o faltantes
- **Solución:** Verificar `.env.local` y reiniciar dev server

### Sin candidatos "relay" en ICE
- TURN no está configurado
- **Solución:** Verificar credenciales TURN en frontend y Asterisk

---

## Estado Final de la Implementación

### ✅ Completado
- [x] Cloudflare Calls habilitado
- [x] Credenciales TURN generadas
- [x] Frontend configurado con TURN
- [x] Tunnel creado y activo
- [x] DNS configurado
- [x] cloudflared instalado y corriendo en servidor
- [x] Public Hostname configurado en Cloudflare

### ⚠️ En Progreso
- [ ] Resolver error 404 del WebSocket (path incorrecto)
- [ ] Verificar configuración HTTP de Asterisk
- [ ] Probar conexión WebSocket sin VPN
- [ ] Testing de llamadas sin VPN

### ⏳ Pendiente
- [ ] Configuración TURN en Asterisk (Paso 2 del tutorial admin)
- [ ] Configuración firewall en servidor (Paso 3 del tutorial admin)
- [ ] Testing completo end-to-end
- [ ] Deployment a producción

---

## Recursos y Referencias

### Documentación Cloudflare
- Tunnel Setup: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
- TURN Service: https://developers.cloudflare.com/realtime/turn/
- VoIP Reference: https://developers.cloudflare.com/reference-architecture/diagrams/sase/deploying-self-hosted-voip-services-for-hybrid-users/

### Testing Tools
- Trickle ICE: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
- WebSocket Tester: https://www.piesocket.com/websocket-tester

### Documentación del Proyecto
- `TUTORIAL_FRONTEND_DEVELOPER.md` - Guía principal para frontend
- `TUTORIAL_ADMINISTRADOR_PBX.md` - Guía principal para admin servidor

---

## Notas Importantes

1. **No usar `172.17.16.24` en la configuración del tunnel** - Usar `localhost` porque cloudflared corre en el mismo servidor
2. **Siempre usar `No TLS Verify: ON`** - Asterisk probablemente usa certificado autofirmado
3. **El path `/ws` es crítico** - Debe coincidir con la configuración de Asterisk
4. **TURN es esencial** - Sin TURN, las llamadas no funcionarán sin VPN

---

## Contactos

- **Desarrollador Frontend:** Usuario actual
- **Administrador PBX:** (enviar instrucciones del tutorial)
- **Email Cloudflare:** soporte_it@quironix.com

---

**Última actualización:** 27 de Enero de 2026
**Estado:** En progreso - Resolviendo path del WebSocket
