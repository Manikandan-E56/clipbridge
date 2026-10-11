import { AccessKey } from "../models/AccessKey.js";

/**
 * Extract key from headers (x-access-key or Authorization) or query parameter.
 */
export function extractKeyFromRequest(req) {
  const headerKey = req.headers["x-access-key"];
  if (headerKey) return String(headerKey).trim();

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  if (req.query && req.query.accessKey) {
    return String(req.query.accessKey).trim();
  }

  return null;
}

/**
 * Middleware: Verifies access key for historical archive and data access.
 */
export async function requireHistoryAccess(req, res, next) {
  try {
    const rawKey = extractKeyFromRequest(req);
    const masterKey = process.env.MASTER_KEY || "admin123";

    if (!rawKey) {
      return res.status(401).json({
        success: false,
        message: "Historical access requires an Access Key. Please provide a valid key.",
        code: "KEY_REQUIRED",
      });
    }

    // Check master server owner key
    if (rawKey === masterKey) {
      req.accessKey = {
        key: masterKey,
        name: "Server Owner (Master Key)",
        role: "admin",
        permissions: {
          canViewHistory: true,
          canDownloadFiles: true,
          canUpload: true,
          canDelete: true,
          canManageKeys: true,
        },
      };
      return next();
    }

    // Check against database access keys
    const keyDoc = await AccessKey.findOne({ key: rawKey.toUpperCase() });

    if (!keyDoc) {
      return res.status(403).json({
        success: false,
        message: "Invalid access key.",
        code: "INVALID_KEY",
      });
    }

    if (!keyDoc.isValid()) {
      return res.status(403).json({
        success: false,
        message: "This access key has expired or been deactivated by the server owner.",
        code: "EXPIRED_KEY",
      });
    }

    if (!keyDoc.permissions.canViewHistory) {
      return res.status(403).json({
        success: false,
        message: "This key does not possess permissions to view historical items.",
        code: "PERMISSION_DENIED",
      });
    }

    // Update usage statistics asynchronously
    keyDoc.usageCount += 1;
    keyDoc.lastUsedAt = new Date();
    await keyDoc.save().catch((err) => console.error("Failed to update key usage stats:", err));

    req.accessKey = keyDoc;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ success: false, message: "Authorization verification failed." });
  }
}

/**
 * Middleware: Requires admin privileges (master key or key with canManageKeys).
 */
export async function requireAdminAccess(req, res, next) {
  try {
    const rawKey = extractKeyFromRequest(req);
    const masterKey = process.env.MASTER_KEY || "admin123";

    if (!rawKey) {
      return res.status(401).json({
        success: false,
        message: "Admin operations require a Server Owner key.",
        code: "KEY_REQUIRED",
      });
    }

    if (rawKey === masterKey) {
      req.accessKey = {
        name: "Server Owner (Master Key)",
        role: "admin",
        permissions: { canManageKeys: true, canDelete: true },
      };
      return next();
    }

    const keyDoc = await AccessKey.findOne({ key: rawKey.toUpperCase() });
    if (!keyDoc || !keyDoc.isValid() || !keyDoc.permissions.canManageKeys) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Server owner or key management permission required.",
        code: "ADMIN_REQUIRED",
      });
    }

    req.accessKey = keyDoc;
    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(500).json({ success: false, message: "Server error during authorization." });
  }
}

/**
 * Middleware: Inspects key if present without blocking unauthorized users (for public LAN endpoints).
 */
export async function optionalAccessKey(req, _res, next) {
  try {
    const rawKey = extractKeyFromRequest(req);
    const masterKey = process.env.MASTER_KEY || "admin123";

    if (!rawKey) {
      req.accessKey = null;
      return next();
    }

    if (rawKey === masterKey) {
      req.accessKey = {
        key: masterKey,
        name: "Server Owner",
        role: "admin",
        permissions: {
          canViewHistory: true,
          canDownloadFiles: true,
          canUpload: true,
          canDelete: true,
          canManageKeys: true,
        },
      };
      return next();
    }

    const keyDoc = await AccessKey.findOne({ key: rawKey.toUpperCase() });
    if (keyDoc && keyDoc.isValid()) {
      req.accessKey = keyDoc;
    } else {
      req.accessKey = null;
    }
    next();
  } catch {
    req.accessKey = null;
    next();
  }
}
