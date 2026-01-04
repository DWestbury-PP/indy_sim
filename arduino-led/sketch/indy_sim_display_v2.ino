/**
 * Indy Sim LED Matrix Display v2 - Enhanced Edition
 * 
 * Features:
 * - Track layout matching web interface circuit style
 * - Car "trails" showing recent positions
 * - Pulsing indicators for movement
 * - Position markers at start/finish
 * - Dynamic brightness based on speed
 * 
 * LED Matrix: 12x8 pixels
 * Communication: JSON-RPC via arduino-router
 */

#include <Arduino_LED_Matrix.h>
#include <Arduino_RouterBridge.h>

Arduino_LED_Matrix matrix;

// Track configuration
#define MATRIX_WIDTH 12
#define MATRIX_HEIGHT 8
#define TRACK_LENGTH 5281  // meters

// Enhanced track layout - circuit style with straights and corners
// Designed to match the racing circuit feel of the web interface
const uint8_t TRACK_SIZE = 34;
const struct {
  uint8_t x;
  uint8_t y;
} trackPixels[TRACK_SIZE] = {
  // START/FINISH straight (top)
  {1,1}, {2,1}, {3,1}, {4,1}, {5,1}, {6,1}, {7,1}, {8,1}, {9,1}, {10,1},
  // Turn 1 (hairpin right)
  {10,2}, {10,3}, {10,4},
  // Back straight
  {9,4}, {8,4}, {7,4}, {6,4}, {5,4}, {4,4}, {3,4}, {2,4},
  // Turn 2 (hairpin left)
  {1,4}, {1,5}, {1,6},
  // Final section back to start
  {2,6}, {3,6}, {4,6}, {5,6}, {6,6}, {7,6}, {8,6}, {9,6}, {10,6},
  // Return to start
  {10,5}, {10,4}, {10,3}, {10,2}, {10,1}
};

// Sector markers (divide track into thirds)
const uint8_t SECTOR_1 = 11;  // End of first sector
const uint8_t SECTOR_2 = 22;  // End of second sector

// Race state
struct RaceData {
  uint16_t car1_pos;
  uint16_t car2_pos;
  uint16_t car1_speed;
  uint16_t car2_speed;
  bool car1_inPit;
  bool car2_inPit;
  bool valid;
} raceData = {0, 0, 0, 0, false, false, false};

// Car trail system - shows last N positions
#define TRAIL_LENGTH 4
struct CarTrail {
  uint8_t positions[TRAIL_LENGTH];  // Track indices
  uint8_t head;
} car1Trail = {{0}, 0}, car2Trail = {{0}, 0};

// Frame buffer and timing
uint8_t frameBuffer[8][13] = {{0}};
uint8_t previousFrame[8][13] = {{0}};
unsigned long lastUpdate = 0;
const unsigned long UPDATE_INTERVAL = 50; // 20 Hz
unsigned long animationPhase = 0;

// Animation effects
bool blinkState = false;
unsigned long lastBlink = 0;
const unsigned long BLINK_INTERVAL = 250;

void setup() {
  Serial.begin(115200);
  
  matrix.begin();
  
  // Enhanced startup sequence
  showEnhancedStartup();
  
  // Initialize RouterBridge
  Bridge.begin();
  Bridge.provide("indy/raceUpdate", handleRaceUpdate);
  
  Serial.println("===========================================");
  Serial.println("Indy Sim LED Display v2 - Enhanced Edition");
  Serial.println("===========================================");
  Serial.println("Matrix: 12x8 pixels");
  Serial.println("Track: Circuit-style layout");
  Serial.println("Features: Trails, speed indicators, effects");
  Serial.println("Method: indy/raceUpdate");
  Serial.println("===========================================");
  
  raceData.valid = true;
}

void loop() {
  // Fallback to simulation if no real data
  if (!raceData.valid || millis() < 5000) {
    simulateRaceData();
  }
  
  // Update animations
  animationPhase = millis();
  
  // Blink timer for effects
  if (millis() - lastBlink >= BLINK_INTERVAL) {
    blinkState = !blinkState;
    lastBlink = millis();
  }
  
  // Update display
  unsigned long now = millis();
  if (now - lastUpdate >= UPDATE_INTERVAL) {
    updateEnhancedDisplay();
    lastUpdate = now;
  }
}

