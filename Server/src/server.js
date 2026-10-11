import http from "node:http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { initSocket } from "./socket/index.js";
import { UPLOAD_DIRECTORY } from "./middleware/upload.js";
import { getNetworkInfo } from "./utils/network.js";
import { AccessKey } from "./models/AccessKey.js";

// Routes
import itemsRouter from "./routes/items.js";
import historyRouter from "./routes/history.js";
import keysRouter from "./routes/keys.js";
import networkRouter from "./routes/network.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_PORT = Number(process.env.CLIENT_PORT) || 5173;

// Configure CORS for local LAN devices (any IP on Wi-Fi)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-key"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static uploaded files (with byte-range support for video/audio streaming)
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(UPLOAD_DIRECTORY)
);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "ClipBridge API is running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date(),
  });
});

// Mount modular API routes
app.use("/api/items", itemsRouter);
app.use("/api/history", historyRouter);
app.use("/api/keys", keysRouter);
app.use("/api/network", networkRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

// Central error handler
app.use((err, _req, res, _next) => {
  console.error("[ServerError]:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Create HTTP server & attach Socket.IO
const httpServer = http.createServer(app);
initSocket(httpServer);

/**
 * Bootstrap default access key if none exists
 */
async function bootstrapDefaultKey() {
  try {
    const count = await AccessKey.countDocuments();
    if (count === 0) {
      const defaultKey = await AccessKey.create({
        key: "CB-MASTER2026",
        name: "Primary Owner Key",
        role: "admin",
        permissions: {
          canViewHistory: true,
          canDownloadFiles: true,
          canUpload: true,
          canDelete: true,
          canManageKeys: true,
        },
      });
      console.log(`\n======================================================`);
      console.log(`[ClipBridge] Initial Access Key Created:`);
      console.log(`Key Code: ${defaultKey.key} (Role: admin)`);
      console.log(`Use this key in History or Admin settings`);
      console.log(`======================================================\n`);
    }
  } catch (err) {
    console.error("Failed to check or seed default key:", err.message);
  }
}

/**
 * Start the ClipBridge Server
 */
async function start() {
  try {
    await connectDB();
    await bootstrapDefaultKey();

    // Bind to 0.0.0.0 so all LAN devices can connect over Wi-Fi
    httpServer.listen(PORT, "0.0.0.0", () => {
      const network = getNetworkInfo(PORT, CLIENT_PORT);
      console.log("\n🚀 ===================================================");
      console.log(`   ClipBridge Server is LIVE on Local Network`);
      console.log(`   Local Address:   http://localhost:${PORT}`);
      console.log(`   Wi-Fi LAN IP:    ${network.serverUrl}`);
      console.log(`   Client Web App:  ${network.clientUrl}`);
      console.log(`   Upload Storage:  ${UPLOAD_DIRECTORY}`);
      console.log("===================================================\n");
    });
  } catch (error) {
    console.error("Could not start ClipBridge server:", error.message);
    process.exit(1);
  }
}

start();
