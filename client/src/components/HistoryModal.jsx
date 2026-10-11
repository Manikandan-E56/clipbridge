import React, { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  Key,
  Search,
  Download,
  Eye,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  File,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  HardDrive,
  Clock,
} from "lucide-react";
import { api } from "../services/api";

export function HistoryModal({
  isOpen,
  onClose,
  accessKey,
  setAccessKey,
  keyPermissions,
  setKeyPermissions,
  onPreviewMedia,
  showToast,
}) {
  const [inputKey, setInputKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load history if key is verified
  useEffect(() => {
    if (isOpen && accessKey && keyPermissions) {
      loadHistory();
      loadStats();
    }
  }, [isOpen, accessKey, page, typeFilter]);

  const handleVerifyKey = async (e) => {
    if (e) e.preventDefault();
    if (!inputKey.trim()) return;

    try {
      setIsVerifying(true);
      const res = await api.verifyAccessKey(inputKey.trim());
      if (res.valid) {
        setAccessKey(inputKey.trim().toUpperCase());
        setKeyPermissions(res);
        localStorage.setItem("cb_access_key", inputKey.trim().toUpperCase());
        showToast(`Unlocked historical access as ${res.name || "Authorized User"}`);
        setPage(1);
      }
    } catch (err) {
      showToast(err.message || "Invalid Access Key", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLock = () => {
    setAccessKey("");
    setKeyPermissions(null);
    localStorage.removeItem("cb_access_key");
    setHistoryItems([]);
    setStats(null);
    showToast("Historical access locked");
  };

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const res = await api.getHistory({
        page,
        limit: 12,
        type: typeFilter,
        search,
        accessKey,
      });
      setHistoryItems(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalCount(res.pagination?.total || 0);
    } catch (err) {
      showToast(err.message || "Failed to load history", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.getHistoryStats(accessKey);
      setStats(res.stats);
    } catch {
      // stats optional
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadHistory();
  };

  const formatStorage = (bytes) => {
    if (!bytes) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {accessKey ? (
              <Unlock size={20} color="var(--accent-emerald)" />
            ) : (
              <Lock size={20} color="var(--accent-primary)" />
            )}
            Historical Access Archive
          </h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {!accessKey ? (
            /* ACCESS KEY PROMPT SCREEN */
            <div className="lock-banner">
              <div className="empty-icon" style={{ background: "rgba(99, 102, 241, 0.15)" }}>
                <Key size={32} color="var(--accent-primary)" />
              </div>
              <div>
                <h4 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                  Historical Access Key Required
                </h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "440px" }}>
                  To maintain local network privacy, historical clipboard records and archived files require an authorization key issued by the server owner.
                </p>
              </div>

              <form onSubmit={handleVerifyKey} className="key-input-group">
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="e.g. CB-MASTER2026"
                  autoFocus
                />
                <button type="submit" className="btn btn-primary" disabled={isVerifying}>
                  {isVerifying ? "Verifying..." : "Unlock"}
                </button>
              </form>

              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  background: "rgba(15, 23, 42, 0.6)",
                  padding: "0.5rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Default Server Owner Key: <code style={{ color: "var(--accent-cyan)" }}>CB-MASTER2026</code>
              </div>
            </div>
          ) : (
            /* UNLOCKED HISTORICAL BROWSER */
            <div>
              {/* Active Key Info Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  background: "rgba(15, 23, 42, 0.9)",
                  borderRadius: "12px",
                  border: "1px solid var(--border-subtle)",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <ShieldCheck size={18} color="var(--accent-emerald)" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {keyPermissions?.name || "Authorized Session"}
                  </span>
                  <span className="badge badge-online">
                    {keyPermissions?.role || "viewer"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    Key: {accessKey}
                  </span>
                  <button className="btn btn-secondary btn-icon" onClick={handleLock} title="Lock / Change Key">
                    <Lock size={14} />
                  </button>
                </div>
              </div>

              {/* Statistics */}
              {stats && (
                <div className="key-stats-grid">
                  <div className="stat-card">
                    <span className="stat-value">{stats.totalItems || 0}</span>
                    <span className="stat-label">Total Items</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{formatStorage(stats.totalStorageBytes)}</span>
                    <span className="stat-label">Disk Storage</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{stats.breakdown?.image || 0}</span>
                    <span className="stat-label">Photos</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{stats.breakdown?.document || 0}</span>
                    <span className="stat-label">Documents</span>
                  </div>
                </div>
              )}

              {/* Search & Filter Bar */}
              <div className="history-filters">
                <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    className="history-search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search historical messages or filenames..."
                  />
                  <button type="submit" className="btn btn-secondary">
                    <Search size={15} />
                  </button>
                </form>

                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    color: "var(--text-main)",
                    padding: "0.55rem 0.85rem",
                    fontSize: "0.82rem",
                    outline: "none",
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="text">Text Notes</option>
                  <option value="link">Web Links</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="document">Documents</option>
                </select>
              </div>

              {/* Items List */}
              {isLoading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  Loading historical records...
                </div>
              ) : historyItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No historical items match the current query.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {historyItems.map((item) => {
                    const fileUrl = item.file?.downloadUrl
                      ? item.file.downloadUrl
                      : item.file?.filename
                      ? `/uploads/${item.file.filename}`
                      : null;

                    return (
                      <div
                        key={item._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.85rem 1rem",
                          background: "rgba(15, 23, 42, 0.7)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "10px",
                          gap: "1rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", overflow: "hidden" }}>
                          {item.type === "text" && <FileText size={18} color="var(--accent-primary)" />}
                          {item.type === "link" && <LinkIcon size={18} color="var(--accent-cyan)" />}
                          {item.type === "image" && <ImageIcon size={18} color="var(--accent-emerald)" />}
                          {item.type === "video" && <VideoIcon size={18} color="var(--accent-amber)" />}
                          {(item.type === "document" || item.type === "other") && (
                            <File size={18} color="#f472b6" />
                          )}

                          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                            <span
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item.content || item.file?.originalName}
                            </span>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                              {new Date(item.createdAt).toLocaleString()} • {item.sender?.deviceName || "Device"}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          {item.type === "image" && (
                            <button
                              className="btn btn-secondary btn-icon"
                              onClick={() => onPreviewMedia && onPreviewMedia(item)}
                              title="Preview photo"
                            >
                              <Eye size={14} />
                            </button>
                          )}

                          {fileUrl && (
                            <a
                              href={fileUrl}
                              download={item.file?.originalName || "download"}
                              className="btn btn-secondary btn-icon"
                              title="Download archived file"
                            >
                              <Download size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "1.25rem",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Page {page} of {totalPages} ({totalCount} total)
                  </span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn btn-secondary btn-icon"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      className="btn btn-secondary btn-icon"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
