#!/bin/bash
# Restore localhost configuration

set -e

echo "=========================================="
echo "Indy Sim - Restore Localhost Config"
echo "=========================================="
echo ""

# Restore original files
if [ -f "backend/src/server.original.js" ]; then
    cp backend/src/server.original.js backend/src/server.js
    echo "  ✓ Restored backend/src/server.js"
else
    echo "  ! No backup found for backend/src/server.js"
fi

if [ -f "frontend/src/App.original.jsx" ]; then
    cp frontend/src/App.original.jsx frontend/src/App.jsx
    echo "  ✓ Restored frontend/src/App.jsx"
else
    echo "  ! No backup found for frontend/src/App.jsx"
fi

# Remove network env file
if [ -f "frontend/.env.network" ]; then
    rm frontend/.env.network
    echo "  ✓ Removed frontend/.env.network"
fi

echo ""
echo "=========================================="
echo "Localhost Configuration Restored!"
echo "=========================================="
echo ""
echo "You can now run:"
echo "   docker-compose up"
echo ""

