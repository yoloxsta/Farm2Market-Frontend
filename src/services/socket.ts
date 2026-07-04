import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    if (this.socket?.connected) {
      return;
    }

    this.userId = userId;
    
    this.socket = io(SOCKET_URL, {
      auth: { userId },
      query: { userId },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      // Join user's personal room
      this.socket?.emit('join', `user:${userId}`);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Listen for new orders (for farmers)
  onNewOrder(callback: (order: any) => void) {
    this.socket?.on('order:new', callback);
  }

  // Listen for order status updates
  onOrderStatus(callback: (order: any) => void) {
    this.socket?.on('order:status', callback);
  }

  // Listen for order updates
  onOrderUpdate(callback: (order: any) => void) {
    this.socket?.on('order:updated', callback);
  }

  // Listen for notifications
  onNotification(callback: (notification: any) => void) {
    this.socket?.on('notification', callback);
  }

  // Remove all listeners
  removeAllListeners() {
    this.socket?.removeAllListeners('order:new');
    this.socket?.removeAllListeners('order:status');
    this.socket?.removeAllListeners('order:updated');
    this.socket?.removeAllListeners('notification');
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
