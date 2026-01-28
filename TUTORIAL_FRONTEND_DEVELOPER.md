# Tutorial para Desarrollador Frontend - WebRTC sin VPN

## Información del Proyecto

- **Proyecto:** Next.js 15 + WebRTC con JsSIP
- **Tunnel ID:** f407aef2-7a56-4f0b-b32c-4933c69dc676
- **Nombre del Tunnel:** quironix-pbx
- **DNS actual:** GoDaddy
- **PBX Server:** Rocky Linux 8 (IP: 172.17.16.24)

**Objetivo:** Configurar el frontend para conectarse al PBX sin VPN usando Cloudflare Tunnel + TURN.

**Tiempo estimado:** 3-4 horas

---

## PARTE 1: CONFIGURACIÓN DE CLOUDFLARE

### Paso 1.1: Acceder a Cloudflare Zero Trust

1. Ve a: https://dash.cloudflare.com
2. Inicia sesión con tu cuenta de Cloudflare
3. En el sidebar izquierdo, busca **"Zero Trust"**
4. Haz clic en **"Zero Trust"**

**Si es la primera vez:**

- Te pedirá crear un "team name"
- Elige el plan **"Free"** (gratuito)
- Continúa con la configuración

---

### Paso 1.2: Obtener el Token del Tunnel

1. En Zero Trust, ve a: **Networks** → **Tunnels**
2. Deberías ver tu tunnel: **"quironix-pbx"** con ID `f407aef2-7a56-4f0b-b32c-4933c69dc676`
3. Haz clic en el nombre del tunnel: **"quironix-pbx"**
4. Busca la sección **"Install and run a connector"**
5. Verás comandos de instalación con un token largo

**TOKEN:**

```
eyJhIjoiYTBjY2M5YTg5MWI2MDhmYjk4YzUyMWE0NGY4OGU4MGIiLCJ0IjoiZjQwN2FlZjItN2E1Ni00ZjBiLWIzMmMtNDkzM2M2OWRjNjc2IiwicyI6Ik16azVPR0ZrTUdNdFpUUTFNaTAwTldVeExUbGlZMkV0WW1Fd05HVmpaVGN4TWpOaiJ9
```

6. **Copia todo el token** (es un string muy largo)

**✅ Guarda este token, lo necesitarás enviar al administrador del PBX.**

---

### Paso 1.3: Configurar Public Hostname Route

Ahora vas a configurar la ruta para el WebSocket.

1. En la página del tunnel, ve a la pestaña **"Public Hostname"**
2. Haz clic en **"Add a public hostname"**

**Configuración del formulario:**

**Subdomain:**

```
pbx
```

**Domain:**

- Aquí necesitas tener un dominio en Cloudflare
- **SI NO TIENES UN DOMINIO EN CLOUDFLARE**, ve a la sección "Opción B: DNS en GoDaddy" más abajo

**Path:**

```
(dejar vacío)
```

**Service:**

- Type: Selecciona **"HTTPS"**
- URL:

```
172.17.16.24:8089
```

**Additional application settings** (expande esta sección):

Haz clic en **"TLS"**:

- **No TLS Verify:** Activa esta opción (toggle a ON)

Haz clic en **"HTTP Settings"**:

- **Connect Timeout:** `30s`
- **TCP Keep-Alive:** `30s`

3. Haz clic en **"Save hostname"**

**✅ Deberías ver:**

```
pbx.tudominio.com → https://172.17.16.24:8089
Status: HEALTHY
```

---

### OPCIÓN A: DNS en Cloudflare

Si tu dominio está en Cloudflare:

1. Ve a tu dominio en Cloudflare Dashboard
2. Ve a **DNS** → **Records**
3. Cloudflare debería haber creado automáticamente un registro CNAME:
   - **Type:** CNAME
   - **Name:** pbx
   - **Target:** `f407aef2-7a56-4f0b-b32c-4933c69dc676.cfargotunnel.com`
   - **Proxy status:** Proxied (nube naranja)

✅ Si existe, continúa al siguiente paso.

**Si NO existe**, créalo manualmente:

- Haz clic en **"Add record"**
- Type: **CNAME**
- Name: **pbx**
- Target: **f407aef2-7a56-4f0b-b32c-4933c69dc676.cfargotunnel.com**
- Proxy status: **Proxied** (activa la nube naranja)
- TTL: **Auto**
- Clic en **Save**

