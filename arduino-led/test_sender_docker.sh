#!/bin/bash
# Test LED Sender - Run from Docker backend container
# This runs the test sender inside the backend container where Node.js is available

set -e

echo "=========================================="
echo "LED Sender Test (via Docker)"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo "Error: Docker is not running"
    exit 1
fi

# Check if backend container is running
CONTAINER_ID=$(docker ps --filter "name=backend" --format "{{.ID}}" | head -1)

if [ -z "$CONTAINER_ID" ]; then
    echo "Error: Backend container is not running"
    echo ""
    echo "Start it with:"
    echo "  cd ~/indy_sim"
    echo "  docker-compose -f docker-compose.network.yml up -d"
    exit 1
fi

echo "Using backend container: $CONTAINER_ID"
echo ""

# Copy test script to container
echo "Copying test script to container..."
docker cp test_sender.js $CONTAINER_ID:/app/

# Run the test sender in the container
echo "Starting test sender..."
echo "(Press Ctrl+C to stop)"
echo ""

docker exec -it $CONTAINER_ID node /app/test_sender.js

