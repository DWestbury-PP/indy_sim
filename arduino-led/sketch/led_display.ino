/**
 * Indy Sim LED Matrix Display
 * 
 * Receives race data from the Linux side via RouterBridge
 * and displays car positions on the LED matrix
 * 
 * NOTE: This is a PROTOTYPE - will need adjustment based on:
 * - Actual LED matrix size and type
 * - Available libraries on Arduino Q
 * - RouterBridge API specifics
 */

// PLACEHOLDER: Include appropriate libraries based on investigation
// #include <Arduino_RouterBridge.h>
// #include <Adafruit_NeoPixel.h>  // If using NeoPixels
// #include <FastLED.h>             // Alternative LED library
// #include <ArduinoGraphics.h>     // If using Arduino's graphics library

// Configuration - ADJUST BASED ON YOUR FINDINGS
#define LED_PIN 6           // GPIO pin for LED matrix (TBD from investigation)
#define NUM_LEDS 96         // 12x8 = 96 LEDs (typical, may vary)
#define MATRIX_WIDTH 12
#define MATRIX_HEIGHT 8
#define TRACK_LENGTH 5281   // meters (from simulation)

// Colors
#define COLOR_CAR1 0xFF0000  // Red
#define COLOR_CAR2 0x0000FF  // Blue
#define COLOR_TRACK 0x101010 // Dim white
#define COLOR_START 0x00FF00 // Green

// Track mapping (oval layout on LED matrix)
// Maps track position (0-5281m) to LED index (0-95)
const int TRACK_MAP_SIZE = 40;  // Number of LEDs representing the track
const uint8_t trackMap[TRACK_MAP_SIZE] = {
  // Define oval track on matrix (clockwise)
  // Row 0 (top): LEDs 0-11
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
  // Right side going down: LEDs 23, 35, 47, 59, 71, 83
  23, 35, 47, 59, 71, 83,
  // Bottom row (right to left): LEDs 95-84
  95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84,
  // Left side going up: LEDs 72, 60, 48, 36, 24, 12
  72, 60, 48, 36, 24, 12
  // Total: 40 LEDs forming oval
};

// Global variables
// PLACEHOLDER: Replace with actual LED library object
// Adafruit_NeoPixel pixels(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);
// CRGB leds[NUM_LEDS];

struct RaceData {
  uint16_t car1_pos;    // meters (0-5281)
  uint16_t car1_speed;  // km/h
  uint16_t car2_pos;    // meters
  uint16_t car2_speed;  // km/h
};

RaceData currentRace = {0, 0, 0, 0};

void setup() {
  Serial.begin(115200);
  
  // PLACEHOLDER: Initialize LED matrix
  // pixels.begin();
  // pixels.clear();
  // pixels.show();
  // OR
  // FastLED.addLeds<WS2812, LED_PIN, GRB>(leds, NUM_LEDS);
  // FastLED.clear();
  // FastLED.show();
  
  // PLACEHOLDER: Initialize RouterBridge communication
  // RouterBridge.begin();
  
  Serial.println("Indy Sim LED Display initialized");
  
  // Draw initial track
  drawTrack();
}

void loop() {
  // PLACEHOLDER: Check for data from Linux side
  // if (RouterBridge.available()) {
  //   String data = RouterBridge.readString();
  //   parseRaceData(data);
  // }
  
  // For testing without RouterBridge, simulate data
  simulateRaceData();
  
  // Update display
  updateDisplay();
  
  delay(50);  // 20 Hz update rate
}

/**
 * Parse incoming race data
 * Expected format: "car1_pos,car1_speed,car2_pos,car2_speed"
 * Example: "234,287,189,282"
 */
void parseRaceData(String data) {
  int comma1 = data.indexOf(',');
  int comma2 = data.indexOf(',', comma1 + 1);
  int comma3 = data.indexOf(',', comma2 + 1);
  
  if (comma1 > 0 && comma2 > comma1 && comma3 > comma2) {
    currentRace.car1_pos = data.substring(0, comma1).toInt();
    currentRace.car1_speed = data.substring(comma1 + 1, comma2).toInt();
    currentRace.car2_pos = data.substring(comma2 + 1, comma3).toInt();
    currentRace.car2_speed = data.substring(comma3 + 1).toInt();
    
    Serial.print("Received: C1@");
    Serial.print(currentRace.car1_pos);
    Serial.print("m C2@");
    Serial.print(currentRace.car2_pos);
    Serial.println("m");
  }
}

