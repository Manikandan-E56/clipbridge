import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, Smartphone, Wifi, Globe } from "lucide-react";

export function QrModal({ isOpen, onClose, networkInfo, showToast }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Derive client connect URL from network info or current location host
  const primaryIp = networkInfo?.primaryIp || window.location.hostname;
  const clientPort = networkInfo?.clientPort || window.location.port || 5173;
  const connectUrl = `http://${primaryIp}:${clientPort}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(connectUrl);
    setCopied(true);
    if (showToast) showToast("Connection URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Smartphone size={20} color="var(--accent-cyan)" />
            Connect Mobile Device
          </h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ alignItems: "center", textAlign: "center" }}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
            Scan with your smartphone or tablet camera while connected to the same Wi-Fi network.
          </p>

          <div
            style={{
              padding: "1.25rem",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
              display: "inline-block",
            }}
          >
            <QRCodeSVG
              value={connectUrl}
              size={220}
              level="H"
              includeMargin={false}
              fgColor="#0f172a"
              bgColor="#ffffff"
            />
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(15, 23, 42, 0.8)",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              border: "1px solid var(--border-subtle)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
            }}
          >
            <Globe size={16} color="var(--accent-cyan)" />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", textAlign: "left" }}>
              {connectUrl}
            </span>
            <button className="btn btn-secondary btn-icon" onClick={copyUrl} title="Copy link">
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              fontSize: "0.78rem",
              color: "var(--text-muted)",
            }}
          >
            <Wifi size={14} color="var(--accent-emerald)" />
            <span>Wi-Fi Network Host: {networkInfo?.hostname || "Local Server"}</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
