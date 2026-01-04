#!/bin/bash
# Deploy Indy Sim LED display sketch to Arduino Q microcontroller

set -e

SKETCH_DIR="sketch"
SKETCH_NAME="indy_sim_display"
SKETCH_FILE="$SKETCH_DIR/$SKETCH_NAME.ino"

echo "=========================================="
echo "Deploy Indy Sim LED Display Sketch"
echo "=========================================="
echo ""

# Check if sketch exists
if [ ! -f "$SKETCH_FILE" ]; then
    echo "Error: Sketch not found: $SKETCH_FILE"
    exit 1
fi

echo "Sketch: $SKETCH_FILE"
echo ""

# Check for arduino-app-cli (preferred for Arduino Q)
if command -v arduino-app-cli &> /dev/null; then
    echo "Using arduino-app-cli..."
    echo ""
    
    # TODO: Determine correct arduino-app-cli command for deploying sketch
    # This may involve creating an "app" or "brick" structure
    # For now, provide instructions
    
    echo "arduino-app-cli detected, but deployment method TBD"
    echo ""
    echo "Manual deployment steps:"
    echo "1. Check existing apps:"
    echo "   arduino-app-cli app list"
    echo ""
    echo "2. Create new app if needed:"
    echo "   arduino-app-cli app create indy-sim-display"
    echo ""
    echo "3. Build and deploy:"
    echo "   arduino-app-cli app build indy-sim-display"
    echo "   arduino-app-cli app upload indy-sim-display"
    echo ""
    
elif command -v arduino-cli &> /dev/null; then
    echo "Using arduino-cli..."
    echo ""
    
    # Compile
    echo "Compiling sketch..."
    arduino-cli compile --fqbn arduino:zephyr:arduino_uno_q "$SKETCH_DIR" \
        || { echo "Compilation failed"; exit 1; }
    
    echo ""
    echo "Compilation successful!"
    echo ""
    
    # Upload
    echo "Uploading to board..."
    arduino-cli upload -p /dev/ttyHS1 --fqbn arduino:zephyr:arduino_uno_q "$SKETCH_DIR" \
        || { echo "Upload failed"; exit 1; }
    
    echo ""
    echo "Upload successful!"
    
else
    echo "Error: Neither arduino-app-cli nor arduino-cli found"
    exit 1
fi

echo ""
echo "=========================================="
echo "Deployment Instructions"
echo "=========================================="
echo ""
echo "If automatic deployment didn't work, try:"
echo ""
echo "Method 1: Arduino App Lab (web interface)"
echo "  1. Open https://app-lab.arduino.cc"
echo "  2. Create new app"
echo "  3. Copy sketch code"
echo "  4. Deploy to board"
echo ""
echo "Method 2: Shawn Hymel's CLI method"
echo "  See: https://www.hackster.io/news/shawn-hymel-s-cli-guide-frees-arduino-uno-q-users-from-the-quite-limiting-app-lab-31bcf330d7e2"
echo ""
echo "=========================================="
echo ""