---

### OPCIÓN B: DNS en GoDaddy

Si tu dominio está en GoDaddy (como es tu caso):

**Tienes 2 opciones:**

#### Opción B1: Transferir DNS a Cloudflare (Recomendado)

1. En Cloudflare Dashboard, ve a **"Add a Site"**
2. Ingresa tu dominio: `tudominio.com`
3. Selecciona plan **"Free"**
4. Cloudflare te mostrará los nameservers:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
5. Ve a GoDaddy → Manage Domain → Nameservers
6. Cambia a **"Custom"**
7. Ingresa los nameservers de Cloudflare
8. Guarda cambios
9. Espera 24-48 horas para propagación (pero usualmente funciona en 1-2 horas)

**Luego sigue "Opción A: DNS en Cloudflare"**

#### Opción B2: Mantener DNS en GoDaddy

En GoDaddy:

1. Ve a tu dominio → DNS Management
2. Agrega un registro CNAME:
   - **Type:** CNAME
   - **Host:** pbx
   - **Points to:** `f407aef2-7a56-4f0b-b32c-4933c69dc676.cfargotunnel.com`
   - **TTL:** 600 (10 minutos)
3. Guarda

**⚠️ IMPORTANTE:** Con esta opción NO tendrás el beneficio del proxy de Cloudflare (DDoS protection, caching, etc.). El tunnel funcionará, pero sin protecciones adicionales.

**Espera 10-30 minutos para propagación DNS.**

---

### Paso 1.4: Verificar DNS

```bash
# En tu terminal local
nslookup pbx.tudominio.com
```

**Resultado esperado (Opción A - DNS en Cloudflare):**

```
Non-authoritative answer:
pbx.tudominio.com    canonical name = f407aef2-7a56-4f0b-b32c-4933c69dc676.cfargotunnel.com
```

**Resultado esperado (Opción B - DNS en GoDaddy):**

```
Non-authoritative answer:
pbx.tudominio.com    canonical name = f407aef2-7a56-4f0b-b32c-4933c69dc676.cfargotunnel.com
```

✅ Si ves el tunnel ID en la respuesta, el DNS está configurado.

---

### Paso 1.5: Obtener Account ID de Cloudflare

