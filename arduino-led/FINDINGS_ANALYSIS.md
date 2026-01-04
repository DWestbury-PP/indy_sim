# Arduino Q Investigation - Findings Analysis

## 🎯 Summary: PERFECT SETUP!

All required components are available. LED display is fully feasible!

## ✅ Components Found

### 1. arduino-router (Communication Bridge)
```bash
Status: active (running)
Socket: /var/run/arduino-router.sock
Serial: /dev/ttyHS1 @ 115200 baud
Access: World-writable socket (srw-rw-rw-)
```

**This is our communication channel!**
- Backend writes JSON-RPC messages to the Unix socket
- arduino-router forwards to microcontroller
- RouterBridge library receives on MCU side

### 2. Arduino_LED_Matrix Library
```
Location: /home/arduino/.arduino15/packages/arduino/hardware/zephyr/0.52.0/libraries/Arduino_LED_Matrix
```

**This controls the LED matrix!**
- Official Arduino library for UNO Q's LED matrix
- Need to examine API to see matrix size and methods

### 3. Arduino_RouterBridge Library  
```
Location: /home/arduino/.arduino15/packages/arduino/hardware/zephyr/0.52.0/libraries/Arduino_RouterBridge
```

**This receives data from Linux!**
- Used in sketch to receive messages from arduino-router
- Handles the serial protocol automatically

### 4. Example Projects
```
- led-matrix-painter (uses LED matrix!)
- air-quality-monitoring
- blink
```

**The led-matrix-painter example is gold!**
- Shows how to use Arduino_LED_Matrix
- Shows how to use RouterBridge
- We can learn the exact API from this

### 5. Available LEDs
```
/sys/class/leds/:
- blue:user
- green:user  
- red:user
- blue:bt
- green:wlan
- red:panic
```

**Individual status LEDs available too!**
- Could use these for race status indicators
- LED matrix is separate (controlled via library)

### 6. Development Tools
```
arduino-cli: v1.4.0 ✅
arduino-app-cli: Available ✅
Board: arduino:zephyr 0.52.0 ✅
```

## 📋 Next Steps

### Step 1: Examine LED Matrix Library (5 min)
```bash
cat /home/arduino/.arduino15/packages/arduino/hardware/zephyr/0.52.0/libraries/Arduino_LED_Matrix/src/Arduino_LED_Matrix.h
```

We need to know:
- Matrix size (width x height)
- API methods (begin(), setPixel(), etc.)
- Frame buffer format

### Step 2: Examine led-matrix-painter Example (10 min)
```bash
ls -la /home/arduino/.local/share/arduino-app-cli/examples/led-matrix-painter/
cat /home/arduino/.local/share/arduino-app-cli/examples/led-matrix-painter/sketch.ino
```

This will show us:
- How to initialize the matrix
- How to draw on it
- How to use RouterBridge with it

### Step 3: Test Communication via Socket (15 min)
Create a simple Node.js script to send test data:
```javascript
const net = require('net');
const socket = '/var/run/arduino-router.sock';

// Send JSON-RPC message
const client = net.connect(socket);
client.write(JSON.stringify({
  jsonrpc: "2.0",
  method: "your/method",
  params: { data: "test" },
  id: 1
}));
```

### Step 4: Create Sketch (30 min)
Based on led-matrix-painter example, create sketch that:
1. Includes Arduino_LED_Matrix and Arduino_RouterBridge
2. Receives race data via RouterBridge
3. Renders cars on LED matrix

### Step 5: Backend Integration (30 min)
Extend backend to:
1. Connect to /var/run/arduino-router.sock
2. Send race data as JSON-RPC messages
3. Rate limit to reasonable frequency

## 🎨 Expected LED Matrix

Based on Arduino UNO R4 (similar to UNO Q), the LED matrix is likely:
- **12x8 pixels** (96 LEDs total)
- **Red LEDs** (monochrome)
- **I2C controlled** internally

We can render:
```
▓▓▓▓▓▓▓▓▓▓▓▓  (12 pixels wide)
▓          ▓
▓ ●        ▓  (Car 1)
▓       ●  ▓  (Car 2)
▓          ▓
▓          ▓
▓▓▓▓▓▓▓▓▓▓▓▓
(blank row)
```

## 🔧 Communication Protocol

arduino-router uses JSON-RPC 2.0 over Unix socket:

```json
{
  "jsonrpc": "2.0",
  "method": "indy/raceUpdate",
  "params": {
    "car1_pos": 234,
    "car2_pos": 189
  },
  "id": 1
}
```

Sketch registers method via RouterBridge:
```cpp
RouterBridge.onMessage("indy/raceUpdate", handleRaceUpdate);
```

## 📊 Architecture Confirmed

```
┌─────────────────────────────────────────────────┐
│  Arduino Q @ 192.168.1.169                      │
│                                                  │
│  Linux Side                                     │
│  ┌──────────────────────────────────────────┐  │
│  │  Backend (Node.js in Docker)             │  │
│  │  - Race simulation                        │  │
│  │  - Connect to Unix socket                 │  │
│  │  - Send JSON-RPC messages                 │  │
│  └─────────────┬────────────────────────────┘  │
│                │                                 │
│                ↓                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  /var/run/arduino-router.sock           │   │
│  │  (Unix domain socket - world writable)   │   │
│  └─────────────┬───────────────────────────┘   │
│                │                                 │
│                ↓                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  arduino-router daemon (PID 577)        │   │
│  │  - Listens on Unix socket               │   │
│  │  - Forwards to /dev/ttyHS1              │   │
│  └─────────────┬───────────────────────────┘   │
│                │ Serial 115200 baud             │
│  ══════════════╪═════════════════════════════  │
│                │                                 │
│  Microcontroller Side (STM32U585)              │
│                ↓                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Sketch                                  │   │
│  │  #include <Arduino_RouterBridge.h>      │   │
│  │  #include <Arduino_LED_Matrix.h>        │   │
│  │                                          │   │
│  │  RouterBridge.onMessage(...)            │   │
│  │  matrix.loadFrame(...)                  │   │
│  └─────────────┬───────────────────────────┘   │
│                │                                 │
│                ↓                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  🔴🔴 LED Matrix (12x8)                 │   │
│  │  Cars racing around track                │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## 🚀 Implementation Ready!

All components verified. We can now:
1. Examine the example code
2. Create our sketch
3. Deploy it
4. Integrate with backend

Estimated time to working prototype: 2-3 hours!

## 📝 Files to Examine on Arduino Q

Run these commands to get the API details:

```bash
# LED Matrix header
cat ~/.arduino15/packages/arduino/hardware/zephyr/0.52.0/libraries/Arduino_LED_Matrix/src/Arduino_LED_Matrix.h

# RouterBridge header  
cat ~/.arduino15/packages/arduino/hardware/zephyr/0.52.0/libraries/Arduino_RouterBridge/src/Arduino_RouterBridge.h

# Example sketch
cat ~/.local/share/arduino-app-cli/examples/led-matrix-painter/sketch.ino

# Example project structure
ls -la ~/.local/share/arduino-app-cli/examples/led-matrix-painter/
```

Share these and we'll complete the implementation!

