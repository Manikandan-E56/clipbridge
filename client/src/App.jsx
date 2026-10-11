import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

import { Header } from "./components/Header";
import { ShareBar } from "./components/ShareBar";
import { LiveStream } from "./components/LiveStream";
import { QrModal } from "./components/QrModal";
import { HistoryModal } from "./components/HistoryModal";
import { KeyManagerModal } from "./components/KeyManagerModal";
import { MediaPreviewModal } from "./components/MediaPreviewModal";
import { DevicesModal } from "./components/DevicesModal";

import { api } from "./services/api";
import { getSocket, registerDevice } from "./services/socket";

function App() {
  // Device identity
  const [deviceId] = useState(() => {
    let id = localStorage.getItem("cb_device_id");
    if (!id) {
      id = "dev-" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("cb_device_id", id);
    }
    return id;
  });

  const [deviceName, setDeviceName] = useState(() => {
    let name = localStorage.getItem("cb_device_name");
    if (!name) {
      const isMobile = /mobile/i.test(navigator.userAgent);
      name = isMobile ? "Mobile Device" : "Workstation";
      localStorage.setItem("cb_device_name", name);
    }
    return name;
  });

  // Data states
  const [items, setItems] = useState([]);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [connectedDevices, setConnectedDevices] = useState([]);

  // Access key & permissions for historical archive
  const [accessKey, setAccessKey] = useState(() => localStorage.getItem("cb_access_key") || "");
  const [keyPermissions, setKeyPermissions] = useState(null);

  // Modals state
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isKeyManagerOpen, setIsKeyManagerOpen] = useState(false);
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Update device name in localStorage & re-register
  const handleUpdateDeviceName = (name) => {
    setDeviceName(name);
    localStorage.setItem("cb_device_name", name);
    registerDevice(name, deviceId);
  };

  // Initial data loading
  useEffect(() => {
    // 1. Fetch network diagnostics & LAN IPs
    api.getNetworkInfo()
      .then((res) => setNetworkInfo(res.data))
      .catch((err) => console.warn("Network info unavailable:", err.message));

    // 2. Fetch recent shared items
    api.getRecentItems(40)
      .then((res) => setItems(res.data || []))
      .catch((err) => console.warn("Failed to load initial items:", err.message));

    // 3. Verify saved access key if exists
    if (accessKey) {
      api.verifyAccessKey(accessKey)
        .then((res) => {
          if (res.valid) setKeyPermissions(res);
          else {
            setAccessKey("");
            localStorage.removeItem("cb_access_key");
          }
        })
        .catch(() => {
          setAccessKey("");
          localStorage.removeItem("cb_access_key");
        });
    }
  }, []);

  // Socket.IO event listeners
  useEffect(() => {
    const socket = getSocket();

    // Register this device with the server
    registerDevice(deviceName, deviceId);

    // Live clip broadcast
    const handleItemNew = (newItem) => {
      setItems((prev) => {
        // Avoid duplicate items
        if (prev.some((item) => item._id === newItem._id)) return prev;
        return [newItem, ...prev];
      });

      if (newItem.sender?.deviceId !== deviceId) {
        showToast(
          `New ${newItem.type} shared from ${newItem.sender?.deviceName || "a nearby device"}!`
        );
      }
    };

    const handleItemDeleted = ({ id }) => {
      setItems((prev) => prev.filter((item) => item._id !== id));
    };

    const handleDeviceList = (deviceList) => {
      setConnectedDevices(deviceList);
    };

    socket.on("item:new", handleItemNew);
    socket.on("item:deleted", handleItemDeleted);
    socket.on("device:list", handleDeviceList);

    return () => {
      socket.off("item:new", handleItemNew);
      socket.off("item:deleted", handleItemDeleted);
      socket.off("device:list", handleDeviceList);
    };
  }, [deviceId, deviceName, showToast]);

  // Global clipboard paste listener (Ctrl+V)
  useEffect(() => {
    const handleGlobalPaste = async (e) => {
      // Don't intercept if user is typing into an input or textarea
      const target = e.target;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Check if image data is pasted (e.g. screenshot taken with Win+Shift+S)
      if (e.clipboardData?.files?.length > 0) {
        const file = e.clipboardData.files[0];
        const formData = new FormData();
        formData.append("files", file);
        formData.append("deviceName", deviceName);
        formData.append("deviceId", deviceId);

        try {
          showToast("Uploading pasted image screenshot...");
          await api.uploadFiles(formData, accessKey);
          showToast("Screenshot shared successfully!");
        } catch (err) {
          showToast(err.message || "Failed to share screenshot", "error");
        }
        return;
      }

      // Check for pasted plain text
      const pastedText = e.clipboardData?.getData("text");
      if (pastedText && pastedText.trim()) {
        try {
          await api.shareText({
            text: pastedText.trim(),
            deviceName,
            deviceId,
            accessKey,
          });
          showToast("Pasted clipboard shared across network!");
        } catch (err) {
          showToast(err.message || "Failed to share clipboard text", "error");
        }
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [deviceName, deviceId, accessKey, showToast]);

  return (
    <div className="app-container">
      {/* Top Navigation Header */}
      <Header
        networkInfo={networkInfo}
        connectedDevicesCount={connectedDevices.length}
        onOpenQr={() => setIsQrOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenKeyManager={() => setIsKeyManagerOpen(true)}
        onOpenDevices={() => setIsDevicesOpen(true)}
        isHistoryUnlocked={Boolean(accessKey && keyPermissions)}
      />

      {/* Main Content Area */}
      <main style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Universal Share Box */}
        <ShareBar
          deviceName={deviceName}
          setDeviceName={handleUpdateDeviceName}
          deviceId={deviceId}
          onSent={() => {}}
          showToast={showToast}
        />

        {/* Real-Time Live Feed */}
        <LiveStream
          items={items}
          onItemDeleted={(id) => setItems((prev) => prev.filter((i) => i._id !== id))}
          onPreviewMedia={(item) => setPreviewItem(item)}
          showToast={showToast}
          accessKey={accessKey}
        />
      </main>

      {/* Modals */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        networkInfo={networkInfo}
        showToast={showToast}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        accessKey={accessKey}
        setAccessKey={setAccessKey}
        keyPermissions={keyPermissions}
        setKeyPermissions={setKeyPermissions}
        onPreviewMedia={(item) => setPreviewItem(item)}
        showToast={showToast}
      />

      <KeyManagerModal
        isOpen={isKeyManagerOpen}
        onClose={() => setIsKeyManagerOpen(false)}
        showToast={showToast}
      />

      <DevicesModal
        isOpen={isDevicesOpen}
        onClose={() => setIsDevicesOpen(false)}
        devices={connectedDevices}
      />

      <MediaPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />

      {/* Floating Toast Alerts */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast"
            style={toast.type === "error" ? { borderColor: "rgba(244, 63, 94, 0.5)", color: "#fda4af" } : {}}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