1. En Cloudflare Dashboard (https://dash.cloudflare.com)
2. Mira la URL en tu navegador:
   ```
   https://dash.cloudflare.com/1234567890abcdef/...
   ```
3. El string después de `.com/` es tu **Account ID**

**O:**

- Haz clic en tu foto de perfil (arriba a la derecha)
- El Account ID aparece en el dropdown

**✅ Copia y guarda tu Account ID:**

```
Account ID: ________________________________
```

---

### Paso 1.6: Crear API Token para TURN

1. Ve a: https://dash.cloudflare.com/profile/api-tokens
2. Haz clic en **"Create Token"**
3. Haz clic en **"Create Custom Token"**

**Configuración del token:**

**Token name:**

```
Quironix TURN API
```

**Permissions:**

- Haz clic en **"Add more"**
- Selecciona: **Account** → **Cloudflare Calls** → **Edit**

**Account Resources:**

- **Include** → Selecciona tu cuenta

**Client IP Address Filtering:**

- Deja vacío (o agrega IPs específicas si quieres más seguridad)

**TTL:**

- Selecciona **"1 year"** o **"Custom"** con la duración que prefieras

4. Haz clic en **"Continue to summary"**
5. Revisa y haz clic en **"Create Token"**

**⚠️ IMPORTANTE:**

- **Copia el token AHORA** - solo se muestra una vez
- Guárdalo en un lugar seguro (password manager)

**✅ Guarda tu API Token:**

```
API Token: cf_____________________________________
```

---

### Paso 1.7: Enviar Información al Administrador PBX

Crea un mensaje con esta información y envíalo al administrador del servidor PBX:

```
===============================================
INFORMACIÓN PARA CONFIGURAR SERVIDOR PBX
===============================================

TUNNEL TOKEN:
-------------
eyJhIjoiNzE4YTk5ZjQwYzU0NDU5M2E3ZDhiMGRhNDZmYWE0MjUiLCJ0Ijoio...
(pega aquí el token completo del paso 1.2)

CREDENCIALES CLOUDFLARE:
------------------------
Account ID: (pega tu Account ID del paso 1.5)
API Token: (pega tu API Token del paso 1.6)

INSTRUCCIONES:
--------------
Por favor sigue el archivo: TUTORIAL_ADMINISTRADOR_PBX.md

Una vez completado, envíame:
- TURN Username
- TURN Credential
- Confirmación de que el tunnel está activo

===============================================
```

**ESPERA AQUÍ** hasta que el administrador del PBX complete su configuración y te envíe las credenciales TURN.

---

## PARTE 2: MODIFICACIÓN DEL CÓDIGO FRONTEND

### Paso 2.1: Recibir Credenciales del Administrador PBX

Deberías recibir del administrador:

```
TURN Username: ________________________________
TURN Credential: ________________________________
```

**Guarda estos valores**, los usarás en el siguiente paso.

---

### Paso 2.2: Actualizar Variables de Entorno

Edita el archivo `.env.local` en la raíz del proyecto:

```bash
# Abrir con tu editor
code .env.local
# o
nano .env.local
```

**REEMPLAZA estas líneas:**

```bash
# ❌ CONFIGURACIÓN ANTIGUA (VPN)
# NEXT_PUBLIC_WEBRTC_WS_URI=wss://172.17.16.24:8089/ws
# NEXT_PUBLIC_WEBRTC_SIP_DOMAIN=172.17.16.24

# ✅ CONFIGURACIÓN NUEVA (Cloudflare Tunnel)
NEXT_PUBLIC_WEBRTC_WS_URI=wss://pbx.tudominio.com/ws
NEXT_PUBLIC_WEBRTC_SIP_DOMAIN=172.17.16.24

# Credenciales TURN de Cloudflare (recibidas del admin PBX)
NEXT_PUBLIC_TURN_USERNAME=tu-turn-username-aqui
NEXT_PUBLIC_TURN_CREDENTIAL=tu-turn-credential-aqui

# Mantener existente
NEXT_PUBLIC_WEBRTC_SIP_PASSWORD=tu-sip-password-actual
```

**Reemplaza:**

- `pbx.tudominio.com` → tu dominio real
- `tu-turn-username-aqui` → el username que te dio el admin
- `tu-turn-credential-aqui` → el credential que te dio el admin

**Guarda el archivo.**

---

### Paso 2.3: Actualizar TypeScript Types

Edita: `src/services/webrtc/types.ts`

**Busca la interfaz `WebRTCCredentials`** y agrega la propiedad `iceServers`:

```typescript
export interface WebRTCCredentials {
  sipUser: string;
  sipPass: string;
  sipDomain: string;
  wsUri: string;
  iceServers?: RTCIceServer[]; // ← AGREGAR ESTA LÍNEA
}
```

**Guarda el archivo.**

---

### Paso 2.4: Actualizar Servicio WebRTC

Edita: `src/services/webrtc/index.ts`

**REEMPLAZA TODO EL CONTENIDO** con este código:

```typescript
import type {
  ProvisionRequest,
  ProvisionResponse,
  WebRTCCredentials,
} from "./types";

const WEBRTC_API_URL =
  process.env.NEXT_PUBLIC_WEBRTC_API_URL || "http://172.17.16.24";

const SIP_DOMAIN = process.env.NEXT_PUBLIC_WEBRTC_SIP_DOMAIN || "172.17.16.24";

const WS_URI =
  process.env.NEXT_PUBLIC_WEBRTC_WS_URI || "wss://pbx.tudominio.com/ws";

const TURN_USERNAME = process.env.NEXT_PUBLIC_TURN_USERNAME || "";
const TURN_CREDENTIAL = process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "";

const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: "stun:stun.cloudflare.com:3478",
  },
  {
    urls: [
      "turn:turn.cloudflare.com:3478?transport=udp",
      "turn:turn.cloudflare.com:3478?transport=tcp",
      "turns:turn.cloudflare.com:5349?transport=tcp",
    ],
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  },
];

export function createDirectWebRTCConfig(
  sipUser: string,
  sipPass: string
): WebRTCCredentials {
  return {
    sipUser,
    sipPass,
    sipDomain: SIP_DOMAIN,
    wsUri: WS_URI,
    iceServers: ICE_SERVERS,
  };
}

export async function provisionWebRTC(
  credentials: ProvisionRequest
): Promise<WebRTCCredentials> {
  try {
    const response = await fetch(`${WEBRTC_API_URL}/api/provision.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ProvisionResponse = await response.json();

    if (data.status !== "ok" || !data.sip_user || !data.ws_uri) {
      throw new Error(data.message || "Invalid credentials");
    }

    return {
      sipUser: data.sip_user,
      sipPass: data.sip_pass || "",
      sipDomain: data.sip_domain || "",
      wsUri: data.ws_uri,
      iceServers: ICE_SERVERS,
    };
  } catch (error) {
    console.error("Error en provisión WebRTC:", error);
    throw error;
  }
}

