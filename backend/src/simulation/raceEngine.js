import { initializeTires, updateTires, completeLap, getTireStatus } from '../telemetry/tireData.js';

/**
 * RaceSimulation - Core race simulation engine
 * Manages two F1 cars racing around a track with realistic physics
 */
export class RaceSimulation {
  constructor(config) {
    this.config = config;
    this.startTime = Date.now();
    this.elapsedTime = 0;

    // Initialize two cars
    this.cars = [
      {
        id: 'car1',
        name: 'NEXUS-01',
        teamColor: '#00d9ff',
        position: 0, // meters along track
        speed: 0, // km/h
        lapNumber: 1,
        lapStartTime: Date.now(),
        currentLapTime: 0,
        lastLapTime: null,
        bestLapTime: null,
        racePosition: 1,
        sector: 1,
        // Basic car state
        throttle: 0,
        brake: 0,
        gear: 4,
        rpm: 8000,
        lateralG: 0,
        longitudinalG: 0,
        // Tire telemetry
        tires: initializeTires('SOFT')
      },
      {
        id: 'car2',
        name: 'NEXUS-02',
        teamColor: '#bd00ff',
        position: 150, // Start slightly behind
        speed: 0,
        lapNumber: 1,
        lapStartTime: Date.now(),
        currentLapTime: 0,
        lastLapTime: null,
        bestLapTime: null,
        racePosition: 2,
        sector: 1,
        throttle: 0,
        brake: 0,
        gear: 4,
        rpm: 8000,
        lateralG: 0,
        longitudinalG: 0,
        // Tire telemetry
        tires: initializeTires('MEDIUM')
      }
    ];
  }

  /**
   * Update simulation by one tick
   */
  update() {
    const now = Date.now();
    const deltaTime = 0.033; // ~30Hz update rate (in seconds)

    this.elapsedTime = (now - this.startTime) / 1000;

    this.cars.forEach((car) => {
      // Store previous speed for acceleration calculation
      const prevSpeed = car.speed || 0;

      // Simple speed variation to simulate racing
      // Cars will speed up and slow down based on track position (simulating corners)
      const trackProgress = (car.position % this.config.trackLength) / this.config.trackLength;

      // Simulate speed zones (straight vs corners)
      // Using sine wave to create natural speed variation
      const speedFactor = 0.8 + 0.2 * Math.cos(trackProgress * Math.PI * 6); // 3 fast sections, 3 slow sections
      const targetSpeed = 280 * speedFactor; // Base speed 280 km/h

      // Add some randomness for variety
      const randomVariation = (Math.random() - 0.5) * 10;
      car.speed = targetSpeed + randomVariation;

      // Calculate G-forces
      // Longitudinal G (acceleration/braking)
      const speedDelta = (car.speed - prevSpeed) / 3.6; // Convert to m/s
      const acceleration = speedDelta / deltaTime; // m/s²
      car.longitudinalG = acceleration / 9.81; // Convert to G

      // Lateral G (cornering) - estimate from speed variation
      const corneringIntensity = Math.abs(Math.sin(trackProgress * Math.PI * 6));
      car.lateralG = (car.speed / 280) * corneringIntensity * 3.5; // Up to 3.5G in corners
      if (Math.random() > 0.5) car.lateralG *= -1; // Vary left/right

      // Update position (convert km/h to m/s: km/h / 3.6)
      const speedMS = car.speed / 3.6;
      car.position += speedMS * deltaTime;

      // Update current lap time
      car.currentLapTime = (now - car.lapStartTime) / 1000;

      // Check if completed a lap
      if (car.position >= this.config.trackLength * car.lapNumber) {
        // Lap completed!
        car.lastLapTime = car.currentLapTime;

        // Update best lap
        if (!car.bestLapTime || car.lastLapTime < car.bestLapTime) {
          car.bestLapTime = car.lastLapTime;
        }

        car.lapNumber++;
        car.lapStartTime = now;

        // Increment tire age
        completeLap(car.tires);

        // Reset to start of track if we've completed all laps
        if (car.lapNumber > this.config.totalLaps) {
          car.lapNumber = 1;
          car.position = car.position % this.config.trackLength;
          car.lastLapTime = null;
          car.bestLapTime = null;
        }
      }

      // Update sector (track divided into 3 sectors)
      const sectorLength = this.config.trackLength / 3;
      const positionInLap = car.position % this.config.trackLength;
      car.sector = Math.floor(positionInLap / sectorLength) + 1;

      // Update driver inputs based on speed
      if (car.speed > 250) {
        car.throttle = 95 + Math.random() * 5;
        car.brake = 0;
        car.gear = 7 + Math.floor(Math.random() * 2); // 7 or 8
        car.rpm = 11000 + Math.random() * 2000;
      } else if (car.speed > 150) {
        car.throttle = 60 + Math.random() * 30;
        car.brake = Math.random() * 20;
        car.gear = 4 + Math.floor(Math.random() * 3); // 4, 5, or 6
        car.rpm = 8000 + Math.random() * 3000;
      } else {
        car.throttle = 40 + Math.random() * 40;
        car.brake = Math.random() * 60;
        car.gear = 2 + Math.floor(Math.random() * 3); // 2, 3, or 4
        car.rpm = 6000 + Math.random() * 4000;
      }

      // Update tire telemetry
      updateTires(car.tires, {
        speed: car.speed,
        throttle: car.throttle,
        brake: car.brake,
        lateralG: car.lateralG,
        longitudinalG: car.longitudinalG,
        trackPosition: trackProgress
      }, deltaTime);
    });

    // Update race positions based on lap number and position
    this.updateRacePositions();
  }

