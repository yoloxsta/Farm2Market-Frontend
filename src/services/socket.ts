import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

type EventCallback = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnecting: boolean = false;

  connect(userId: string) {
    // If already connected with same user, just re-register event handlers
    if (this.socket?.connected && this.userId === userId) {
      console.log('Socket already connected, re-registering handlers');
      this.registerEventHandlers();
      return;
    }

    // If connecting with different user, disconnect first
    if (this.socket && this.userId !== userId) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Prevent multiple connection attempts
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.userId = userId;
    
    console.log('Connecting socket for user:', userId);
    
    this.socket = io(SOCKET_URL, {
      auth: { userId },
      query: { userId },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnecting = false;
      // Join user's personal room
      this.socket?.emit('join', `user:${userId}`);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnecting = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnecting = false;
    });

    // Register event handlers
    this.registerEventHandlers();
  }

  private registerEventHandlers() {
    if (!this.socket) return;
    
    // Remove old handlers first to avoid duplicates
    this.socket.off('order:new');
    this.socket.off('order:status');
    this.socket.off('order:updated');
    this.socket.off('notification');
    
    // Set up event forwarding
    this.socket.on('order:new', (data) => {
      console.log('Received order:new event:', data);
      this.forwardEvent('order:new', data);
    });
    this.socket.on('order:status', (data) => {
      console.log('Received order:status event:', data);
      this.forwardEvent('order:status', data);
    });
    this.socket.on('order:updated', (data) => {
      console.log('Received order:updated event:', data);
      this.forwardEvent('order:updated', data);
    });
    this.socket.on('notification', (data) => {
      console.log('Received notification event:', data);
      this.forwardEvent('notification', data);
    });
  }

  private forwardEvent(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    console.log(`Forwarding ${event} to ${callbacks?.size || 0} listeners`);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.isConnecting = false;
  }

  // Listen for new orders (for farmers)
  onNewOrder(callback: EventCallback) {
    this.addListener('order:new', callback);
  }

  // Listen for order status updates
  onOrderStatus(callback: EventCallback) {
    this.addListener('order:status', callback);
  }

  // Listen for order updates
  onOrderUpdate(callback: EventCallback) {
    this.addListener('order:updated', callback);
  }

  // Listen for notifications
  onNotification(callback: EventCallback) {
    this.addListener('notification', callback);
  }

  // Add listener
  private addListener(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    console.log(`Added listener for ${event}, total: ${this.listeners.get(event)!.size}`);
  }

  // Remove specific listener
  removeListener(event: string, callback: EventCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  // Remove all listeners for a specific event
  removeEventListeners(event: string) {
    this.listeners.delete(event);
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
