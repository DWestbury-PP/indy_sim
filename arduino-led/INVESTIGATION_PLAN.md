# Arduino Q LED Matrix Investigation Plan

## Goal
Display the Indy Sim race on the Arduino Q's embedded LED matrix by:
1. Extending the backend to send race data to the microcontroller
2. Creating a sketch that receives data and renders it on the LED matrix
3. Using the arduino-router bridge for Linux → Microcontroller communication

## Phase 1: Investigation (Run these on your Arduino Q)

### 1.1 Check for arduino-router

```bash
# Check if arduino-router is installed
which arduino-router
systemctl status arduino-router

# Check for arduino-router process
ps aux | grep arduino-router

# Look for socket/communication interface
ls -la /dev/ | grep -i arduino
ls -la /run/ | grep -i arduino
ls -la /var/run/ | grep -i arduino
```

### 1.2 Find Arduino CLI

```bash
# Check for Arduino CLI
which arduino-cli
arduino-cli version

# Look for App CLI
which arduino-app-cli
arduino-app-cli --help
```

### 1.3 Explore Installed Examples

```bash
# Look for example sketches/apps
find /usr -name "*arduino*" -type d 2>/dev/null
find /opt -name "*arduino*" -type d 2>/dev/null
find ~ -name "*arduino*" -type d 2>/dev/null

# Look for LED matrix examples
find / -name "*LED*" -o -name "*matrix*" -o -name "*display*" 2>/dev/null | grep -i arduino
```

### 1.4 Check for Libraries

```bash
# Find Arduino libraries directory
arduino-cli lib list
arduino-cli core list

# Look for RouterBridge
find / -name "*RouterBridge*" 2>/dev/null
find / -name "*RPClite*" 2>/dev/null
```

### 1.5 Check LED Matrix Hardware Info

```bash
# Look for device tree info
ls -la /sys/class/leds/
ls -la /sys/class/gpio/

# Check dmesg for LED info
dmesg | grep -i led
dmesg | grep -i matrix

# Check for I2C/SPI devices (common for LED matrices)
ls -la /dev/i2c*
ls -la /dev/spi*
```

### 1.6 Examine Running Sketches

```bash
# Check if there's already a sketch running
ps aux | grep sketch

# Look for App Lab examples
ls -la /var/lib/arduino-app-lab/ 2>/dev/null
ls -la ~/.arduino-app-lab/ 2>/dev/null
```

## Phase 2: Research Findings

Document your findings in a file called `ARDUINO_Q_FINDINGS.txt`:

```bash
cat > ~/ARDUINO_Q_FINDINGS.txt << 'EOF'
ARDUINO Q INVESTIGATION RESULTS
================================

1. arduino-router status:
[paste output here]

2. Arduino CLI info:
[paste output here]

3. LED devices found:
[paste output here]

4. Libraries available:
[paste output here]

5. Example sketches:
[paste output here]

6. Communication interfaces:
[paste output here]
EOF
```

## Phase 3: Test Communication

### 3.1 Simple Test Sketch

If you find arduino-router is running, we can create a test sketch that:
1. Listens for data from Linux
2. Blinks an LED or displays something on the matrix

### 3.2 Linux Test Sender

Create a simple Node.js script that sends test data through arduino-router to verify the communication pipeline works.

## Phase 4: Implementation

Once we understand the hardware and communication method:

### 4.1 Backend Extension
- Add LED matrix data output to the race engine
- Simplify race state to LED-matrix-friendly format
- Send updates via arduino-router

### 4.2 Microcontroller Sketch
- Receive race data via RouterBridge
- Map track to LED matrix coordinates
- Render car positions with different colors
- Update at reasonable refresh rate

### 4.3 Integration
- Configure arduino-router communication
- Deploy sketch to microcontroller
- Connect backend to arduino-router
- Test and debug

## Expected Architecture

```
┌─────────────────────────────────────────────────┐
│  Arduino Q - Linux (Debian)                     │
│                                                  │
│  ┌────────────┐        ┌──────────────┐        │
│  │  Backend   │───────→│ arduino-     │        │
│  │  (Node.js) │  data  │ router       │        │
│  │            │        │ (daemon)     │        │
│  └────────────┘        └──────┬───────┘        │
│                               │                 │
│                               │ IPC/Socket      │
│  ─────────────────────────────┼─────────────────│
│                               │                 │
│  Arduino Q - Microcontroller  │                 │
│                               ↓                 │
│  ┌────────────────────────────────────┐        │
│  │  Sketch (C++)                      │        │
│  │  - RouterBridge.receive()          │        │
│  │  - Parse race data                 │        │
│  │  - Update LED matrix               │        │
│  └────────────────────────────────────┘        │
│                               │                 │
│                               ↓                 │
│  ┌────────────────────────────────────┐        │
│  │  LED Matrix Display                │        │
│  │  🔴 Car 1    🔵 Car 2              │        │
│  └────────────────────────────────────┘        │
└─────────────────────────────────────────────────┘
```

## Data Format Design

### Simple LED Matrix Protocol
```javascript
// From Backend to Microcontroller
{
  "car1": {
    "pos": 234,      // Track position (0-5281m)
    "speed": 287     // Speed in km/h
  },
  "car2": {
    "pos": 189,
    "speed": 282
  }
}

// Or even simpler - CSV:
// "234,287,189,282\n"
```

### Matrix Rendering Strategy
- Represent track as a loop on the LED matrix
- Car 1 = Red LED
- Car 2 = Blue LED
- Leader could pulse/blink
- Speed could affect brightness

## Next Steps

1. **Run Phase 1 investigation commands** on your Arduino Q
2. **Save results** to a file
3. **Share findings** so we can create the actual implementation
4. Based on what you find, we'll create:
   - The sketch for the microcontroller
   - Backend extension to send data
   - Deployment scripts

## Escape Hatch: Alternative Approaches

If arduino-router is too locked down or unavailable:

### Option A: Serial Communication
- Use USB serial connection
- Backend writes to /dev/ttyUSB* or similar
- Sketch reads from Serial

### Option B: Shared File
- Backend writes to a file
- Sketch (or a bridge script) reads the file
- Less elegant but might work

### Option C: I2C/GPIO Direct Control
- If we have permissions, control LEDs directly from Linux
- No sketch needed
- Requires understanding the LED matrix hardware connection

## References

- Shawn Hymel's CLI Guide: https://www.hackster.io/news/shawn-hymel-s-cli-guide-frees-arduino-uno-q-users-from-the-quite-limiting-app-lab-31bcf330d7e2
- Arduino App Lab Components: https://support.arduino.cc/hc/en-us/articles/24358702846748
- GitHub repos: arduino-router, Arduino_RouterBridge, Arduino_RPClite

## Questions to Answer

- [ ] What LED matrix is on the Arduino Q? (Size? Type? NeoPixel/WS2812?)
- [ ] Is arduino-router running and accessible?
- [ ] Can we deploy sketches via CLI?
- [ ] What libraries are available?
- [ ] Are there existing LED matrix examples?
- [ ] What's the communication protocol between Linux and MCU?

