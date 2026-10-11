import React, { useState } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  Download,
  Trash2,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  File,
  Code,
  Eye,
  Inbox,
} from "lucide-react";
import { api } from "../services/api";

export function LiveStream({
  items,
  onItemDeleted,
  onPreviewMedia,
  showToast,
  accessKey,
}) {
  const [filter, setFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [codeModeMap, setCodeModeMap] = useState({});

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCodeMode = (id) => {
    setCodeModeMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this item from the shared clipboard?")) return;
    try {
      await api.deleteItem(id, accessKey);
      showToast("Item deleted");
      if (onItemDeleted) onItemDeleted(id);
    } catch (err) {
      showToast(err.message || "Failed to delete item", "error");
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatRelativeTime = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 45) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "text") return item.type === "text";
    if (filter === "links") return item.type === "link";
    if (filter === "media") return item.type === "image" || item.type === "video";
    if (filter === "docs") return item.type === "document" || item.type === "other";
    return true;
  });

  return (
    <div className="stream-section">
      <div className="feed-header">
        <div className="feed-title">
          <span>Active Clipboard & Shared Media</span>
          <span className="badge badge-text">{filteredItems.length} items</span>
        </div>

        <div className="filter-pills">
          {["all", "text", "links", "media", "docs"].map((tab) => (
            <button
              key={tab}
              className={`filter-pill ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state glass-panel">
          <div className="empty-icon">
            <Inbox size={32} />
          </div>
          <h3>No items shared yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "380px" }}>
            Share text notes, URLs, documents, or drag-and-drop photos above. Any device connected to your Wi-Fi will see them live!
          </p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredItems.map((item) => {
            const isCodeMode = codeModeMap[item._id];
            const fileUrl = item.file?.downloadUrl
              ? item.file.downloadUrl
              : item.file?.filename
              ? `/uploads/${item.file.filename}`
              : null;

            return (
              <div key={item._id} className="item-card glass-panel">
                <div className="card-top">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {item.type === "text" && <span className="badge badge-text"><FileText size={12} /> Text</span>}
                    {item.type === "link" && <span className="badge badge-link"><LinkIcon size={12} /> Link</span>}
                    {item.type === "image" && <span className="badge badge-image"><ImageIcon size={12} /> Photo</span>}
                    {item.type === "video" && <span className="badge badge-video"><VideoIcon size={12} /> Video</span>}
                    {item.type === "audio" && <span className="badge badge-doc"><Music size={12} /> Audio</span>}
                    {item.type === "document" && <span className="badge badge-doc"><File size={12} /> Doc</span>}
                    {item.type === "other" && <span className="badge badge-text"><File size={12} /> File</span>}
                  </div>

                  <div className="card-meta">
                    <span>{item.sender?.deviceName || "Device"}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(item.createdAt)}</span>
                  </div>
                </div>

                <div className="card-content-area">
                  {/* TEXT CONTENT */}
                  {item.type === "text" && (
                    <div
                      className="card-text"
                      style={
                        isCodeMode
                          ? { fontFamily: "var(--font-mono)", fontSize: "0.85rem", background: "rgba(0,0,0,0.3)", padding: "0.75rem", borderRadius: "8px" }
                          : {}
                      }
                    >
                      {item.content}
                    </div>
                  )}

                  {/* WEB LINK */}
                  {item.type === "link" && (
                    <a
                      href={item.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-link-preview"
                    >
                      <LinkIcon size={20} color="var(--accent-cyan)" />
                      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                        <span className="url">{item.content}</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          Click to open link in new tab
                        </span>
                      </div>
                      <ExternalLink size={16} color="var(--text-muted)" style={{ marginLeft: "auto" }} />
                    </a>
                  )}

                  {/* IMAGE */}
                  {item.type === "image" && fileUrl && (
                    <div
                      className="card-media-preview"
                      onClick={() => onPreviewMedia && onPreviewMedia(item)}
                    >
                      <img src={fileUrl} alt={item.file?.originalName || "Shared Photo"} loading="lazy" />
                    </div>
                  )}

                  {/* VIDEO */}
                  {item.type === "video" && fileUrl && (
                    <div style={{ borderRadius: "12px", overflow: "hidden", background: "#000" }}>
                      <video
                        src={fileUrl}
                        controls
                        style={{ width: "100%", maxHeight: "240px", display: "block" }}
                        preload="metadata"
                      />
                    </div>
                  )}

                  {/* AUDIO */}
                  {item.type === "audio" && fileUrl && (
                    <div style={{ padding: "0.5rem 0" }}>
                      <audio src={fileUrl} controls style={{ width: "100%" }} />
                    </div>
                  )}

                  {/* DOCUMENT / FILE */}
                  {(item.type === "document" || item.type === "other") && (
                    <div className="card-file-block">
                      <div className="card-file-icon">
                        <File size={22} />
                      </div>
                      <div className="card-file-info">
                        <span className="card-file-name" title={item.file?.originalName}>
                          {item.file?.originalName || item.content}
                        </span>
                        <span className="card-file-size">
                          {formatFileSize(item.file?.size)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-bottom">
                  <div className="card-actions">
                    {/* Copy Text or URL button */}
                    {(item.type === "text" || item.type === "link") && (
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => copyToClipboard(item.content, item._id)}
                        title="Copy to clipboard"
                      >
                        {copiedId === item._id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>
                    )}

                    {/* Toggle Code Monospace for text */}
                    {item.type === "text" && (
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => toggleCodeMode(item._id)}
                        title="Toggle monospace font"
                      >
                        <Code size={14} />
                      </button>
                    )}

                    {/* Image Preview Lightbox button */}
                    {item.type === "image" && (
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => onPreviewMedia && onPreviewMedia(item)}
                        title="View photo fullscreen"
                      >
                        <Eye size={14} />
                      </button>
                    )}

                    {/* Download File */}
                    {fileUrl && (
                      <a
                        href={fileUrl}
                        download={item.file?.originalName || "download"}
                        className="btn btn-secondary btn-icon"
                        title="Download file"
                      >
                        <Download size={14} />
                      </a>
                    )}
                  </div>

                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => handleDelete(item._id)}
                    title="Delete item"
                  >
                    <Trash2 size={14} color="#f43f5e" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
