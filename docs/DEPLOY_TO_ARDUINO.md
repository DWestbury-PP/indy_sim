# Deploy to Arduino Q - Quick Guide

Your Arduino Q is at: **192.168.1.169**

## The Fix Applied

**Problem:** Docker bridge network created isolated network (172.17.0.x) instead of using WiFi network (192.168.1.169)

**Solution:** Changed `docker-compose.network.yml` to use **host network mode** so containers bind directly to the Arduino's WiFi interface.

## Deploy Now

On your Arduino Q:

```bash
cd /path/to/indy_sim

# 1. Stop existing containers
docker-compose -f docker-compose.network.yml down

# 2. Pull/update if needed, or make sure docker-compose.network.yml is updated

# 3. Run setup script to configure with 192.168.1.169
./setup-network.sh

# 4. Start with host networking
docker-compose -f docker-compose.network.yml up --build
```

## Verify It's Working

### From Arduino Q:

```bash
# Check services are listening
sudo netstat -tlnp | grep -E '3001|5173'

# Should show something like:
# tcp  0  0  0.0.0.0:3001  0.0.0.0:*  LISTEN  <pid>/node
# tcp  0  0  0.0.0.0:5173  0.0.0.0:*  LISTEN  <pid>/node
```

### From Your Mac:

```bash
# Test backend
curl http://192.168.1.169:3001/health
# Should return: {"status":"ok","timestamp":1704312345678}

# Test frontend
curl -I http://192.168.1.169:5173
# Should return: HTTP/1.1 200 OK
```

### In Browser (on your Mac):

Open: `http://192.168.1.169:5173`

You should see:
- ✅ Connection status shows "● Connected"
- ✅ Race data loads
- ✅ Cars moving on track
- ✅ Live telemetry updating

## What Changed in docker-compose.network.yml

```yaml
# OLD (Bridge Network)
services:
  backend:
    ports:
      - "3001:3001"
    networks:
      - indy-sim-network

# NEW (Host Network)
services:
  backend:
    network_mode: host  # <-- This is the key change!
    # No port mapping needed
    # No custom networks needed
```

## If You Get Errors

### Port already in use

```bash
# Check what's using the ports
sudo lsof -i :3001
sudo lsof -i :5173

# Kill the process or use different ports
```

### Firewall blocking

```bash
sudo ufw allow 3001
sudo ufw allow 5173
sudo ufw status
```

### Can't ping from Mac

```bash
# From Mac
ping 192.168.1.169

# If this fails, check network connectivity first
```

### Containers not starting

```bash
# Check logs
docker-compose -f docker-compose.network.yml logs

# Try rebuilding
docker-compose -f docker-compose.network.yml up --build --force-recreate
```

## Performance Tuning for Arduino Q

If it's slow, reduce the simulation frequency:

```bash
cat > backend/.env << EOF
UPDATE_FREQUENCY=10
TOTAL_LAPS=30
PORT=3001
EOF

docker-compose -f docker-compose.network.yml restart backend
```

## Success Checklist

- [ ] `docker ps` shows 2 running containers
- [ ] `curl http://192.168.1.169:3001/health` returns JSON
- [ ] `curl http://192.168.1.169:5173` returns HTML
- [ ] Browser at `http://192.168.1.169:5173` shows race sim
- [ ] Connection status shows "Connected"
- [ ] Cars are moving on track
- [ ] Telemetry is updating

If all boxes checked: **You're good to go!** 🏁

## Still Having Issues?

See `NETWORK_HOST_MODE.md` for detailed troubleshooting.

