# Testing Guide - Arduino Q LED Display

## Phase 1: Deploy Sketch (5 minutes)

### On Arduino Q:

```bash
cd ~/indy_sim/arduino-led

# Deploy the sketch
./quick_deploy.sh
```

**Expected output:**
- App created at `~/.local/share/arduino-app-cli/apps/indy-sim-display/`
- Sketch compiled and uploaded
- App started

**What to look for:**
- LED matrix should show animated startup sequence
- Two dots should be moving around an oval track
- This is simulation mode (no backend needed yet)

### Check status:

```bash
# View app list
arduino-app-cli app list

# Should show:
# indy-sim-display    🏎️   running   false

# View logs
arduino-app-cli app logs indy-sim-display

# Should show:
# "Indy Sim LED Display Ready"
# "Matrix: 12x8 pixels"
# "Method registered: indy/raceUpdate"
```

✅ **Phase 1 Complete:** LED matrix works, sketch is running

---

## Phase 2: Test Communication (10 minutes)

### Test the backend sender:

```bash
cd ~/indy_sim/arduino-led

# Run test sender
node test_sender.js
```

**Expected output:**
```
============================================================
LED Sender Test - Indy Sim
============================================================

Socket: /var/run/arduino-router.sock
Method: indy/raceUpdate

✓ Socket found

Connecting...
✓ Connected to arduino-router

Starting race simulation...
(Cars moving around 5281m track)

Press Ctrl+C to stop

[20] Car1: 500m | Car2: 900m
[40] Car1: 1000m | Car2: 1300m
...
```

**Check the sketch logs:**
```bash
arduino-app-cli app logs indy-sim-display --follow
```

**Should show:**
```
Race update: Car1=500m, Car2=900m
Race update: Car1=1000m, Car2=1300m
...
```

**Watch the LED matrix:**
- Cars should move based on the data being sent
- Not simulation anymore - real data from test sender!

Press Ctrl+C to stop the test sender.

✅ **Phase 2 Complete:** Backend → Router → Sketch → LED matrix works!

---

## Phase 3: Integrate with Real Backend (15 minutes)

Now connect it to the actual race simulation!

### Create backend integration:

Edit `/Users/dwestbury/Documents/Source Code/indy_sim/backend/src/server.js`:

Add at the top:
```javascript
import { LEDSenderSocket } from '../arduino-led/backend-extension/ledSender_socket.js';
```

After creating `raceSimulation`, add:
```javascript
// Initialize LED sender (if on Arduino Q)
const ledSender = new LEDSenderSocket({
  enabled: process.env.ENABLE_LED_DISPLAY === 'true',
  updateRate: 20
});
```

In the `setInterval` that broadcasts race updates, add:
```javascript
setInterval(() => {
  raceSimulation.update();
  const state = raceSimulation.getCurrentState();
  io.emit('raceUpdate', state);
  
  // Send to LED matrix
  ledSender.sendData(state);  // <-- ADD THIS LINE
}, updateInterval);
```

Add cleanup on exit:
```javascript
process.on('SIGINT', () => {
  ledSender.close();
  process.exit();
});
```

### Update docker-compose.network.yml:

Add environment variable:
```yaml
services:
  backend:
    environment:
      - ENABLE_LED_DISPLAY=true
```

### Restart backend:

```bash
cd ~/indy_sim
docker-compose -f docker-compose.network.yml restart backend
```

### Verify it works:

```bash
# Check backend logs
docker-compose -f docker-compose.network.yml logs -f backend

# Should see:
# "[LED Sender] Connecting to /var/run/arduino-router.sock..."
# "[LED Sender] Connected to arduino-router"
# "[LED Sender] Sent 100 messages. Car1: 1234m, Car2: 2345m"

# Check sketch logs
arduino-app-cli app logs indy-sim-display --follow

# Should see race updates matching the simulation
```

### Open the web interface:

From your Mac: `http://192.168.1.169:5173`

**You should now see:**
- 🖥️ **Web browser:** Full race dashboard with telemetry
- 🔴 **LED Matrix:** Cars racing around the track
- **Both synchronized in real-time!**

✅ **Phase 3 Complete:** Full integration working!

---

## Troubleshooting

### Sketch won't compile

```bash
# Check for errors
arduino-app-cli app logs indy-sim-display

# Try restarting
arduino-app-cli app stop indy-sim-display
arduino-app-cli app start indy-sim-display
```

### LED matrix shows nothing

```bash
# Check if app is running
arduino-app-cli app list

# Restart the app
arduino-app-cli app restart indy-sim-display

# Check logs for errors
arduino-app-cli app logs indy-sim-display
```

### Test sender can't connect

```bash
# Check arduino-router is running
systemctl status arduino-router

# Check socket exists
ls -la /var/run/arduino-router.sock

# Try restarting arduino-router
sudo systemctl restart arduino-router
```

### Backend can't connect to socket

Docker containers need access to the socket. Update docker-compose.network.yml:

```yaml
services:
  backend:
    volumes:
      - /var/run/arduino-router.sock:/var/run/arduino-router.sock
```

Then restart:
```bash
docker-compose -f docker-compose.network.yml restart backend
```

### Cars moving strangely on LED matrix

Check the track mapping in the sketch. The oval might need adjustment based on how the matrix is oriented.

Edit `sketch/indy_sim_display.ino` and adjust the `trackPixels` array.

---

## Performance Notes

### Update Rates

- **Race Simulation:** 30 Hz (every 33ms)
- **LED Display:** 20 Hz (every 50ms) - Good balance for Arduino Q
- **WebSocket:** 30 Hz (every 33ms)

### If LED display is laggy:

Reduce update rate in backend integration:
```javascript
const ledSender = new LEDSenderSocket({
  enabled: true,
  updateRate: 10  // Reduce to 10 Hz
});
```

### If Arduino Q is struggling:

```bash
# Check CPU usage
docker stats

# Reduce race simulation update rate
echo "UPDATE_FREQUENCY=20" >> backend/.env
docker-compose -f docker-compose.network.yml restart backend
```

---

## Success Criteria

✅ LED matrix shows animated track on startup
✅ Test sender successfully sends data to sketch
✅ Sketch receives data and updates display
✅ Backend connects to arduino-router socket
✅ Real race data appears on LED matrix
✅ Web interface and LED matrix show same race, synchronized
✅ No lag or stuttering on either display

---

## What's Next?

### Optional Enhancements:

1. **Add pit stop indicator:** Flash LEDs when a car pits
2. **Show lap count:** Use bottom row of LEDs as lap progress bar
3. **Add start/finish line:** Mark position 0 with different pattern
4. **Speed indicator:** Use brightness to show relative speeds
5. **Winner celebration:** Animated sequence when race finishes

### Visualizations:

Try the alternative `updateDisplayProgressBar()` function in the sketch for a different layout (horizontal progress bars instead of oval).

---

## Commands Reference

```bash
# App Management
arduino-app-cli app list
arduino-app-cli app start indy-sim-display
arduino-app-cli app stop indy-sim-display
arduino-app-cli app restart indy-sim-display
arduino-app-cli app logs indy-sim-display
arduino-app-cli app logs indy-sim-display --follow

# Testing
node test_sender.js

# Docker
docker-compose -f docker-compose.network.yml logs -f backend
docker-compose -f docker-compose.network.yml restart backend

# System
systemctl status arduino-router
```

---

Enjoy your multi-platform race visualization! 🏎️✨

