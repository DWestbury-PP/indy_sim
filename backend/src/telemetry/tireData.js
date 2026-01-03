/**
 * Tire Telemetry Module
 * Generates realistic tire data: temperature, pressure, wear
 */

// Tire compound types with different characteristics
export const TIRE_COMPOUNDS = {
  SOFT: {
    name: 'SOFT',
    color: '#ff0000',
    optimalTemp: { min: 90, max: 110 },
    degradationRate: 0.8, // Wears faster
    gripLevel: 1.0,
    maxLaps: 15
  },
  MEDIUM: {
    name: 'MEDIUM',
    color: '#ffff00',
    optimalTemp: { min: 85, max: 105 },
    degradationRate: 0.5, // Moderate wear
    gripLevel: 0.85,
    maxLaps: 25
  },
  HARD: {
    name: 'HARD',
    color: '#ffffff',
    optimalTemp: { min: 80, max: 100 },
    degradationRate: 0.3, // Wears slowly
    gripLevel: 0.75,
    maxLaps: 40
  }
};

/**
 * Initialize tire state for a car
 */
export function initializeTires(compound = 'SOFT') {
  const compoundData = TIRE_COMPOUNDS[compound];

  return {
    compound: compound,
    age: 0, // Laps on this tire set
    fl: createTire('FL', compoundData),
    fr: createTire('FR', compoundData),
    rl: createTire('RL', compoundData),
    rr: createTire('RR', compoundData)
  };
}

/**
 * Create a single tire with initial state
 */
function createTire(position, compound) {
  // Base temperature varies slightly by position
  const baseTemp = position.startsWith('F') ? 85 : 83; // Front tires slightly hotter

  return {
    position: position,
    temperature: baseTemp + (Math.random() - 0.5) * 5, // °C
    pressure: 21.5 + (Math.random() - 0.5) * 0.5, // PSI
    wear: 100, // Percentage remaining
    surfaceTemp: baseTemp + (Math.random() - 0.5) * 5,
    innerTemp: baseTemp - 5 + (Math.random() - 0.5) * 3
  };
}

/**
 * Update tire data based on driving conditions
 */
export function updateTires(tireState, drivingData, deltaTime) {
  const compound = TIRE_COMPOUNDS[tireState.compound];
  const { speed, throttle, brake, lateralG, longitudinalG, trackPosition } = drivingData;

  // Update each tire
  ['fl', 'fr', 'rl', 'rr'].forEach(pos => {
    const tire = tireState[pos];

    // Temperature changes based on speed and forces
    updateTireTemperature(tire, speed, throttle, brake, lateralG, longitudinalG, pos, compound);

    // Pressure changes with temperature (PV=nRT)
    updateTirePressure(tire);

    // Wear degrades over time based on usage
    updateTireWear(tire, speed, throttle, brake, lateralG, compound, deltaTime);
  });

  return tireState;
}

/**
 * Update tire temperature based on driving conditions
 */
function updateTireTemperature(tire, speed, throttle, brake, lateralG, longitudinalG, position, compound) {
  const isFront = position.startsWith('f');
  const isLeft = position.endsWith('l');

  // Base heat generation from speed
  let heatGeneration = speed / 30; // Higher speed = more heat

  // Front tires heat up more under braking
  if (isFront && brake > 0) {
    heatGeneration += brake / 10;
  }

  // Rear tires heat up more under acceleration
  if (!isFront && throttle > 0) {
    heatGeneration += throttle / 15;
  }

  // Cornering heats up outer tires
  const corneringHeat = Math.abs(lateralG) * 2;
  if ((lateralG > 0 && isLeft) || (lateralG < 0 && !isLeft)) {
    heatGeneration += corneringHeat;
  }

  // Target temperature based on compound optimal range
  const targetTemp = (compound.optimalTemp.min + compound.optimalTemp.max) / 2;
  const tempDelta = (targetTemp + heatGeneration - tire.temperature) * 0.05;

  // Update temperature with some inertia
  tire.temperature += tempDelta;

  // Add some random variation (thermal dynamics)
  tire.temperature += (Math.random() - 0.5) * 0.5;

  // Clamp to reasonable range
  tire.temperature = Math.max(60, Math.min(130, tire.temperature));

  // Surface temp is slightly higher than core
  tire.surfaceTemp = tire.temperature + Math.random() * 5;
  tire.innerTemp = tire.temperature - 3 + Math.random() * 2;
}