export const TEST_CREDENTIALS = {
  "6170": {
    username: "6170",
    password: "9c8c35689dca898e0cbad7fc622944ca",
  },
  "6171": {
    username: "6171",
    password: "9c8c35689dca898e0cbad7fc622944ca",
  },
  "6172": {
    username: "6172",
    password: "9c8c35689dca898e0cbad7fc622944ca",
  },
  "6173": {
    username: "6173",
    password: "9c8c35689dca898e0cbad7fc622944ca",
  },
};
```

**Guarda el archivo.**

---

### Paso 2.5: Actualizar Hook useWebRTCPhone

Edita: `src/hooks/useWebRTCPhone.ts`

**Busca las líneas 76-86** (configuración de JsSIP UA):

```typescript
const configuration = {
  sockets: [socket],
  uri: `sip:${config.sipUser}@${config.sipDomain}`,
  password: config.sipPass,
  register: true,
  session_timers: false,
  register_expires: 300,
  contact_uri: `sip:${config.sipUser}@${config.sipDomain}`,
};
```

**AGREGA** la línea `ice_servers` al final:

```typescript
const configuration = {
  sockets: [socket],
  uri: `sip:${config.sipUser}@${config.sipDomain}`,
  password: config.sipPass,
  register: true,
  session_timers: false,
  register_expires: 300,
  contact_uri: `sip:${config.sipUser}@${config.sipDomain}`,
  ice_servers: config.iceServers || [], // ← AGREGAR ESTA LÍNEA
};
```

**Guarda el archivo.**

---

## PARTE 3: TESTING

### Paso 3.1: Verificar Tunnel Antes de Probar

Antes de probar el frontend, verifica que el tunnel esté funcionando:

```bash
# Desde tu terminal local
curl -I https://pbx.tudominio.com
```

**Resultado esperado:**

```
HTTP/2 200
server: cloudflare
...
```

✅ Cualquier respuesta (incluso 404) significa que el tunnel está funcionando.

**Si falla:**

- Verifica DNS con: `nslookup pbx.tudominio.com`
- Verifica que el administrador PBX tenga el servicio activo
- Espera unos minutos más para propagación DNS

---

### Paso 3.2: Probar Conexión WebSocket

```bash
# Instalar wscat si no lo tienes
npm install -g wscat

# Probar WebSocket
wscat -c wss://pbx.tudominio.com/ws
```

**Resultado esperado:**

```
Connected (press CTRL+C to quit)
```

Puedes ver datos binarios o mensajes SIP.

✅ Si te conectas, el WebSocket está funcionando.

**Presiona `Ctrl+C` para salir.**

---

### Paso 3.3: Iniciar Servidor de Desarrollo

**IMPORTANTE: Desconéctate de la VPN antes de probar.**

```bash
# Desconectar VPN
# (usa el método que tengas configurado)