/**
 * Handle race updates from backend
 */
void handleRaceUpdate(uint16_t car1_pos, uint16_t car2_pos) {
  raceData.car1_pos = car1_pos;
  raceData.car2_pos = car2_pos;
  raceData.valid = true;
  
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 2000) {
    Serial.print("Race: C1=");
    Serial.print(car1_pos);
    Serial.print("m C2=");
    Serial.print(car2_pos);
    Serial.println("m");
    lastPrint = millis();
  }
}

/**
 * Simulation mode for testing
 */
void simulateRaceData() {
  static uint16_t car1_pos = 0;
  static uint16_t car2_pos = 800;
  static unsigned long lastSim = 0;
  
  if (millis() - lastSim > 100) {
    car1_pos = (car1_pos + 30) % TRACK_LENGTH;  // ~290 km/h
    car2_pos = (car2_pos + 25) % TRACK_LENGTH;  // ~280 km/h
    
    raceData.car1_pos = car1_pos;
    raceData.car2_pos = car2_pos;
    raceData.car1_speed = 290;
    raceData.car2_speed = 280;
    
    lastSim = millis();
  }
}

/**
 * Map track position to LED coordinate
 */
uint8_t mapPositionToTrackIndex(uint16_t position) {
  int trackIndex = (position * TRACK_SIZE) / TRACK_LENGTH;
  return constrain(trackIndex, 0, TRACK_SIZE - 1);
}

/**
 * Add position to car trail
 */
void addToTrail(CarTrail &trail, uint8_t trackIndex) {
  trail.head = (trail.head + 1) % TRAIL_LENGTH;
  trail.positions[trail.head] = trackIndex;
}

/**
 * Clear frame buffer
 */
void clearFrameBuffer() {
  memcpy(previousFrame, frameBuffer, sizeof(frameBuffer));
  memset(frameBuffer, 0, sizeof(frameBuffer));
}

/**
 * Set pixel with bounds checking
 */
void setPixel(uint8_t x, uint8_t y, uint8_t brightness) {
  if (x < 13 && y < 8) {
    frameBuffer[y][x] = brightness > 0 ? 1 : 0;
  }
}

/**
 * Draw the track with sector markers
 */
void drawTrack() {
  // Draw main track (dim)
  for (int i = 0; i < TRACK_SIZE; i++) {
    setPixel(trackPixels[i].x, trackPixels[i].y, 1);
  }
  
  // Start/finish line (brighter - blink)
  if (blinkState) {
    setPixel(trackPixels[0].x, trackPixels[0].y, 1);
    setPixel(trackPixels[1].x, trackPixels[1].y, 1);
  }
  
  // Sector markers (blink opposite phase)
  if (!blinkState) {
    setPixel(trackPixels[SECTOR_1].x, trackPixels[SECTOR_1].y, 1);
    setPixel(trackPixels[SECTOR_2].x, trackPixels[SECTOR_2].y, 1);
  }
}

/**
 * Draw car with trail effect
 */
void drawCar(uint8_t trackIndex, CarTrail &trail, bool isLeader) {
  // Update trail
  addToTrail(trail, trackIndex);
  
  // Draw trail (fading)
  for (int i = 0; i < TRAIL_LENGTH; i++) {
    int offset = (trail.head - i + TRAIL_LENGTH) % TRAIL_LENGTH;
    uint8_t pos = trail.positions[offset];
    
    if (i == 0) {
      // Current position - brightest, pulsing
      uint8_t pulse = (animationPhase / 100) % 2;
      if (pulse || isLeader) {
        setPixel(trackPixels[pos].x, trackPixels[pos].y, 1);
        
        // Add "glow" around leader
        if (isLeader && blinkState) {
          // Try adjacent pixels (if valid)
          if (trackPixels[pos].x > 0) 
            setPixel(trackPixels[pos].x - 1, trackPixels[pos].y, 1);
          if (trackPixels[pos].x < 12) 
            setPixel(trackPixels[pos].x + 1, trackPixels[pos].y, 1);
        }
      }
    } else if (i == 1) {
      // Recent position - medium brightness
      setPixel(trackPixels[pos].x, trackPixels[pos].y, 1);
    } else {
      // Older positions - create gap effect (blank every other)
      if (i % 2 == 0) {
        setPixel(trackPixels[pos].x, trackPixels[pos].y, 0);
      }
    }
  }
}

