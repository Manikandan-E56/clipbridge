import express from "express";
import { getNetworkInfo } from "../utils/network.js";

const router = express.Router();

/**
 * GET /api/network/info
 * Returns local LAN IP addresses, URLs, and hostname for cross-device QR code generation.
 */
router.get("/info", (req, res) => {
  const serverPort = process.env.PORT || 5000;
  const clientPort = process.env.CLIENT_PORT || 5173;

  const info = getNetworkInfo(serverPort, clientPort);

  res.json({
    success: true,
    data: {
      ...info,
      uptimeSeconds: process.uptime(),
      memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
  });
});

export default router;
