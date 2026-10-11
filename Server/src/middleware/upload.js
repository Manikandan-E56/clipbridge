import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload storage directory
export const UPLOAD_DIRECTORY = path.resolve(
  __dirname,
  "../../",
  process.env.UPLOAD_DIR || "uploads"
);

// Ensure the directory exists
if (!fs.existsSync(UPLOAD_DIRECTORY)) {
  fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIRECTORY);
  },
  filename: (_req, file, cb) => {
    // Generate unique file prefix while keeping original extension
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// Detect high-level item type based on MIME
export function detectFileType(mimetype) {
  if (!mimetype) return "other";
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";
  if (
    mimetype.includes("pdf") ||
    mimetype.includes("msword") ||
    mimetype.includes("officedocument") ||
    mimetype.includes("text/") ||
    mimetype.includes("json") ||
    mimetype.includes("csv") ||
    mimetype.includes("zip") ||
    mimetype.includes("tar") ||
    mimetype.includes("rar")
  ) {
    return "document";
  }
  return "other";
}

// 2GB max file size limit suitable for video and large document transfers on LAN
export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB
  },
});
