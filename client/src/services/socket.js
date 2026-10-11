import { io } from "socket.io-client";

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    // When served or proxied via Vite, connect directly or to origin
    socketInstance = io(window.location.origin, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
}

export function registerDevice(deviceName, deviceId) {
  const socket = getSocket();
  socket.emit("device:register", {
    deviceName,
    deviceId,
    userAgent: navigator.userAgent,
  });
}
