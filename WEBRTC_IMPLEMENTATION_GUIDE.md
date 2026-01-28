# WebRTC Implementation Guide - Cloudflare Tunnel + TURN

## Overview

This guide will help you eliminate VPN dependency for WebRTC connections from your Next.js frontend to the Asterisk/FreePBX server in Azure using Cloudflare infrastructure.

**Solution**: Cloudflare Tunnel (for WebSocket signaling) + Cloudflare Calls (for media relay)

**Estimated Time**: 2-3 hours
**Cost**: Free (within 1TB/month free tier)
**Client Requirements**: None (browser-only)

---

## Prerequisites

- [ ] Cloudflare account with domain configured
- [ ] Access to Azure PBX server (Rocky Linux 8 + Asterisk/FreePBX)
- [ ] SSH access to PBX server
- [ ] Cloudflare API token (for TURN credentials)
- [ ] Node.js environment for frontend development

---

## Architecture

```
Frontend (Next.js)
    │
    ├─── SIP Signaling (WSS) ───> Cloudflare Tunnel ───> PBX:8089
    │
    └─── Media (RTP/SRTP) ────> Cloudflare TURN ────> PBX
```

**Traffic Flow:**
1. WebSocket signaling: `wss://pbx.yourdomain.com` → Cloudflare Tunnel → `172.17.16.24:8089`
2. Media streams: Frontend ↔ `turn.cloudflare.com` ↔ PBX

---

## Phase 1: Server-Side Setup (PBX Administrator)

**🔴 IMPORTANT**: The PBX administrator must complete these steps first. See `PBX_SERVER_SETUP.md` for detailed server-side instructions.

**Server-side tasks:**
- [ ] Install Cloudflare Tunnel (cloudflared) on PBX server
- [ ] Configure tunnel for WebSocket endpoint
- [ ] Configure Asterisk/FreePBX for TURN servers
- [ ] Test WebSocket connectivity
- [ ] Provide frontend team with:
  - Cloudflare Tunnel public hostname (e.g., `pbx.yourdomain.com`)
  - TURN credentials (username/credential)
  - Confirmation that port 8089 is accessible via tunnel

---

## Phase 2: Frontend Configuration

### Step 1: Update Environment Variables

Edit `.env.local`:

```bash
# Old VPN-dependent configuration (REMOVE or COMMENT OUT)
# NEXT_PUBLIC_WEBRTC_WS_URI=wss://172.17.16.24:8089/ws
# NEXT_PUBLIC_WEBRTC_SIP_DOMAIN=172.17.16.24

# New Cloudflare configuration
NEXT_PUBLIC_WEBRTC_WS_URI=wss://pbx.yourdomain.com/ws
NEXT_PUBLIC_WEBRTC_SIP_DOMAIN=172.17.16.24

# Cloudflare TURN credentials (provided by server admin)
NEXT_PUBLIC_TURN_USERNAME=your-turn-username
NEXT_PUBLIC_TURN_CREDENTIAL=your-turn-credential

# Keep existing
NEXT_PUBLIC_WEBRTC_SIP_PASSWORD=your-sip-password
```

**Replace:**
- `pbx.yourdomain.com` → Your Cloudflare Tunnel hostname
- `your-turn-username` → TURN username from server admin
- `your-turn-credential` → TURN credential from server admin

---

### Step 2: Update TypeScript Types

Edit `src/services/webrtc/types.ts`:

```typescript
export interface WebRTCCredentials {
  sipUser: string;
  sipPass: string;
  sipDomain: string;
  wsUri: string;
  iceServers?: RTCIceServer[];  // ADD THIS LINE
}
```

---

### Step 3: Update WebRTC Service

Edit `src/services/webrtc/index.ts`:

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
  process.env.NEXT_PUBLIC_WEBRTC_WS_URI || "wss://pbx.yourdomain.com/ws";

