# Cloudflare Tunnel Setup - Dashboard Guide

## Overview

This guide shows you how to create and configure a Cloudflare Tunnel using the **Cloudflare Dashboard** (web interface) instead of command-line tools.

**What you'll do:**
1. Access Cloudflare Zero Trust dashboard
2. Create a new tunnel
3. Install the connector on your PBX server
4. Configure the tunnel route
5. Test the connection

**Time required:** 30-45 minutes
**Prerequisites:**
- Cloudflare account with a domain
- Access to PBX server via SSH
- Basic understanding of your domain

---

## Part 1: Create Tunnel in Cloudflare Dashboard

### Step 1: Access Cloudflare Zero Trust Dashboard

1. **Log in to Cloudflare**
   - Go to: https://dash.cloudflare.com
   - Enter your email and password
   - Complete 2FA if enabled

2. **Navigate to Zero Trust**
   - In the left sidebar, look for **"Zero Trust"**
   - Click on **"Zero Trust"**

   **Alternative if you don't see Zero Trust:**
   - Go directly to: https://one.dash.cloudflare.com/
   - Or click your account name → **"Zero Trust"**

3. **First-time setup** (if you haven't used Zero Trust before)
   - You'll be asked to choose a team name
   - Enter a team name (e.g., `quironix` or your company name)
   - Choose a plan: **Select "Free"** (sufficient for this use case)
   - Click **"Continue"**

---

### Step 2: Create a Tunnel

1. **Navigate to Tunnels**
   - In Zero Trust dashboard, look in left sidebar
   - Click **"Networks"** → **"Tunnels"**
   - Or go directly to: https://one.dash.cloudflare.com/[your-account-id]/networks/tunnels

2. **Create new tunnel**
   - Click **"Create a tunnel"** button (blue button, top right)

3. **Select tunnel type**
   - Choose **"Cloudflared"** (should be selected by default)
   - Click **"Next"**

4. **Name your tunnel**
   - Enter name: `quironix-pbx` (or any name you prefer)
   - Click **"Save tunnel"**

**✅ Checkpoint:** You should now see a screen titled "Install connector"

---

### Step 3: Install Connector on PBX Server

**Important:** Keep this browser tab open! You'll need information from it.

The dashboard will show installation commands for different operating systems.

1. **Select your OS**
   - Find the dropdown that says "Choose an environment"
   - Select **"Linux"** → **"Red Hat/CentOS/Rocky Linux"**

   The dashboard will display commands like this:

   ```bash
   # Example shown in dashboard (your TUNNEL-ID will be different)
   curl -L --output cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
   sudo rpm -i cloudflared.rpm
   sudo cloudflared service install <LONG-TOKEN-STRING>
   ```

2. **Copy the commands**
   - Click the **"Copy"** button next to the commands
   - Or manually copy all three commands

3. **SSH to your PBX server**
   - Open a terminal/SSH client
   - Connect to your server:
     ```bash
     ssh root@172.17.16.24
     ```
   - Or use your preferred SSH method

4. **Paste and run the commands**
   - Paste the commands you copied from the dashboard
   - Press Enter to execute

   **Expected output:**
   ```
   Downloading cloudflared...
   Installing cloudflared...
   cloudflared service installed successfully
   ```

5. **Verify installation**
   ```bash
   sudo systemctl status cloudflared
   ```

   Should show: `active (running)` ✅

6. **Back to dashboard**
   - Click **"Next"** button in the Cloudflare dashboard

**✅ Checkpoint:** The dashboard should show a green checkmark indicating the connector is connected.

---

### Step 4: Configure Public Hostname (Route Traffic)

Now you'll configure what traffic the tunnel should handle.

1. **Add a public hostname**
   - You should see "Route tunnel" section
   - Under "Public Hostnames", click **"Add a public hostname"**

2. **Configure the route**

   Fill in the form:

   **Subdomain:**
   - Enter: `pbx`

   **Domain:**
   - Select your domain from dropdown (e.g., `yourdomain.com`)
   - The full hostname will be: `pbx.yourdomain.com`

   **Path:**
   - Leave empty

   **Service:**

   - **Type:** Select `HTTPS` from dropdown
   - **URL:** Enter `172.17.16.24:8089`

   **Additional application settings** (expand this section):

   - **TLS:**
     - Find "No TLS Verify" option
     - Toggle it **ON** (enable it)
     - This is important because the PBX likely uses self-signed certificate

   - **HTTP settings:**
     - Scroll down to find these settings:
     - **Connection timeout:** `30s`
     - **TCP keepalive:** `30s`
     - **HTTP/2 Origin:** Leave default

3. **Save the hostname**
   - Click **"Save hostname"** button at the bottom

**✅ Checkpoint:** You should see your new route listed:
```
pbx.yourdomain.com → https://172.17.16.24:8089
```

---

### Step 5: Complete Setup

1. **Click "Save tunnel"** or **"Finish"** button

2. **You should now see your tunnel in the list:**
   - Name: `quironix-pbx`
   - Status: **Healthy** (green indicator)
   - Connector: 4 connections

**If status shows "Down" or "Inactive":**
   - Wait 30 seconds and refresh the page
   - Check server: `sudo systemctl status cloudflared`
   - Check server logs: `sudo journalctl -u cloudflared -n 50`

---

### Step 6: Verify DNS Configuration

The tunnel creation should have **automatically created** a DNS record.

**Verify it:**

1. **Go to DNS settings**
   - In main Cloudflare dashboard (not Zero Trust)
   - Select your domain
   - Click **"DNS"** → **"Records"**
   - Or go to: https://dash.cloudflare.com/[your-account-id]/[your-domain]/dns

2. **Look for the record**
   - You should see a CNAME record:
   - **Type:** CNAME
   - **Name:** `pbx`
   - **Target:** `<TUNNEL-ID>.cfargotunnel.com`
   - **Proxy status:** Proxied (orange cloud) ✅

**If you DON'T see the record:**

Click **"Add record"** and create it manually:
- **Type:** `CNAME`
- **Name:** `pbx`
- **Target:** `<TUNNEL-ID>.cfargotunnel.com`
  - Get TUNNEL-ID from Zero Trust → Networks → Tunnels → click your tunnel
- **Proxy status:** **Proxied** (orange cloud icon)
- **TTL:** Auto
- Click **"Save"**

---

### Step 7: Test the Tunnel

1. **Test from command line**

   From your local machine (not the server):
   ```bash
   curl -I https://pbx.yourdomain.com
   ```

   **Expected result:** Any response (even 404 or error) means the tunnel is working!

   Example good response:
   ```
   HTTP/2 404
   server: cloudflare
   ```

2. **Test WebSocket (if you have wscat installed)**
   ```bash
   # Install wscat if needed
   npm install -g wscat

   # Test WebSocket
   wscat -c wss://pbx.yourdomain.com/ws
   ```

   **Expected:** Connection established or WebSocket-specific error (means tunnel is working)

3. **Check tunnel status in dashboard**
   - Go back to: Zero Trust → Networks → Tunnels
   - Click on your tunnel name
   - You should see:
     - **Status:** Healthy ✅
     - **Requests:** Increasing number (if you tested)
     - **Connections:** 4 (healthy)

**✅ If all tests pass, your tunnel is working!**

---

## Part 2: Get Configuration Details for Server Admin

Now you need to provide specific information to your server administrator so they can complete the Asterisk/TURN configuration.

### Step 8: Get Your Cloudflare Account ID

1. **In Cloudflare dashboard**
   - Look at the URL in your browser
   - It will look like: `https://dash.cloudflare.com/1234567890abcdef/yourdomain.com`
   - The random string after `.com/` is your **Account ID**

   **Or:**
   - Click your account name (top right)
   - The Account ID is shown in the dropdown

2. **Copy and save it:**
   - Account ID: `____________________`

---

### Step 9: Create Cloudflare API Token

Your server admin needs this to generate TURN credentials.

1. **Go to API Tokens page**
   - Click on your profile icon (top right)
   - Select **"My Profile"**
   - Click **"API Tokens"** tab
   - Or go directly to: https://dash.cloudflare.com/profile/api-tokens

2. **Create new token**
   - Click **"Create Token"** button

3. **Use template or create custom**

   **Option A - Use Template (Easier):**
   - Find template: **"Edit Cloudflare Workers"** or **"API Token Template"**
   - Click **"Use template"**
   - Add permission: **Account** → **Cloudflare Calls** → **Edit**

   **Option B - Create Custom (More control):**
   - Click **"Create Custom Token"**
   - **Token name:** `Quironix TURN API`
   - **Permissions:**
     - Click **"Add more"**
     - Select: **Account** → **Cloudflare Calls** → **Edit**
   - **Account Resources:**
     - Include → Select your account
   - **TTL:** Select "1 year" or custom
   - Click **"Continue to summary"**

4. **Review and create**
   - Review permissions
   - Click **"Create Token"**

5. **Copy the token**
   - **⚠️ IMPORTANT:** Copy the token NOW - you won't see it again!
   - Click **"Copy"** button
   - Save it somewhere safe:

   ```
   API Token: cf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## Part 3: Information Package for Server Admin

Create this document and send to your Rocky Linux server administrator:

```
===============================================
CLOUDFLARE TUNNEL - CONFIGURATION DETAILS
===============================================

TUNNEL INFORMATION:
-------------------
✅ Tunnel created: YES
✅ Tunnel name: quironix-pbx
✅ Tunnel status: Healthy
✅ Public hostname: wss://pbx.yourdomain.com/ws

CLOUDFLARE ACCOUNT DETAILS:
---------------------------
Account ID: [PASTE YOUR ACCOUNT ID]
API Token: [PASTE YOUR API TOKEN]
Domain: yourdomain.com

TUNNEL ALREADY CONFIGURED:
--------------------------
✅ Cloudflared installed on server
✅ Tunnel service running
✅ Public hostname configured
✅ DNS record created

WHAT YOU NEED TO DO:
--------------------
1. Configure Asterisk/FreePBX for TURN servers
2. Generate TURN credentials using the API token above
3. Update firewall rules
4. Send back TURN credentials

INSTRUCTIONS:
-------------
Follow the "Configure Asterisk for TURN" section in:
- SERVER_MANAGER_INSTRUCTIONS.md (Steps 8-10)
- Or PBX_SERVER_SETUP.md (Phase 2)

Specifically you need to:
1. Edit /etc/asterisk/pjsip.conf
2. Add STUN/TURN configuration
3. Generate TURN credentials (command below)
4. Update firewall
5. Send credentials back to frontend team

GENERATE TURN CREDENTIALS:
--------------------------
Run this on the server (replace ACCOUNT_ID and API_TOKEN):

curl -X POST "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/calls/turn/keys" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "quironix-frontend-turn",
    "ttl": 31536000
  }'

