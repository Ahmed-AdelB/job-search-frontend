/**
 * SSE Manager - Server-Sent Events Connection Manager
 * Author: Ahmed Adel Bakr Alderai
 */

type MessageHandler = (data: unknown) => void;
type ErrorHandler = (error: Event) => void;

interface SSEConnection {
  eventSource: EventSource;
  reconnectAttempts: number;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
}

const connections = new Map<string, SSEConnection>();

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000;

/**
 * Connect to an SSE endpoint with auto-reconnect
 */
export function connectSSE(
  url: string,
  onMessage: MessageHandler,
  onError?: ErrorHandler
): void {
  // Disconnect existing connection if any
  disconnectSSE(url);

  const token = localStorage.getItem("auth-token");
  const fullUrl = new URL(url, window.location.origin);
  
  // Add token as query parameter if available
  if (token) {
    fullUrl.searchParams.set("token", token);
  }

  const eventSource = new EventSource(fullUrl.toString());
  
  const connection: SSEConnection = {
    eventSource,
    reconnectAttempts: 0,
    reconnectTimer: null,
  };
  
  connections.set(url, connection);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {
      // If not JSON, pass raw data
      onMessage(event.data);
    }
  };

  eventSource.onerror = (error) => {
    console.error(`SSE error for ${url}:`, error);
    
    if (onError) {
      onError(error);
    }

    // Attempt reconnection if not at max attempts
    if (connection.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, connection.reconnectAttempts);
      connection.reconnectAttempts++;
      
      console.log(`Reconnecting to ${url} in ${delay}ms (attempt ${connection.reconnectAttempts})`);
      
      connection.reconnectTimer = setTimeout(() => {
        connectSSE(url, onMessage, onError);
      }, delay);
    } else {
      console.error(`Max reconnect attempts reached for ${url}`);
    }
  };

  eventSource.onopen = () => {
    // Reset reconnect attempts on successful connection
    connection.reconnectAttempts = 0;
  };
}

/**
 * Disconnect from a specific SSE endpoint
 */
export function disconnectSSE(url: string): void {
  const connection = connections.get(url);
  if (connection) {
    if (connection.reconnectTimer) {
      clearTimeout(connection.reconnectTimer);
    }
    connection.eventSource.close();
    connections.delete(url);
  }
}

/**
 * Disconnect from all SSE endpoints
 */
export function disconnectAllSSE(): void {
  connections.forEach((connection, url) => {
    disconnectSSE(url);
  });
}

/**
 * Get active SSE connection count
 */
export function getActiveSSECount(): number {
  return connections.size;
}
