# Host Network Mode for Arduino Q

## The Problem

Docker's default bridge network creates an isolated network (172.17.0.x), which means:
- ❌ Backend accessible at `172.17.0.1:3001` (Docker network)
- ❌ NOT accessible at `192.168.1.169:3001` (WiFi network)
- ❌ Your Mac browser can't reach the Docker bridge network

## The Solution: Host Network Mode

By using `network_mode: host`, containers use the Arduino's network interface directly:
- ✅ Backend accessible at `192.168.1.169:3001` (WiFi network)
- ✅ Frontend accessible at `192.168.1.169:5173` (WiFi network)
- ✅ Your Mac browser can reach both services

## What Changed

**Before (Bridge Network):**
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

**After (Host Network):**
```yaml
services:
  backend:
    network_mode: host
    # No ports mapping needed - uses host's network directly
    # No custom networks needed
```

## Updated Setup Instructions

On your Arduino Q (192.168.1.169):

```bash
# 1. Pull latest changes or ensure you have the updated docker-compose.network.yml
cd /path/to/indy_sim

# 2. Make sure frontend/.env.network points to the Arduino's WiFi IP
cat > frontend/.env.network << EOF
VITE_BACKEND_URL=http://192.168.1.169:3001
EOF

# 3. Activate network configuration (if not already done)
./setup-network.sh

# 4. Stop old containers if running
docker-compose -f docker-compose.network.yml down

# 5. Start with host networking
docker-compose -f docker-compose.network.yml up --build
```

## Verification

On your Arduino Q, check that services are listening on the right interface:

```bash
# Should show 0.0.0.0:3001 or *:3001
sudo netstat -tlnp | grep 3001

# Should show 0.0.0.0:5173 or *:5173
sudo netstat -tlnp | grep 5173
```

From your Mac, test connectivity:

```bash
# Test backend health endpoint
curl http://192.168.1.169:3001/health

# Should return: {"status":"ok","timestamp":...}

# Test frontend
curl -I http://192.168.1.169:5173

# Should return: HTTP/1.1 200 OK
```

Then open browser on your Mac:
```
http://192.168.1.169:5173
```

## Key Differences with Host Mode

### Advantages ✅
- Containers use host's network directly (192.168.1.169)
- No network translation/NAT overhead
- Simpler networking - what you see is what you get
- Better performance (slightly)

### Considerations ⚠️
- Containers share the host's network namespace
- Port conflicts possible if host is already using 3001 or 5173
- `localhost` inside containers = host's localhost (not container's)
- Less isolation (but fine for single-purpose devices like Arduino Q)

### Not Available On ❌
- Docker Desktop for Mac/Windows (host networking only works on Linux)
- Good thing your Arduino Q runs Linux! 😊

## Troubleshooting

### Still showing 172.17.0.x?

Make sure you've rebuilt the containers with the new config:
```bash
docker-compose -f docker-compose.network.yml down
docker-compose -f docker-compose.network.yml up --build
```

### Port already in use?

Check what's using the ports:
```bash
sudo lsof -i :3001
sudo lsof -i :5173
```

Stop the conflicting service or change ports in the backend/.env:
```bash
echo "PORT=3002" >> backend/.env
```

Then update frontend/.env.network:
```bash
echo "VITE_BACKEND_URL=http://192.168.1.169:3002" > frontend/.env.network
```

### Can't access from Mac?

1. **Firewall check:**
   ```bash
   # On Arduino Q
   sudo ufw status
   sudo ufw allow 3001
   sudo ufw allow 5173
   ```

2. **Ping test:**
   ```bash
   # From your Mac
   ping 192.168.1.169
   ```

3. **Check containers are running:**
   ```bash
   docker ps
   ```

4. **Check logs:**
   ```bash
   docker-compose -f docker-compose.network.yml logs backend
   docker-compose -f docker-compose.network.yml logs frontend
   ```

### Backend logs show correct IP?

You should see in the logs:
```
Server running on 0.0.0.0:3001
CORS origin: *
```

NOT:
```
Server running on 127.0.0.1:3001
```

## Performance Tip for Arduino Q

If the simulation is too demanding, create `backend/.env`:

```bash
cat > backend/.env << EOF
UPDATE_FREQUENCY=10
TOTAL_LAPS=30
PORT=3001
EOF
```

Then restart:
```bash
docker-compose -f docker-compose.network.yml restart backend
```

## Summary

With `network_mode: host`:
- Backend binds to `0.0.0.0:3001` → accessible at `192.168.1.169:3001`
- Frontend binds to `0.0.0.0:5173` → accessible at `192.168.1.169:5173`
- Your Mac browser connects to `http://192.168.1.169:5173`
- WebSocket connects to `http://192.168.1.169:3001`
- Everything works! 🎉

No more Docker bridge network isolation issues!

