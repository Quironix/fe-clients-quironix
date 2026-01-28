# Instructions for Rocky Linux Server Manager

## Mission

Configure the PBX server (172.17.16.24) to allow WebRTC connections from the internet without requiring VPN, using Cloudflare infrastructure.

**What we need from you:**
1. Install Cloudflare Tunnel on the PBX server
2. Expose WebSocket endpoint (port 8089) to the internet
3. Configure Asterisk for TURN servers
4. Provide connection details to frontend team

**Time required:** 1-2 hours
**Impact:** Zero downtime, no changes to existing calls
**Rollback:** Simple (stop tunnel service)

---

## Prerequisites

Before starting, ensure you have:
- [ ] Root/sudo access to PBX server (172.17.16.24)
- [ ] Cloudflare account credentials
- [ ] Domain managed in Cloudflare (ask if you don't have this)
- [ ] Server can access internet

**Required information:**
- Your Cloudflare Account ID: `____________________`
- Your Cloudflare API Token: `____________________`
  - Create at: https://dash.cloudflare.com/profile/api-tokens
  - Permissions needed: "Account - Cloudflare Tunnel - Edit"
- Your domain in Cloudflare: `____________________`

---

## Quick Start (Copy-Paste Commands)

### Step 1: Install Cloudflare Tunnel (5 minutes)

SSH to PBX server and run:

```bash
# Download and install
cd /tmp
curl -L -o cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
sudo rpm -i cloudflared.rpm

# Verify
cloudflared --version
```

---

### Step 2: Authenticate (5 minutes)

```bash
# Login to Cloudflare
cloudflared tunnel login
```

**If headless server:**
- Copy the URL from terminal
- Open in your browser
- Select domain
- Authorize

---

### Step 3: Create Tunnel (2 minutes)

```bash
# Create tunnel
cloudflared tunnel create quironix-pbx

# Save the TUNNEL-ID shown in output
```

**Copy the TUNNEL-ID here:** `____________________`

---

### Step 4: Configure Tunnel (10 minutes)

```bash
# Create config directory
sudo mkdir -p /etc/cloudflared

# Create config file
sudo nano /etc/cloudflared/config.yml
```

**Paste this (replace <TUNNEL-ID> and yourdomain.com):**

```yaml
tunnel: <TUNNEL-ID>
credentials-file: /root/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: pbx.yourdomain.com
    service: https://172.17.16.24:8089
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s
      tcpKeepAlive: 30s
  - service: http_status:404
```

Save: `Ctrl+X` → `Y` → `Enter`

---

### Step 5: Configure DNS (5 minutes)

**Option A - Via CLI:**
```bash
cloudflared tunnel route dns quironix-pbx pbx.yourdomain.com
```

**Option B - Via Cloudflare Dashboard:**
1. Go to https://dash.cloudflare.com
2. Select domain → DNS → Add record
3. Type: `CNAME`
4. Name: `pbx`
5. Target: `<TUNNEL-ID>.cfargotunnel.com`
6. Proxy: ON (orange cloud)
7. Save

---

### Step 6: Start Tunnel Service (5 minutes)

```bash
# Install as service
sudo cloudflared service install

# Enable and start
sudo systemctl enable cloudflared
sudo systemctl start cloudflared

# Check status (should show "active (running)")
sudo systemctl status cloudflared
```

**✅ Checkpoint:** If status shows "active (running)", tunnel is working!

---

### Step 7: Test Tunnel (5 minutes)

```bash
# Test from server
curl -I https://pbx.yourdomain.com
```

**If you see ANY response** (even 404), tunnel is working! ✅

---

### Step 8: Configure Asterisk for TURN (15 minutes)

```bash
# Edit PJSIP configuration
sudo nano /etc/asterisk/pjsip.conf
```

**Find `[global]` section and add/modify:**

```ini
[global]
type=global
ice_support=yes
stun_server=stun.cloudflare.com:3478
external_media_address=turn.cloudflare.com
external_signaling_address=turn.cloudflare.com
rtcp_mux=yes
```

Save: `Ctrl+X` → `Y` → `Enter`

**Reload Asterisk:**
```bash
sudo asterisk -rx "pjsip reload"

# Verify
sudo asterisk -rx "pjsip show settings" | grep -i stun
```

Should show: `stun_server=stun.cloudflare.com:3478` ✅

---

### Step 9: Generate TURN Credentials (10 minutes)

**Fill in your details:**
- Account ID: `____________________`
- API Token: `____________________`

```bash
# Set variables (replace with your values)
ACCOUNT_ID="your-account-id-here"
API_TOKEN="your-api-token-here"

# Generate credentials
curl -X POST "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/calls/turn/keys" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "quironix-frontend-turn",
    "ttl": 31536000
  }'
```

**Save the response:**
```json
{
  "result": {
    "key": "COPY-THIS-USERNAME",
    "secret": "COPY-THIS-CREDENTIAL"
  }
}
```

**IMPORTANT:** Save these values:
- TURN Username: `____________________`
- TURN Credential: `____________________`

---

### Step 10: Update Firewall (5 minutes)

```bash
# Allow outbound to Cloudflare TURN
sudo firewall-cmd --permanent --add-port=3478/udp
sudo firewall-cmd --permanent --add-port=3478/tcp
sudo firewall-cmd --permanent --add-port=5349/tcp
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-ports
```

---

## Provide to Frontend Team

**Fill this out and send to frontend developer:**

```
===============================================
WEBRTC CONNECTION DETAILS
===============================================

Public WebSocket Endpoint:
wss://pbx.yourdomain.com/ws

SIP Configuration:
- SIP Domain: 172.17.16.24

Cloudflare TURN Servers:
- STUN: stun.cloudflare.com:3478
- TURN UDP: turn.cloudflare.com:3478
- TURN TCP: turn.cloudflare.com:3478
- TURN TLS: turn.cloudflare.com:5349

TURN Credentials:
- Username: [PASTE-FROM-STEP-9]
- Credential: [PASTE-FROM-STEP-9]

Server Status:
- Tunnel Running: YES
- WebSocket Accessible: YES
- TURN Configured: YES
- Date Configured: [TODAY'S DATE]

===============================================
```

---

## Verification Checklist

Before notifying the frontend team, verify:

```bash
# 1. Tunnel is running
sudo systemctl status cloudflared
# Should show: "active (running)" ✅

# 2. WebSocket is accessible
curl -I https://pbx.yourdomain.com
# Should return response ✅

# 3. Asterisk is configured
sudo asterisk -rx "pjsip show settings" | grep stun
# Should show: stun.cloudflare.com:3478 ✅

# 4. View tunnel logs (optional)
sudo journalctl -u cloudflared -n 20
# Should show connections ✅
```

All checks pass? **You're done!** ✅

---

## Troubleshooting

### Problem: "tunnel not connecting"

```bash
# Check logs
sudo journalctl -u cloudflared -n 50

# Restart tunnel
sudo systemctl restart cloudflared

# Test internet
ping cloudflare.com
```

### Problem: "curl to pbx.yourdomain.com fails"

**Check:**
1. DNS propagation: `nslookup pbx.yourdomain.com`
2. Tunnel status: `sudo systemctl status cloudflared`
3. Config file: `cat /etc/cloudflared/config.yml`

### Problem: "WebSocket connection refused"

**Verify WebSocket is running locally:**
```bash
# Check if port 8089 is listening
sudo netstat -tlnp | grep 8089

# Test locally
curl -k https://172.17.16.24:8089
```

If not listening, check Asterisk/FreePBX WebSocket configuration.

---

## Rollback (if needed)

If something goes wrong:

```bash
# Stop tunnel
sudo systemctl stop cloudflared
sudo systemctl disable cloudflared

# Remove DNS record from Cloudflare Dashboard

# Revert Asterisk config
sudo nano /etc/asterisk/pjsip.conf
# Comment out STUN/TURN lines

# Reload
sudo asterisk -rx "pjsip reload"
```

Users will need VPN again, but everything else works normally.

---

## Monitoring (After Deployment)

### Daily health check:
```bash
# Quick status
sudo systemctl status cloudflared
```

### Weekly monitoring:
```bash
# View tunnel logs
sudo journalctl -u cloudflared -n 100

# Check Asterisk status
sudo asterisk -rx "pjsip show transports"
```

### Monthly maintenance:
```bash
# Update cloudflared
curl -L -o /tmp/cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
sudo rpm -U /tmp/cloudflared.rpm
sudo systemctl restart cloudflared
```

---

## Cost

**Cloudflare Tunnel:** FREE ✅
**Cloudflare TURN:** FREE up to 1TB/month ✅

**Estimated usage:** ~80-200 GB/month (well within free tier)

**Monitor usage:**
- Cloudflare Dashboard → Analytics → Calls
- Set alert at 800 GB

---

## Support

**If you get stuck:**

1. **Check detailed guide:** See `PBX_SERVER_SETUP.md` for detailed explanations
2. **Cloudflare Docs:** https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
3. **Community:** https://community.cloudflare.com/

**Contact:**
- Frontend team: [contact-email]
- Infrastructure lead: [contact-email]

---

## Quick Command Reference

```bash
# Tunnel status
sudo systemctl status cloudflared

# View tunnel logs
sudo journalctl -u cloudflared -f

# Restart tunnel
sudo systemctl restart cloudflared

# Reload Asterisk
sudo asterisk -rx "pjsip reload"

# Check Asterisk SIP
sudo asterisk -rx "pjsip show endpoints"

# Check WebSocket transport
sudo asterisk -rx "pjsip show transports"
```

---

## Summary

**What you did:**
1. ✅ Installed Cloudflare Tunnel on PBX server
2. ✅ Exposed WebSocket (port 8089) to internet via tunnel
3. ✅ Configured Asterisk to use Cloudflare TURN servers
4. ✅ Generated TURN credentials
5. ✅ Updated firewall rules
6. ✅ Provided connection details to frontend team

**Result:**
- Frontend can connect to PBX without VPN
- WebRTC calls work from anywhere with internet
- No changes to existing PBX functionality
- Zero downtime deployment

**Next steps:**
- Frontend team will update their code
- They will test connection without VPN
- Monitor Cloudflare dashboard for usage

---

**Configuration completed:** ☐ YES
**Date:** __________
**Completed by:** __________
**Issues encountered:** __________
**Frontend team notified:** ☐ YES

---

Thank you for your work on this! 🙏

For detailed technical information, see `PBX_SERVER_SETUP.md`.
