import './CarTechnicalView.css';

/**
 * Technical wireframe view of the car with overlaid data points
 */
export default function CarTechnicalView({ car }) {
  return (
    <div className="car-technical-view">
      <div className="technical-header">
        <h3>{car.name}</h3>
        <span className="technical-label">TECHNICAL VIEW</span>
      </div>

      <div className="wireframe-container">
        {/* Wireframe background */}
        <img
          src="/assets/Indy4.jpg"
          alt="Car Wireframe"
          className="wireframe-image"
        />

        {/* Data overlays positioned over the wireframe */}

        {/* Front Wing - Aerodynamics */}
        <div className="data-overlay front-wing">
          <div className="overlay-label">FRONT AERO</div>
          <div className="overlay-value">{(car.driver.throttle * 0.8).toFixed(0)}%</div>
        </div>

        {/* Rear Wing */}
        <div className="data-overlay rear-wing">
          <div className="overlay-label">REAR AERO</div>
          <div className="overlay-value">{(car.driver.throttle * 0.9).toFixed(0)}%</div>
        </div>

        {/* Engine / Power Unit */}
        <div className="data-overlay engine">
          <div className="overlay-label">POWER UNIT</div>
          <div className="overlay-value">{car.driver.rpm.toLocaleString()} RPM</div>
          <div className="overlay-sub">GEAR {car.driver.gear}</div>
        </div>

        {/* Front Left Tire */}
        <div className="data-overlay tire-fl">
          <div className="overlay-label">FL</div>
          <div className="overlay-value tire-temp" style={{
            color: car.tires.fl.wear > 70 ? '#00ff88' : car.tires.fl.wear > 40 ? '#ffff00' : '#ff3b30'
          }}>
            {car.tires.fl.temp}°
          </div>
          <div className="overlay-sub">{car.tires.fl.wear}%</div>
        </div>

        {/* Front Right Tire */}
        <div className="data-overlay tire-fr">
          <div className="overlay-label">FR</div>
          <div className="overlay-value tire-temp" style={{
            color: car.tires.fr.wear > 70 ? '#00ff88' : car.tires.fr.wear > 40 ? '#ffff00' : '#ff3b30'
          }}>
            {car.tires.fr.temp}°
          </div>
          <div className="overlay-sub">{car.tires.fr.wear}%</div>
        </div>

        {/* Rear Left Tire */}
        <div className="data-overlay tire-rl">
          <div className="overlay-label">RL</div>
          <div className="overlay-value tire-temp" style={{
            color: car.tires.rl.wear > 70 ? '#00ff88' : car.tires.rl.wear > 40 ? '#ffff00' : '#ff3b30'
          }}>
            {car.tires.rl.temp}°
          </div>
          <div className="overlay-sub">{car.tires.rl.wear}%</div>
        </div>

        {/* Rear Right Tire */}
        <div className="data-overlay tire-rr">
          <div className="overlay-label">RR</div>
          <div className="overlay-value tire-temp" style={{
            color: car.tires.rr.wear > 70 ? '#00ff88' : car.tires.rr.wear > 40 ? '#ffff00' : '#ff3b30'
          }}>
            {car.tires.rr.temp}°
          </div>
          <div className="overlay-sub">{car.tires.rr.wear}%</div>
        </div>

        {/* Brake System */}
        <div className="data-overlay brakes">
          <div className="overlay-label">BRAKES</div>
          <div className="overlay-value">{car.driver.brake}%</div>
        </div>

        {/* Speed overlay */}
        <div className="data-overlay speed-indicator">
          <div className="overlay-value speed-large">{car.track.speed}</div>
          <div className="overlay-label">KM/H</div>
        </div>
      </div>

      <div className="technical-footer">
        <span className="click-hint">⟲ Click anywhere to return</span>
      </div>
    </div>
  );
}
