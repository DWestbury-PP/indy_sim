#!/usr/bin/env node
/**
 * Test LED Sender - Standalone test for Arduino Q
 * 
 * This sends simulated race data to the microcontroller
 * to verify the communication works before integrating with the real backend
 */

import net from 'net';
import fs from 'fs';

const SOCKET_PATH = '/var/run/arduino-router.sock';
const METHOD = 'indy/raceUpdate';

console.log('='.repeat(60));
console.log('LED Sender Test - Indy Sim');
console.log('='.repeat(60));
console.log('');
console.log('Socket:', SOCKET_PATH);
console.log('Method:', METHOD);
console.log('');

// Check if socket exists
if (!fs.existsSync(SOCKET_PATH)) {
  console.error('❌ Socket not found:', SOCKET_PATH);
  console.error('   Is arduino-router running?');
  process.exit(1);
}

console.log('✓ Socket found');
console.log('');
console.log('Connecting...');

// Connect to socket
const client = net.connect(SOCKET_PATH);

let connected = false;
let messageId = 0;
let messagesSent = 0;

client.on('connect', () => {
  console.log('✓ Connected to arduino-router');
  console.log('');
  console.log('Starting race simulation...');
  console.log('(Cars moving around 5281m track)');
  console.log('');
  connected = true;
  
  // Start sending data
  startRaceSimulation();
});

client.on('data', (data) => {
  // Handle responses (optional)
  try {
    const response = JSON.parse(data.toString());
    if (response.error) {
      console.error('❌ RPC Error:', response.error);
    }
  } catch (e) {
    // Ignore parse errors
  }
});

client.on('error', (err) => {
  console.error('❌ Socket error:', err.message);
  process.exit(1);
});

client.on('close', () => {
  console.log('');
  console.log('Connection closed');
  console.log(`Sent ${messagesSent} messages`);
});

// Simulate race data
let car1_pos = 0;
let car2_pos = 500;

function startRaceSimulation() {
  setInterval(() => {
    if (!connected) return;
    
    // Update positions (different speeds)
    car1_pos = (car1_pos + 25) % 5281;  // ~287 km/h
    car2_pos = (car2_pos + 20) % 5281;  // ~275 km/h
    
    // Create JSON-RPC message
    const message = {
      jsonrpc: '2.0',
      method: METHOD,
      params: [car1_pos, car2_pos],
      id: ++messageId
    };
    
    // Send
    client.write(JSON.stringify(message) + '\n');
    messagesSent++;
    
    // Log occasionally
    if (messagesSent % 20 === 0) {
      console.log(`[${messagesSent}] Car1: ${car1_pos}m | Car2: ${car2_pos}m`);
    }
    
  }, 50); // 20 Hz
  
  // Stats every 5 seconds
  setInterval(() => {
    console.log('');
    console.log(`📊 Stats: ${messagesSent} messages sent (${(messagesSent/5).toFixed(1)}/sec)`);
  }, 5000);
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('');
  console.log('');
  console.log('Stopping...');
  client.end();
  setTimeout(() => process.exit(0), 100);
});

console.log('Press Ctrl+C to stop');
console.log('');

