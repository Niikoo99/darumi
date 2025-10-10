// Socket.IO service for real-time notifications
import { io } from 'socket.io-client';
import { getBaseUrl } from '../config/api';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Connect to Socket.IO server
  connect(userId) {
    if (this.socket && this.isConnected) {
      console.log('🔌 Socket already connected');
      return;
    }

    try {
      const socketUrl = getBaseUrl();
      console.log('🔌 Connecting to Socket.IO:', socketUrl);
      
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      // Connection event handlers
      this.socket.on('connect', () => {
        console.log('✅ Socket.IO connected:', this.socket.id);
        this.isConnected = true;
        
        // Join user-specific room for personalized notifications
        this.socket.emit('join_user_room', userId);
        console.log('👤 Joined user room:', userId);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket.IO disconnected:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error);
        this.isConnected = false;
      });

      // Objective completion notification
      this.socket.on('objective_completed', (data) => {
        console.log('🎉 Objective completed notification:', data);
        this.emitToListeners('objective_completed', data);
      });

      // Objective failed notification
      this.socket.on('objective_failed', (data) => {
        console.log('😞 Objective failed notification:', data);
        this.emitToListeners('objective_failed', data);
      });

    } catch (error) {
      console.error('❌ Error initializing Socket.IO:', error);
    }
  }

  // Disconnect from Socket.IO server
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting Socket.IO');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Add event listener
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listener
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit to all listeners for an event
  emitToListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
    };
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
