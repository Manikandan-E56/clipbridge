import React from "react";
import {
  Share2,
  QrCode,
  History,
  Key,
  Users,
  Wifi,
  Laptop,
} from "lucide-react";

export function Header({
  networkInfo,
  connectedDevicesCount,
  onOpenQr,
  onOpenHistory,
  onOpenKeyManager,
  onOpenDevices,
  isHistoryUnlocked,
}) {
  return (
    <header className="app-header glass-panel">
      <div className="brand-section">
        <div className="brand-logo-icon">
          <Share2 size={24} />
        </div>
        <div className="brand-text">
          <h1>ClipBridge</h1>
          <p>Local Wi-Fi Clipboard & Secure File Sharing</p>
        </div>
      </div>

      <div className="header-actions">
        {networkInfo?.primaryIp && (
          <div className="lan-pill" title="Local Network IP Address">
            <span className="pulse-dot" />
            <Wifi size={14} />
            <span className="ip">{networkInfo.primaryIp}</span>
          </div>
        )}

        <button
          className="btn btn-secondary"
          onClick={onOpenDevices}
          title="Connected LAN Devices"
        >
          <Users size={16} />
          <span>{connectedDevicesCount} Online</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenQr}
          title="Scan QR to open ClipBridge on Mobile"
        >
          <QrCode size={16} />
          <span>QR Connect</span>
        </button>

        <button
          className={`btn ${isHistoryUnlocked ? "btn-secondary" : "btn-primary"}`}
          onClick={onOpenHistory}
          title="Permission-Gated Historical Archive"
        >
          <History size={16} />
          <span>{isHistoryUnlocked ? "History" : "Unlock History"}</span>
        </button>

        <button
          className="btn btn-ghost btn-icon"
          onClick={onOpenKeyManager}
          title="Server Owner Key Management"
        >
          <Key size={18} />
        </button>
      </div>
    </header>
  );
}
