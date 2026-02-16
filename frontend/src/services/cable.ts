// frontend/src/services/cable.ts
type MessageHandler = (data: Record<string, unknown>) => void;

interface Subscription {
  channel: string;
  params: Record<string, unknown>;
  onMessage: MessageHandler;
}

class CableService {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private url: string;

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    this.url = `${baseUrl}/cable`;
  }

  connect(): void {
    if (typeof window === 'undefined') return;
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    this.ws = new WebSocket(`${this.url}?token=${token}`);

    this.ws.onopen = () => {
      this.reconnectDelay = 1000;
      this.subscriptions.forEach((sub, id) => {
        this.sendSubscribe(id, sub);
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ping' || data.type === 'confirm_subscription') return;
        if (data.identifier) {
          const parsed = JSON.parse(data.identifier);
          const key = this.subscriptionKey(parsed.channel, parsed);
          const sub = this.subscriptions.get(key);
          if (sub && data.message) {
            sub.onMessage(data.message);
          }
        }
      } catch {
        // ignore parse errors
      }
    };

    this.ws.onclose = () => {
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  subscribe(
    channel: string,
    params: Record<string, unknown>,
    onMessage: MessageHandler,
  ): () => void {
    const key = this.subscriptionKey(channel, params);
    const sub: Subscription = { channel, params, onMessage };
    this.subscriptions.set(key, sub);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(key, sub);
    }

    return () => {
      this.subscriptions.delete(key);
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendUnsubscribe(key, sub);
      }
    };
  }

  private sendSubscribe(key: string, sub: Subscription): void {
    const identifier = JSON.stringify({ channel: sub.channel, ...sub.params });
    this.ws?.send(JSON.stringify({ command: 'subscribe', identifier }));
  }

  private sendUnsubscribe(_key: string, sub: Subscription): void {
    const identifier = JSON.stringify({ channel: sub.channel, ...sub.params });
    this.ws?.send(JSON.stringify({ command: 'unsubscribe', identifier }));
  }

  private subscriptionKey(channel: string, params: Record<string, unknown>): string {
    return JSON.stringify({ channel, ...params });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      this.connect();
    }, this.reconnectDelay);
  }
}

export const cable = new CableService();
