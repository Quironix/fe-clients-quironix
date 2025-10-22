# Guía de Debugging WebRTC

## 🚀 Test Rápido desde la UI

### Botón "Probar Conexión WebSocket"

La forma más rápida de diagnosticar problemas es usar el botón de test integrado:

**Ubicación:**
1. En el diálogo "Conectar PBX" → Botón **"Probar Conexión WebSocket"** (parte inferior)
2. Cuando estés conectado → Botón **"Test"** junto a "Desconectar"

**Cómo usar:**
1. Haz clic en "Conectar PBX" (o en "Test" si ya estás conectado)
2. Haz clic en **"Probar Conexión WebSocket"**
3. Abre la consola del navegador (**F12**)
4. Revisa los logs del test (marcados con 🧪)

**Resultados:**
- ✅ **Conexión exitosa:** Verás "Conexión WebSocket exitosa!" en un toast verde
- ❌ **Error de conexión:** Verás el error específico en la consola y un toast rojo
- ⏳ **Timeout:** Si pasan 10 segundos sin respuesta, hay problema de conectividad

## Consola del Navegador

### 1. Abrir DevTools

**Chrome/Edge:**
- Mac: `Cmd + Option + J`
- Windows/Linux: `Ctrl + Shift + J`

**Firefox:**
- Mac: `Cmd + Option + K`
- Windows/Linux: `Ctrl + Shift + K`

### 2. Revisar Logs de Conexión

Una vez que haces clic en "Conectar PBX" o en un anexo de prueba, busca en la consola los siguientes logs:

#### ✅ Flujo de Conexión Exitoso

```
🔄 [WebRTC] Iniciando registro...
📋 [WebRTC] Config: { sipUser: "6170", sipDomain: "172.17.16.24", wsUri: "wss://172.17.16.24:8089/ws" }
📦 [WebRTC] Cargando JsSIP...
✅ [WebRTC] JsSIP cargado correctamente
🐛 [WebRTC] Debug de JsSIP habilitado
🔌 [WebRTC] Creando WebSocket: wss://172.17.16.24:8089/ws
⚙️ [WebRTC] Configuración UA: { uri: "sip:6170@172.17.16.24", contact_uri: "sip:6170@172.17.16.24" }
🚀 [WebRTC] Iniciando User Agent...
✅ [WebRTC] User Agent iniciado, esperando registro...
🔗 [WebRTC] WebSocket conectado
✅ [WebRTC] Registrado en PBX exitosamente
```

#### ❌ Errores Comunes

**1. No hay configuración:**
```
❌ [WebRTC] No hay configuración disponible
```
**Solución:** Asegúrate de hacer clic primero en "Conectar PBX" y seleccionar un anexo.

**2. Fallo en el registro:**
```
❌ [WebRTC] Registro fallido: {...}
❌ [WebRTC] Detalles del error: { cause: "...", response: "..." }
```
**Solución:** Verifica las credenciales y la conectividad con el servidor.

**3. WebSocket desconectado:**
```
⚠️ [WebRTC] WebSocket desconectado
```
**Solución:** Verifica la conectividad de red con el servidor Issabel.

## Network Tab - Inspección de WebSocket

### 1. Abrir la pestaña Network

En DevTools, ve a la pestaña **Network** (Red).

### 2. Filtrar por WebSocket

- Haz clic en el botón **WS** en la barra de filtros
- Esto mostrará solo conexiones WebSocket

### 3. Conectar a la PBX

1. Haz clic en "Conectar PBX" y selecciona un anexo
2. En la pestaña Network, deberías ver una nueva conexión:
   - **Name:** `ws` o similar
   - **Status:** `101 Switching Protocols` (exitoso)
   - **Type:** `websocket`

### 4. Inspeccionar Mensajes WebSocket

1. Haz clic en la conexión WebSocket
2. Ve a la pestaña **Messages** (Mensajes)
3. Aquí verás todos los mensajes SIP que se envían y reciben:

#### Mensajes de Registro Exitoso

```
↑ REGISTER sip:172.17.16.24 SIP/2.0
  Via: SIP/2.0/WSS ...
  From: <sip:6170@172.17.16.24>
  To: <sip:6170@172.17.16.24>
  ...

↓ SIP/2.0 200 OK
  Via: SIP/2.0/WSS ...
  From: <sip:6170@172.17.16.24>
  To: <sip:6170@172.17.16.24>;tag=...
  ...
```

#### Mensajes de Error

```
↓ SIP/2.0 401 Unauthorized
  → Credenciales incorrectas

↓ SIP/2.0 403 Forbidden
  → Usuario no tiene permisos

↓ SIP/2.0 404 Not Found
  → Usuario no existe en PBX
```

### 5. Inspeccionar Estado de la Conexión

En la pestaña **Headers** de la conexión WebSocket:

