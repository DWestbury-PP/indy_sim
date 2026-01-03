# Docker Networking: Bridge vs Host Mode

## Understanding the Issue You Encountered

### Bridge Network (Original - Didn't Work)

```
┌─────────────────────────────────────────────────────┐
│  Arduino Q (192.168.1.169) - Your WiFi Network     │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Docker Bridge Network (172.17.0.0/16)      │   │
│  │                                              │   │
│  │  ┌──────────────┐      ┌──────────────┐    │   │
│  │  │  Backend     │      │  Frontend    │    │   │
│  │  │  172.17.0.2  │      │  172.17.0.3  │    │   │
│  │  │  :3001       │      │  :5173       │    │   │
│  │  └──────────────┘      └──────────────┘    │   │
│  │                                              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
         ↑
         │
    ❌ Mac browser CANNOT reach 172.17.0.x
    (Docker internal network only)
```

**Result:** 
- ✅ Backend accessible at `172.17.0.1:3001` (from Arduino)
- ❌ Backend NOT accessible at `192.168.1.169:3001` (from Mac)
- ❌ WebSocket connection fails from Mac browser

### Host Network (Fixed - Works!)

```
┌─────────────────────────────────────────────────────┐
│  Arduino Q (192.168.1.169) - Your WiFi Network     │
│                                                     │
│  ┌──────────────┐      ┌──────────────┐           │
│  │  Backend     │      │  Frontend    │           │
│  │  0.0.0.0     │      │  0.0.0.0     │           │
│  │  :3001       │      │  :5173       │           │
│  └──────────────┘      └──────────────┘           │
│                                                     │
│  (Containers use host's network directly)          │
│                                                     │
└─────────────────────────────────────────────────────┘
         ↑
         │
    ✅ Mac browser CAN reach 192.168.1.169:3001
    (Arduino's WiFi IP)
```

**Result:**
- ✅ Backend accessible at `192.168.1.169:3001` (from Mac)
- ✅ Frontend accessible at `192.168.1.169:5173` (from Mac)
- ✅ WebSocket connection works from Mac browser

## Technical Details

### Bridge Network (`network_mode: bridge` - default)

**How it works:**
1. Docker creates isolated network (172.17.0.0/16)
2. Containers get IPs in that range (172.17.0.2, 172.17.0.3, etc.)
3. Port mapping (`-p 3001:3001`) NATs traffic from host to container
4. Containers are isolated from host network

**Port mapping flow:**
```
Mac Browser → 192.168.1.169:3001 → Arduino host → NAT → 172.17.0.2:3001 (container)
```

**Why it didn't work:**
- Port mapping was configured (`ports: "3001:3001"`)
- BUT: Backend was seeing requests from 172.17.x.x (Docker gateway)
- CORS/WebSocket may have had issues with the translation
- Network namespace isolation causing connection issues

### Host Network (`network_mode: host`)

**How it works:**
1. No isolated network created
2. Containers use host's network directly
3. No port mapping needed (or possible)
4. Container sees same interfaces as host

**Connection flow:**
```
Mac Browser → 192.168.1.169:3001 → Backend container (direct, no NAT)
```

**Why it works:**
- Container binds to 0.0.0.0:3001 on host's network
- This means 192.168.1.169:3001 (WiFi interface)
- No network translation/NAT
- Direct connection = WebSocket works perfectly

## Code Changes Required

### docker-compose.yml

**Bridge (didn't work):**
```yaml
services:
  backend:
    ports:
      - "3001:3001"
    networks:
      - indy-sim-network

networks:
  indy-sim-network:
    driver: bridge
```

**Host (works!):**
```yaml
services:
  backend:
    network_mode: host
    # No ports: needed
    # No networks: needed
```

### Backend Code (server.js)

No changes needed! Already configured to bind to `0.0.0.0`:

```javascript
const HOST = process.env.HOST || '0.0.0.0';
httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
```

With host networking, `0.0.0.0:3001` → `192.168.1.169:3001` ✅

### Frontend Config (.env.network)

```bash
VITE_BACKEND_URL=http://192.168.1.169:3001
```

This tells the browser (on Mac) where to connect.

## Advantages of Host Network

✅ **Performance:** No NAT overhead  
✅ **Simplicity:** What you see is what you get  
✅ **Compatibility:** Better for real-time protocols (WebSocket)  
✅ **Debugging:** Easier to troubleshoot  

## Considerations

⚠️ **Port conflicts:** Container ports must not conflict with host  
⚠️ **Less isolation:** Containers share host network (fine for single-purpose device)  
⚠️ **Linux only:** Host networking only works on Linux (good for Arduino Q!)  

## When to Use Each

### Use Bridge Network When:
- Running multiple services that might conflict
- Need network isolation for security
- Running on Docker Desktop (Mac/Windows)
- Don't need external access

### Use Host Network When:
- Running on Linux (like Arduino Q)
- Need external network access
- Real-time protocols (WebSocket, UDP, etc.)
- Single-purpose device/deployment
- Performance matters

## Your Arduino Q Deployment

**Perfect use case for host networking:**
- ✅ Linux device (Debian on Arduino Q)
- ✅ Single purpose (running Indy Sim)
- ✅ Need external access (from Mac browser)
- ✅ WebSocket real-time data
- ✅ No port conflicts expected

## Commands to Check

### Verify host network mode is active:

```bash
# Check container network mode
docker inspect <container_id> | grep NetworkMode

# Should show: "NetworkMode": "host"
```

### Verify services are on host network:

```bash
# Should show 0.0.0.0:3001 and 0.0.0.0:5173
sudo netstat -tlnp | grep -E '3001|5173'
```

### Test from external machine (Mac):

```bash
# Backend health check
curl http://192.168.1.169:3001/health

# Frontend
curl -I http://192.168.1.169:5173
```

## Summary

**Bridge Network:**
- Containers isolated in 172.17.0.x
- Port mapping required
- ❌ Didn't work for your use case

**Host Network:**
- Containers on 192.168.1.169 (Arduino's WiFi IP)
- No port mapping
- ✅ Works perfectly for your use case

That's why we switched from bridge to host! 🎉

