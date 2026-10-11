import { Server } from "socket.io";

let io = null;
const connectedDevices = new Map(); // socket.id -> device metadata

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "DELETE", "PATCH"],
    },
    maxHttpBufferSize: 50 * 1024 * 1024, // 50MB for socket messages
  });

  io.on("connection", (socket) => {
    const clientIp =
      socket.handshake.headers["x-forwarded-for"] ||
      socket.handshake.address ||
      "Unknown IP";

    const userAgent = socket.handshake.headers["user-agent"] || "";

    // Track initial connection
    const device = {
      socketId: socket.id,
      ip: clientIp,
      deviceName: "Connecting Device...",
      deviceType: detectDeviceType(userAgent),
      connectedAt: new Date(),
    };
    connectedDevices.set(socket.id, device);

    console.log(`[Socket.IO] Device connected: ${socket.id} (${clientIp})`);

    // Client sends their device registration (e.g. "MacBook Pro", "iPhone 15")
    socket.on("device:register", (data) => {
      if (connectedDevices.has(socket.id)) {
        const current = connectedDevices.get(socket.id);
        const updated = {
          ...current,
          deviceName: data?.deviceName || current.deviceName,
          deviceId: data?.deviceId || socket.id,
          deviceType: data?.deviceType || current.deviceType,
        };
        connectedDevices.set(socket.id, updated);
        broadcastDeviceList();
      }
    });

    // Send the current list of online devices to this socket
    socket.emit("device:list", Array.from(connectedDevices.values()));
    broadcastDeviceList();

    // Ephemeral clipboard sharing between active tabs / devices
    socket.on("clipboard:broadcast", (payload) => {
      socket.broadcast.emit("clipboard:receive", {
        ...payload,
        senderSocketId: socket.id,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.IO] Device disconnected: ${socket.id} (${reason})`);
      connectedDevices.delete(socket.id);
      broadcastDeviceList();
    });
  });

  return io;
}

function detectDeviceType(ua) {
  if (/mobile/i.test(ua)) return "smartphone";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  return "desktop";
}

function broadcastDeviceList() {
  if (io) {
    const list = Array.from(connectedDevices.values());
    io.emit("device:list", list);
  }
}

/**
 * Access the Socket.IO instance anywhere in backend.
 */
export function getIO() {
  return io;
}

/**
 * Helper to broadcast an item creation.
 */
export function emitItemCreated(item) {
  if (io) {
    io.emit("item:new", item);
  }
}

/**
 * Helper to broadcast an item deletion.
 */
export function emitItemDeleted(itemId) {
  if (io) {
    io.emit("item:deleted", { id: itemId });
  }
}
