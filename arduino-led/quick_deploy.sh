#!/bin/bash
# Quick deployment script for Arduino Q using arduino-app-cli

set -e

APP_NAME="indy-sim-display"
APP_DIR="$HOME/.local/share/arduino-app-cli/apps/$APP_NAME"
SKETCH_SOURCE="sketch/indy_sim_display.ino"

echo "=========================================="
echo "Quick Deploy: Indy Sim LED Display"
echo "=========================================="
echo ""

# Check if sketch exists
if [ ! -f "$SKETCH_SOURCE" ]; then
    echo "Error: Sketch not found: $SKETCH_SOURCE"
    exit 1
fi

# Method 1: Copy from blink example (easiest)
echo "Method: Copy from blink example..."
echo ""

# Check if app already exists
if [ -d "$APP_DIR" ]; then
    echo "App directory already exists: $APP_DIR"
    read -p "Remove and recreate? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Stop app if running
        arduino-app-cli app stop $APP_NAME 2>/dev/null || true
        rm -rf "$APP_DIR"
        echo "Removed old app"
    else
        echo "Using existing app directory"
    fi
fi

# Create app directory if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    echo "Creating app from blink example..."
    cp -r ~/.local/share/arduino-app-cli/examples/blink "$APP_DIR"
    echo "✓ App directory created"
fi

# Update app.yaml
echo "Updating app.yaml..."
cat > "$APP_DIR/app.yaml" << 'EOF'
name: indy-sim-display
description: Indy Sim race display on LED matrix
icon: 🏎️
version: 1.0.0
EOF
echo "✓ app.yaml updated"

# Copy sketch (Arduino Q apps use sketch/ subdirectory)
echo "Copying sketch..."
mkdir -p "$APP_DIR/sketch"
cp "$SKETCH_SOURCE" "$APP_DIR/sketch/sketch.ino"
echo "✓ Sketch copied"

# Remove Python files (not needed for this app)
rm -f "$APP_DIR/main.py" "$APP_DIR/requirements.txt"

echo ""
echo "=========================================="
echo "App Created: $APP_NAME"
echo "Location: $APP_DIR"
echo "=========================================="
echo ""

# Stop any running apps
echo "Stopping other apps..."
arduino-app-cli app stop led-matrix-painter 2>/dev/null || true
arduino-app-cli app stop blink 2>/dev/null || true
arduino-app-cli app stop air-quality-monitoring 2>/dev/null || true
echo ""

# Start the app
echo "Starting app..."
echo "(This will compile and upload the sketch)"
echo ""

arduino-app-cli app start $APP_NAME

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "The sketch is now running on the microcontroller."
echo "You should see the LED matrix animating!"
echo ""
echo "Useful commands:"
echo "  arduino-app-cli app logs $APP_NAME        # View logs"
echo "  arduino-app-cli app stop $APP_NAME        # Stop app"
echo "  arduino-app-cli app restart $APP_NAME     # Restart app"
echo "  arduino-app-cli monitor                    # Serial monitor"
echo ""
echo "Next: Test the backend sender!"
echo "  cd backend-extension"
echo "  node ledSender_socket.js"
echo ""

