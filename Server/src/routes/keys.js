import express from "express";
import crypto from "node:crypto";
import { AccessKey } from "../models/AccessKey.js";
import { requireAdminAccess } from "../middleware/auth.js";

const router = express.Router();

// Helper to generate a clean, human-readable key code (e.g., CB-7K9P2X4M)
function generateKeyCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // readable chars without ambiguous 0/O, 1/I
  let result = "CB-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return result;
}

/**
 * GET /api/keys
 * List all issued keys (admin only).
 */
router.get("/", requireAdminAccess, async (_req, res) => {
  try {
    const keys = await AccessKey.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: keys.length, data: keys });
  } catch (error) {
    console.error("Error fetching keys:", error);
    res.status(500).json({ success: false, message: "Failed to fetch keys" });
  }
});

/**
 * POST /api/keys
 * Create a new access key with specific permissions.
 */
router.post("/", requireAdminAccess, async (req, res) => {
  try {
    const {
      name,
      customKey,
      role = "viewer",
      permissions = {},
      expiresInDays,
    } = req.body;

    const finalKey = (customKey ? customKey.trim() : generateKeyCode()).toUpperCase();

    // Check collision
    const existing = await AccessKey.findOne({ key: finalKey });
    if (existing) {
      return res.status(409).json({ success: false, message: "A key with this code already exists" });
    }

    let expiresAt = null;
    if (expiresInDays && Number(expiresInDays) > 0) {
      expiresAt = new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000);
    }

    const newKey = await AccessKey.create({
      key: finalKey,
      name: name?.trim() || "Shared Device Key",
      role,
      permissions: {
        canViewHistory: permissions.canViewHistory ?? true,
        canDownloadFiles: permissions.canDownloadFiles ?? true,
        canUpload: permissions.canUpload ?? true,
        canDelete: permissions.canDelete ?? false,
        canManageKeys: permissions.canManageKeys ?? (role === "admin"),
      },
      expiresAt,
    });

    res.status(201).json({ success: true, data: newKey });
  } catch (error) {
    console.error("Error creating access key:", error);
    res.status(500).json({ success: false, message: "Failed to generate key" });
  }
});

/**
 * PATCH /api/keys/:id
 * Toggle activation status or modify permissions.
 */
router.patch("/:id", requireAdminAccess, async (req, res) => {
  try {
    const { isActive, permissions, name, expiresAt } = req.body;

    const keyDoc = await AccessKey.findById(req.params.id);
    if (!keyDoc) {
      return res.status(404).json({ success: false, message: "Key not found" });
    }

    if (typeof isActive === "boolean") keyDoc.isActive = isActive;
    if (name) keyDoc.name = name.trim();
    if (expiresAt !== undefined) keyDoc.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (permissions) {
      keyDoc.permissions = {
        ...keyDoc.permissions.toObject(),
        ...permissions,
      };
    }

    await keyDoc.save();
    res.json({ success: true, data: keyDoc });
  } catch (error) {
    console.error("Error updating key:", error);
    res.status(500).json({ success: false, message: "Failed to update key" });
  }
});

/**
 * DELETE /api/keys/:id
 * Permanently revoke/delete an access key.
 */
router.delete("/:id", requireAdminAccess, async (req, res) => {
  try {
    const deleted = await AccessKey.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Key not found" });
    }

    res.json({ success: true, message: "Key revoked successfully" });
  } catch (error) {
    console.error("Error deleting key:", error);
    res.status(500).json({ success: false, message: "Failed to delete key" });
  }
});

export default router;
