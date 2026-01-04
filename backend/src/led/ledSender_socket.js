/**
 * LED Sender for Arduino Q - Unix Socket Version
 * 
 * Sends race data to arduino-router via Unix domain socket
 * Socket: /var/run/arduino-router.sock
 * Protocol: JSON-RPC 2.0
 */

import net from 'net';
import fs from 'fs';

const SOCKET_PATH = '/var/run/arduino-router.sock';
const RPC_METHOD = 'indy/raceUpdate';

export class LEDSenderSocket {
  constructor(options = {}) {
    this.enabled = options.enabled !== undefined ? options.enabled : true;
    this.updateRate = options.updateRate || 20; // Hz
    this.socketPath = options.socketPath || SOCKET_PATH;
    this.method = options.method || RPC_METHOD;
    
    this.client = null;
    this.connected = false;
    this.reconnecting = false;
    this.messageId = 0;
    
    this.lastSendTime = 0;
    this.sendInterval = 1000 / this.updateRate;
    
    this.stats = {
      sent: 0,
      errors: 0,
      lastError: null,
      connected: false
    };
    
    if (this.enabled) {
      this.connect();
    }
  }
  
  /**
   * Connect to arduino-router Unix socket
   */
  connect() {
    if (this.connected || this.reconnecting) {
      return;
    }
    
    // Check if socket exists
    if (!fs.existsSync(this.socketPath)) {
      console.error(`[LED Sender] Socket not found: ${this.socketPath}`);
      this.stats.lastError = 'Socket not found';
      this.enabled = false;
      return;
    }
    
    this.reconnecting = true;
    console.log(`[LED Sender] Connecting to ${this.socketPath}...`);
    
    try {
      this.client = net.connect(this.socketPath);
      
      this.client.on('connect', () => {
        console.log('[LED Sender] Connected to arduino-router');
        this.connected = true;
        this.reconnecting = false;
        this.stats.connected = true;
      });
      
      this.client.on('data', (data) => {
        // Handle responses if needed
        try {
          const response = JSON.parse(data.toString());
          if (response.error) {
            console.error('[LED Sender] RPC Error:', response.error);
            this.stats.errors++;
            this.stats.lastError = response.error.message;
          }
        } catch (e) {
          // Ignore parse errors for now
        }
      });
      
      this.client.on('error', (err) => {
        console.error('[LED Sender] Socket error:', err.message);
        this.stats.errors++;
        this.stats.lastError = err.message;
        this.connected = false;
        this.stats.connected = false;
      });
      
      this.client.on('close', () => {
        console.log('[LED Sender] Connection closed');
        this.connected = false;
        this.stats.connected = false;
        this.reconnecting = false;
        
        // Try to reconnect after delay
        if (this.enabled) {
          setTimeout(() => this.connect(), 5000);
        }
      });
      
    } catch (error) {
      console.error('[LED Sender] Connection failed:', error.message);
      this.stats.lastError = error.message;
      this.reconnecting = false;
    }
  }
  
  /**
   * Send race data to LED display
   * @param {Object} raceState - Current race state from simulation
   */
  sendData(raceState) {
    if (!this.enabled || !this.connected) {
      return;
    }
    
    const now = Date.now();
    if (now - this.lastSendTime < this.sendInterval) {
      return; // Rate limiting
    }
    
    try {
      // Extract car positions
      if (!raceState.cars || raceState.cars.length < 2) {
        return;
      }
      
      const car1 = raceState.cars[0];
      const car2 = raceState.cars[1];
      
      // Create JSON-RPC message
      // Parameters must be an array to match sketch signature: handleRaceUpdate(uint16_t, uint16_t)
      const message = {
        jsonrpc: '2.0',
        method: this.method,
        params: [
          Math.round(car1.position),
          Math.round(car2.position)
        ],
        id: ++this.messageId
      };
      
      // Send to socket
      const messageStr = JSON.stringify(message) + '\n';
      this.client.write(messageStr);
      
      this.stats.sent++;
      this.lastSendTime = now;
      
      // Debug log (occasional)
      if (this.stats.sent % 100 === 0) {
        console.log(`[LED Sender] Sent ${this.stats.sent} messages. Car1: ${message.params.car1_pos}m, Car2: ${message.params.car2_pos}m`);
      }
      
    } catch (error) {
      this.stats.errors++;
      this.stats.lastError = error.message;
      console.error('[LED Sender] Send error:', error.message);
    }
  }
  
  /**
   * Get sender statistics
   */
  getStats() {
    return {
      ...this.stats,
      enabled: this.enabled,
      method: this.method,
      updateRate: this.updateRate,
      socketPath: this.socketPath
    };
  }
  
  /**
   * Close connection
   */
  close() {
    this.enabled = false;
    if (this.client) {
      this.client.end();
      this.client = null;
    }
    this.connected = false;
    console.log('[LED Sender] Closed');
  }
}

/**
 * Test function - run standalone
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('LED Sender Test Mode');
  
  const sender = new LEDSenderSocket({
    enabled: true,
    updateRate: 10
  });
  
  // Simulate race data
  let car1_pos = 0;
  let car2_pos = 500;
  
  setInterval(() => {
    car1_pos = (car1_pos + 25) % 5281;
    car2_pos = (car2_pos + 20) % 5281;
    
    const fakeRaceState = {
      cars: [
        { track: { trackPosition: car1_pos } },
        { track: { trackPosition: car2_pos } }
      ]
    };
    
    sender.sendData(fakeRaceState);
  }, 100);
  
  // Stats every 5 seconds
  setInterval(() => {
    console.log('Stats:', sender.getStats());
  }, 5000);
}

