# Indy Sim - F1 Race Simulation
![Frontend UI Preview](./docs/frontend_UI.png)


A simple web app to demonstrate real-time data processing using an edge computing system. This simulation uses an F1 race team with comprehensive telemetry, interactive visualizations, and basic "mission control aesthetics".

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Ports 3001 (backend) and 5173 (frontend) available

### Running the Application

Start both backend and frontend services:

```bash
docker compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Backend Health Check**: http://localhost:3001/health

### Stopping the Application

```bash
docker compose down
```

## Network/Remote Access Setup

Want to run this on a remote device (like Arduino Q, Raspberry Pi, or a home server) and access it from another machine on your network?

**Quick Setup:**
```bash
./setup-network.sh
docker-compose -f docker-compose.network.yml up --build
```

Then access from any device on your network at `http://<DEVICE_IP>:5173`

📖 See **[NETWORK_QUICKSTART.md](./NETWORK_QUICKSTART.md)** for complete instructions.

## Features

### Real-Time Race Simulation
- **2 F1 Cars** racing on a realistic circuit with varied corners (hairpins, chicanes, fast corners)
- **30 Hz update rate** - 30 times per second data processing and broadcast
- **Physics-based simulation** - Speed variation through corners, G-force calculations
- **Lap timing** - Current lap, last lap, best lap tracking
- **Live positioning** - Real-time race positions with overtaking
- **Gap/Interval timing** - Live calculation of time gap between P1 and P2

### Comprehensive Telemetry

#### Track Data
- Live speed with historical trend sparkline
- Track position and sector tracking
- Visual progress bar showing track completion
- G-force calculations (lateral and longitudinal)

#### Driver Inputs
- Throttle and brake pressure with animated bars
- Engine RPM with historical trend sparkline
- Current gear selection
- Real-time input visualization

#### Tire Telemetry
- **3 tire compounds** - SOFT (fast/15 laps), MEDIUM (balanced/25 laps), HARD (durable/40 laps)
- **Per-tire monitoring** - FL, FR, RL, RR individual tracking
- **Temperature** - Color-coded by optimal range (blue=cold, green=optimal, red=overheating)
- **Pressure** - Live PSI readings per tire
- **Wear percentage** - Color-coded degradation tracking (green→yellow→orange→red)
- **Physics-based degradation** - Wear based on speed, braking, cornering forces
- **Pit stop warnings** - Automatic alerts when tires need changing

### Interactive Features

#### Pit Stop System
- **Interactive pit button** on each car's telemetry display
- **Tire compound cycling** - SOFT → MEDIUM → HARD → SOFT
- **Instant tire reset** - Fresh tires with 100% wear and optimal temps
- **Real-time broadcast** - All clients see pit stop immediately

#### 3D Card Flip Visualization
- **Click any car card** to flip to technical view
- **Top-down wireframe** - F1 car blueprint with data overlays
- **Component-specific data** - Information positioned over relevant car parts:
  - Front/Rear Wing aerodynamics
  - Power Unit (RPM, gear)
  - Individual tire temps and wear (FL, FR, RL, RR)
  - Brake system status
  - Live speed indicator
- **Smooth 3D animation** - Professional card flip transition
- **Click to return** - Toggle between telemetry and technical views

### Visual Design

#### Mission Control Aesthetic
- **Dark theme** - Black background with cyan/purple accents
- **Glowing effects** - Box shadows and text glows on key elements
- **Data-dense layout** - Grafana-style dashboard approach
- **Animated metrics** - Progress bars with glowing fills
- **Sparkline trends** - Canvas-based mini graphs showing recent history
- **Color-coded status** - Intuitive color scheme for all metrics

#### Layout
- **3-column responsive grid** - Car 1 | Live Track | Car 2
- **Optimal space usage** - Tire data positioned alongside main telemetry
- **Professional polish** - Hover effects, transitions, visual feedback

### Live Track Visualization
- **SVG-based track map** - Realistic circuit with 13 waypoint system
- **Animated car markers** - Team-colored F1 car icons
- **Correct orientation** - Cars rotate to match track direction
- **Position badges** - P1/P2 indicators on each car
- **Sector divisions** - Visual S1, S2, S3 markers
- **Start/Finish line** - Checkered pattern aligned to track

## Project Structure

```
indy_sim/
├── backend/
│   ├── src/
│   │   ├── server.js              # WebSocket server & race loop
│   │   ├── simulation/
│   │   │   └── raceEngine.js      # Core race simulation
│   │   └── telemetry/
│   │       └── tireData.js        # Tire physics & degradation
│   ├── Dockerfile.dev
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── assets/
│   │       └── Indy4.jpg          # F1 wireframe blueprint
│   ├── src/
│   │   ├── App.jsx                # Main application
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js    # WebSocket connection
│   │   │   └── useTrendData.js    # Sparkline data tracking
│   │   └── components/
│   │       ├── TrackMap.jsx       # Live track visualization
│   │       ├── CarDataDisplay.jsx # Telemetry card with flip
│   │       ├── CarTechnicalView.jsx # Wireframe overlay view
│   │       ├── TireDisplay.jsx    # Tire telemetry component
│   │       ├── DataBar.jsx        # Animated progress bars
│   │       └── Sparkline.jsx      # Mini trend graphs
│   ├── Dockerfile.dev
│   └── package.json
├── docker-compose.yml
├── SPEC.md                        # Detailed specification
└── README.md                      # This file
```

