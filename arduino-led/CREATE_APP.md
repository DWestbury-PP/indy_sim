# Creating the Indy Sim Display App on Arduino Q

## Quick Start

```bash
cd ~/indy_sim/arduino-led

# Create new app
arduino-app-cli app new indy-sim-display \
  --description "Indy Sim race display on LED matrix" \
  --icon "🏎️"

# This will create: ~/.local/share/arduino-app-cli/apps/indy-sim-display/
```

## App Structure (Arduino Q Apps)

Based on Arduino App Lab structure, apps contain:

```
~/.local/share/arduino-app-cli/apps/indy-sim-display/
├── app.yaml              # App configuration
├── sketch.ino            # Arduino sketch for microcontroller
├── main.py (optional)    # Python code for Linux side
└── requirements.txt      # Python dependencies (if using main.py)
```

## Steps After Creation

### 1. Copy the Sketch

```bash
# After creating the app, copy our sketch
cp sketch/indy_sim_display.ino \
   ~/.local/share/arduino-app-cli/apps/indy-sim-display/sketch.ino
```

### 2. Check app.yaml

The app.yaml should look something like:

```yaml
name: indy-sim-display
description: Indy Sim race display on LED matrix
icon: 🏎️
version: 1.0.0
```

### 3. Build and Upload

```bash
# Start the app (this compiles and uploads the sketch)
arduino-app-cli app start indy-sim-display

# Check status
arduino-app-cli app list

# View logs from microcontroller
arduino-app-cli app logs indy-sim-display

# Stop the app
arduino-app-cli app stop indy-sim-display
```

## Alternative: Copy from Example

If creating from scratch is tricky, copy an existing example:

```bash
# Copy blink example as template
cp -r ~/.local/share/arduino-app-cli/examples/blink \
      ~/.local/share/arduino-app-cli/apps/indy-sim-display

# Edit the files
cd ~/.local/share/arduino-app-cli/apps/indy-sim-display

# Update app.yaml
nano app.yaml
# Change name to: indy-sim-display
# Change description to: Indy Sim race display on LED matrix
# Change icon to: 🏎️

# Replace sketch
rm sketch.ino
cp ~/indy_sim/arduino-led/sketch/indy_sim_display.ino sketch.ino

# Remove Python code (we don't need it yet)
rm main.py requirements.txt 2>/dev/null

# Start it
arduino-app-cli app start indy-sim-display
```

## Monitoring

```bash
# Watch logs in real-time
arduino-app-cli app logs indy-sim-display --follow

# Or use Arduino's monitor
arduino-app-cli monitor
```

## Troubleshooting

### "App already exists"
```bash
# List apps
arduino-app-cli app list

# Remove if needed
rm -rf ~/.local/share/arduino-app-cli/apps/indy-sim-display
```

### "Build failed"
Check the sketch for errors:
```bash
arduino-app-cli app logs indy-sim-display
```

### "Upload failed"
Make sure no other app is running:
```bash
arduino-app-cli app list
arduino-app-cli app stop <other-app-name>
```

## Next: Integrate with Backend

Once the sketch is running on the microcontroller:

1. Test it shows the animated track (simulation mode)
2. Connect backend sender to arduino-router socket
3. Watch cars move based on real race data!

