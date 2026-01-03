# Network Setup Guide for Arduino Q (or Remote Access)

This guide explains how to run the Indy Sim stack on a remote device (like Arduino Q) and access it from a browser on a different machine on the same network.

## Problem

The default configuration uses `localhost` for WebSocket connections, which doesn't work when:
- The Docker containers run on one machine (Arduino Q)
- The web browser is on a different machine (your laptop/desktop)

## Solution

We've created network-enabled variants of the configuration files that allow cross-machine WebSocket connections.

## Setup Instructions

### 1. Find Your Arduino Q's IP Address

On the Arduino Q, run:
```bash
hostname -I
```
or
```bash
ip addr show
```

Look for an IP like `192.168.1.xxx` or `10.0.0.xxx` (your home network IP).

### 2. Create the Frontend Environment File

On the Arduino Q, create a file `frontend/.env.network`:

```bash
cd /path/to/indy_sim/frontend
cat > .env.network << EOF
VITE_BACKEND_URL=http://<YOUR_ARDUINO_IP>:3001
EOF
```

Replace `<YOUR_ARDUINO_IP>` with the actual IP address from step 1.

**Example:**
```bash
# If your Arduino IP is 192.168.1.50
echo "VITE_BACKEND_URL=http://192.168.1.50:3001" > .env.network
```

### 3. Update Backend to Use Network Server

On the Arduino Q, temporarily rename the backend server file:

```bash
cd /path/to/indy_sim/backend/src
mv server.js server.original.js
cp server.network.js server.js
```

### 4. Update Frontend to Use Network Configuration

On the Arduino Q:

```bash
cd /path/to/indy_sim/frontend/src
mv App.jsx App.original.jsx
cp App.network.jsx App.jsx
```

### 5. Start the Containers

Use the network-enabled docker-compose file:

```bash
cd /path/to/indy_sim
docker-compose -f docker-compose.network.yml up --build
```

### 6. Access from Your Browser

On your laptop/desktop, open a web browser and navigate to:
```
http://<YOUR_ARDUINO_IP>:5173
```

Replace `<YOUR_ARDUINO_IP>` with your Arduino's IP address.

**Example:**
```
http://192.168.1.50:5173
```

## What Changed?

### Backend Changes (`server.network.js`)
- Added `CORS_ORIGIN` environment variable support
- Allows wildcard CORS (`*`) for development
- Binds to `0.0.0.0` instead of localhost
- More verbose logging for debugging

### Frontend Changes (`App.network.jsx`)
- Uses `VITE_BACKEND_URL` environment variable
- Falls back to localhost if not set
- Shows backend URL in loading screen for debugging

### Docker Compose Changes (`docker-compose.network.yml`)
- Sets `CORS_ORIGIN=*` for backend
- Sets `HOST=0.0.0.0` for backend
- Mounts `.env.network` file for frontend

## Reverting to Local Development

To go back to the original localhost configuration:

```bash
# Backend
cd backend/src
mv server.original.js server.js

# Frontend
cd ../../frontend/src
mv App.original.jsx App.jsx

# Use original docker-compose
docker-compose up
```

## Troubleshooting

### WebSocket Still Not Connecting

1. **Check firewall settings** on Arduino Q:
   ```bash
   # Allow ports 3001 and 5173
   sudo ufw allow 3001
   sudo ufw allow 5173
   ```

2. **Verify containers are running**:
   ```bash
   docker ps
   ```

3. **Check backend logs**:
   ```bash
   docker-compose -f docker-compose.network.yml logs backend
   ```

4. **Check frontend logs**:
   ```bash
   docker-compose -f docker-compose.network.yml logs frontend
   ```

5. **Test backend health endpoint** from your laptop:
   ```bash
   curl http://<ARDUINO_IP>:3001/health
   ```

### Browser Console Errors

Open browser DevTools (F12) and check the Console tab for connection errors. The frontend now logs the backend URL it's trying to connect to.

### Network Issues

- Ensure both devices are on the same network
- Try pinging the Arduino Q from your laptop: `ping <ARDUINO_IP>`
- Check if any router firewalls are blocking the ports

## Performance Notes

The Arduino Q may be slower than a typical development machine. You might want to:

1. Reduce the simulation update frequency by setting environment variable:
   ```bash
   export UPDATE_FREQUENCY=10  # Lower = slower updates, less CPU
   ```

2. Monitor resource usage:
   ```bash
   docker stats
   ```

## Security Warning

⚠️ **Important:** The `CORS_ORIGIN=*` setting allows connections from any origin. This is fine for a home network test, but **DO NOT** use this configuration on a public network or in production.

For better security, replace `*` with your laptop's IP in the docker-compose file:
```yaml
environment:
  - CORS_ORIGIN=http://192.168.1.100:5173
```

