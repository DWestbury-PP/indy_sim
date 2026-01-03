import './TireDisplay.css';

/**
 * Get color based on tire wear level
 */
function getWearColor(wear) {
  if (wear >= 70) return '#00ff88'; // Green - good
  if (wear >= 40) return '#ffff00'; // Yellow - moderate
  if (wear >= 20) return '#ff9500'; // Orange - warning
  return '#ff3b30'; // Red - critical
}

/**
 * Get color based on tire temperature
 */
function getTempColor(temp, compound) {
  // Optimal ranges by compound (from spec)
  const optimalRanges = {
    SOFT: { min: 90, max: 110 },
    MEDIUM: { min: 85, max: 105 },
    HARD: { min: 80, max: 100 }
  };

  const range = optimalRanges[compound] || optimalRanges.MEDIUM;

  if (temp >= range.min && temp <= range.max) {
    return '#00ff88'; // Green - optimal
  } else if (temp >= range.min - 10 && temp <= range.max + 10) {
    return '#ffff00'; // Yellow - acceptable
  } else if (temp < range.min - 10) {
    return '#00d9ff'; // Blue - cold
  } else {
    return '#ff3b30'; // Red - overheating
  }
}

/**
 * Get compound color
 */
function getCompoundColor(compound) {
  const colors = {
    SOFT: '#ff0000',
    MEDIUM: '#ffff00',
    HARD: '#ffffff'
  };
  return colors[compound] || '#ffffff';
}

/**
 * Individual tire display
 */
function Tire({ tire, position, compound, compact = false }) {
  const wearColor = getWearColor(tire.wear);
  const tempColor = getTempColor(tire.temp, compound);

  return (
    <div className={`tire ${compact ? 'tire-compact' : ''}`} data-position={position}>
      <div className="tire-visual" style={{ borderColor: wearColor }}>
        <div className="tire-wear-indicator" style={{
          height: `${tire.wear}%`,
          backgroundColor: wearColor
        }}></div>
      </div>
      <div className="tire-data">
        <div className="tire-metric">
          <span className="tire-label">{compact ? 'TMP' : 'TEMP'}</span>
          <span className="tire-value" style={{ color: tempColor }}>
            {tire.temp}°{compact ? '' : 'C'}
          </span>
        </div>
        <div className="tire-metric">
          <span className="tire-label">PSI</span>
          <span className="tire-value">
            {tire.pressure}
          </span>
        </div>
        <div className="tire-metric">
          <span className="tire-label">{compact ? 'WR' : 'WEAR'}</span>
          <span className="tire-value" style={{ color: wearColor }}>
            {tire.wear}%
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Tire Display Component - shows all 4 tires with telemetry
 */
export default function TireDisplay({ tires, compact = false, onPitStop, carId }) {
  if (!tires) return null;

  const { compound, age, fl, fr, rl, rr, status } = tires;
  const compoundColor = getCompoundColor(compound);

  const handlePitStop = () => {
    if (onPitStop && carId) {
      onPitStop(carId);
    }
  };

  return (
    <div className={`tire-display ${compact ? 'tire-display-compact' : ''}`}>
      <div className="tire-header">
        <div className="tire-compound" style={{ color: compoundColor }}>
          {compound}
        </div>
        <div className="tire-age">
          {compact ? `L${age}/${status.maxLaps}` : `LAP ${age} / ${status.maxLaps}`}
        </div>
      </div>

      <div className={`tire-grid ${compact ? 'tire-grid-compact' : ''}`}>
        <Tire tire={fl} position="FL" compound={compound} compact={compact} />
        <Tire tire={fr} position="FR" compound={compound} compact={compact} />
        <Tire tire={rl} position="RL" compound={compound} compact={compact} />
        <Tire tire={rr} position="RR" compound={compound} compact={compact} />
      </div>

      {status.shouldPit && (
        <div className="pit-warning">
          <span className="pit-icon">⚠️</span>
          <span className="pit-text">
            {status.reason === 'CRITICAL_WEAR' && 'PIT NOW'}
            {status.reason === 'APPROACHING_MAX_LAPS' && `${status.lapsRemaining}L`}
            {status.reason === 'LOW_AVERAGE_WEAR' && `${status.lapsRemaining}L`}
          </span>
        </div>
      )}

      <div className="tire-summary">
        <div className="tire-summary-item">
          <span className="summary-label">{compact ? 'AVG TMP' : 'AVG TEMP'}</span>
          <span className="summary-value">{status.avgTemperature}°{compact ? '' : 'C'}</span>
        </div>
        <div className="tire-summary-item">
          <span className="summary-label">{compact ? 'AVG WR' : 'AVG WEAR'}</span>
          <span className="summary-value">{status.avgWear}%</span>
        </div>
      </div>

      {onPitStop && (
        <button
          className="pit-button"
          onClick={handlePitStop}
          disabled={age < 5}
        >
          <span className="pit-button-icon">🔧</span>
          <span className="pit-button-text">PIT STOP</span>
        </button>
      )}
    </div>
  );
}
