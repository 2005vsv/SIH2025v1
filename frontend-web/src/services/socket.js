import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(userId, token) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(API_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');

      // Join user room
      if (userId) {
        this.socket.emit('join', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Handle real-time notifications
    this.socket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      this.emit('notification', notification);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  // Send message to server
  send(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot send message');
    }
  }

  // Get connection status
  get isConnected() {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;