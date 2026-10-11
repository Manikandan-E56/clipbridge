import React, { useState, useRef } from "react";
import {
  Send,
  Upload,
  FileText,
  Paperclip,
  X,
  File,
  Image,
  Video,
  Laptop,
} from "lucide-react";
import { api } from "../services/api";

export function ShareBar({ deviceName, setDeviceName, deviceId, onSent, showToast }) {
  const [activeTab, setActiveTab] = useState("text"); // 'text' | 'files'
  const [textContent, setTextContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Submit Text or URL
  const handleSendText = async (e) => {
    if (e) e.preventDefault();
    if (!textContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await api.shareText({
        text: textContent.trim(),
        deviceName,
        deviceId,
      });
      setTextContent("");
      showToast("Shared successfully to local network!");
      if (onSent) onSent();
    } catch (err) {
      showToast(err.message || "Failed to share message", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit File Upload
  const handleSendFiles = async () => {
    if (selectedFiles.length === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("deviceName", deviceName);
      formData.append("deviceId", deviceId);

      for (const file of selectedFiles) {
        formData.append("files", file);
      }

      await api.uploadFiles(formData);
      setSelectedFiles([]);
      showToast(`Uploaded ${selectedFiles.length} file(s) successfully!`);
      if (onSent) onSent();
    } catch (err) {
      showToast(err.message || "Failed to upload files", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...droppedFiles]);
      setActiveTab("files");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="share-container glass-panel">
      <div className="share-header">
        <div className="share-tabs">
          <button
            className={`share-tab ${activeTab === "text" ? "active" : ""}`}
            onClick={() => setActiveTab("text")}
          >
            <FileText size={15} />
            <span>Text / Link</span>
          </button>
          <button
            className={`share-tab ${activeTab === "files" ? "active" : ""}`}
            onClick={() => setActiveTab("files")}
          >
            <Paperclip size={15} />
            <span>Files {selectedFiles.length > 0 && `(${selectedFiles.length})`}</span>
          </button>
        </div>

        <div className="device-picker" title="Name shown as the sender">
          <Laptop size={14} />
          <span>Device:</span>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="My Device"
          />
        </div>
      </div>

      {activeTab === "text" ? (
        <form onSubmit={handleSendText} className="text-composer">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste text, clipboard snippet, or web link to broadcast instantly across your Wi-Fi..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleSendText();
              }
            }}
          />
          <div className="share-footer">
            <span className="paste-hint">
              Tip: Press <kbd>Ctrl+Enter</kbd> to send, or press <kbd>Ctrl+V</kbd> anywhere
            </span>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!textContent.trim() || isSubmitting}
            >
              <Send size={15} />
              <span>{isSubmitting ? "Sharing..." : "Broadcast"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="files-composer">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <div
            className={`dropzone ${isDragging ? "drag-active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="dropzone-icon">
              <Upload size={22} />
            </div>
            <div>
              <strong>Click to browse</strong> or drag & drop files here
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Photos, Videos, PDFs, Documents, Archives up to 2 GB
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="selected-files-list">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="selected-file-row">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <File size={16} color="var(--accent-cyan)" />
                    <span style={{ fontWeight: 500 }}>{file.name}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => removeFile(idx)}
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="share-footer" style={{ marginTop: "0.75rem" }}>
            <span className="paste-hint">
              {selectedFiles.length} file(s) queued for local transfer
            </span>
            <button
              type="button"
              className="btn btn-primary"
              disabled={selectedFiles.length === 0 || isSubmitting}
              onClick={handleSendFiles}
            >
              <Upload size={15} />
              <span>{isSubmitting ? "Uploading..." : `Send ${selectedFiles.length} File(s)`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
