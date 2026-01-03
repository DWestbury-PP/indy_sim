import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { RaceSimulation } from './simulation/raceEngine.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure CORS for network access
const corsOrigin = process.env.CORS_ORIGIN === '*' 
  ? '*' 
  : process.env.CORS_ORIGIN || "http://localhost:5173";

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Initialize race simulation
const raceSimulation = new RaceSimulation({
  totalLaps: parseInt(process.env.TOTAL_LAPS) || 58,
  trackLength: parseInt(process.env.TRACK_LENGTH) || 5281,
  updateFrequency: parseInt(process.env.UPDATE_FREQUENCY) || 30
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send current race state immediately on connection
  socket.emit('raceUpdate', raceSimulation.getCurrentState());

  // Handle pit stop requests
  socket.on('pitStop', ({ carId }) => {
    console.log(`Pit stop requested for ${carId}`);
    raceSimulation.executePitStop(carId);
    // Immediately broadcast updated state
    io.emit('raceUpdate', raceSimulation.getCurrentState());
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the race simulation loop
const updateInterval = 1000 / (parseInt(process.env.UPDATE_FREQUENCY) || 30);
setInterval(() => {
  raceSimulation.update();
  const state = raceSimulation.getCurrentState();
  io.emit('raceUpdate', state);
}, updateInterval);

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`WebSocket server ready`);
  console.log(`CORS origin: ${corsOrigin}`);
  console.log(`Race simulation started`);
});