Save the "key" and "secret" from the response and send to me.

===============================================
```

---

## Part 4: Alternative - Get Tunnel Token for Manual Installation

If the automatic installation didn't work, or you need to reinstall:

### Get Tunnel Token from Dashboard

1. **Go to your tunnel**
   - Zero Trust → Networks → Tunnels
   - Click on your tunnel name (`quironix-pbx`)

2. **Configure the connector**
   - Find the **"Configure"** section
   - Look for **"Install and run a connector"**
   - You'll see a token that looks like:
     ```
     eyJhIjoiNzE4YTk5ZjQwYzU0NDU5M2E3ZDhiMGRhNDZmYWE0MjUiLCJ0IjoiOGY...
     ```

3. **Use this token on the server**

   SSH to server and run:
   ```bash
   # If cloudflared is already installed
   sudo cloudflared service install eyJhIjoiNzE4YTk5ZjQwYzU0NDU5M2E3ZDhiMGRhNDZmYWE0MjUiLCJ0IjoiOGY...

   # Start service
   sudo systemctl start cloudflared
   sudo systemctl enable cloudflared
   ```

---

## Troubleshooting Dashboard Issues

### Issue: Can't find "Zero Trust" in sidebar

**Solution:**
- Go directly to: https://one.dash.cloudflare.com/
- Or from main dashboard, click your account dropdown → "Zero Trust"
- Some accounts need to activate Zero Trust first (it's free)

---

### Issue: Tunnel shows "Down" or "Inactive"

**Check:**

1. **On the server:**
   ```bash
   sudo systemctl status cloudflared
   ```

   If not running:
   ```bash
   sudo systemctl start cloudflared
   sudo journalctl -u cloudflared -n 50
   ```

2. **In dashboard:**
   - Wait 30-60 seconds
   - Refresh the page
   - Check if connections show up

---

### Issue: "No route found" or 404 error

**Check:**

1. **Public hostname configuration:**
   - Zero Trust → Networks → Tunnels → Your tunnel
   - Click **"Public Hostname"** tab
   - Verify route exists: `pbx.yourdomain.com` → `https://172.17.16.24:8089`

