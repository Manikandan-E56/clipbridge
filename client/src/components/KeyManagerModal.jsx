import React, { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Trash2,
  Check,
  Copy,
  Shield,
  X,
  AlertCircle,
} from "lucide-react";
import { api } from "../services/api";

export function KeyManagerModal({ isOpen, onClose, showToast }) {
  const [adminKey, setAdminKey] = useState(
    () => localStorage.getItem("cb_admin_key") || "CB-MASTER2026"
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [keysList, setKeysList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // New Key Form State
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyRole, setNewKeyRole] = useState("viewer");
  const [canDownload, setCanDownload] = useState(true);
  const [canDelete, setCanDelete] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    if (isOpen && adminKey) {
      loadKeys();
    }
  }, [isOpen]);

  const loadKeys = async () => {
    try {
      setIsLoading(true);
      const res = await api.getKeys(adminKey);
      setKeysList(res.data || []);
      setIsAuthenticated(true);
      localStorage.setItem("cb_admin_key", adminKey);
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    loadKeys();
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await api.createKey(
        {
          name: newKeyName.trim(),
          role: newKeyRole,
          permissions: {
            canViewHistory: true,
            canDownloadFiles: canDownload,
            canDelete: canDelete,
          },
          expiresInDays: Number(expiresInDays) || null,
        },
        adminKey
      );

      showToast(`Generated Access Key: ${res.data?.key}`);
      setNewKeyName("");
      loadKeys();
    } catch (err) {
      showToast(err.message || "Failed to create key", "error");
    }
  };

  const handleToggleKey = async (id, currentStatus) => {
    try {
      await api.toggleKey(id, !currentStatus, adminKey);
      showToast(currentStatus ? "Key deactivated" : "Key activated");
      loadKeys();
    } catch (err) {
      showToast(err.message || "Failed to update key status", "error");
    }
  };

  const handleDeleteKey = async (id) => {
    if (!window.confirm("Permanently revoke this access key?")) return;
    try {
      await api.deleteKey(id, adminKey);
      showToast("Access key revoked");
      loadKeys();
    } catch (err) {
      showToast(err.message || "Failed to revoke key", "error");
    }
  };

  const copyKeyText = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    showToast("Key code copied!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Shield size={20} color="var(--accent-primary)" />
            Server Owner — Access Key Manager
          </h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {!isAuthenticated ? (
            /* ADMIN LOGIN SCREEN */
            <form onSubmit={handleAdminLogin} className="lock-banner">
              <div className="empty-icon">
                <Key size={30} />
              </div>
              <div>
                <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                  Server Owner Authorization
                </h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Enter the Master Key or an Admin Key to manage device permissions.
                </p>
              </div>

              <div className="key-input-group">
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Owner Master Key"
                />
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? "Authenticating..." : "Login"}
                </button>
              </div>
            </form>
          ) : (
            /* KEYS MANAGEMENT INTERFACE */
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Generate New Key Form */}
              <form
                onSubmit={handleCreateKey}
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div style={{ fontSize: "0.95rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Plus size={16} color="var(--accent-cyan)" />
                  Issue New Access Key
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>
                      Key Label / Device
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g. Living Room TV / Guest iPhone"
                      style={{
                        width: "100%",
                        background: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        padding: "0.5rem 0.75rem",
                        color: "#fff",
                        fontSize: "0.85rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>
                      Role
                    </label>
                    <select
                      value={newKeyRole}
                      onChange={(e) => setNewKeyRole(e.target.value)}
                      style={{
                        width: "100%",
                        background: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        padding: "0.5rem 0.75rem",
                        color: "#fff",
                        fontSize: "0.85rem",
                        outline: "none",
                      }}
                    >
                      <option value="viewer">Viewer (Read history)</option>
                      <option value="contributor">Contributor (History + Upload)</option>
                      <option value="admin">Administrator (Full Control)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>
                      Expires In
                    </label>
                    <select
                      value={expiresInDays}
                      onChange={(e) => setExpiresInDays(e.target.value)}
                      style={{
                        width: "100%",
                        background: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        padding: "0.5rem 0.75rem",
                        color: "#fff",
                        fontSize: "0.85rem",
                        outline: "none",
                      }}
                    >
                      <option value="7">7 Days</option>
                      <option value="30">30 Days</option>
                      <option value="90">90 Days</option>
                      <option value="0">Never Expires</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginTop: "0.25rem" }}>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={canDownload}
                        onChange={(e) => setCanDownload(e.target.checked)}
                      />
                      Allow File Downloads
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={canDelete}
                        onChange={(e) => setCanDelete(e.target.checked)}
                      />
                      Allow Item Deletions
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={!newKeyName.trim()}>
                    <Plus size={15} />
                    <span>Generate Key</span>
                  </button>
                </div>
              </form>

              {/* Table of Issued Keys */}
              <div className="keys-table-container">
                <table className="keys-table">
                  <thead>
                    <tr>
                      <th>Key Code</th>
                      <th>Label</th>
                      <th>Role</th>
                      <th>Usage</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keysList.map((k) => (
                      <tr key={k._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span className="key-code-badge">{k.key}</span>
                            <button
                              className="btn btn-ghost btn-icon"
                              onClick={() => copyKeyText(k.key)}
                              title="Copy key"
                            >
                              {copiedKey === k.key ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{k.name}</td>
                        <td>
                          <span className="badge badge-text">{k.role}</span>
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                          {k.usageCount} times
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleKey(k._id, k.isActive)}
                            className={`badge ${k.isActive ? "badge-online" : "badge-doc"}`}
                            style={{ cursor: "pointer", border: "none" }}
                          >
                            {k.isActive ? "Active" : "Revoked"}
                          </button>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn btn-ghost btn-icon"
                            onClick={() => handleDeleteKey(k._id)}
                            title="Delete key permanently"
                          >
                            <Trash2 size={14} color="#f43f5e" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