const TURN_USERNAME = process.env.NEXT_PUBLIC_TURN_USERNAME || "";
const TURN_CREDENTIAL = process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "";

const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: "stun:stun.cloudflare.com:3478"
  },
  {
    urls: [
      "turn:turn.cloudflare.com:3478?transport=udp",
      "turn:turn.cloudflare.com:3478?transport=tcp",
      "turns:turn.cloudflare.com:5349?transport=tcp"
    ],
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL
  }
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

---

### Step 4: Update WebRTC Phone Hook

Edit `src/hooks/useWebRTCPhone.ts`:

Find line 76-86 (the JsSIP UA configuration) and update:

```typescript
const socket = new JsSIP.WebSocketInterface(config.wsUri);

const configuration = {
  sockets: [socket],
  uri: `sip:${config.sipUser}@${config.sipDomain}`,
  password: config.sipPass,
  register: true,
  session_timers: false,
  register_expires: 300,
  contact_uri: `sip:${config.sipUser}@${config.sipDomain}`,
  ice_servers: config.iceServers || [],  // ADD THIS LINE
};

uaRef.current = new JsSIP.UA(configuration);
```

---

## Phase 3: Testing

### Step 1: Test Without VPN

1. **Disconnect VPN**
2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser console** (F12)
4. **Navigate to dashboard**
5. **Monitor console for WebRTC logs**

### Step 2: Verify WebSocket Connection

Look for console logs:
```
🔗 [WebRTC] WebSocket conectado
Conectado a la central telefónica
```

If you see errors:
- Check `NEXT_PUBLIC_WEBRTC_WS_URI` is correct
- Verify Cloudflare Tunnel is running on server
- Check DNS propagation

### Step 3: Test Call

1. **Make a test call**
2. **Open browser DevTools → Console**
3. **Check ICE candidates**:

Expected output:
```javascript
ICE: RTCIceCandidate {
  candidate: "candidate:... typ relay raddr ... rport ..."
  // ^^^ Look for "relay" - indicates TURN is working
}
```

**Good signs:**
- ✅ See `typ relay` candidates (TURN working)
- ✅ Call connects without VPN
- ✅ Two-way audio works

**Bad signs:**
- ❌ Only `typ host` or `typ srflx` (TURN not working)
- ❌ Connection timeout
- ❌ "ICE failed" errors

### Step 4: Verify TURN Usage

In browser console during a call:

```javascript
// Get the current RTCPeerConnection stats
const pc = currentSessionRef.current.connection;
pc.getStats().then(stats => {
  stats.forEach(report => {
    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
      console.log('Active connection:', report);
      // Should show TURN relay if working correctly
    }
  });
});
```

---

## Phase 4: Production Deployment

### Step 1: Update Production Environment

Add to production `.env` or environment variables:

```bash
NEXT_PUBLIC_WEBRTC_WS_URI=wss://pbx.yourdomain.com/ws
NEXT_PUBLIC_WEBRTC_SIP_DOMAIN=172.17.16.24
NEXT_PUBLIC_TURN_USERNAME=production-turn-username
NEXT_PUBLIC_TURN_CREDENTIAL=production-turn-credential
NEXT_PUBLIC_WEBRTC_SIP_PASSWORD=production-sip-password
```

### Step 2: Deploy

```bash
npm run build
npm start
```

Or deploy to your hosting platform (Vercel, AWS, etc.)

### Step 3: Monitor Usage

**Monitor Cloudflare Calls usage:**
1. Log in to Cloudflare Dashboard
2. Navigate to **Analytics** → **Calls**
3. Monitor bandwidth usage (free tier: 1TB/month)

**Expected usage:**
- ~200MB per hour of calling
- 10 users × 2 hours/day × 30 days = ~120 GB/month (within free tier)

---

## Troubleshooting

### Issue: "WebSocket desconectado"