2. **If no route exists:**
   - Click **"Add a public hostname"**
   - Follow Step 4 again

---

### Issue: DNS record not created automatically

**Solution:**

Create manually:
1. Cloudflare Dashboard → Select domain → DNS → Records
2. Add CNAME record:
   - Name: `pbx`
   - Target: `<TUNNEL-ID>.cfargotunnel.com`
   - Proxy: ON (orange cloud)

**To find TUNNEL-ID:**
- Zero Trust → Networks → Tunnels
- Your tunnel ID is shown in the list
- Or click tunnel → Look for UUID in URL or page

---

### Issue: "TLS verification error" in tunnel logs

**Solution:**

1. **Edit public hostname:**
   - Zero Trust → Networks → Tunnels → Your tunnel
   - Click **"Public Hostname"** tab
   - Click **Edit** (pencil icon) on your route

2. **Enable "No TLS Verify":**
   - Expand **"Additional application settings"**
   - Find **"TLS"** section
   - Toggle **"No TLS Verify"** to ON
   - Click **"Save hostname"**

---

## Monitoring Your Tunnel

### View Tunnel Metrics

1. **In Cloudflare Dashboard:**
   - Zero Trust → Networks → Tunnels
   - Click on your tunnel name

2. **Metrics available:**
   - **Requests:** Number of requests through tunnel
   - **Connections:** Should show 4 (healthy)
   - **Data Transfer:** Amount of data transferred
   - **Status:** Healthy/Down/Degraded

