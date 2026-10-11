# 💻 ClipBridge — Frontend Client

The web client for **ClipBridge**, built with React 19, Vite, and Socket.IO.

For full project documentation, architecture overview, and setup details, please see the [Root README](../README.md).

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Local: `http://localhost:5173`
   - LAN: `http://<YOUR_LAN_IP>:5173`

## ⚙️ Configuration

The frontend proxies `/api`, `/uploads`, and `/socket.io` to the backend server running on `http://localhost:5000` via [vite.config.js](./vite.config.js).
