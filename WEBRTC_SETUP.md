# Configuración WebRTC - Integración con Issabel PBX

Este documento describe la integración de llamadas WebRTC usando JsSIP para conectarse a la central telefónica Issabel PBX.

## Características Implementadas

- Registro automático de User Agent (UA) con credenciales SIP
- Llamadas salientes desde el módulo de gestión de deudores
- Soporte para múltiples anexos WebRTC
- Interfaz de login con credenciales de prueba
- Indicador de estado de conexión
- Control de llamadas (colgar, espera)

## Arquitectura

### Componentes Principales

1. **WebRTCContext** (`src/context/WebRTCContext.tsx`)

   - Proveedor de contexto para el estado global del softphone
   - Maneja configuración SIP, estado de registro y estado de llamadas

2. **useWebRTCPhone** (`src/hooks/useWebRTCPhone.ts`)

   - Hook personalizado que encapsula toda la lógica de JsSIP
   - Funciones: `makeCall`, `hangup`, `toggleHold`, `register`, `unregister`
   - Manejo de eventos de llamadas y registro
   - Se conecta directamente al WebSocket de Issabel PBX

3. **WebRTC Services** (`src/services/webrtc/`)

   - `createDirectWebRTCConfig()`: Crea configuración SIP directamente (sin llamar a PHP)
   - `TEST_CREDENTIALS`: Credenciales de anexos de prueba
   - Tipos TypeScript para configuración WebRTC

4. **WebRTCLogin** (`src/app/dashboard/components/webrtc-login.tsx`)

   - Componente de diálogo para seleccionar anexo
   - Botones rápidos para anexos de prueba
   - Integrado en el sidebar del dashboard
   - Conecta directamente al WebSocket sin provisión PHP

5. **DebtorContacts** (`src/app/dashboard/debtor-management/components/debtor-contacts.tsx`)
   - Botón "Llamar" integrado con WebRTC
   - Cambia a "Colgar" cuando hay llamada activa
   - Llama automáticamente al contacto principal

## Configuración

### Variables de Entorno

Agrega a tu archivo `.env.local`:

```bash
# Dominio SIP (opcional, default: webrtc.quironix.com)
NEXT_PUBLIC_WEBRTC_SIP_DOMAIN=webrtc.quironix.com

# URI del WebSocket (opcional, default: wss://webrtc.quironix.com:8089/ws)
# ⚠️ IMPORTANTE: Verifica el path correcto con tu administrador de Issabel
# Paths comunes:
#   - wss://IP:8089/ws (Asterisk/Issabel estándar)
#   - wss://IP:8089/ (sin path)
#   - wss://IP:8089/websocket (alternativo)
NEXT_PUBLIC_WEBRTC_WS_URI=wss://webrtc.quironix.com:8089/ws

# URL del servidor de provisión WebRTC (DEPRECATED, ya no se usa)
NEXT_PUBLIC_WEBRTC_API_URL=http://webrtc.quironix.com
```

### Servidor Issabel PBX

**IP del servidor:** `webrtc.quironix.com`

**Puertos requeridos:**

- UDP 5060 (SIP clásico)
- TCP 8088 (WebRTC WS)
- TCP 8089 (WebRTC WSS)
- UDP 10000-20000 (RTP media)

### Verificar Conectividad

```bash
# Escanear puertos críticos TCP
nmap -p 5060,8088,8089 webrtc.quironix.com

# Escanear puerto críticos UDP
nmap -sU -p 5060 webrtc.quironix.com

# Escanear rango RTP UDP
nmap -sU -p 10000-20000 webrtc.quironix.com

# Escaneo completo con detección de servicios
nmap -sV -p 5060,8088,8089,10000-20000 webrtc.quironix.com
```

## Anexos de Prueba

Los siguientes anexos están preconfigurados para desarrollo:

| Anexo | Usuario | Contraseña                       |
| ----- | ------- | -------------------------------- |
| 6170  | 6170    | 9c8c35689dca898e0cbad7fc622944ca |
| 6171  | 6171    | 9c8c35689dca898e0cbad7fc622944ca |
| 6172  | 6172    | 9c8c35689dca898e0cbad7fc622944ca |
| 6173  | 6173    | 9c8c35689dca898e0cbad7fc622944ca |

Estos están disponibles en `src/services/webrtc/index.ts` como `TEST_CREDENTIALS`.

## Uso

### 1. Conectarse a la PBX

1. En el dashboard, hacer clic en el botón "Conectar PBX" en el sidebar
2. Ingresar credenciales manualmente O usar uno de los botones de anexo de prueba
3. Esperar confirmación de registro

**💡 Tip:** Si ves "Conectando..." indefinidamente:

- Haz clic en **"Probar Conexión WebSocket"** (botón en el diálogo)
- Abre la consola del navegador (F12) para ver logs detallados
- Verifica que estés conectado a la VPN si es necesario
- Acepta el certificado SSL en `https://webrtc.quironix.com:8089`

