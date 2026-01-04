#!/bin/bash
# Get API details from Arduino Q libraries and examples

OUTPUT="api_details.txt"

echo "======================================"
echo "Arduino Q LED Matrix API Details"
echo "======================================"
echo ""

cat > $OUTPUT << 'HEADER'
ARDUINO Q LED MATRIX - API DETAILS
===================================
Generated: $(date)

HEADER

# LED Matrix header
echo ">>> Arduino_LED_Matrix.h" | tee -a $OUTPUT
echo "----------------------------------------" >> $OUTPUT
cat ~/.arduino15/packages/arduino/hardware/zephyr/0.52.0/libraries/Arduino_LED_Matrix/src/Arduino_LED_Matrix.h >> $OUTPUT 2>&1
echo "" >> $OUTPUT
echo "" >> $OUTPUT

# RouterBridge header
echo ">>> Arduino_RouterBridge.h" | tee -a $OUTPUT
echo "----------------------------------------" >> $OUTPUT
cat ~/.arduino15/packages/arduino/hardware/zephyr/0.52.0/libraries/Arduino_RouterBridge/src/Arduino_RouterBridge.h >> $OUTPUT 2>&1
echo "" >> $OUTPUT
echo "" >> $OUTPUT

# Example sketch - led-matrix-painter
echo ">>> led-matrix-painter sketch.ino" | tee -a $OUTPUT
echo "----------------------------------------" >> $OUTPUT
cat ~/.local/share/arduino-app-cli/examples/led-matrix-painter/sketch.ino >> $OUTPUT 2>&1
echo "" >> $OUTPUT
echo "" >> $OUTPUT

# Example project structure
echo ">>> led-matrix-painter project structure" | tee -a $OUTPUT
echo "----------------------------------------" >> $OUTPUT
ls -laR ~/.local/share/arduino-app-cli/examples/led-matrix-painter/ >> $OUTPUT 2>&1
echo "" >> $OUTPUT
echo "" >> $OUTPUT

# Check for other LED examples
echo ">>> Other LED examples" | tee -a $OUTPUT
echo "----------------------------------------" >> $OUTPUT
find ~/.arduino15/packages/arduino/hardware/zephyr/0.52.0/libraries/Arduino_LED_Matrix -name "*.ino" -o -name "examples" -type d >> $OUTPUT 2>&1
echo "" >> $OUTPUT

# Look for example sketches in the library
echo ">>> LED Matrix library examples" | tee -a $OUTPUT
echo "----------------------------------------" >> $OUTPUT
ls -laR ~/.arduino15/packages/arduino/hardware/zephyr/0.52.0/libraries/Arduino_LED_Matrix/examples/ >> $OUTPUT 2>&1
echo "" >> $OUTPUT

echo ""
echo "======================================"
echo "Complete! Results in: $OUTPUT"
echo "======================================"
echo ""
echo "Now share this file so we can create the sketch!"

