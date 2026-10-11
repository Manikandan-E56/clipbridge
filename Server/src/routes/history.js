import express from "express";
import { SharedItem } from "../models/SharedItem.js";
import { AccessKey } from "../models/AccessKey.js";
import { requireHistoryAccess, extractKeyFromRequest } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/history/verify
 * Validates an access key and returns active permissions.
 */
router.post("/verify", async (req, res) => {
  try {
    const rawKey = req.body.key || extractKeyFromRequest(req);
    const masterKey = process.env.MASTER_KEY || "admin123";

    if (!rawKey) {
      return res.status(400).json({
        success: false,
        message: "No key provided",
        valid: false,
      });
    }

    if (rawKey.trim() === masterKey) {
      return res.json({
        success: true,
        valid: true,
        role: "admin",
        name: "Server Owner",
        permissions: {
          canViewHistory: true,
          canDownloadFiles: true,
          canUpload: true,
          canDelete: true,
          canManageKeys: true,
        },
      });
    }

    const keyDoc = await AccessKey.findOne({ key: rawKey.trim().toUpperCase() });

    if (!keyDoc || !keyDoc.isValid()) {
      return res.status(403).json({
        success: false,
        valid: false,
        message: keyDoc && !keyDoc.isValid() ? "Access key has expired or is deactivated." : "Invalid access key.",
      });
    }

    res.json({
      success: true,
      valid: true,
      role: keyDoc.role,
      name: keyDoc.name,
      permissions: keyDoc.permissions,
      expiresAt: keyDoc.expiresAt,
    });
  } catch (error) {
    console.error("Key verification error:", error);
    res.status(500).json({ success: false, message: "Verification failed." });
  }
});

/**
 * GET /api/history
 * Permission-gated historical search, filtering, and pagination.
 */
router.get("/", requireHistoryAccess, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      search,
      startDate,
      endDate,
      pinned,
    } = req.query;

    const query = {};

    // Filter by item type
    if (type && type !== "all") {
      query.type = type;
    }

    // Filter by text or filename search
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { content: regex },
        { "file.originalName": regex },
        { tags: regex },
      ];
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Filter by pinned state
    if (pinned !== undefined) {
      query.pinned = pinned === "true";
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      SharedItem.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SharedItem.countDocuments(query),
    ]);

    res.json({
      success: true,
      authorizedAs: req.accessKey?.name || "Authorized User",
      permissions: req.accessKey?.permissions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      data: items,
    });
  } catch (error) {
    console.error("History query error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve history" });
  }
});

/**
 * GET /api/history/stats
 * Aggregated statistics about stored historical content.
 */
router.get("/stats", requireHistoryAccess, async (_req, res) => {
  try {
    const [totalItems, typeCounts, storageStats] = await Promise.all([
      SharedItem.countDocuments(),
      SharedItem.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      SharedItem.aggregate([
        { $match: { "file.size": { $exists: true } } },
        { $group: { _id: null, totalBytes: { $sum: "$file.size" } } },
      ]),
    ]);

    const breakdown = {};
    for (const item of typeCounts) {
      breakdown[item._id] = item.count;
    }

    res.json({
      success: true,
      stats: {
        totalItems,
        breakdown,
        totalStorageBytes: storageStats[0]?.totalBytes || 0,
      },
    });
  } catch (error) {
    console.error("Stats query error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve stats" });
  }
});

export default router;
