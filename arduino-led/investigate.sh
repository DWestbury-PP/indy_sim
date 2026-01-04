#!/bin/bash
# Arduino Q Investigation Script
# Run this on your Arduino Q to gather information about LED matrix control

OUTPUT_FILE="arduino_q_findings.txt"

echo "=========================================="
echo "Arduino Q LED Matrix Investigation"
echo "=========================================="
echo ""
echo "Saving results to: $OUTPUT_FILE"
echo ""

# Start output file
cat > $OUTPUT_FILE << 'HEADER'
ARDUINO Q INVESTIGATION RESULTS
================================
Generated: $(date)

HEADER

# Function to run command and log
log_section() {
    local title="$1"
    local command="$2"
    
    echo ">>> $title" | tee -a $OUTPUT_FILE
    echo "Command: $command" >> $OUTPUT_FILE
    echo "----------------------------------------" >> $OUTPUT_FILE
    eval "$command" >> $OUTPUT_FILE 2>&1
    echo "" >> $OUTPUT_FILE
    echo "✓ $title"
}

# 1. Arduino Router
echo "Checking arduino-router..."
log_section "1.1 arduino-router location" "which arduino-router"
log_section "1.2 arduino-router service status" "systemctl status arduino-router --no-pager"
log_section "1.3 arduino-router processes" "ps aux | grep arduino-router | grep -v grep"

# 2. Arduino CLI
echo "Checking Arduino CLI..."
log_section "2.1 Arduino CLI location" "which arduino-cli"
log_section "2.2 Arduino CLI version" "arduino-cli version 2>&1"
log_section "2.3 App CLI location" "which arduino-app-cli"
log_section "2.4 App CLI help" "arduino-app-cli --help 2>&1"

# 3. Arduino Libraries
echo "Checking Arduino libraries..."
log_section "3.1 Installed libraries" "arduino-cli lib list 2>&1"
log_section "3.2 Installed cores" "arduino-cli core list 2>&1"
log_section "3.3 RouterBridge search" "find /usr /opt -name '*RouterBridge*' 2>/dev/null"
log_section "3.4 RPClite search" "find /usr /opt -name '*RPClite*' 2>/dev/null"

# 4. LED Devices
echo "Checking LED devices..."
log_section "4.1 LED class devices" "ls -la /sys/class/leds/ 2>&1"
log_section "4.2 GPIO devices" "ls -la /sys/class/gpio/ 2>&1"
log_section "4.3 I2C devices" "ls -la /dev/i2c* 2>&1"
log_section "4.4 SPI devices" "ls -la /dev/spi* 2>&1"

# 5. Kernel messages
echo "Checking kernel logs..."
log_section "5.1 LED kernel messages" "dmesg | grep -i led | tail -20"
log_section "5.2 Matrix kernel messages" "dmesg | grep -i matrix | tail -20"

# 6. Arduino directories
echo "Checking Arduino directories..."
log_section "6.1 Arduino directories in /usr" "find /usr -name '*arduino*' -type d 2>/dev/null | head -20"
log_section "6.2 Arduino directories in /opt" "find /opt -name '*arduino*' -type d 2>/dev/null"
log_section "6.3 Arduino directories in home" "find ~ -name '*arduino*' -type d 2>/dev/null"

# 7. Running processes
echo "Checking running processes..."
log_section "7.1 Sketch processes" "ps aux | grep sketch | grep -v grep"
log_section "7.2 App Lab processes" "ps aux | grep app-lab | grep -v grep"

# 8. Communication sockets
echo "Checking communication sockets..."
log_section "8.1 Sockets in /run" "ls -la /run/ | grep -i arduino"
log_section "8.2 Sockets in /var/run" "ls -la /var/run/ | grep -i arduino 2>&1"
log_section "8.3 Unix sockets" "netstat -x | grep arduino"

# 9. Serial devices
echo "Checking serial devices..."
log_section "9.1 TTY devices" "ls -la /dev/tty* | grep -i usb"
log_section "9.2 ACM devices" "ls -la /dev/ttyACM* 2>&1"

# 10. Board info
echo "Checking board info..."
log_section "10.1 Board list" "arduino-cli board list 2>&1"
log_section "10.2 Config" "arduino-cli config dump 2>&1"

# 11. Examples
echo "Checking examples..."
log_section "11.1 LED examples" "find / -path '*/examples/*LED*' -o -path '*/examples/*matrix*' 2>/dev/null | head -20"

echo ""
echo "=========================================="
echo "Investigation Complete!"
echo "=========================================="
echo ""
echo "Results saved to: $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "1. Review the findings in $OUTPUT_FILE"
echo "2. Look for:"
echo "   - arduino-router status (should be running)"
echo "   - Arduino CLI availability"
echo "   - LED device paths"
echo "   - RouterBridge library location"
echo "3. Share the findings so we can create the implementation"
echo ""