**Causes:**
- Cloudflare Tunnel not running on server
- Incorrect `NEXT_PUBLIC_WEBRTC_WS_URI`
- DNS not propagated

**Solutions:**
1. Verify tunnel status on server:
   ```bash
   sudo systemctl status cloudflared
   ```
2. Test WebSocket manually:
   ```bash
   wscat -c wss://pbx.yourdomain.com/ws
   ```
3. Check Cloudflare DNS settings

---

### Issue: "Llamada fallida" or no audio

**Causes:**
- TURN credentials incorrect
- TURN not configured on PBX
- Firewall blocking TURN ports

**Solutions:**
1. Verify TURN credentials in `.env.local`
2. Check browser console for ICE errors
3. Verify PBX TURN configuration (see `PBX_SERVER_SETUP.md`)
4. Test TURN connectivity:
   ```bash
   # Use Trickle ICE test: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
   ```

---

### Issue: Connection works with VPN but not without

**Causes:**
- Still using old `172.17.16.24` endpoint
- TURN not configured properly

**Solutions:**
1. Clear browser cache
2. Verify `.env.local` has new configuration
3. Restart dev server: `npm run dev`
4. Check `config.wsUri` in browser console

---

### Issue: High latency or poor audio quality

**Causes:**
- TURN relay adding latency
- Network congestion
- Codec issues

**Solutions:**
1. Check network speed (both client and server)
2. Verify Cloudflare edge location (should be geographically close)
3. Consider WARP Connector if latency is critical
4. Review Asterisk codec configuration

---

## Rollback Plan

If you need to revert to VPN-based connection:

1. **Revert `.env.local`**:
   ```bash
   NEXT_PUBLIC_WEBRTC_WS_URI=wss://172.17.16.24:8089/ws
   NEXT_PUBLIC_WEBRTC_SIP_DOMAIN=172.17.16.24
   ```

2. **Comment out ICE servers** in `src/services/webrtc/index.ts`:
   ```typescript
   // const ICE_SERVERS: RTCIceServer[] = [...]
   ```

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

4. **Connect to VPN**

---

## Cost Monitoring

### Cloudflare Calls Pricing

| Usage | Monthly Cost |
|-------|--------------|
| 0 - 1,000 GB | **FREE** |
| 1,001 - 2,000 GB | $50 |
| 2,001+ GB | $0.05/GB |

**How to monitor:**
1. Cloudflare Dashboard → Analytics → Calls
2. Set up usage alerts (recommended: alert at 800 GB)
3. Review monthly usage reports

**Estimated usage:**
- 1 hour call = ~200 MB
- 10 users × 40 hours/month = 400 hours = ~80 GB/month
- **Well within free tier**

---

## Next Steps

- [ ] Review this guide
- [ ] Coordinate with server administrator (provide `PBX_SERVER_SETUP.md`)
- [ ] Wait for server-side setup completion
- [ ] Receive TURN credentials and tunnel hostname
- [ ] Update environment variables
- [ ] Modify code files (Steps 2-4)
- [ ] Test without VPN
- [ ] Deploy to production

---

## Support Resources

**Cloudflare Documentation:**
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/)
- [Cloudflare TURN Service](https://developers.cloudflare.com/realtime/turn/)
- [VoIP Reference Architecture](https://developers.cloudflare.com/reference-architecture/diagrams/sase/deploying-self-hosted-voip-services-for-hybrid-users/)

**Testing Tools:**
- [WebRTC Trickle ICE Test](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/)
- [WebSocket Test](https://www.piesocket.com/websocket-tester)

**Community:**
- [Cloudflare Community Forums](https://community.cloudflare.com/)
- [JsSIP Documentation](https://jssip.net/documentation/)

---

## Questions?

Contact your infrastructure team or refer to:
- `PBX_SERVER_SETUP.md` - For server administrators
- `TROUBLESHOOTING.md` - Detailed troubleshooting guide
- Backend team for TURN credential rotation procedures