- **Request URL:** `wss://172.17.16.24:8089/ws`
- **Status Code:** `101 Switching Protocols`
- **Upgrade:** `websocket`
- **Connection:** `Upgrade`

## Logs de JsSIP (Detallados)

Con el debug habilitado (`JsSIP.debug.enable("JsSIP:*")`), verás logs muy detallados:

```
JsSIP:Transport connecting to wss://172.17.16.24:8089/ws
JsSIP:Transport WebSocket connected
JsSIP:UA registration requested
JsSIP:Registrator sending REGISTER
JsSIP:Transport sending message:
  REGISTER sip:172.17.16.24 SIP/2.0
  ...
JsSIP:Transport received message:
  SIP/2.0 200 OK
  ...
JsSIP:Registrator registered
```

### Filtrar Logs de JsSIP

En la consola del navegador, puedes filtrar logs escribiendo:

- `JsSIP:Transport` - Solo logs de transporte/WebSocket
- `JsSIP:Registrator` - Solo logs de registro
- `JsSIP:RTCSession` - Solo logs de llamadas

## Verificar Conectividad de Red

### Desde la Terminal (fuera del navegador)

```bash
# 1. Verificar que el servidor responde
ping 172.17.16.24

# 2. Verificar puerto WebSocket (8089)
nc -zv 172.17.16.24 8089

# 3. Escanear puertos con nmap
nmap -p 5060,8088,8089 172.17.16.24

# 4. Verificar conexión SSL/TLS
openssl s_client -connect 172.17.16.24:8089
```

### Desde el Navegador

1. Abre la consola del navegador (F12)
2. Ejecuta este comando para probar el WebSocket manualmente:

```javascript
const ws = new WebSocket('wss://172.17.16.24:8089/ws');
ws.onopen = () => console.log('✅ WebSocket abierto');
ws.onerror = (e) => console.error('❌ Error WebSocket:', e);
ws.onclose = (e) => console.log('WebSocket cerrado:', e.code, e.reason);
```

#### Códigos de Cierre Comunes

- `1000` - Cierre normal
- `1001` - El servidor se fue
- `1006` - Conexión cerrada anormalmente (sin respuesta)
- `1015` - Error de TLS/SSL

## Problemas Comunes y Soluciones

### "Conectando..." infinito

**Posibles causas:**
1. El WebSocket no se puede conectar al servidor
2. El servidor rechaza la conexión
3. Problemas de certificado SSL
4. **Path incorrecto en el WebSocket URI** ⚠️

**Verificar el Path del WebSocket:**

El path `/ws` es estándar en Asterisk/Issabel pero **puede ser diferente** en tu servidor.

**Paths comunes:**
- `wss://172.17.16.24:8089/ws` (estándar Asterisk/Issabel)
- `wss://172.17.16.24:8089/` (sin path)
- `wss://172.17.16.24:8089/websocket` (alternativo)

**Cómo verificar el path correcto:**
1. Pregunta al administrador del servidor Issabel
2. Revisa la configuración SSH:
   ```bash
   ssh root@172.17.16.24
   cat /etc/asterisk/http.conf | grep -i websocket
   ```
3. Usa el botón "Probar Conexión WebSocket" y revisa el error en consola

**Cambiar el path:**

Edita `.env.local`:
```bash
NEXT_PUBLIC_WEBRTC_WS_URI=wss://172.17.16.24:8089/TU_PATH_AQUI
```

**Probar en consola:**
```bash
# En la terminal
curl -k https://172.17.16.24:8089/ws
```

### Certificado SSL Auto-firmado

Si el servidor usa un certificado auto-firmado, el navegador puede bloquear la conexión.

**Solución temporal:**
1. Navega a `https://172.17.16.24:8089` en el navegador
2. Acepta el certificado (clic en "Avanzado" → "Continuar")
3. Vuelve a la aplicación e intenta conectar

### Firewall o Proxy

Si estás detrás de un firewall corporativo:

1. Verifica que el puerto `8089` esté abierto
2. Algunos proxies bloquean WebSockets
3. Prueba desde una red diferente (ej: hotspot móvil)

### Error CORS

Si ves errores de CORS en la consola:

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solución:** El servidor Issabel debe configurar los headers CORS correctamente.

## Checklist de Debugging

- [ ] Abrir DevTools y consola
- [ ] Hacer clic en "Conectar PBX"
- [ ] Verificar logs con prefijo `[WebRTC]`
- [ ] Revisar pestaña Network → WS
- [ ] Verificar que WebSocket muestra status `101`
- [ ] Revisar mensajes SIP en la pestaña Messages
- [ ] Verificar logs de JsSIP en consola
- [ ] Si falla, probar conexión manual con `new WebSocket()`
- [ ] Verificar conectividad de red con `ping` y `nc`
- [ ] Revisar certificado SSL si es necesario
