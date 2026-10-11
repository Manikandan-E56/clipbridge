import React from "react";
import { Users, X, Laptop, Smartphone, Tablet } from "lucide-react";

export function DevicesModal({ isOpen, onClose, devices }) {
  if (!isOpen) return null;

  const getDeviceIcon = (type) => {
    if (type === "smartphone") return <Smartphone size={18} color="var(--accent-cyan)" />;
    if (type === "tablet") return <Tablet size={18} color="var(--accent-emerald)" />;
    return <Laptop size={18} color="var(--accent-primary)" />;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Users size={20} color="var(--accent-emerald)" />
            Online Devices on Wi-Fi ({devices.length})
          </h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            These devices are actively connected to your local ClipBridge server instance via Socket.IO:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {devices.map((device) => (
              <div
                key={device.socketId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  background: "rgba(15, 23, 42, 0.8)",
                  borderRadius: "10px",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getDeviceIcon(device.deviceType)}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                      {device.deviceName || "Anonymous Device"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {device.ip?.replace(/^::ffff:/, "")}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="pulse-dot" />
                  <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}>
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
