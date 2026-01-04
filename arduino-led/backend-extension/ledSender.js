/**
 * LED Sender for Arduino Q
 * 
 * Sends race data from the backend to the Arduino Q's microcontroller
 * via the arduino-router bridge
 * 
 * NOTE: This is a PROTOTYPE - will need adjustment based on investigation findings
 */

import { spawn } from 'child_process';
import fs from 'fs';

/**
 * LED Data Sender Class
 */
export class LEDSender {
  constructor(options = {}) {
    this.enabled = options.enabled || false;
    this.updateRate = options.updateRate || 20; // Hz (lower than main sim)
    this.method = options.method || 'auto'; // 'auto', 'router', 'serial', 'file'
    
    this.lastSendTime = 0;
    this.sendInterval = 1000 / this.updateRate;
    
    // Communication methods
    this.routerProcess = null;
    this.serialPath = null;
    this.filePath = '/tmp/indy_sim_led_data';
    
    // Stats
    this.stats = {
      sent: 0,
      errors: 0,
      lastError: null
    };
    
    if (this.enabled) {
      this.initialize();
    }
  }
  
  /**
   * Initialize communication with microcontroller
   */
  async initialize() {
    console.log('[LED Sender] Initializing...');
    
    try {
      if (this.method === 'auto') {
        // Try to detect best method
        this.method = await this.detectMethod();
      }
      
      switch (this.method) {
        case 'router':
          await this.initializeRouter();
          break;
        case 'serial':
          await this.initializeSerial();
          break;
        case 'file':
          await this.initializeFile();
          break;
        default:
          throw new Error(`Unknown method: ${this.method}`);
      }
      
      console.log(`[LED Sender] Initialized using method: ${this.method}`);
    } catch (error) {
      console.error('[LED Sender] Initialization failed:', error.message);
      this.enabled = false;
      this.stats.lastError = error.message;
    }
  }
  
  /**
   * Auto-detect best communication method
   */
  async detectMethod() {
    // Check for arduino-router
    if (fs.existsSync('/usr/bin/arduino-router') || 
        fs.existsSync('/usr/local/bin/arduino-router')) {
      return 'router';
    }
    
    // Check for serial device
    const serialDevices = [
      '/dev/ttyACM0',
      '/dev/ttyUSB0',
      '/dev/serial0'
    ];
    
    for (const device of serialDevices) {
      if (fs.existsSync(device)) {
        this.serialPath = device;
        return 'serial';
      }
    }
    
    // Fall back to file-based communication
    return 'file';
  }
  
  /**
   * Initialize arduino-router communication
   */
  async initializeRouter() {
    // TODO: Implement based on investigation findings
    // Likely involves sending data to a specific socket or using arduino-app-cli
    console.log('[LED Sender] Using arduino-router (method TBD from investigation)');
    
    // Placeholder: might use arduino-app-cli or direct socket communication
    // this.routerProcess = spawn('arduino-app-cli', ['send', '--target', 'mcu']);
  }
  
  /**
   * Initialize serial communication
   */
  async initializeSerial() {
    if (!this.serialPath) {
      throw new Error('No serial device found');
    }
    
    console.log(`[LED Sender] Using serial: ${this.serialPath}`);
    
    // Using simple fs.appendFile for now - could use serialport library for better control
    // const SerialPort = require('serialport');
    // this.serialPort = new SerialPort(this.serialPath, { baudRate: 115200 });
  }
  
  /**
   * Initialize file-based communication
   */
  async initializeFile() {
    console.log(`[LED Sender] Using file: ${this.filePath}`);
    
    // Create the file if it doesn't exist
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '', { mode: 0o666 });
    }
  }
  
  /**
   * Send race data to LED display
   * @param {Object} raceState - Current race state
   */
  sendData(raceState) {
    if (!this.enabled) {
      return;
    }
    
    const now = Date.now();
    if (now - this.lastSendTime < this.sendInterval) {
      return; // Rate limiting
    }
    
    try {
      // Format data for LED display (simplified)
      const ledData = this.formatData(raceState);
      
      // Send via appropriate method
      switch (this.method) {
        case 'router':
          this.sendViaRouter(ledData);
          break;
        case 'serial':
          this.sendViaSerial(ledData);
          break;
        case 'file':
          this.sendViaFile(ledData);
          break;
      }
      
      this.stats.sent++;
      this.lastSendTime = now;
      
    } catch (error) {
      this.stats.errors++;
      this.stats.lastError = error.message;
      console.error('[LED Sender] Error sending data:', error.message);
    }
  }
  
  /**
   * Format race data for LED display
   * Simplifies complex race state to just what we need
   */
  formatData(raceState) {
    if (!raceState.cars || raceState.cars.length < 2) {
      return null;
    }
    
    const car1 = raceState.cars[0];
    const car2 = raceState.cars[1];
    
    // CSV format: car1_pos,car1_speed,car2_pos,car2_speed
    const data = [
      Math.round(car1.track.trackPosition),
      Math.round(car1.speed),
      Math.round(car2.track.trackPosition),
      Math.round(car2.speed)
    ].join(',');
    
    return data + '\n';
  }
  
  /**
   * Send via arduino-router
   */
  sendViaRouter(data) {
    // TODO: Implement based on investigation
    // Placeholder implementations:
    
    // Option 1: If there's a CLI tool
    // spawn('arduino-app-cli', ['send-to-mcu', data]);
    
    // Option 2: If there's a socket/pipe
    // fs.appendFileSync('/run/arduino-router/data', data);
    
    // Option 3: If RouterBridge uses stdin/stdout
    // this.routerProcess.stdin.write(data);
    
    console.log('[LED Sender] Would send via router:', data.trim());
  }
  
  /**
   * Send via serial port
   */
  sendViaSerial(data) {
    if (this.serialPath) {
      // Simple file write (blocking, but fine for small data)
      fs.appendFileSync(this.serialPath, data);
      
      // Better: use serialport library
      // if (this.serialPort && this.serialPort.isOpen) {
      //   this.serialPort.write(data);
      // }
    }
  }
  
  /**
   * Send via shared file
   */
  sendViaFile(data) {
    fs.writeFileSync(this.filePath, data);
  }
  
  /**
   * Get sender statistics
   */
  getStats() {
    return {
      ...this.stats,
      enabled: this.enabled,
      method: this.method,
      updateRate: this.updateRate
    };
  }
  
  /**
   * Cleanup
   */
  close() {
    if (this.routerProcess) {
      this.routerProcess.kill();
    }
    
    if (this.serialPort) {
      this.serialPort.close();
    }
    
    console.log('[LED Sender] Closed');
  }
}

/**
 * Example usage:
 * 
 * import { LEDSender } from './ledSender.js';
 * 
 * const ledSender = new LEDSender({
 *   enabled: true,
 *   updateRate: 20,
 *   method: 'auto'
 * });
 * 
 * // In race simulation loop:
 * setInterval(() => {
 *   const raceState = simulation.getCurrentState();
 *   ledSender.sendData(raceState);
 * }, 1000/30);
 */

