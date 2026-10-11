# 🛠️ ClipBridge — Backend Server

The backend API and WebSocket server for **ClipBridge**, built with Node.js, Express, Socket.IO, Multer, and MongoDB/Mongoose.

For full project documentation, architecture overview, and setup details, please see the [Root README](../README.md).

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Verify your `.env` file:
   ```env
   PORT=5000
   CLIENT_PORT=5173
   MONGO_URI=mongodb://127.0.0.1:27017/clipbridge
   UPLOAD_DIR=uploads
   MASTER_KEY=admin123
   ```

3. **Start the server:**
   ```bash
   # Development mode with nodemon:
   npm run dev

   # Production mode:
   npm start
   ```

## 📡 Endpoints Overview

- `/api/items` - Text sharing, file uploads, recent feed
- `/api/history` - Historical archive search and statistics
- `/api/keys` - Access key generation and permission management
- `/api/network` - LAN interface discovery and host IP diagnostics
- `/uploads` - Static media and file downloads
