#!/bin/bash
# Deploy Enhanced v2 LED Display

set -e

APP_NAME="indy-sim-display"
APP_DIR="$HOME/.local/share/arduino-app-cli/apps/$APP_NAME"

echo "=========================================="
echo "Deploy Enhanced LED Display v2"
echo "=========================================="
echo ""
echo "New features:"
echo "  ✨ Circuit-style track layout"
echo "  🏎️ Car trails showing motion"
echo "  💫 Pulsing position indicators"
echo "  🎯 Sector markers"
echo "  ⚡ Close racing indicators"
echo ""

# Stop app if running
echo "Stopping existing app..."
arduino-app-cli app stop $APP_NAME 2>/dev/null || true

# Copy enhanced sketch
echo "Copying enhanced sketch..."
mkdir -p "$APP_DIR/sketch"
cp sketch/indy_sim_display_v2.ino "$APP_DIR/sketch/sketch.ino"
echo "✓ Sketch updated to v2"

# Copy Python stub  
echo "Copying Python stub..."
mkdir -p "$APP_DIR/python"
cp python_stub/main.py "$APP_DIR/python/main.py"
cp python_stub/requirements.txt "$APP_DIR/python/requirements.txt"
echo "✓ Python stub updated"

echo ""
echo "Starting enhanced version..."
arduino-app-cli app start $APP_DIR

echo ""
echo "=========================================="
echo "Enhanced v2 Deployed!"
echo "=========================================="
echo ""
echo "Watch for these effects:"
echo "  • Circuit-style track shape"
echo "  • Cars leave trails as they move"
echo "  • Leader gets a 'glow' effect"
echo "  • Start/finish line blinks"
echo "  • Position indicators in corners (P1/P2)"
echo "  • Close racing = flashing corners!"
echo ""
echo "View logs:"
echo "  arduino-app-cli app logs $APP_NAME --follow"
echo ""