## Technology Stack

### Backend
- **Node.js 20** - JavaScript runtime
- **Express** - HTTP server framework
- **Socket.io** - WebSocket communication
- **Custom physics engine** - Race simulation with tire degradation

### Frontend
- **React 18** - UI framework with hooks
- **Vite** - Fast build tool with hot reload
- **Socket.io-client** - Real-time WebSocket connection
- **Canvas API** - High-performance sparkline rendering
- **CSS3** - Advanced animations and 3D transforms

### Deployment
- **Docker** - Containerization for platform independence
- **Docker Compose** - Multi-container orchestration
- **Volume mounts** - Hot reload in development

## Architecture

### Data Flow
```
Backend (30 Hz)           WebSocket          Frontend (React)
┌────────────────────┐   ◄──────────►   ┌──────────────────────┐
│ Race Engine        │                  │ useWebSocket()       │
│   • Position calc  │                  │   • State management │
│   • Tire physics   │   JSON over      │   • Auto-reconnect   │
│   • Gap timing     │   Socket.io      │                      │
│   ↓                │                  │ ↓                    │
│ Broadcast State    │                  │ Component Render     │
│   • 2 cars         │                  │   • Telemetry cards  │
│   • Tires (8 data) │                  │   • Track map        │
│   • Race info      │                  │   • Visual effects   │
└────────────────────┘                  └──────────────────────┘
         ↑                                           ↓
         │                                   User Actions
         └──────────────  Pit Stop  ─────────────────┘
```

### Key Calculations (30 Hz)
1. **Position updates** - Track progress based on speed and delta time
2. **Tire degradation** - Wear calculation from throttle, brake, G-forces
3. **Temperature simulation** - Heat from speed, braking, cornering
4. **Pressure changes** - Based on temperature (Gay-Lussac's Law)
5. **Gap timing** - Distance/speed ratio between leader and follower
6. **Lap completion** - Sector transitions and timing capture

## Development

### Hot Reloading
Both services support hot-reloading in development mode:
- **Backend**: Changes to `backend/src/**` trigger automatic restart via nodemon
- **Frontend**: Changes to `frontend/src/**` and `frontend/public/**` trigger instant HMR
- **Styles**: All CSS changes apply immediately without page reload

### Viewing Logs
```bash
docker compose logs -f backend   # Backend logs only
docker compose logs -f frontend  # Frontend logs only
docker compose logs -f           # All logs
```

### Making Changes
1. Edit files in `backend/src/` or `frontend/src/`
2. Changes apply automatically via hot reload
3. No need to restart containers

### Rebuilding After Dependency Changes
```bash
docker compose down
docker compose up --build
```

## Usage Guide

### Interacting with the Simulation

1. **View Real-Time Data**
   - Watch the live track map showing car positions
   - Observe telemetry updating 30 times per second
   - See tire degradation progress over laps

2. **Monitor Tire Strategy**
   - Check tire wear percentages (color-coded)
   - Watch for pit warnings (⚠️ icon when tires need changing)
   - Monitor temperature and pressure in real-time

3. **Execute Pit Stops**
   - Click the "PIT STOP" button when tires are degraded
   - Button disabled for first 5 laps (minimum stint)
   - Watch tires reset to fresh compound

4. **Explore Technical View**
   - Click any car card to flip to wireframe view
   - See data overlaid on specific car components
   - Click again to return to telemetry view

5. **Track Race Progress**
   - Monitor lap count and race time
   - Watch interval gap between P1 and P2
   - See position changes happen live

## Performance

- **Update Rate**: 30 Hz (33ms intervals)
- **WebSocket Latency**: <10ms on local network
- **Data Points/Second**: ~300 (2 cars × 50+ metrics × 3 updates)
- **Simulated Sensors**: ~100 data points per car
- **Canvas Rendering**: 60 FPS for sparklines

## Showcasing Omnia Capabilities

This simulation demonstrates:

1. **Real-time Edge Processing**
   - 30 Hz physics calculations
   - Gap timing computed from live speed data
   - Tire degradation based on multi-factor physics

2. **High-Throughput Data**
   - Broadcast to multiple clients simultaneously
   - No lag or buffering at 30 Hz update rate
   - Smooth animations and transitions

3. **Complex Calculations**
   - Multi-body physics simulation
   - Temperature/pressure correlations
   - Historical data tracking for trends

4. **Professional Visualization**
   - Hollywood-quality visual effects
   - Data-dense mission control aesthetic
   - Interactive 3D card transformations

## Known Limitations

- **Simulation**: Simplified physics model (not a full racing simulator)
- **Cars**: Fixed at 2 cars (can be extended)
- **Track**: Single pre-defined circuit
- **Network**: Assumes low-latency connection

## Future Enhancements

Potential additions for extended demos:
- [ ] More cars (scale to 20+ grid)
- [ ] Multiple track layouts
- [ ] Weather simulation (rain, track temperature)
- [ ] Fuel load and strategy
- [ ] Damage simulation
- [ ] Race incidents and safety cars
- [ ] Replay system
- [ ] Historical session comparison

## Documentation

For detailed technical specifications and design decisions, see [SPEC.md](./docs/SPEC.md)
