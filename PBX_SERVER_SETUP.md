# PBX Server Setup Guide - Rocky Linux 8 + Asterisk/FreePBX

## Overview

This guide provides complete instructions for configuring your Rocky Linux 8 server with Asterisk/FreePBX to work with Cloudflare Tunnel and TURN service, eliminating the need for VPN connections.

**Server Environment:**

- OS: Rocky Linux 8
- PBX: Asterisk/FreePBX (Issabel)
- Current IP: 172.17.16.24 (Azure private network)
- WebSocket Port: 8089

**What you'll accomplish:**

1. Expose WebSocket endpoint (port 8089) via Cloudflare Tunnel
2. Configure Asterisk/FreePBX to use Cloudflare TURN servers
3. Enable WebRTC connections without VPN

**Estimated Time**: 1-2 hours

---

## Prerequisites

- [ ] Root or sudo access to PBX server
- [ ] Server can access internet (for Cloudflare Tunnel)
- [ ] Cloudflare account with domain configured
- [ ] Cloudflare API token (create at: https://dash.cloudflare.com/profile/api-tokens)

---

## Phase 1: Install Cloudflare Tunnel

### Step 1: Download and Install cloudflared

SSH to your PBX server and run:

```bash
# Download cloudflared for RHEL-based systems
cd /tmp
curl -L -o cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm

# Install
sudo rpm -i cloudflared.rpm

# Verify installation
cloudflared --version
```

**Expected output:**

```
cloudflared version 2024.x.x (built xxxx-xx-xx)
```

---

### Step 2: Authenticate with Cloudflare

```bash
# This will open a browser to authenticate
cloudflared tunnel login
```

**If you're on a headless server:**

1. Copy the URL from the terminal
2. Open it on your local machine
3. Select your domain
4. Authorize the tunnel

This creates: `/root/.cloudflared/cert.pem`

---

### Step 3: Create a Tunnel

```bash
# Create tunnel (replace 'quironix-pbx' with your preferred name)
cloudflared tunnel create quironix-pbx
```

**Expected output:**

```
Tunnel credentials written to /root/.cloudflared/f407aef2-7a56-4f0b-b32c-4933c69dc676.json
Created tunnel quironix-pbx with id f407aef2-7a56-4f0b-b32c-4933c69dc676
```

**Important:** Save the `TUNNEL-ID` - you'll need it later.

---

### Step 4: Create Tunnel Configuration

Create configuration file:

```bash
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

Add the following configuration (replace `f407aef2-7a56-4f0b-b32c-4933c69dc676` and `yourdomain.com`):

```yaml
tunnel: f407aef2-7a56-4f0b-b32c-4933c69dc676
credentials-file: /root/.cloudflared/f407aef2-7a56-4f0b-b32c-4933c69dc676.json

ingress:
  # Route for WebSocket endpoint
  - hostname: pbx.quironix.com
    service: https://172.17.16.24:8089
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s
      tcpKeepAlive: 30s

  # Catch-all rule (required)
  - service: http_status:404
```

**Configuration notes:**

- `hostname`: Your public domain (must be in Cloudflare)
- `service`: Local WebSocket endpoint
- `noTLSVerify: true`: Required if using self-signed cert on PBX
- `connectTimeout: 30s`: Prevents timeouts on WebSocket connections
- `tcpKeepAlive: 30s`: Keeps WebSocket connections alive

Save and exit (`Ctrl+X`, then `Y`, then `Enter`)

---

### Step 5: Configure DNS in Cloudflare

**Option A: Via Cloudflare Dashboard**

1. Go to https://dash.cloudflare.com
2. Select your domain
3. Go to **DNS** → **Records**
4. Click **Add record**
   - Type: `CNAME`
   - Name: `pbx`
   - Target: `f407aef2-7a56-4f0b-b32c-4933c69dc676.cfargotunnel.com`
   - Proxy status: **Proxied** (orange cloud)
5. Click **Save**

**Option B: Via CLI**

```bash
cloudflared tunnel route dns quironix-pbx pbx.quironix.com
```

---

### Step 6: Test Tunnel Configuration

```bash
# Test tunnel in foreground (for debugging)
cloudflared tunnel --config /etc/cloudflared/config.yml run quironix-pbx
```

**Expected output:**

```
INF Starting tunnel tunnelID=f407aef2-7a56-4f0b-b32c-4933c69dc676
INF Connection registered connIndex=0 ip=xxx.xxx.xxx.xxx
INF Connection registered connIndex=1 ip=xxx.xxx.xxx.xxx
INF Connection registered connIndex=2 ip=xxx.xxx.xxx.xxx
INF Connection registered connIndex=3 ip=xxx.xxx.xxx.xxx
```

**Test from another terminal:**

```bash
curl -I https://pbx.quironix.com
```

If you see a response (even 404 or error), the tunnel is working!

Press `Ctrl+C` to stop the test.

---

### Step 7: Install Tunnel as System Service

```bash
# Install as system service
sudo cloudflared service install

# Enable auto-start on boot
sudo systemctl enable cloudflared

# Start the service
sudo systemctl start cloudflared

# Check status
sudo systemctl status cloudflared
```

**Expected output:**

```
● cloudflared.service - Cloudflare Tunnel
   Loaded: loaded (/etc/systemd/system/cloudflared.service; enabled)
   Active: active (running) since ...
```

**View logs:**

```bash
sudo journalctl -u cloudflared -f
```

---

## Phase 2: Configure Asterisk/FreePBX for TURN

### Step 1: Verify Current WebRTC Configuration

```bash
# Check current WebSocket configuration
sudo asterisk -rx "pjsip show transports"
```

Look for transport on port 8089 with type `wss`.

---

### Step 2: Configure ICE/STUN/TURN Settings

#### For Asterisk (PJSIP):

Edit PJSIP configuration:

```bash
sudo nano /etc/asterisk/pjsip.conf
```

Find or add the `[global]` section and add:

```ini
[global]
type=global
max_forwards=70
user_agent=Asterisk PBX
default_outbound_endpoint=default_outbound_endpoint
keep_alive_interval=90
disable_multi_domain=no

; ICE/STUN/TURN Configuration
ice_support=yes
media_use_received_transport=no
rtcp_mux=yes

; Cloudflare STUN servers
stun_server=stun.cloudflare.com:3478

; External media address (if behind NAT)
external_media_address=turn.cloudflare.com
external_signaling_address=turn.cloudflare.com
```

**Alternative location** (if using separate files):

```bash
sudo nano /etc/asterisk/pjsip_wizard.conf
```

Add to WebRTC endpoint templates:

```ini
[webrtc_endpoint](!)
type=endpoint
transport=transport-wss
context=from-internal
disallow=all
allow=opus
allow=ulaw
webrtc=yes
ice_support=yes
media_encryption=sdes
rtcp_mux=yes

; Use TURN for NAT traversal
use_avpf=yes
media_use_received_transport=no
```

---

#### For FreePBX Web Interface:

1. **Log in to FreePBX GUI**: `https://172.17.16.24` (or via VPN initially)

2. **Navigate to**: **Settings** → **Asterisk SIP Settings** → **SIP Settings [chan_pjsip]**

3. **Under "WebRTC" section**, configure:

   - **ICE Support**: `Yes`
   - **STUN Server**: `stun.cloudflare.com:3478`
   - **External Media Address**: `turn.cloudflare.com`
   - **External Signaling Address**: `turn.cloudflare.com`

4. **Click "Submit"** and **"Apply Config"**

---

### Step 3: Configure TURN Credentials (Client-Side)

**Note:** TURN credentials are typically configured on the **client side** (frontend application). However, you need to provide the credentials to the frontend team.

**Generate TURN credentials** using Cloudflare API:

```bash
# Replace with your Cloudflare Account ID and API Token
ACCOUNT_ID="your-account-id"
API_TOKEN="your-api-token"

curl -X POST "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/calls/turn/keys" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "quironix-frontend-turn",
    "ttl": 31536000
  }'
```

**Response:**

```json
{
  "result": {
    "id": "key-id",
    "name": "quironix-frontend-turn",
    "key": "turn-username",
    "secret": "turn-credential",
    "ttl": 31536000
  },
  "success": true
}
```

**Important:** Save the `key` (username) and `secret` (credential) and provide to frontend team.

---

### Step 4: Update Firewall Rules (if applicable)

Ensure outbound connections to Cloudflare TURN servers are allowed:

```bash
# Allow outbound to Cloudflare TURN (UDP/TCP)
sudo firewall-cmd --permanent --add-port=3478/udp
sudo firewall-cmd --permanent --add-port=3478/tcp
sudo firewall-cmd --permanent --add-port=5349/tcp
sudo firewall-cmd --permanent --add-port=53/udp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp

# Reload firewall
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-ports
```

**For Azure NSG (Network Security Group):**

- Ensure **outbound** rules allow connections to internet
- No inbound rules needed (tunnel handles this)

---

### Step 5: Restart Asterisk

```bash
# Reload PJSIP configuration
sudo asterisk -rx "pjsip reload"

# Or restart Asterisk completely
sudo systemctl restart asterisk

# Check status
sudo systemctl status asterisk
```

---

## Phase 3: Testing and Verification

### Step 1: Test WebSocket Endpoint

From your local machine (or server):

```bash
# Install wscat if not available
npm install -g wscat

# Test WebSocket connection
wscat -c wss://pbx.quironix.com/ws
```

**Expected output:**

```
Connected (press CTRL+C to quit)
```

If you see binary data or SIP messages, it's working!

---

### Step 2: Verify TURN Connectivity

From a client machine:

```bash
# Test STUN server
curl -v stun:stun.cloudflare.com:3478
```

Or use online tool: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

**Test configuration:**

- STUN: `stun:stun.cloudflare.com:3478`
- TURN: `turn:turn.cloudflare.com:3478`
- Username: `<your-turn-username>`
- Credential: `<your-turn-credential>`

Click **"Gather candidates"** - you should see:

- `host` candidates
- `srflx` candidates (from STUN)
- `relay` candidates (from TURN) ← Most important!

---

### Step 3: Test SIP Registration

From Asterisk CLI:

```bash
sudo asterisk -rvvv

# Check active endpoints
pjsip show endpoints

# Check WebSocket transports
pjsip show transports

# Monitor for registration attempts
pjsip set logger on
```

Have frontend team attempt connection - you should see registration attempts in the CLI.

---

### Step 4: Monitor Cloudflare Tunnel

```bash
# Real-time tunnel logs
sudo journalctl -u cloudflared -f
```

Look for:

```
INF Request: wss://pbx.quironix.com/ws
INF Proxying to origin: https://172.17.16.24:8089
```

---

## Phase 4: Provide Information to Frontend Team

Create a summary document for the frontend team:

```
WebRTC Connection Details
=========================

Cloudflare Tunnel Public Endpoint:
- WebSocket URI: wss://pbx.quironix.com/ws

SIP Configuration:
- SIP Domain: 172.17.16.24
- WebSocket Port: 8089 (accessible via tunnel)

Cloudflare TURN Credentials:
- TURN Username: <turn-username>
- TURN Credential: <turn-credential>

STUN/TURN Servers:
- STUN: stun.cloudflare.com:3478
- TURN UDP: turn.cloudflare.com:3478
- TURN TCP: turn.cloudflare.com:3478
- TURN TLS: turn.cloudflare.com:5349

Status:
- Tunnel Status: Active ✓
- WebSocket Endpoint: Accessible ✓
- TURN Configured: Yes ✓
- Firewall: Configured ✓

Testing:
- WebSocket connectivity tested: [ ]
- SIP registration tested: [ ]
- Call audio tested: [ ]
```

Send this to: [Frontend team contact]

---

## Troubleshooting

### Issue: Tunnel not connecting

**Check tunnel status:**

```bash
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -n 50
```

**Common causes:**

- Credentials file not found → Check `/root/.cloudflared/f407aef2-7a56-4f0b-b32c-4933c69dc676.json` exists
- Network connectivity → Test `ping cloudflare.com`
- Firewall blocking → Check outbound rules

**Solution:**

```bash
# Restart tunnel
sudo systemctl restart cloudflared

# Test manually
cloudflared tunnel --config /etc/cloudflared/config.yml run quironix-pbx
```

---

### Issue: WebSocket connection fails

**Test local WebSocket:**

```bash
# Install websocat
sudo yum install -y websocat

# Test local WebSocket
websocat wss://127.0.0.1:8089/ws --insecure
```

**If local works but tunnel doesn't:**

- Check `originRequest.noTLSVerify: true` in config.yml
- Verify service URL in config: `https://172.17.16.24:8089`

---

### Issue: TURN not working

**Verify TURN credentials:**

```bash
# Test TURN allocation
turnutils_uclient -v -u <turn-username> -w <turn-credential> turn.cloudflare.com
```

**Check Asterisk TURN configuration:**

```bash
sudo asterisk -rx "pjsip show settings" | grep -i stun
sudo asterisk -rx "pjsip show settings" | grep -i ice
```

---

### Issue: SIP registration fails

**Check Asterisk logs:**

```bash
sudo tail -f /var/log/asterisk/full
```

**Common causes:**

- Incorrect SIP credentials
- WebSocket transport not configured
- ICE support disabled

**Enable verbose logging:**

```bash
sudo asterisk -rvvv
pjsip set logger on
core set verbose 5
```

---

## Maintenance

### Monitoring Tunnel Health

```bash
# Check tunnel status
sudo systemctl status cloudflared

# View recent logs
sudo journalctl -u cloudflared -n 100

# Real-time monitoring
sudo journalctl -u cloudflared -f
```

### Updating cloudflared

```bash
# Check current version
cloudflared --version

# Download latest
curl -L -o /tmp/cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm

# Update
sudo rpm -U /tmp/cloudflared.rpm

# Restart service
sudo systemctl restart cloudflared
```

### Rotating TURN Credentials

**Every 6-12 months**, regenerate TURN credentials:

```bash
# Delete old key
curl -X DELETE "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/calls/turn/keys/<KEY_ID>" \
  -H "Authorization: Bearer ${API_TOKEN}"

# Create new key
curl -X POST "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/calls/turn/keys" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"name": "quironix-frontend-turn", "ttl": 31536000}'
```

Provide new credentials to frontend team.

---

### Log Rotation

Ensure Cloudflare Tunnel logs don't fill disk:

```bash
# Configure journald log rotation
sudo nano /etc/systemd/journald.conf
```

Add/modify:

```ini
[Journal]
SystemMaxUse=500M
SystemKeepFree=1G
MaxRetentionSec=1month
```

```bash
# Restart journald
sudo systemctl restart systemd-journald
```

---

## Security Considerations

### Tunnel Security

- Tunnel credentials stored in `/root/.cloudflared/f407aef2-7a56-4f0b-b32c-4933c69dc676.json`
- Protect this file with proper permissions:
  ```bash
  sudo chmod 600 /root/.cloudflared/f407aef2-7a56-4f0b-b32c-4933c69dc676.json
  ```

### TURN Security

- TURN credentials should be rotated periodically
- Use time-limited credentials when possible
- Monitor Cloudflare Calls usage for anomalies

### Asterisk Security

- Keep Asterisk/FreePBX updated
- Use strong SIP passwords
- Enable fail2ban for SIP authentication attempts:
  ```bash
  sudo yum install -y fail2ban
  sudo systemctl enable fail2ban
  sudo systemctl start fail2ban
  ```

---

## Rollback Plan

If you need to disable Cloudflare Tunnel:

```bash
# Stop and disable tunnel
sudo systemctl stop cloudflared
sudo systemctl disable cloudflared

# Remove DNS record from Cloudflare Dashboard

# Revert Asterisk configuration
sudo nano /etc/asterisk/pjsip.conf
# Comment out STUN/TURN settings

# Reload Asterisk
sudo asterisk -rx "pjsip reload"
```

Users will need to reconnect via VPN.

---

## Support Resources

**Cloudflare Documentation:**

- Tunnel Setup: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/
- TURN Service: https://developers.cloudflare.com/realtime/turn/

**Asterisk Documentation:**

- PJSIP: https://wiki.asterisk.org/wiki/display/AST/Configuring+res_pjsip
- WebRTC: https://wiki.asterisk.org/wiki/display/AST/WebRTC

**Tools:**

- Trickle ICE Test: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
- WebSocket Test: https://www.piesocket.com/websocket-tester

---

## Checklist

Server setup completed:

- [ ] Cloudflared installed and authenticated
- [ ] Tunnel created and configured
- [ ] DNS record created in Cloudflare
- [ ] Tunnel service running and enabled
- [ ] WebSocket endpoint accessible via tunnel
- [ ] Asterisk/FreePBX configured for TURN
- [ ] TURN credentials generated
- [ ] Firewall rules updated
- [ ] WebSocket connection tested
- [ ] TURN connectivity verified
- [ ] Frontend team notified with connection details

---

**Setup completed by:** **\*\*\*\***\_**\*\*\*\***
**Date:** **\*\*\*\***\_**\*\*\*\***
**Tunnel ID:** **\*\*\*\***\_**\*\*\*\***
**Public hostname:** **\*\*\*\***\_**\*\*\*\***
**TURN credentials provided:** Yes / No
