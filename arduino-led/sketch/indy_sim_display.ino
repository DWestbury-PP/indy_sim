/**
 * Indy Sim LED Matrix Display for Arduino Q
 * 
 * Displays race positions on the 12x8 LED matrix
 * Receives data from Linux side via RouterBridge
 * 
 * LED Matrix: 13x8 pixels (using 12x8 for track)
 * Communication: JSON-RPC via arduino-router
 */

#include <Arduino_LED_Matrix.h>
#include <Arduino_RouterBridge.h>

// LED Matrix object
Arduino_LED_Matrix matrix;

// Track configuration
#define MATRIX_WIDTH 12
#define MATRIX_HEIGHT 8
#define TRACK_LENGTH 5281  // meters (from simulation)

// Track layout - oval on 12x8 matrix
// We'll use the perimeter for the track
const uint8_t TRACK_SIZE = 38;
const struct {
  uint8_t x;
  uint8_t y;
} trackPixels[TRACK_SIZE] = {
  // Top row (left to right)
  {0,0}, {1,0}, {2,0}, {3,0}, {4,0}, {5,0}, {6,0}, {7,0}, {8,0}, {9,0}, {10,0}, {11,0},
  // Right column (top to bottom)
  {11,1}, {11,2}, {11,3}, {11,4}, {11,5}, {11,6}, {11,7},
  // Bottom row (right to left)
  {10,7}, {9,7}, {8,7}, {7,7}, {6,7}, {5,7}, {4,7}, {3,7}, {2,7}, {1,7}, {0,7},
  // Left column (bottom to top)
  {0,6}, {0,5}, {0,4}, {0,3}, {0,2}, {0,1}
  // Total: 38 pixels forming oval
};

// Race state
struct RaceData {
  uint16_t car1_pos;    // meters (0-5281)
  uint16_t car2_pos;    // meters
  bool valid;
} raceData = {0, 0, false};

// Frame buffer for LED matrix
// 13x8 = 104 pixels, stored as array
uint8_t frameBuffer[8][13] = {{0}};

// Timing
unsigned long lastUpdate = 0;
const unsigned long UPDATE_INTERVAL = 50; // 20 Hz

void setup() {
  Serial.begin(115200);
  
  // Initialize LED Matrix
  matrix.begin();
  
  // Show startup animation
  showStartupAnimation();
  
  // TODO: Initialize RouterBridge when we know the API
  // RouterBridge.begin();
  // RouterBridge.onMessage("indy/raceUpdate", handleRaceUpdate);
  
  Serial.println("Indy Sim LED Display Ready");
  Serial.println("Matrix: 12x8 pixels");
  Serial.println("Waiting for race data...");
  
  // For testing without RouterBridge, simulate data
  raceData.valid = true;
}

void loop() {
  // TODO: When RouterBridge is configured, it will call handleRaceUpdate()
  // For now, simulate race data for testing
  simulateRaceData();
  
  // Update display at fixed rate
  unsigned long now = millis();
  if (now - lastUpdate >= UPDATE_INTERVAL) {
    updateDisplay();
    lastUpdate = now;
  }
}

/**
 * Handle incoming race data (will be called by RouterBridge)
 * Expected format: {"car1_pos": 234, "car2_pos": 189}
 */
void handleRaceUpdate(/* parameters from RouterBridge */) {
  // TODO: Parse JSON when we know RouterBridge API
  // For now, this is a placeholder
  
  // Example parsing (adapt based on actual API):
  // raceData.car1_pos = json["car1_pos"];
  // raceData.car2_pos = json["car2_pos"];
  // raceData.valid = true;
  
  Serial.println("Race data received");
}

/**
 * Simulate race data for testing (remove when RouterBridge works)
 */
void simulateRaceData() {
  static uint16_t car1_pos = 0;
  static uint16_t car2_pos = 500;
  static unsigned long lastSim = 0;
  
  if (millis() - lastSim > 100) {
    // Cars moving at different speeds
    car1_pos = (car1_pos + 25) % TRACK_LENGTH;
    car2_pos = (car2_pos + 20) % TRACK_LENGTH;
    
    raceData.car1_pos = car1_pos;
    raceData.car2_pos = car2_pos;
    raceData.valid = true;
    
    lastSim = millis();
  }
}

/**
 * Map track position (meters) to pixel coordinate
 */
