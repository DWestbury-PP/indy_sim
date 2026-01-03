# Indy Sim - F1 Race Simulation

A visually stunning web application demonstrating the real-time data processing capabilities of the Omnia edge computing system through an F1 race team simulation.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Ports 3001 (backend) and 5173 (frontend) available

### Running the Application

Start both backend and frontend services:

```bash
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Backend Health Check**: http://localhost:3001/health

### Stopping the Application

```bash
docker-compose down
```

## Project Structure

```
indy_sim/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── server.js       # Main server with WebSocket
│   │   └── simulation/     # Race simulation engine
│   ├── Dockerfile          # Production Docker image
│   ├── Dockerfile.dev      # Development Docker image
│   └── package.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── App.jsx         # Main app component
│   │   ├── hooks/          # Custom React hooks
│   │   └── styles/         # CSS styles
│   ├── Dockerfile          # Production Docker image
│   ├── Dockerfile.dev      # Development Docker image
│   └── package.json
├── docker-compose.yml       # Docker Compose configuration
├── SPEC.md                  # Detailed project specification
└── README.md                # This file
```

## Current Features (Phase 1 - Foundation)

### Backend
- ✅ Express server with WebSocket (Socket.io)
- ✅ Basic race simulation with 2 cars
- ✅ Real-time data generation (30 Hz update rate)
- ✅ Simulated lap timing and position tracking
- ✅ Basic driver inputs (throttle, brake, gear, RPM)

### Frontend
- ✅ React 18 with Vite
- ✅ WebSocket connection to backend
- ✅ Real-time data display
- ✅ Connection status indicator
- ✅ Live race information (laps, timing, positions)
- ✅ Individual car data cards

### Data Being Simulated
- Track position and progress
- Speed (varies based on track position)
- Lap timing (current, last, best)
- Sector tracking
- Race position
- Driver inputs (throttle, brake, gear, RPM)

## Development

### Hot Reloading
Both services support hot-reloading in development mode:
- Backend: Changes to `backend/src/**` trigger automatic restart
- Frontend: Changes to `frontend/src/**` trigger automatic rebuild

### Viewing Logs
```bash
docker-compose logs -f backend   # Backend logs only
docker-compose logs -f frontend  # Frontend logs only
docker-compose logs -f           # All logs
```

### Rebuilding After Changes
```bash
docker-compose up --build
```

## Next Steps

Phase 2 - Enhanced Simulation:
- [ ] Add more realistic sensor data (engine, tires, brakes, aerodynamics)
- [ ] Implement race events (pit stops, tire degradation)
- [ ] Add more detailed physics simulation
- [ ] Improve data correlation (speed/RPM/gear relationships)

Phase 3 - Visualization:
- [ ] 3D track visualization with Three.js
- [ ] Vehicle wireframe models
- [ ] Real-time charts and graphs
- [ ] Visual polish (animations, effects, styling)

Phase 4 - Production Ready:
- [ ] Performance optimization
- [ ] Error handling and resilience
- [ ] Configuration options
- [ ] Documentation and demo scripts

## Architecture

### Data Flow
```
Backend (30 Hz)     WebSocket      Frontend (React)
┌──────────────┐   ◄────────►   ┌─────────────────┐
│ Race Engine  │                │ useWebSocket()  │
│   ↓          │                │        ↓        │
│ Data Gen     │   JSON over    │ State Update    │
│   ↓          │   Socket.io    │        ↓        │
│ Broadcast    │                │ UI Render       │
└──────────────┘                └─────────────────┘
```

### Technology Stack
- **Backend**: Node.js 20, Express, Socket.io
- **Frontend**: React 18, Vite, Socket.io-client
- **Deployment**: Docker, Docker Compose
- **Future**: Three.js (3D), D3.js (charts)

## Testing the Current Build

1. **Start the services**: `docker-compose up --build`
2. **Open browser**: Navigate to http://localhost:5173
3. **Verify connection**: Check for "Connected" status in the header
4. **Watch the race**: You should see two cars racing with live updating data
5. **Observe updates**: Speed, position, lap times, and driver inputs update in real-time

## Known Limitations (Phase 1)

- Basic simulation only (position and speed)
- Limited sensor data (just driver inputs)
- No 3D visualization yet
- Simple UI styling
- No race events (pit stops, etc.)

These will be addressed in subsequent phases.

## Documentation

For detailed project specifications, see [SPEC.md](./SPEC.md)

## License

Proprietary - Omnia System Demonstration