/**
 * Update tire pressure based on temperature
 * Using simplified ideal gas law: pressure increases with temperature
 */
function updateTirePressure(tire) {
  // Cold pressure is around 19-20 PSI, hot pressure 21-24 PSI
  const coldPressure = 19.5;
  const coldTemp = 70; // Cold tire temperature

  // Simple linear relationship (in reality it's more complex)
  const tempDelta = tire.temperature - coldTemp;
  const pressureIncrease = tempDelta * 0.05; // ~0.05 PSI per degree C

  tire.pressure = coldPressure + pressureIncrease;

  // Add small random variation
  tire.pressure += (Math.random() - 0.5) * 0.1;

  // Clamp to reasonable range
  tire.pressure = Math.max(18, Math.min(26, tire.pressure));
}

/**
 * Update tire wear based on usage
 */
function updateTireWear(tire, speed, throttle, brake, lateralG, compound, deltaTime) {
  // Base degradation rate (per second)
  let degradation = compound.degradationRate * 0.01 * deltaTime;

  // High speed increases wear
  degradation *= (1 + speed / 500);

  // Aggressive driving increases wear
  const aggressionFactor = (throttle + brake + Math.abs(lateralG) * 30) / 150;
  degradation *= (1 + aggressionFactor);

  // Apply wear
  tire.wear = Math.max(0, tire.wear - degradation);

  // Worn tires lose grip and overheat easier
  if (tire.wear < 30) {
    tire.temperature += 0.5; // Worn tires run hotter
  }
}

/**
 * Complete a lap - increment tire age
 */
export function completeLap(tireState) {
  tireState.age++;
  return tireState;
}

/**
 * Check if tires need to be changed (pit stop recommendation)
 */
export function shouldPitForTires(tireState) {
  const compound = TIRE_COMPOUNDS[tireState.compound];

  // Recommend pit stop if:
  // 1. Any tire below 20% wear
  const minWear = Math.min(
    tireState.fl.wear,
    tireState.fr.wear,
    tireState.rl.wear,
    tireState.rr.wear
  );

  if (minWear < 20) {
    return { shouldPit: true, reason: 'CRITICAL_WEAR', lapsRemaining: 0 };
  }

  // 2. Tire age approaching max laps for compound
  const lapsRemaining = compound.maxLaps - tireState.age;
  if (lapsRemaining <= 3) {
    return { shouldPit: true, reason: 'APPROACHING_MAX_LAPS', lapsRemaining };
  }

  // 3. Average wear below 40%
  const avgWear = (tireState.fl.wear + tireState.fr.wear + tireState.rl.wear + tireState.rr.wear) / 4;
  if (avgWear < 40) {
    return { shouldPit: true, reason: 'LOW_AVERAGE_WEAR', lapsRemaining: Math.floor(lapsRemaining / 2) };
  }

  return { shouldPit: false, lapsRemaining };
}

/**
 * Perform a pit stop - change tires
 */
export function changeTires(newCompound = 'MEDIUM') {
  return initializeTires(newCompound);
}

/**
 * Get tire status summary for display
 */
export function getTireStatus(tireState) {
  const compound = TIRE_COMPOUNDS[tireState.compound];
  const pitInfo = shouldPitForTires(tireState);

  return {
    compound: tireState.compound,
    age: tireState.age,
    maxLaps: compound.maxLaps,
    ...pitInfo,
    avgTemperature: ((tireState.fl.temperature + tireState.fr.temperature +
                      tireState.rl.temperature + tireState.rr.temperature) / 4).toFixed(1),
    avgWear: ((tireState.fl.wear + tireState.fr.wear +
               tireState.rl.wear + tireState.rr.wear) / 4).toFixed(1)
  };
}