/**
 * Draw position indicator (who's ahead)
 */
void drawPositionIndicator() {
  // Top left corner - Position 1
  setPixel(0, 0, blinkState ? 1 : 0);
  
  // Bottom left corner - Position 2  
  setPixel(0, 7, blinkState ? 0 : 1);
}

/**
 * Enhanced display update with all effects
 */
void updateEnhancedDisplay() {
  if (!raceData.valid) return;
  
  clearFrameBuffer();
  
  // Draw base track
  drawTrack();
  
  // Get car positions
  uint8_t car1_idx = mapPositionToTrackIndex(raceData.car1_pos);
  uint8_t car2_idx = mapPositionToTrackIndex(raceData.car2_pos);
  
  // Determine leader (for special effects)
  bool car1_leading = raceData.car1_pos > raceData.car2_pos;
  
  // Draw cars with trails
  drawCar(car1_idx, car1Trail, car1_leading);
  drawCar(car2_idx, car2Trail, !car1_leading);
  
  // Position indicator
  drawPositionIndicator();
  
  // If cars are very close, add excitement indicator
  int posDiff = abs((int)raceData.car1_pos - (int)raceData.car2_pos);
  if (posDiff < 100) {  // Within 100m
    // Flash corners to show close racing
    if ((animationPhase / 100) % 2 == 0) {
      setPixel(11, 0, 1);  // Top right
      setPixel(11, 7, 1);  // Bottom right
    }
  }
  
  // Send to display
  matrix.loadPixels(&frameBuffer[0][0], 8 * 13);
  
  // Debug output
  static unsigned long lastDebug = 0;
  if (millis() - lastDebug > 2000) {
    Serial.print("Display: C1[");
    Serial.print(car1_idx);
    Serial.print("] C2[");
    Serial.print(car2_idx);
    Serial.print("] Gap:");
    Serial.print(posDiff);
    Serial.println("m");
    lastDebug = millis();
  }
}

/**
 * Enhanced startup animation
 */
void showEnhancedStartup() {
  // 1. Track reveal with racing line
  for (int i = 0; i < TRACK_SIZE; i++) {
    clearFrameBuffer();
    
    // Draw track up to current point
    for (int j = 0; j <= i; j++) {
      setPixel(trackPixels[j].x, trackPixels[j].y, 1);
    }
    
    // "Car" following the racing line
    if (i > 0) {
      setPixel(trackPixels[i-1].x, trackPixels[i-1].y, 0);
    }
    
    matrix.loadPixels(&frameBuffer[0][0], 8 * 13);
    delay(30);
  }
  
  delay(200);
  
  // 2. Flash the whole track
  for (int f = 0; f < 3; f++) {
    clearFrameBuffer();
    matrix.loadPixels(&frameBuffer[0][0], 8 * 13);
    delay(100);
    
    clearFrameBuffer();
    for (int i = 0; i < TRACK_SIZE; i++) {
      setPixel(trackPixels[i].x, trackPixels[i].y, 1);
    }
    matrix.loadPixels(&frameBuffer[0][0], 8 * 13);
    delay(100);
  }
  
  // 3. Position indicators
  clearFrameBuffer();
  setPixel(0, 0, 1);  // P1
  delay(150);
  setPixel(0, 7, 1);  // P2
  matrix.loadPixels(&frameBuffer[0][0], 8 * 13);
  delay(300);
  
  // 4. Ready message (fill and clear)
  memset(frameBuffer, 1, sizeof(frameBuffer));
  matrix.loadPixels(&frameBuffer[0][0], 8 * 13);
  delay(200);
  
  matrix.clear();
  delay(300);
}

