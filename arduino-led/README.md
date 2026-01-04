# Arduino Q LED Matrix Display for Indy Sim

This directory contains the investigation tools and code to display the Indy Sim race on the Arduino Q's embedded LED matrix.

## Status: 🔬 Investigation Phase

We're currently gathering information about your Arduino Q's capabilities before implementing the LED display.

## Quick Start: Investigation

On your Arduino Q, run:

```bash
cd /path/to/indy_sim/arduino-led
chmod +x investigate.sh
./investigate.sh
```

This will generate `arduino_q_findings.txt` with all the information we need.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Arduino Q - Linux Side (192.168.1.169)         │
│                                                  │
│  ┌────────────────────────────────────┐         │
│  │  Backend (Node.js)                 │         │
│  │  - Race simulation engine          │         │
│  │  - WebSocket to browser            │         │
│  │  - NEW: LED data sender ────┐     │         │
│  └──────────────────────────────│─────┘         │
│                                 │                │
│  ┌──────────────────────────────▼─────┐         │
│  │  arduino-router (daemon)           │         │
│  │  - Bridges Linux ↔ Microcontroller │         │
│  └──────────────────────────────┬─────┘         │
│                                 │                │
├─────────────────────────────────┼────────────────┤
│  Arduino Q - Microcontroller    │                │
│                                 │                │
│  ┌──────────────────────────────▼─────┐         │
│  │  Sketch (C++)                      │         │
│  │  - Receives race data              │         │
│  │  - Renders on LED matrix           │         │
│  │  - Car 1 = Red, Car 2 = Blue       │         │
│  └──────────────────────────────┬─────┘         │
│                                 │                │
│  ┌──────────────────────────────▼─────┐         │
│  │  🟥 LED Matrix Display              │         │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓                      │         │
│  │  ▓          ▓  Track loop           │         │
│  │  🔴🔵       ▓  with cars            │         │
│  │  ▓          ▓                       │         │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓                      │         │
│  └────────────────────────────────────┘         │
└─────────────────────────────────────────────────┘
```

## Files

### Investigation
- `INVESTIGATION_PLAN.md` - Detailed investigation plan
- `investigate.sh` - Automated investigation script
- `arduino_q_findings.txt` - Output from investigation (generated)

### Implementation (to be created after investigation)
- `sketch/` - Arduino sketch for microcontroller
  - `led_display.ino` - Main sketch file
  - `track_renderer.cpp` - Track and car rendering logic
- `backend-extension/` - Node.js extension for backend
  - `ledSender.js` - Sends data to arduino-router
  - `dataFormatter.js` - Formats race data for LED display
- `deploy.sh` - Script to deploy sketch to microcontroller

## Data Flow

1. **Backend** generates race state (every 33ms)
2. **LED Sender** simplifies data for LED matrix:
   ```json
   {
     "car1_pos": 234,
     "car1_speed": 287,
     "car2_pos": 189,
     "car2_speed": 282
   }
   ```
3. **arduino-router** sends data to microcontroller
4. **Sketch** receives data via `RouterBridge.receive()`
5. **Sketch** maps track position to LED coordinates
6. **LED Matrix** displays cars moving around track

## LED Display Concept

### Possible Layouts

**Option A: Oval Track (12x8 matrix)**
```
▓▓▓▓▓▓▓▓▓▓▓▓
▓          ▓
▓          ▓
🔴         🔵   ← Cars
▓          ▓
▓          ▓
▓▓▓▓▓▓▓▓▓▓▓▓
```

**Option B: Linear Progress (12x8 matrix)**
```
Car 1: ▓▓▓▓▓▓▓▓▓▓░░  🔴
Car 2: ▓▓▓▓▓▓▓▓░░░░  🔵
Lap:   ████████████
Time:  ▓▓▓▓▓▓▓▓▓▓▓▓
```

**Option C: Simplified Track Map**
```
    S1    S2    S3
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓                ▓
▓  🔴            ▓
▓        🔵      ▓
▓                ▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

## Technical Considerations

### Performance
- LED update rate: 10-30 Hz (lower than simulation 30Hz)
- Data size: Keep minimal (< 100 bytes per update)
- Processing: Simple math on microcontroller

### Color Coding
- 🔴 **Red** - Car 1 (Leader at start)
- 🔵 **Blue** - Car 2
- 🟢 **Green** - Start/finish line
- 🟡 **Yellow** - Pit lane (when active)
- Brightness = Speed indicator

### Data Protocol Options

**Option 1: JSON (readable)**
```json
{"c1p":234,"c1s":287,"c2p":189,"c2s":282}
```

**Option 2: CSV (compact)**
```
234,287,189,282
```

**Option 3: Binary (most efficient)**
```
0x00EA 0x011F 0x00BD 0x011A
```

## Next Steps

1. ✅ Create investigation tools
2. ⏳ **Run investigation on Arduino Q** ← YOU ARE HERE
3. ⏳ Analyze findings
4. ⏳ Create sketch based on available hardware/libraries
5. ⏳ Extend backend to send LED data
6. ⏳ Test and debug
7. ⏳ Optimize and polish

## References

- [Shawn Hymel's CLI Guide](https://www.hackster.io/news/shawn-hymel-s-cli-guide-frees-arduino-uno-q-users-from-the-quite-limiting-app-lab-31bcf330d7e2)
- [Arduino App Lab Components](https://support.arduino.cc/hc/en-us/articles/24358702846748)
- [Arduino RouterBridge Library](https://github.com/arduino/Arduino_RouterBridge)
- [arduino-router Daemon](https://github.com/arduino/arduino-router)

## Questions?

See `INVESTIGATION_PLAN.md` for detailed information, or run the investigation script and share the results!

