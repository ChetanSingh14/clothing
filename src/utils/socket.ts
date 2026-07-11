import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "./api";

let socket: Socket | null = null;
let isLoggingOut = false;

// Determine socket server URL dynamically based on API URL
const SOCKET_URL = API_URL.replace("/api/v1", "");

export const getSocket = (): Socket | null => {
  if (typeof window === "undefined") return null;

  const token = useAuthStore.getState().token;
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: false,       // CRITICAL: Disable auto-reconnection to prevent infinite loops on auth failure
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("⚡ Socket connected:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ Socket connection error:", err.message);
      // Auth failure — clean up socket instance but don't trigger logout loop
      if (err.message.includes("Authentication error")) {
        socket?.disconnect();
        socket = null;
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
    });

    socket.on("session_expired", (data) => {
      console.warn("🚨 Session expired via socket (logged in on another device):", data);
      
      // Guard against re-entrant logout calls
      if (isLoggingOut) return;
      isLoggingOut = true;

      // Clean up socket first before triggering logout
      socket?.removeAllListeners();
      socket?.disconnect();
      socket = null;

      // Clear state and redirect (without calling backend logout since session is already invalid)
      useAuthStore.getState().logout();
      isLoggingOut = false;
    });
  } else {
    // If token changed, update socket credentials and reconnect
    const currentSocketToken = socket.auth && (socket.auth as any).token;
    if (currentSocketToken !== token) {
      console.log("🔄 Socket token changed. Reconnecting with new token...");
      socket.auth = { token };
      socket.disconnect().connect();
    }
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting socket explicitly...");
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};
