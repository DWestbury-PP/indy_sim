import { useTrendData } from '../hooks/useTrendData';
import DataBar from './DataBar';
import Sparkline from './Sparkline';
import TireDisplay from './TireDisplay';

/**
 * Enhanced car data display with visual metrics
 */
export default function CarDataDisplay({ car, onPitStop }) {
  // Track trends for sparklines
  const speedHistory = useTrendData(car.track.speed, 20);
  const rpmHistory = useTrendData(car.driver.rpm, 20);

  return (
    <div className="car-card" style={{ borderColor: car.teamColor }}>
      <div className="car-header">
        <h3>{car.name}</h3>
        <span className="position">P{car.position}</span>
      </div>

      <div className="car-card-content">
        <div className="car-data">
          {/* Track Section */}
          <div className="data-section">
            <h4>Track</h4>
            <div className="metric-with-trend">
              <div className="metric-row">
                <span className="metric-label">Speed</span>
                <span className="metric-value">{car.track.speed} km/h</span>
              </div>
              {speedHistory.length > 2 && (
                <Sparkline
                  data={speedHistory}
                  width={100}
                  height={25}
                  color={car.teamColor}
                />
              )}
            </div>
            <p>Position: {car.track.position}m</p>
            <p>Sector: {car.track.sector}</p>
            <DataBar
              label="Progress"
              value={car.track.trackProgress * 100}
              max={100}
              color={car.teamColor}
              showValue={false}
            />
          </div>

          {/* Timing Section */}
          <div className="data-section">
            <h4>Timing</h4>
            <p>Lap: {car.timing.lapNumber}</p>
            <p>Current: {car.timing.currentLapTime}s</p>
            <p>Last: {car.timing.lastLapTime ? `${car.timing.lastLapTime}s` : 'N/A'}</p>
            <p>Best: {car.timing.bestLapTime ? `${car.timing.bestLapTime}s` : 'N/A'}</p>
          </div>

          {/* Driver Inputs Section */}
          <div className="data-section">
            <h4>Driver Inputs</h4>
            <DataBar
              label="Throttle"
              value={car.driver.throttle}
              color="#00ff88"
            />
            <DataBar
              label="Brake"
              value={car.driver.brake}
              color="#ff3b30"
            />
            <div className="metric-with-trend">
              <div className="metric-row">
                <span className="metric-label">RPM</span>
                <span className="metric-value">{car.driver.rpm.toLocaleString()}</span>
              </div>
              {rpmHistory.length > 2 && (
                <Sparkline
                  data={rpmHistory}
                  width={100}
                  height={25}
                  color="#ffff00"
                />
              )}
            </div>
            <p>Gear: {car.driver.gear}</p>
          </div>
        </div>

        {/* Tire Section - Positioned to the side */}
        {car.tires && (
          <div className="tire-sidebar">
            <TireDisplay
              tires={car.tires}
              compact={true}
              onPitStop={onPitStop}
              carId={car.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}