# Iniciar servidor
npm run dev
```

Abre: http://localhost:5173

---

### Paso 3.4: Monitorear Consola del Navegador

1. Abre **DevTools** (F12)
2. Ve a la pestaña **Console**
3. Navega al dashboard donde se conecta WebRTC

**Busca estos logs:**

```
🔗 [WebRTC] WebSocket conectado
✅ Conectado a la central telefónica
```

✅ Si ves estos mensajes, la conexión WebSocket funciona.

---

### Paso 3.5: Verificar ICE Candidates

Con la consola abierta, haz una llamada de prueba.

**Busca logs que contengan:**

```
ICE: RTCIceCandidate {
  candidate: "candidate:... typ relay ..."
}
```

**Verifica que veas:**

- ✅ `typ relay` → Indica que está usando TURN de Cloudflare
- ✅ `raddr turn.cloudflare.com` → Confirma servidor TURN

**Si solo ves `typ host` o `typ srflx`:**

- Las credenciales TURN pueden estar incorrectas
- Verifica `.env.local`
- Reinicia el servidor de desarrollo

---

### Paso 3.6: Probar Llamada Completa

1. **Hacer una llamada** a un número de prueba
2. **Verificar:**

   - ✅ La llamada se conecta
   - ✅ Se escucha audio en ambos lados
   - ✅ No hay delay excesivo
   - ✅ La calidad es buena

3. **Verificar en consola:**
   ```
   Llamando a XXX...
   Llamada conectada
   ```

✅ Si todo funciona, la configuración está completa.

---

### Paso 3.7: Verificar Estadísticas de Conexión (Opcional)

En la consola del navegador, durante una llamada:

```javascript
// Si tienes acceso al RTCPeerConnection
const pc = currentSessionRef.current.connection;

pc.getStats().then((stats) => {
  stats.forEach((report) => {
    if (report.type === "candidate-pair" && report.state === "succeeded") {
      console.log("Conexión activa:", report);
      // Busca: "relay" en localCandidateId o remoteCandidateId
    }
  });
});
```

---

## PARTE 4: DEPLOYMENT A PRODUCCIÓN

### Paso 4.1: Actualizar Variables en Producción

En tu plataforma de deployment (Vercel, AWS, etc.):

1. Ve a **Environment Variables**
2. Agrega/actualiza:

```
NEXT_PUBLIC_WEBRTC_WS_URI=wss://pbx.tudominio.com/ws
NEXT_PUBLIC_WEBRTC_SIP_DOMAIN=172.17.16.24
NEXT_PUBLIC_TURN_USERNAME=tu-turn-username
NEXT_PUBLIC_TURN_CREDENTIAL=tu-turn-credential
NEXT_PUBLIC_WEBRTC_SIP_PASSWORD=tu-sip-password
```

---

### Paso 4.2: Build y Deploy

```bash
# Crear build de producción
npm run build

# Verificar que no hay errores
npm run type-check

# Deploy (según tu plataforma)
# Vercel:
vercel --prod