### View Tunnel Logs

**In Dashboard (Limited):**
- Zero Trust → Logs → Gateway
- Filter by your tunnel

**On Server (Complete logs):**
```bash
# Real-time logs
sudo journalctl -u cloudflared -f

# Last 100 lines
sudo journalctl -u cloudflared -n 100

# Logs from today
sudo journalctl -u cloudflared --since today
```

---

## Managing Your Tunnel

### Edit Tunnel Routes

1. Zero Trust → Networks → Tunnels
2. Click your tunnel name
3. Click **"Public Hostname"** tab
4. Click **Edit** (pencil icon) on route
5. Make changes
6. Click **"Save hostname"**

### Add More Routes

1. Same as above, but click **"Add a public hostname"**
2. Configure new route
3. Save

### Delete Tunnel

1. Zero Trust → Networks → Tunnels
2. Click **...** (three dots) next to tunnel
3. Click **"Delete"**
4. Confirm

**⚠️ Don't forget to also:**
- Stop service on server: `sudo systemctl stop cloudflared`
- Remove DNS record from domain settings

---

## Summary Checklist

After completing this guide:

- [ ] Accessed Cloudflare Zero Trust dashboard
- [ ] Created tunnel named `quironix-pbx`
- [ ] Installed cloudflared on PBX server
- [ ] Configured public hostname: `pbx.yourdomain.com` → `https://172.17.16.24:8089`
- [ ] Verified DNS record exists
- [ ] Tested tunnel with curl (got response)
- [ ] Tunnel status shows "Healthy"
- [ ] Copied Account ID
- [ ] Created API Token
- [ ] Sent configuration package to server admin

---

## Next Steps

1. **Send the configuration package** (from Part 3) to your server administrator
2. **Wait for server admin** to complete Asterisk/TURN configuration
3. **Receive TURN credentials** from server admin
4. **Update your frontend code** following `WEBRTC_IMPLEMENTATION_GUIDE.md`
5. **Test WebRTC** without VPN

---

## Support Resources

**Cloudflare Documentation:**
- Zero Trust Tunnels: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
- Dashboard Guide: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-remote-tunnel/

**Video Tutorials:**
- Search YouTube: "Cloudflare Tunnel setup dashboard"
- Official Cloudflare channel has recent tutorials

**Community:**
- https://community.cloudflare.com/

---

**Guide completed!** You're ready to set up your Cloudflare Tunnel via the dashboard. Good luck! 🚀