  /**
   * Update race positions based on progress
   */
  updateRacePositions() {
    // Sort cars by total distance traveled
    const sorted = [...this.cars].sort((a, b) => {
      const distanceA = (a.lapNumber - 1) * this.config.trackLength + (a.position % this.config.trackLength);
      const distanceB = (b.lapNumber - 1) * this.config.trackLength + (b.position % this.config.trackLength);
      return distanceB - distanceA;
    });

    // Update positions
    sorted.forEach((car, index) => {
      car.racePosition = index + 1;
    });
  }

  /**
   * Execute pit stop for a specific car
   */
  executePitStop(carId) {
    const car = this.cars.find(c => c.id === carId);
    if (!car) {
      console.error(`Car ${carId} not found`);
      return;
    }

    console.log(`Executing pit stop for ${car.name} (${carId})`);

    // Determine new compound based on current compound
    let newCompound;
    if (car.tires.compound === 'SOFT') {
      newCompound = 'MEDIUM';
    } else if (car.tires.compound === 'MEDIUM') {
      newCompound = 'HARD';
    } else {
      newCompound = 'SOFT'; // Cycle back
    }

    // Reset tires with new compound
    car.tires = initializeTires(newCompound);

    console.log(`${car.name} changed from ${car.tires.compound} to ${newCompound} tires`);
  }

  /**
   * Calculate time gap between cars
   */
  calculateGap() {
    // Sort by position
    const sorted = [...this.cars].sort((a, b) => a.racePosition - b.racePosition);

    if (sorted.length < 2) return null;

    const leader = sorted[0];
    const follower = sorted[1];

    // Calculate total distance for each car
    const leaderDistance = (leader.lapNumber - 1) * this.config.trackLength + (leader.position % this.config.trackLength);
    const followerDistance = (follower.lapNumber - 1) * this.config.trackLength + (follower.position % this.config.trackLength);

    // Distance gap in meters
    const distanceGap = leaderDistance - followerDistance;

    // Estimate time gap based on follower's current speed
    // Convert speed from km/h to m/s: speed / 3.6
    const followerSpeedMS = follower.speed / 3.6;
    const timeGap = followerSpeedMS > 0 ? distanceGap / followerSpeedMS : 0;

    return {
      distanceMeters: Math.round(distanceGap),
      timeSeconds: timeGap,
      leader: leader.name,
      follower: follower.name
    };
  }

  /**
   * Get current state for broadcasting
   */
  getCurrentState() {
    const gap = this.calculateGap();

    return {
      timestamp: Date.now(),
      raceTime: this.elapsedTime,
      raceState: {
        currentLap: Math.max(this.cars[0].lapNumber, this.cars[1].lapNumber),
        totalLaps: this.config.totalLaps,
        gap: gap
      },
      cars: this.cars.map(car => {
        const tireStatus = getTireStatus(car.tires);

        return {
          id: car.id,
          name: car.name,
          teamColor: car.teamColor,
          position: car.racePosition,
          track: {
            speed: Math.round(car.speed),
            position: Math.round(car.position % this.config.trackLength),
            trackProgress: (car.position % this.config.trackLength) / this.config.trackLength,
            sector: car.sector
          },
          timing: {
            lapNumber: car.lapNumber,
            currentLapTime: car.currentLapTime.toFixed(3),
            lastLapTime: car.lastLapTime ? car.lastLapTime.toFixed(3) : null,
            bestLapTime: car.bestLapTime ? car.bestLapTime.toFixed(3) : null
          },
          driver: {
            throttle: Math.round(car.throttle),
            brake: Math.round(car.brake),
            gear: car.gear,
            rpm: Math.round(car.rpm)
          },
          tires: {
            compound: car.tires.compound,
            age: car.tires.age,
            fl: {
              temp: Math.round(car.tires.fl.temperature),
              pressure: car.tires.fl.pressure.toFixed(1),
              wear: Math.round(car.tires.fl.wear)
            },
            fr: {
              temp: Math.round(car.tires.fr.temperature),
              pressure: car.tires.fr.pressure.toFixed(1),
              wear: Math.round(car.tires.fr.wear)
            },
            rl: {
              temp: Math.round(car.tires.rl.temperature),
              pressure: car.tires.rl.pressure.toFixed(1),
              wear: Math.round(car.tires.rl.wear)
            },
            rr: {
              temp: Math.round(car.tires.rr.temperature),
              pressure: car.tires.rr.pressure.toFixed(1),
              wear: Math.round(car.tires.rr.wear)
            },
            status: tireStatus
          }
        };
      })
    };
  }
}
