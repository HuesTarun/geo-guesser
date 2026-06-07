import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

interface SocketListener {
  event: string;
  callback: (data: any) => void;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user, isAuthenticated } = useAuth();
  const listenersRef = useRef<SocketListener[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socketUrl = import.meta.env.DEV ? "http://localhost:3001" : window.location.origin;
    const socket = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      socket.emit("auth", {
        userId: user.id,
        username: user.name || user.username || "Player",
        avatar: user.avatar,
      });

      // Bind all registered listeners on connection
      listenersRef.current.forEach(({ event, callback }) => {
        socket.on(event, callback);
      });
    });

    socketRef.current = socket;

    return () => {
      // Unbind all registered listeners
      listenersRef.current.forEach(({ event, callback }) => {
        socket.off(event, callback);
      });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?.id]);

  const emit = useCallback((event: string, data: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    const listener = { event, callback };
    listenersRef.current.push(listener);

    // If socket is already active and connected, bind immediately
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }

    // Return an unsubscribe cleanup function
    return () => {
      listenersRef.current = listenersRef.current.filter((l) => l !== listener);
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  }, []);

  return { socket: socketRef.current, emit, on };
}