# O manual:
npm start
```

---

### Paso 4.3: Testing en Producción

1. Accede a tu app en producción
2. **Desconectar VPN**
3. Intentar conectar y hacer llamada
4. Verificar logs del navegador

✅ Si funciona sin VPN, deployment exitoso.

---

## PARTE 5: MONITOREO Y COSTOS

### Paso 5.1: Monitorear Uso de Cloudflare Calls

1. Ve a Cloudflare Dashboard
2. Selecciona tu cuenta
3. Ve a **Analytics** → **Calls**

**Métricas disponibles:**

- **Bandwidth usado** (GB)
- **Número de sesiones**
- **Duración total**

**Límite gratuito:** 1,000 GB/mes

**Uso estimado:**

- 1 hora de llamada ≈ 200 MB
- 10 usuarios × 2 horas/día × 30 días ≈ 120 GB/mes
- **Bien dentro del tier gratuito** ✅

---

### Paso 5.2: Configurar Alertas

En Cloudflare Dashboard:

1. Ve a **Notifications**
2. Haz clic en **Add**
3. Configura:
   - **Type:** Billing
   - **Threshold:** 800 GB (80% del límite)
   - **Email:** tu-email@empresa.com
4. Guarda

✅ Recibirás alerta si te acercas al límite.

---

### Paso 5.3: Revisar Salud del Tunnel

**Diariamente:**

1. Ve a Zero Trust → Networks → Tunnels
2. Verifica que **quironix-pbx** tenga estado **"Healthy"**
3. Revisa que haya 4 conexiones activas

**Si está "Down":**

- Contacta al administrador del servidor PBX
- Verifica que el servicio cloudflared esté corriendo

---

## TROUBLESHOOTING

### Problema: "WebSocket desconectado"

**Síntomas:**

```
⚠️ [WebRTC] WebSocket desconectado
```

**Verificar:**

1. **DNS resuelve correctamente:**

   ```bash
   nslookup pbx.tudominio.com
   ```

2. **Tunnel está activo:**

   - Cloudflare Dashboard → Zero Trust → Tunnels
   - Estado debe ser "Healthy"

3. **Variable de entorno correcta:**

   ```bash
   # Verificar en .env.local
   echo $NEXT_PUBLIC_WEBRTC_WS_URI
   # Debe mostrar: wss://pbx.tudominio.com/ws
   ```

4. **Reiniciar dev server:**
   ```bash
   npm run dev
   ```

---

### Problema: "Llamada fallida" o sin audio

**Síntomas:**

- Llamada se inicia pero no se conecta
- No hay audio

**Verificar:**

1. **Credenciales TURN en .env.local:**

   ```bash
   grep TURN .env.local
   # Debe mostrar username y credential
   ```

2. **ICE candidates en consola:**

   - Abrir DevTools → Console
   - Buscar logs con "ICE" o "candidate"
   - Debe haber candidatos `typ relay`

3. **Limpiar cache del navegador:**

   - Ctrl+Shift+R (hard refresh)
   - O modo incógnito

4. **Verificar que admin PBX configuró TURN:**
   - Contactar al admin
   - Verificar que configuró `/etc/asterisk/pjsip.conf`

---

### Problema: Funciona con VPN pero no sin VPN

**Causa:** Aún está usando la IP privada

**Solución:**

1. Verificar `.env.local`:

   ```bash
   cat .env.local | grep WEBRTC
   ```

2. Debe mostrar:

   ```
   NEXT_PUBLIC_WEBRTC_WS_URI=wss://pbx.tudominio.com/ws
   ```

3. **NO debe mostrar:**

   ```
   wss://172.17.16.24:8089/ws  ❌
   ```

4. Si aún muestra IP privada:
   - Editar `.env.local`
   - Cambiar a `wss://pbx.tudominio.com/ws`
   - Reiniciar: `npm run dev`
   - Limpiar cache del navegador

---

### Problema: Alta latencia o mala calidad

**Síntomas:**

- Llamadas tienen delay notable
- Audio entrecortado

**Verificar:**

1. **Red local:**

   ```bash
   ping pbx.tudominio.com
   # Debe tener <100ms
   ```

2. **TURN está siendo usado:**

   - Revisar consola del navegador
   - Buscar `typ relay` en candidates
   - TURN añade ~20-50ms de latencia (normal)

3. **Usar STUN si es posible:**
   - STUN es más rápido que TURN
   - Si ves `typ srflx`, está usando STUN (mejor)

**Optimización:**

- Si la latencia es crítica, considera usar WARP Connector
- WARP Connector elimina TURN relay (conexión más directa)

---

### Problema: TypeError en consola

**Síntomas:**

```
TypeError: Cannot read property 'iceServers' of undefined
```

**Solución:**

1. Verificar que agregaste `iceServers` en tipos:

   ```typescript
   // src/services/webrtc/types.ts
   iceServers?: RTCIceServer[];  // ← Debe existir
   ```

2. Verificar que agregaste en hook:

   ```typescript
   // src/hooks/useWebRTCPhone.ts
   ice_servers: config.iceServers || [],  // ← Debe existir
   ```

3. Reiniciar servidor:
   ```bash
   npm run dev
   ```

---

## ROLLBACK (Revertir Cambios)

Si necesitas volver a usar VPN:

### Paso 1: Revertir Variables de Entorno

Edita `.env.local`:

```bash
# Revertir a configuración VPN
NEXT_PUBLIC_WEBRTC_WS_URI=wss://172.17.16.24:8089/ws
NEXT_PUBLIC_WEBRTC_SIP_DOMAIN=172.17.16.24

# Comentar credenciales TURN
# NEXT_PUBLIC_TURN_USERNAME=...
# NEXT_PUBLIC_TURN_CREDENTIAL=...
```

### Paso 2: Revertir Código (Opcional)

Si quieres remover completamente el código TURN:

```bash
# Usar git para revertir
git checkout src/services/webrtc/index.ts
git checkout src/services/webrtc/types.ts
git checkout src/hooks/useWebRTCPhone.ts
```