/**
 * Simulate race data for testing (remove when RouterBridge works)
 */
void simulateRaceData() {
  static unsigned long lastUpdate = 0;
  static uint16_t car1_pos = 0;
  static uint16_t car2_pos = 100;
  
  if (millis() - lastUpdate > 100) {
    car1_pos = (car1_pos + 20) % TRACK_LENGTH;
    car2_pos = (car2_pos + 18) % TRACK_LENGTH;
    
    currentRace.car1_pos = car1_pos;
    currentRace.car1_speed = 280;
    currentRace.car2_pos = car2_pos;
    currentRace.car2_speed = 275;
    
    lastUpdate = millis();
  }
}

/**
 * Map track position (meters) to LED index
 */
uint8_t mapPositionToLED(uint16_t position) {
  // Map 0-5281m to track LEDs (0-39)
  int trackIndex = (position * TRACK_MAP_SIZE) / TRACK_LENGTH;
  trackIndex = constrain(trackIndex, 0, TRACK_MAP_SIZE - 1);
  return trackMap[trackIndex];
}

/**
 * Draw the track outline
 */
void drawTrack() {
  // PLACEHOLDER: Clear all LEDs first
  // pixels.clear();
  // OR
  // FastLED.clear();
  
  // Draw track outline in dim color
  for (int i = 0; i < TRACK_MAP_SIZE; i++) {
    // PLACEHOLDER: Set LED color
    // pixels.setPixelColor(trackMap[i], COLOR_TRACK);
    // OR
    // leds[trackMap[i]] = CRGB(0x10, 0x10, 0x10);
  }
  
  // Mark start/finish line
  // pixels.setPixelColor(trackMap[0], COLOR_START);
  // OR
  // leds[trackMap[0]] = CRGB(0x00, 0xFF, 0x00);
}

/**
 * Update the display with current race state
 */
void updateDisplay() {
  // Draw track
  drawTrack();
  
  // Get LED positions for cars
  uint8_t car1_led = mapPositionToLED(currentRace.car1_pos);
  uint8_t car2_led = mapPositionToLED(currentRace.car2_pos);
  
  // Brightness based on speed (0-255)
  uint8_t car1_brightness = map(currentRace.car1_speed, 0, 350, 50, 255);
  uint8_t car2_brightness = map(currentRace.car2_speed, 0, 350, 50, 255);
  
  // PLACEHOLDER: Draw cars
  // pixels.setPixelColor(car1_led, pixels.Color(car1_brightness, 0, 0));
  // pixels.setPixelColor(car2_led, pixels.Color(0, 0, car2_brightness));
  // pixels.show();
  // OR
  // leds[car1_led] = CRGB(car1_brightness, 0, 0);
  // leds[car2_led] = CRGB(0, 0, car2_brightness);
  // FastLED.show();
  
  // Debug output
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 1000) {
    Serial.print("Car1: LED ");
    Serial.print(car1_led);
    Serial.print(" @ ");
    Serial.print(currentRace.car1_pos);
    Serial.print("m | Car2: LED ");
    Serial.print(car2_led);
    Serial.print(" @ ");
    Serial.print(currentRace.car2_pos);
    Serial.println("m");
    lastPrint = millis();
  }
}

/**
 * Alternative: Simple linear display (if oval is too complex)
 */
void updateDisplayLinear() {
  // Clear display
  // pixels.clear();
  
  // Show car 1 progress on top row (0-11)
  int car1_leds = map(currentRace.car1_pos, 0, TRACK_LENGTH, 0, MATRIX_WIDTH);
  for (int i = 0; i < car1_leds; i++) {
    // pixels.setPixelColor(i, COLOR_CAR1);
  }
  
  // Show car 2 progress on second row (12-23)
  int car2_leds = map(currentRace.car2_pos, 0, TRACK_LENGTH, 0, MATRIX_WIDTH);
  for (int i = 0; i < car2_leds; i++) {
    // pixels.setPixelColor(MATRIX_WIDTH + i, COLOR_CAR2);
  }
  
  // pixels.show();
}

