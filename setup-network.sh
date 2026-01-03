#!/bin/bash
# Setup script for network-enabled Indy Sim on Arduino Q or remote device

set -e

echo "=========================================="
echo "Indy Sim - Network Setup Script"
echo "=========================================="
echo ""

# Get Arduino IP address
echo "Step 1: Detecting IP address..."
ARDUINO_IP=$(hostname -I | awk '{print $1}')

if [ -z "$ARDUINO_IP" ]; then
    echo "Could not auto-detect IP address."
    read -p "Please enter your Arduino Q's IP address: " ARDUINO_IP
else
    echo "Detected IP: $ARDUINO_IP"
    read -p "Is this correct? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        read -p "Please enter the correct IP address: " ARDUINO_IP
    fi
fi

echo ""
echo "Using IP address: $ARDUINO_IP"
echo ""

# Backup original files if they exist
echo "Step 2: Backing up original files..."

if [ -f "backend/src/server.js" ] && [ ! -f "backend/src/server.original.js" ]; then
    cp backend/src/server.js backend/src/server.original.js
    echo "  ✓ Backed up backend/src/server.js"
fi

if [ -f "frontend/src/App.jsx" ] && [ ! -f "frontend/src/App.original.jsx" ]; then
    cp frontend/src/App.jsx frontend/src/App.original.jsx
    echo "  ✓ Backed up frontend/src/App.jsx"
fi

# Create frontend .env.network file
echo ""
echo "Step 3: Creating frontend environment configuration..."
cat > frontend/.env.network << EOF
VITE_BACKEND_URL=http://$ARDUINO_IP:3001
EOF
echo "  ✓ Created frontend/.env.network"

# Replace files with network variants
echo ""
echo "Step 4: Activating network configuration..."
cp backend/src/server.network.js backend/src/server.js
echo "  ✓ Activated network backend"

cp frontend/src/App.network.jsx frontend/src/App.jsx
echo "  ✓ Activated network frontend"

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start the containers with:"
echo "   docker-compose -f docker-compose.network.yml up --build"
echo ""
echo "2. Access from your browser at:"
echo "   http://$ARDUINO_IP:5173"
echo ""
echo "To revert to localhost configuration, run:"
echo "   ./restore-localhost.sh"
echo ""

