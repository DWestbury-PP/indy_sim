# Next Steps: Arduino Q LED Display Implementation

## 🎯 Current Status

✅ Network configuration working (Arduino Q at 192.168.1.169)
✅ Docker stack running on Arduino Q
✅ Web app accessible from Mac browser
🔬 **LED display - Investigation phase**

## 📝 What You Need to Do Now

### Step 1: Run Investigation Script

On your Arduino Q (via SSH):

```bash
cd /path/to/indy_sim/arduino-led
./investigate.sh
```

This will create `arduino_q_findings.txt` with all the information we need.

### Step 2: Review Findings

Look for these key pieces of information in the findings file:

**Critical:**
- [ ] Is `arduino-router` installed and running?
- [ ] Is `arduino-cli` or `arduino-app-cli` available?
- [ ] What LED devices exist in `/sys/class/leds/`?
- [ ] Are there any RouterBridge or RPClite libraries?

**Helpful:**
- [ ] What serial devices exist? (`/dev/ttyACM*`, `/dev/ttyUSB*`)
- [ ] Any example sketches already on the system?
- [ ] What's the board type? (`arduino-cli board list`)

### Step 3: Share Findings

Once you have `arduino_q_findings.txt`, we can:
1. Identify the exact LED matrix hardware and library
2. Confirm the communication method (router/serial/other)
3. Complete the sketch code with correct includes and API calls
4. Integrate with the backend

## 🔧 What We've Prepared

### Investigation Tools
- `investigate.sh` - Automated investigation script
- `INVESTIGATION_PLAN.md` - Detailed investigation guide

### Prototype Code (needs refinement)
- `sketch/led_display.ino` - Arduino sketch (has placeholders)
- `backend-extension/ledSender.js` - Backend sender (has placeholders)

### Documentation
- `README.md` - Project overview
- This file - Next steps guide

## 🎨 Possible Outcomes

### Scenario A: arduino-router Available ✨ (Best Case)

```
Backend → arduino-router → RouterBridge → LED Matrix
```

We'll need to:
1. Find how to send data to arduino-router (CLI tool? Socket? Pipe?)
2. Include correct RouterBridge library in sketch
3. Wire up the data flow

### Scenario B: Serial Communication Available

```
Backend → /dev/ttyACM0 → Serial → LED Matrix
```

We'll need to:
1. Open serial port in Node.js backend
2. Use Serial.read() in sketch
3. Handle serial protocol

### Scenario C: File-Based Communication

```
Backend → /tmp/led_data → File watcher → LED Matrix
```

We'll need to:
1. Backend writes to shared file
2. Sketch (or wrapper script) reads file
3. Update LED matrix

### Scenario D: Direct GPIO Control (Advanced)

```
Backend → Linux GPIO/I2C → LED Matrix (no sketch needed!)
```

If we have GPIO/I2C access from Linux, we might control LEDs directly without a sketch!

## 🚀 Implementation Roadmap

Once we have findings:

### Phase 1: Hello LED (15 min)
- Get a single LED blinking from a sketch
- Confirm we can deploy code to microcontroller
- **Milestone:** Proof we can control hardware

### Phase 2: Test Communication (30 min)
- Send test data from Linux to microcontroller
- Receive and parse on microcontroller side
- Log to serial monitor to verify
- **Milestone:** Two-way communication working

### Phase 3: Simple Display (1 hour)
- Implement basic track rendering
- Show 2 dots representing cars
- Update positions from test data
- **Milestone:** Basic visualization working

### Phase 4: Integration (1 hour)
- Connect ledSender to backend
- Format race data appropriately
- Tune update rates and performance
- **Milestone:** Live race displayed on LED matrix!

### Phase 5: Polish (optional)
- Add visual effects (speed = brightness, etc.)
- Optimize performance for Arduino Q
- Add configuration options
- **Milestone:** Production-ready LED display

## 📊 Expected Timeline

- **Investigation:** 15 minutes
- **Analysis & Code Completion:** 30 minutes  
- **Testing & Debug:** 1-2 hours
- **Integration:** 1 hour
- **Total:** 3-4 hours of active work

## 🆘 Troubleshooting Scenarios

### "arduino-router not found"
→ We'll use serial or file-based communication instead

### "Can't deploy sketches"
→ Follow Shawn Hymel's CLI guide to set up deployment

### "LED matrix library not available"
→ Install required library or use raw GPIO control

### "Permission denied on devices"
→ Add user to appropriate groups (dialout, gpio, etc.)

### "Too slow / laggy"
→ Reduce LED update rate, simplify rendering

## 📚 Resources to Have Ready

Keep these links handy:

1. **Shawn Hymel's CLI Guide**
   https://www.hackster.io/news/shawn-hymel-s-cli-guide-frees-arduino-uno-q-users-from-the-quite-limiting-app-lab-31bcf330d7e2

2. **Arduino App Lab Components**
   https://support.arduino.cc/hc/en-us/articles/24358702846748

3. **arduino-router GitHub**
   https://github.com/arduino/arduino-router

4. **Arduino_RouterBridge GitHub**
   https://github.com/arduino/Arduino_RouterBridge

## ❓ Questions to Answer

Before we can complete the implementation:

- [ ] What's the LED matrix size? (e.g., 12x8, 16x8)
- [ ] What LED type? (NeoPixel/WS2812, APA102, other?)
- [ ] How is it connected? (GPIO pin? I2C? SPI?)
- [ ] Can we use App Lab to deploy or do we need CLI?
- [ ] Does RouterBridge exist and work?
- [ ] What libraries are available?

## 🎬 Ready to Start?

Run the investigation script and let's see what we're working with!

```bash
cd /path/to/indy_sim/arduino-led
./investigate.sh
cat arduino_q_findings.txt
```

Then we'll refine the code and get those LEDs showing your race! 🏎️💨✨

