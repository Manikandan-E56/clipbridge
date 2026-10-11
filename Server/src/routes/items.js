import express from "express";
import fs from "node:fs";
import path from "node:path";
import { SharedItem } from "../models/SharedItem.js";
import { upload, detectFileType, UPLOAD_DIRECTORY } from "../middleware/upload.js";
import { emitItemCreated, emitItemDeleted } from "../socket/index.js";
import { optionalAccessKey } from "../middleware/auth.js";

const router = express.Router();

// Helper to determine if content is a web link
function isUrl(text) {
  if (!text || typeof text !== "string") return false;
  try {
    const url = new URL(text.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * GET /api/items/recent
 * Get recent shared items for the live workspace feed.
 */
router.get("/recent", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const items = await SharedItem.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error("Error fetching recent items:", error);
    res.status(500).json({ success: false, message: "Failed to fetch items" });
  }
});

/**
 * POST /api/items/text
 * Share a text snippet, note, or URL.
 */
router.post("/text", optionalAccessKey, async (req, res) => {
  try {
    const { text, deviceName, deviceId, tags } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ success: false, message: "Text content is required" });
    }

    const trimmed = text.trim();
    const type = isUrl(trimmed) ? "link" : "text";

    const newItem = await SharedItem.create({
      type,
      content: trimmed,
      sender: {
        deviceId: deviceId || "anonymous",
        deviceName: deviceName || "Local Device",
        ip: req.ip || req.socket.remoteAddress || "",
        userAgent: req.headers["user-agent"] || "",
      },
      tags: Array.isArray(tags) ? tags : [],
    });

    emitItemCreated(newItem);

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error("Error sharing text/link:", error);
    res.status(500).json({ success: false, message: "Failed to share item" });
  }
});

/**
 * POST /api/items/upload
 * Upload one or multiple files (photos, videos, documents, files).
 */
router.post(
  "/upload",
  optionalAccessKey,
  upload.array("files", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
      }

      const deviceName = req.body.deviceName || "Local Device";
      const deviceId = req.body.deviceId || "anonymous";
      const userIp = req.ip || req.socket.remoteAddress || "";
      const userAgent = req.headers["user-agent"] || "";

      const createdItems = [];

      for (const file of req.files) {
        const itemType = detectFileType(file.mimetype);

        const newItem = await SharedItem.create({
          type: itemType,
          content: file.originalname,
          file: {
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            relativePath: `uploads/${file.filename}`,
            downloadUrl: `/api/items/download/${file.filename}`,
          },
          sender: {
            deviceId,
            deviceName,
            ip: userIp,
            userAgent,
          },
        });

        emitItemCreated(newItem);
        createdItems.push(newItem);
      }

      res.status(201).json({
        success: true,
        count: createdItems.length,
        data: createdItems,
      });
    } catch (error) {
      console.error("Error handling file upload:", error);
      res.status(500).json({ success: false, message: "File upload failed" });
    }
  }
);

/**
 * GET /api/items/download/:filename
 * Download an uploaded file.
 */
router.get("/download/:filename", (req, res) => {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);
  const filePath = path.join(UPLOAD_DIRECTORY, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "File not found on disk" });
  }

  res.download(filePath, (err) => {
    if (err && !res.headersSent) {
      console.error("Error sending file:", err);
      res.status(500).json({ success: false, message: "Download failed" });
    }
  });
});

/**
 * DELETE /api/items/:id
 * Remove a shared item and its disk file.
 */
router.delete("/:id", optionalAccessKey, async (req, res) => {
  try {
    const item = await SharedItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // If item has a disk file, clean it up
    if (item.file?.filename) {
      const diskPath = path.join(UPLOAD_DIRECTORY, item.file.filename);
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (unlinkErr) {
          console.warn("Failed to delete file from disk:", unlinkErr.message);
        }
      }
    }

    await SharedItem.findByIdAndDelete(req.params.id);
    emitItemDeleted(req.params.id);

    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ success: false, message: "Failed to delete item" });
  }
});

export default router;