### Paso 3: Reiniciar

```bash
npm run dev
```

### Paso 4: Conectar VPN

Conecta VPN y prueba que funcione normalmente.

---

## CHECKLIST FINAL

Antes de considerar completa la implementación:

### Configuración Cloudflare:

- [ ] Tunnel tiene estado "Healthy" en dashboard
- [ ] Public hostname configurado: `pbx.tudominio.com → https://172.17.16.24:8089`
- [ ] DNS resuelve correctamente (`nslookup pbx.tudominio.com`)
- [ ] API Token creado y guardado
- [ ] Account ID guardado

### Código Frontend:

- [ ] `.env.local` actualizado con `wss://pbx.tudominio.com/ws`
- [ ] Credenciales TURN agregadas en `.env.local`
- [ ] `src/services/webrtc/types.ts` tiene `iceServers?: RTCIceServer[]`
- [ ] `src/services/webrtc/index.ts` tiene configuración ICE_SERVERS
- [ ] `src/hooks/useWebRTCPhone.ts` tiene `ice_servers: config.iceServers || []`

### Testing:

- [ ] `curl -I https://pbx.tudominio.com` responde
- [ ] WebSocket se conecta sin VPN
- [ ] Consola muestra "WebSocket conectado"
- [ ] ICE candidates muestran `typ relay`
- [ ] Llamada se conecta sin VPN
- [ ] Audio funciona en ambos lados
- [ ] Calidad es aceptable

### Producción:

- [ ] Variables de entorno actualizadas en plataforma de deployment
- [ ] Build de producción exitoso
- [ ] Deploy exitoso
- [ ] Testing en producción sin VPN funciona
- [ ] Alertas de uso configuradas

---

## DOCUMENTACIÓN Y RECURSOS

**Archivos del proyecto:**

- `TUTORIAL_ADMINISTRADOR_PBX.md` - Para el admin del servidor
- `TUTORIAL_FRONTEND_DEVELOPER.md` - Este archivo
- `.env.local` - Variables de entorno (NO commitear)

**Cloudflare Resources:**

- Dashboard: https://dash.cloudflare.com
- Zero Trust: https://one.dash.cloudflare.com
- TURN Docs: https://developers.cloudflare.com/realtime/turn/
- Tunnel Docs: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/

**Testing Tools:**

- Trickle ICE: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
- WebSocket Test: https://www.piesocket.com/websocket-tester
- DNS Check: https://dnschecker.org/

**Soporte:**

- Cloudflare Community: https://community.cloudflare.com/
- JsSIP Docs: https://jssip.net/documentation/

---

## RESUMEN DE COSTOS

| Servicio          | Costo Mensual | Límite Gratuito |
| ----------------- | ------------- | --------------- |
| Cloudflare Tunnel | **GRATIS**    | Ilimitado       |
| Cloudflare STUN   | **GRATIS**    | Ilimitado       |
| Cloudflare TURN   | **GRATIS**    | 1,000 GB/mes    |
| **TOTAL**         | **$0**        | -               |

**Uso estimado mensual:** ~120-200 GB (dentro del tier gratuito)

**Costo adicional si excedes:** $0.05 por GB adicional

---

## PRÓXIMOS PASOS

Una vez que todo funcione:

1. **Documentar para el equipo:**

   - Crear README interno
   - Documentar proceso de deployment
   - Agregar troubleshooting común

2. **Monitoreo continuo:**

   - Revisar dashboard de Cloudflare semanalmente
   - Monitorear uso de bandwidth
   - Verificar salud del tunnel

3. **Optimizaciones futuras:**

   - Considerar WARP Connector si necesitas menor latencia
   - Implementar métricas de calidad de llamadas
   - Agregar logging de errores WebRTC

4. **Seguridad:**
   - Rotar credenciales TURN cada 6 meses
   - Mantener API tokens seguros
   - Revisar logs de acceso

---

**FIN DEL TUTORIAL - PARTE FRONTEND**

Implementación completada el: **\*\***\_\_\_**\*\***
Developer: **\*\***\_\_\_**\*\***
Dominio configurado: **\*\***\_\_\_**\*\***
Estado: **\*\***\_\_\_**\*\***
