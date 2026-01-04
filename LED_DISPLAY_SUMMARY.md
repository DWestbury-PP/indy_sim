# Arduino Q LED Matrix Display - Project Summary

## 🎯 Goal

Extend the Indy Sim to display the race on the Arduino Q's embedded LED matrix, showing both cars moving around a track in real-time.

## 📍 Current Status

✅ **Backend & Frontend** - Running on Arduino Q via Docker with host networking
✅ **WebSocket** - Working over WiFi network (192.168.1.169)
✅ **Web Interface** - Accessible from Mac browser
🔬 **LED Display** - Investigation phase (tools created, waiting for findings)

## 🏗️ Proposed Architecture

```
┌───────────────────────────────────────────────────────┐
│  Arduino Q @ 192.168.1.169                            │
│                                                        │
│  Linux Side (Debian)                                  │
│  ┌──────────────────────────────────────────────┐    │
│  │  Docker Container - Backend                  │    │
│  │  ┌────────────────────────────────┐         │    │
│  │  │  Race Simulation Engine         │         │    │
│  │  │  - 30 Hz updates                │         │    │
│  │  │  - WebSocket to browser ────────┼────────────→ Mac Browser
│  │  │  - NEW: LED data sender         │         │    │
│  │  └─────────────┬──────────────────┘         │    │
│  └────────────────┼───────────────────────────┘    │
│                   │                                   │
│                   ↓                                   │
│  ┌────────────────────────────────────────────┐     │
│  │  arduino-router (Linux daemon)             │     │
│  │  Bridges Linux ↔ Microcontroller           │     │
│  └─────────────┬──────────────────────────────┘     │
│                │                                      │
│  ══════════════╪══════════════════════════════════  │
│                │                                      │
│  Microcontroller Side                                │
│                ↓                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  Sketch (C++)                               │    │
│  │  - RouterBridge.receive()                   │    │
│  │  - Parse: "pos1,spd1,pos2,spd2"            │    │
│  │  - Map positions to LED coordinates         │    │
│  │  - Render cars on matrix                    │    │
│  └─────────────┬───────────────────────────────┘    │
│                │                                      │
│                ↓                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  🔴🔵 LED Matrix                            │    │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓                              │    │
│  │  ▓          ▓                               │    │
│  │  🔴         ▓  (Oval track)                 │    │
│  │  ▓       🔵 ▓                               │    │
│  │  ▓          ▓                               │    │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓                              │    │
│  └─────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────┘
```

## 📦 Files Created

### Investigation Tools (`arduino-led/`)
```
arduino-led/
├── README.md                    # Project overview
├── INVESTIGATION_PLAN.md        # Detailed investigation guide
├── NEXT_STEPS.md                # Step-by-step guide
├── investigate.sh               # Automated investigation script
│
├── sketch/
│   └── led_display.ino          # Prototype Arduino sketch
│
└── backend-extension/
    └── ledSender.js             # Prototype backend extension
```

### Documentation
- `LED_DISPLAY_SUMMARY.md` - This file
- Various network setup docs (already created)

## 🔍 Investigation Requirements

Before we can complete the implementation, we need to know:

### Hardware Info
- [ ] LED matrix size (e.g., 12x8, 16x8)
- [ ] LED type (NeoPixel/WS2812, APA102, etc.)
- [ ] Connection method (GPIO, I2C, SPI)

### Software Info
- [ ] arduino-router status (running? accessible?)
- [ ] Arduino CLI availability
- [ ] Available libraries (RouterBridge, LED libraries)
- [ ] Deployment method (App Lab? CLI?)

### Communication Info
- [ ] How to send data to microcontroller
- [ ] Data format/protocol
- [ ] Update rate capabilities

## 🎬 Next Steps for User

1. **SSH into your Arduino Q:**
   ```bash
   ssh user@192.168.1.169
   ```

2. **Navigate to project:**
   ```bash
   cd /path/to/indy_sim/arduino-led
   ```

3. **Run investigation:**
   ```bash
   ./investigate.sh
   ```

4. **Review findings:**
   ```bash
   cat arduino_q_findings.txt
   ```

5. **Share results** so we can:
   - Complete the sketch code
   - Configure the backend integration
   - Deploy and test

## 🎨 Display Concepts

