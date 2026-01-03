import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook to manage WebSocket connection to the backend
 */
export const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [raceData, setRaceData] = useState(null);

  useEffect(() => {
    // Create socket connection
    const socketInstance = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // Listen for race updates
    socketInstance.on('raceUpdate', (data) => {
      setRaceData(data);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.close();
    };
  }, [url]);

  const sendPitStop = (carId) => {
    if (socket && isConnected) {
      console.log(`Requesting pit stop for ${carId}`);
      socket.emit('pitStop', { carId });
    }
  };

  return { socket, isConnected, raceData, sendPitStop };
};
