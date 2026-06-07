import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

let socketInstance: Socket | null = null;
const listeners = new Set<{ event: string; callback: (data: any) => void }>();

export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const localListenersRef = useRef<Set<{ event: string; callback: (data: any) => void }>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      return;
    }

    if (!socketInstance) {
      const socketUrl = import.meta.env.DEV ? "http://localhost:3001" : window.location.origin;
      socketInstance = io(socketUrl, {
        path: "/socket.io",
        transports: ["websocket"],
        autoConnect: true,
      });

      socketInstance.on("connect", () => {
        console.log("Socket connected:", socketInstance?.id);
        socketInstance?.emit("auth", {
          userId: user.id,
          username: user.name || user.username || "Player",
          avatar: user.avatar,
        });

        // Re-bind all active listeners on connection
        listeners.forEach(({ event, callback }) => {
          socketInstance?.on(event, callback);
        });
      });
    }

    return () => {
      // Cleanup this component's local listeners when it unmounts
      localListenersRef.current.forEach((listener) => {
        listeners.delete(listener);
        socketInstance?.off(listener.event, listener.callback);
      });
      localListenersRef.current.clear();
    };
  }, [isAuthenticated, user?.id]);

  const emit = useCallback((event: string, data: unknown) => {
    socketInstance?.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    const listener = { event, callback };
    listeners.add(listener);
    localListenersRef.current.add(listener);

    if (socketInstance) {
      socketInstance.on(event, callback);
    }

    return () => {
      listeners.delete(listener);
      localListenersRef.current.delete(listener);
      socketInstance?.off(event, callback);
    };
  }, []);

  return { socket: socketInstance, emit, on };
}
