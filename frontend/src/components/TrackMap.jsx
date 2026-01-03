import { useMemo } from 'react';
import './TrackMap.css';

/**
 * Calculate position on track based on progress (0-1)
 * Creates a realistic F1 circuit with varied corners
 */
function getTrackPosition(progress, width = 400, height = 500) {
  // Normalize progress to 0-1
  progress = progress % 1;

  // Define waypoints for a realistic circuit layout
  const waypoints = [
    // Start/Finish straight
    { x: 0.5, y: 0.8, type: 'straight' },
    // Turn 1: Fast right-hander
    { x: 0.75, y: 0.7, type: 'fast' },
    { x: 0.85, y: 0.5, type: 'fast' },
    // Turn 2: Tight hairpin
    { x: 0.82, y: 0.3, type: 'hairpin' },
    { x: 0.7, y: 0.2, type: 'hairpin' },
    // Back straight
    { x: 0.4, y: 0.2, type: 'straight' },
    // Turn 3: Chicane
    { x: 0.25, y: 0.25, type: 'chicane' },
    { x: 0.22, y: 0.35, type: 'chicane' },
    { x: 0.25, y: 0.45, type: 'chicane' },
    // Turn 4: Medium speed corner
    { x: 0.2, y: 0.6, type: 'medium' },
    // Final corner complex
    { x: 0.25, y: 0.75, type: 'medium' },
    { x: 0.35, y: 0.82, type: 'fast' },
    // Back to start
    { x: 0.5, y: 0.8, type: 'straight' }
  ];

  // Interpolate between waypoints
  const totalPoints = waypoints.length - 1;
  const segmentProgress = progress * totalPoints;
  const currentSegment = Math.floor(segmentProgress);
  const t = segmentProgress - currentSegment;

  const p1 = waypoints[currentSegment];
  const p2 = waypoints[(currentSegment + 1) % waypoints.length];

  // Smooth interpolation with easing based on corner type
  const easedT = p1.type === 'hairpin' ?
    t * t * (3 - 2 * t) : // Smooth for tight corners
    t; // Linear for straights

  const x = (p1.x + (p2.x - p1.x) * easedT) * width;
  const y = (p1.y + (p2.y - p1.y) * easedT) * height;

  // Calculate rotation based on direction
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  // Add 90 degrees because car is drawn pointing up by default, but atan2(dy,dx) gives 0° for pointing right
  const rotation = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

  return { x, y, rotation };
}

/**
 * Generate track path SVG string
 */
function generateTrackPath(width = 600, height = 400) {
  // Sample many points along the track for smooth curve
  const numPoints = 100;
  const points = [];

  for (let i = 0; i <= numPoints; i++) {
    const progress = i / numPoints;
    const pos = getTrackPosition(progress, width, height);
    points.push(`${pos.x},${pos.y}`);
  }

  // Create smooth path using the points
  return `M ${points.join(' L ')} Z`;
}

/**
 * Car marker component
 */
function CarMarker({ car, width, height }) {
  const position = useMemo(
    () => getTrackPosition(car.track.trackProgress, width, height),
    [car.track.trackProgress, width, height]
  );

  return (
    <g className="car-marker" transform={`translate(${position.x}, ${position.y})`}>
      {/* Car body - styled as a simplified F1 car shape */}
      <g transform={`rotate(${position.rotation})`}>
        {/* Main body */}
        <rect
          x="-8"
          y="-12"
          width="16"
          height="24"
          rx="3"
          fill={car.teamColor}
          stroke="white"
          strokeWidth="1.5"
          opacity="0.9"
        />
        {/* Front wing */}
        <rect
          x="-10"
          y="-14"
          width="20"
          height="3"
          rx="1"
          fill={car.teamColor}
          opacity="0.7"
        />
        {/* Rear wing */}
        <rect
          x="-10"
          y="11"
          width="20"
          height="3"
          rx="1"
          fill={car.teamColor}
          opacity="0.7"
        />
        {/* Direction indicator (nose) */}
        <circle
          cx="0"
          cy="-16"
          r="2"
          fill="white"
        />
      </g>

      {/* Car label */}
      <text
        x="0"
        y="-25"
        textAnchor="middle"
        className="car-label"
        fill={car.teamColor}
        style={{ textShadow: `0 0 8px ${car.teamColor}` }}
      >
        {car.name}
      </text>

      {/* Position badge */}
      <circle
        cx="0"
        cy="25"
        r="10"
        fill="rgba(0, 0, 0, 0.8)"
        stroke={car.teamColor}
        strokeWidth="2"
      />
      <text
        x="0"
        y="30"
        textAnchor="middle"
        className="position-badge"
        fill="white"
      >
        P{car.position}
      </text>
    </g>
  );
}

/**
 * Track Map Component
 * Shows overhead view of the circuit with live car positions
 */
export default function TrackMap({ cars }) {
  const width = 400;
  const height = 500;
  const trackPath = useMemo(() => generateTrackPath(width, height), [width, height]);

  if (!cars || cars.length === 0) {
    return (
      <div className="track-map">
        <p>Waiting for race data...</p>
      </div>
    );
  }

  return (
    <div className="track-map">
      <div className="track-header">
        <h3>Live Track Position</h3>
      </div>

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="track-svg"
      >
        {/* Track background */}
        <rect width={width} height={height} fill="transparent" />

        {/* Sector dividers */}
        <g className="sector-lines">
          {[0, 0.333, 0.666].map((sectorProgress, idx) => {
            const pos = getTrackPosition(sectorProgress, width, height);
            return (
              <g key={idx}>
                <line
                  x1={width / 2}
                  y1={height / 2}
                  x2={pos.x}
                  y2={pos.y}
                  stroke="rgba(0, 217, 255, 0.2)"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  className="sector-label"
                  fill="rgba(0, 217, 255, 0.5)"
                >
                  S{idx + 1}
                </text>
              </g>
            );
          })}
        </g>

        {/* Track path - outer edge */}
        <path
          d={trackPath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="48"
          className="track-outer"
        />

        {/* Track path - racing line */}
        <path
          d={trackPath}
          fill="none"
          stroke="rgba(0, 217, 255, 0.3)"
          strokeWidth="44"
          className="track-surface"
        />

        {/* Center line */}
        <path
          d={trackPath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="2"
          strokeDasharray="10,10"
          className="track-centerline"
        />

        {/* Start/Finish line */}
        <g className="start-finish">
          {(() => {
            const startPos = getTrackPosition(0, width, height);
            return (
              <g transform={`translate(${startPos.x}, ${startPos.y}) rotate(${startPos.rotation})`}>
                <line
                  x1={-25}
                  y1={0}
                  x2={25}
                  y2={0}
                  stroke="white"
                  strokeWidth="4"
                />
                <rect
                  x={-25}
                  y={-2}
                  width="50"
                  height="4"
                  fill="url(#checkerboard)"
                />
              </g>
            );
          })()}
        </g>

        {/* Checkerboard pattern definition */}
        <defs>
          <pattern id="checkerboard" x="0" y="0" width="8" height="4" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="4" height="4" fill="white" />
            <rect x="4" y="0" width="4" height="4" fill="black" />
          </pattern>
        </defs>

        {/* Car markers */}
        {cars.map((car) => (
          <CarMarker key={car.id} car={car} width={width} height={height} />
        ))}
      </svg>
    </div>
  );
}
