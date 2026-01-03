import './DataBar.css';

/**
 * Animated horizontal bar for visualizing metrics
 * Perfect for throttle, brake, fuel, wear, etc.
 */
export default function DataBar({
  label,
  value,
  max = 100,
  color = '#00d9ff',
  showValue = true,
  unit = '%'
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="data-bar-container">
      <div className="data-bar-header">
        <span className="data-bar-label">{label}</span>
        {showValue && (
          <span className="data-bar-value" style={{ color }}>
            {value}{unit}
          </span>
        )}
      </div>
      <div className="data-bar-track">
        <div
          className="data-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}80`
          }}
        >
          <div className="data-bar-glow" style={{ backgroundColor: color }}></div>
        </div>
      </div>
    </div>
  );
}