void mapPositionToPixel(uint16_t position, uint8_t &x, uint8_t &y) {
  // Map 0-5281m to track pixels (0-37)
  int trackIndex = (position * TRACK_SIZE) / TRACK_LENGTH;
  trackIndex = constrain(trackIndex, 0, TRACK_SIZE - 1);
  
  x = trackPixels[trackIndex].x;
  y = trackPixels[trackIndex].y;
}

/**
 * Clear the frame buffer
 */
void clearFrameBuffer() {
  memset(frameBuffer, 0, sizeof(frameBuffer));
}

/**
 * Set a pixel in the frame buffer
 */
void setPixel(uint8_t x, uint8_t y, bool on) {
  if (x < 13 && y < 8) {
    frameBuffer[y][x] = on ? 1 : 0;
  }
}

/**
 * Draw the track outline
 */
void drawTrack() {
  for (int i = 0; i < TRACK_SIZE; i++) {
    setPixel(trackPixels[i].x, trackPixels[i].y, true);
  }
}

/**
 * Update the LED display with current race state
 */
void updateDisplay() {
  if (!raceData.valid) {
    return;
  }
  
  // Clear buffer
  clearFrameBuffer();
  
  // Draw track outline
  drawTrack();
  
  // Get car positions
  uint8_t car1_x, car1_y;
  uint8_t car2_x, car2_y;
  mapPositionToPixel(raceData.car1_pos, car1_x, car1_y);
  mapPositionToPixel(raceData.car2_pos, car2_x, car2_y);
  
  // Draw cars (brighter - will be visible on track)
  // If cars overlap, that's OK - they'll be on same pixel
  setPixel(car1_x, car1_y, true);
  setPixel(car2_x, car2_y, true);
  
  // Add center indicator if cars overlap
  if (car1_x == car2_x && car1_y == car2_y) {
    // Mark center pixel to show both cars at same position
    setPixel(6, 4, true);
  }
  
  // Convert frame buffer to LED matrix format and display
  matrix.loadPixels(&frameBuffer[0][0], 8 * 13);
  
  // Debug output (limit frequency)
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 1000) {
    Serial.print("Car1: ");
    Serial.print(raceData.car1_pos);
    Serial.print("m (");
    Serial.print(car1_x);
    Serial.print(",");
    Serial.print(car1_y);
    Serial.print(") | Car2: ");
    Serial.print(raceData.car2_pos);
    Serial.print("m (");
    Serial.print(car2_x);
    Serial.print(",");
    Serial.print(car2_y);
    Serial.println(")");
    lastPrint = millis();
  }
}

/**
 * Show startup animation
 */
void showStartupAnimation() {
  // Quick race track reveal animation
  for (int i = 0; i < TRACK_SIZE; i++) {
    clearFrameBuffer();
    for (int j = 0; j <= i; j++) {
      setPixel(trackPixels[j].x, trackPixels[j].y, true);
    }
    matrix.loadPixels(&frameBuffer[0][0], 8 * 13);
    delay(20);
  }
  
  // Flash twice
  matrix.clear();
  delay(100);
  clearFrameBuffer();
  drawTrack();
  matrix.loadPixels(&frameBuffer[0][0], 8 * 13);
  delay(100);
  matrix.clear();
  delay(100);
  clearFrameBuffer();
  drawTrack();
  matrix.loadPixels(&frameBuffer[0][0], 8 * 13);
}

/**
 * Alternative: Simple progress bar display
 * Shows two horizontal bars for car progress
 */
void updateDisplayProgressBar() {
  clearFrameBuffer();
  
  // Car 1 - top 3 rows
  int car1_progress = map(raceData.car1_pos, 0, TRACK_LENGTH, 0, MATRIX_WIDTH);
  for (int i = 0; i < car1_progress; i++) {
    setPixel(i, 1, true);
  }
  setPixel(car1_progress, 1, true); // Car position
  
  // Car 2 - middle 3 rows
  int car2_progress = map(raceData.car2_pos, 0, TRACK_LENGTH, 0, MATRIX_WIDTH);
  for (int i = 0; i < car2_progress; i++) {
    setPixel(i, 4, true);
  }
  setPixel(car2_progress, 4, true); // Car position
  
  // Separator line
  for (int i = 0; i < MATRIX_WIDTH; i++) {
    setPixel(i, 3, i % 2 == 0);
  }
  
  matrix.loadPixels(&frameBuffer[0][0], 8 * 13);
}