### Option A: Oval Track (Most Realistic)
```
▓▓▓▓▓▓▓▓▓▓▓▓
▓          ▓
▓ 🔴       ▓
▓       🔵 ▓
▓          ▓
▓▓▓▓▓▓▓▓▓▓▓▓
```
- Track outline in dim white
- Car 1 = Red LED
- Car 2 = Blue LED
- Position mapped from meters to LED coordinates

### Option B: Linear Progress Bars
```
C1: ▓▓▓▓▓▓▓▓▓▓░░  🔴
C2: ▓▓▓▓▓▓▓▓░░░░  🔵
    ─────────────────
Lap: ████████░░░░░░
```
- Each car gets a progress bar
- Additional info (lap, time) on other rows

### Option C: Simplified Track Map
```
  START │ S1  │ S2  │ S3  │
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓                        ▓
▓  🔴                    ▓
▓           🔵           ▓
▓                        ▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```
- More detail if matrix is larger
- Sector markers

## 📊 Data Flow

### Backend → Microcontroller
```javascript
// Every 50ms (20 Hz)
{
  car1_pos: 234,    // meters (0-5281)
  car1_speed: 287,  // km/h
  car2_pos: 189,    // meters
  car2_speed: 275   // km/h
}
↓
// Formatted as CSV
"234,287,189,275\n"
```

### Microcontroller Processing
```cpp
// Receive: "234,287,189,275"
// Parse: car1@234m, car2@189m
// Map: position → LED index
// Render: Set LED colors/brightness
```

## 🚀 Implementation Phases

### Phase 1: Investigation ← YOU ARE HERE
- Run investigate.sh
- Analyze findings
- Determine approach

### Phase 2: Hello LED (15 min)
- Deploy simple blink sketch
- Confirm hardware control works

### Phase 3: Test Communication (30 min)
- Send test data Linux → MCU
- Verify receipt and parsing

### Phase 4: Basic Display (1 hour)
- Implement track rendering
- Show car positions
- Test with fake data

### Phase 5: Integration (1 hour)
- Connect to real race engine
- Tune performance
- Debug issues

### Phase 6: Polish (optional)
- Visual effects
- Configuration
- Optimization

## 🔧 Technical Considerations

### Performance
- LED update rate: 10-20 Hz (lower than sim's 30 Hz)
- Data size: Keep minimal (<100 bytes)
- Arduino Q CPU: May be slower than standard boards

### Communication
- **Preferred:** arduino-router (if available)
- **Fallback:** Serial port communication
- **Last resort:** File-based with polling

### Rendering
- Simple mapping: Linear position → LED index
- Color coding: Red (P1), Blue (P2)
- Brightness: Speed-dependent
- Track: Static outline, cars move

## 📚 Key Resources

1. **Shawn Hymel's CLI Guide**
   https://www.hackster.io/news/shawn-hymel-s-cli-guide-frees-arduino-uno-q-users-from-the-quite-limiting-app-lab-31bcf330d7e2

2. **Arduino App Lab Components**
   https://support.arduino.cc/hc/en-us/articles/24358702846748

3. **arduino-router**
   https://github.com/arduino/arduino-router

4. **Arduino_RouterBridge**
   https://github.com/arduino/Arduino_RouterBridge

## 🎯 Success Criteria

When complete, you'll have:

- ✅ Race cars visible on LED matrix
- ✅ Real-time position updates
- ✅ Smooth animation (10-20 fps)
- ✅ Minimal performance impact
- ✅ Easy to enable/disable
- ✅ Web interface still responsive

## 🤔 Why This is Cool

1. **Multi-platform display:** Web browser AND physical LED matrix
2. **Edge computing showcase:** Visualization at the edge device
3. **Hardware integration:** Bridges software simulation with physical output
4. **Arduino Q capabilities:** Demonstrates Linux + MCU working together
5. **Visual appeal:** Lights are cool! 💡

## 📝 Notes

- The prototype code has placeholders marked with `// PLACEHOLDER:`
- These will be filled in once we know your hardware specifics
- The approach is flexible and can adapt to what's available
- Worst case: We can still do something cool even if limited!

## ❓ Questions?

See the detailed guides in `arduino-led/`:
- `INVESTIGATION_PLAN.md` - What to investigate
- `NEXT_STEPS.md` - What to do next
- `README.md` - Project overview

Ready to run that investigation script? 🚀

