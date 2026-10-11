import React from "react";
import { X, Download, File, ExternalLink } from "lucide-react";

export function MediaPreviewModal({ item, onClose }) {
  if (!item) return null;

  const fileUrl = item.file?.downloadUrl
    ? item.file.downloadUrl
    : item.file?.filename
    ? `/uploads/${item.file.filename}`
    : null;

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content wide"
        style={{ maxWidth: "900px", background: "#050811", border: "1px solid var(--border-medium)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
              {item.file?.originalName || item.content || "Media Preview"}
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Shared by {item.sender?.deviceName || "Device"} • {formatFileSize(item.file?.size)}
            </span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div
          className="modal-body"
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            minHeight: "350px",
            background: "#000000",
          }}
        >
          {item.type === "image" && fileUrl && (
            <img
              src={fileUrl}
              alt={item.file?.originalName || "Preview"}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          )}

          {item.type === "video" && fileUrl && (
            <video
              src={fileUrl}
              controls
              autoPlay
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                borderRadius: "8px",
              }}
            />
          )}

          {item.type === "audio" && fileUrl && (
            <div style={{ width: "100%", maxWidth: "480px", padding: "2rem" }}>
              <audio src={fileUrl} controls autoPlay style={{ width: "100%" }} />
            </div>
          )}

          {(item.type === "document" || item.type === "other") && (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <File size={56} color="var(--accent-cyan)" style={{ marginBottom: "1rem" }} />
              <h4>{item.file?.originalName}</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                Document preview not available in browser. Download below to view.
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {item.file?.mimetype || "unknown"}
          </span>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {fileUrl && (
              <a
                href={fileUrl}
                download={item.file?.originalName || "download"}
                className="btn btn-primary"
              >
                <Download size={15} />
                <span>Download</span>
              </a>
            )}
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
