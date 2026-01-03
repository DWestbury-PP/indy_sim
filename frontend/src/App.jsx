import { useWebSocket } from './hooks/useWebSocket';
import TrackMap from './components/TrackMap';
import CarDataDisplay from './components/CarDataDisplay';
import DataBar from './components/DataBar';
import './App.css';

const BACKEND_URL = 'http://localhost:3001';

/**
 * Format seconds into MM:SS.ms format
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
}

function App() {
  const { isConnected, raceData, sendPitStop } = useWebSocket(BACKEND_URL);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Indy Sim - F1 Race Simulation</h1>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '● Connected' : '○ Disconnected'}
        </div>
      </header>

      <main className="app-main">
        {!raceData && (
          <div className="loading">
            <p>Waiting for race data...</p>
          </div>
        )}

        {raceData && (
          <div className="race-container">
            <div className="race-info">
              <div className="race-info-section">
                <h2>Race Status</h2>
              </div>

              <div className="race-info-section lap-progress">
                <div className="metric-header">
                  <span className="metric-label">LAP PROGRESS</span>
                  <span className="metric-value">
                    {raceData.raceState.currentLap} / {raceData.raceState.totalLaps}
                  </span>
                </div>
                <DataBar
                  value={raceData.raceState.currentLap}
                  max={raceData.raceState.totalLaps}
                  color="#00d9ff"
                  showValue={false}
                />
              </div>

              {raceData.raceState.gap && (
                <div className="race-info-section gap-info">
                  <div className="metric-header">
                    <span className="metric-label">INTERVAL</span>
                    <span className="metric-value gap-value">
                      +{raceData.raceState.gap.timeSeconds.toFixed(3)}s
                    </span>
                  </div>
                  <div className="gap-details">
                    {raceData.raceState.gap.distanceMeters}m
                  </div>
                </div>
              )}

              <div className="race-info-section race-time">
                <div className="metric-header">
                  <span className="metric-label">RACE TIME</span>
                  <span className="metric-value">{formatTime(raceData.raceTime)}</span>
                </div>
              </div>
            </div>

            <div className="race-content">
              {/* Car 1 - Left Column */}
              {raceData.cars[0] && (
                <div className="car-column">
                  <CarDataDisplay car={raceData.cars[0]} onPitStop={sendPitStop} />
                </div>
              )}

              {/* Track - Center Column */}
              <div className="track-section">
                <TrackMap cars={raceData.cars} />
              </div>

              {/* Car 2 - Right Column */}
              {raceData.cars[1] && (
                <div className="car-column">
                  <CarDataDisplay car={raceData.cars[1]} onPitStop={sendPitStop} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