### 2. Realizar una Llamada

1. Navegar a Gestión de Deudores > Detalle de un deudor
2. En la sección de "Contactos", hacer clic en "Llamar"
3. La llamada se iniciará al número del contacto principal
4. Durante la llamada, el botón cambia a "Colgar"

### 3. Estado de la Llamada

El hook `useWebRTCPhone` proporciona los siguientes estados:

- `idle`: Sin conexión
- `registering`: Conectando a PBX
- `registered`: Conectado y listo
- `calling`: Iniciando llamada
- `ringing`: Sonando (esperando respuesta)
- `in-call`: Llamada activa
- `on-hold`: Llamada en espera
- `ended`: Llamada finalizada
- `failed`: Error en llamada o registro

## Conexión Directa al WebSocket

La aplicación se conecta **directamente** al WebSocket de Issabel PBX usando JsSIP, sin necesidad de provisión desde el servidor PHP.

### Configuración Hardcoded

```typescript
const SIP_DOMAIN = "webrtc.quironix.com";
const WS_URI = "wss://webrtc.quironix.com:8089/ws";
```

### Función Helper

```typescript
createDirectWebRTCConfig(sipUser: string, sipPass: string): WebRTCCredentials
```

Esta función crea la configuración necesaria para JsSIP:

```typescript
{
  sipUser: "6170",
  sipPass: "9c8c35689dca898e0cbad7fc622944ca",
  sipDomain: "webrtc.quironix.com",
  wsUri: "wss://webrtc.quironix.com:8089/ws"
}
```

### API del Servidor de Provisión (DEPRECATED)

**Nota:** El endpoint `/api/provision.php` ya no se utiliza. La aplicación se conecta directamente al WebSocket.

## Estructura de Archivos

```
src/
├── context/
│   └── WebRTCContext.tsx          # Contexto global del softphone
├── hooks/
│   └── useWebRTCPhone.ts          # Hook principal de JsSIP
├── services/
│   └── webrtc/
│       ├── index.ts               # Servicio de provisión
│       └── types.ts               # Tipos TypeScript
└── app/
    └── dashboard/
        ├── layout.tsx             # Provider agregado aquí
        └── components/
            ├── webrtc-login.tsx   # Diálogo de login
            └── appsidebar.tsx     # Botón en sidebar
        └── debtor-management/
            └── components/
                └── debtor-contacts.tsx  # Botón de llamar
```

## Dependencias

```json
{
  "jssip": "^3.10.1"
}
```

Instalado con: `npm install jssip --legacy-peer-deps`

## Librería JsSIP

**Documentación oficial:** https://jssip.net/

**GitHub:** https://github.com/versatica/JsSIP

JsSIP es una librería JavaScript completa que implementa el protocolo SIP sobre WebSockets, permitiendo realizar llamadas VoIP directamente desde el navegador.

## Troubleshooting

### Error: "Debes permitir acceso al micrófono"

El navegador requiere permisos para el micrófono. Asegúrate de:

- Permitir el acceso cuando el navegador lo solicite
- Verificar permisos del sitio en configuración del navegador

### Error: "No estás conectado a la central telefónica"

1. Verifica que el servidor esté accesible
2. Comprueba las credenciales
3. Revisa la consola del navegador para errores de WebSocket

### Error: "Llamada fallida"

Posibles causas:

- Número de destino inválido
- Permisos insuficientes en el anexo
- Problemas de red/firewall
- Codecs de audio incompatibles

### El audio no se escucha

1. Verifica el volumen del sistema
2. Comprueba que no haya otros dispositivos capturando el micrófono
3. Revisa la consola para errores de "autoplay blocked"

## Seguridad

- Las credenciales SIP se mantienen en memoria únicamente
- No se almacenan en localStorage ni cookies
- El WebSocket usa WSS (cifrado) en producción
- Las contraseñas se transmiten hasheadas desde la BD

## Próximas Mejoras

- [ ] Llamadas entrantes
- [ ] Historial de llamadas
- [ ] Transferencia de llamadas
- [ ] Conferencias de 3 vías
- [ ] Grabación de llamadas
- [ ] Integración con CRM (notas automáticas)
- [ ] Marcador rápido con teclado numérico
- [ ] Indicador de calidad de llamada

## Referencia del Código Original

El código de referencia se encuentra en:

- `WebRtc-Fono/index.html` - Implementación HTML/JavaScript vanilla
- `WebRtc-Fono/jssip.min.js` - Librería JsSIP
- `WebRtc-Fono/api/provision.php` - API de provisión PHP

## Soporte

Para problemas relacionados con la central telefónica Issabel, contactar al administrador de sistemas.

Para problemas con la integración en el frontend, revisar los logs del navegador y del hook `useWebRTCPhone`.
