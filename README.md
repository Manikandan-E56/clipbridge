# 📋 ClipBridge

> **Self-hosted, real-time local network clipboard & file sharing workspace with permission-gated historical access.**

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.3-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.8-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

## 🌟 Overview

**ClipBridge** makes cross-device sharing on your local Wi-Fi seamless, private, and lightning-fast. Whether you need to copy a 2FA code from your phone to your workstation, drop design assets and videos onto a nearby tablet, or sync snippets across multiple computers, ClipBridge bridges the gap without relying on external cloud providers or internet access.

All assets remain strictly within your local network (LAN), backed by MongoDB for optional persistent archiving and access key authorization.

---

## ✨ Features

### ⚡ Real-Time Synchronization
* **Live Clipboard Broadcast**: Instantly push text snippets, code, and links to all connected screens in real time using **Socket.IO**.
* **Live Activity Feed**: Updates seamlessly without needing to refresh pages.
* **Online Device Discovery**: Real-time tracking of active devices (smartphones, tablets, desktop workstations) with dynamic device naming.

### 📁 Rich File & Media Sharing
* **Universal File Support**: Upload images, audio, video recordings, PDFs, code archives, and generic documents (up to 50MB per upload).
* **In-App Media Previews**: Native modal previewer for high-resolution images, streaming audio, and inline video playback with byte-range HTTP headers.
* **One-Click Actions**: Quick copy to clipboard, direct download, and item deletion.

### 📲 Frictionless Mobile Connection (QR Code)
* **Instant QR Code Join**: Generates a dynamic QR code containing your server's Wi-Fi LAN address (`http://<LAN_IP>:5173`).
* **Zero App Installs**: Open any mobile camera app, scan the QR code, and start transferring files directly in the mobile browser.

### 🔐 Granular Access Keys & History Archive
* **Permission-Gated History**: Browse, filter (by type: `text`, `link`, `image`, `video`, `audio`, `document`), and search through past shared items.
* **Role-Based Access Control**:
  * **Admin**: Manage access keys, view history, upload, download, and delete items.
  * **Contributor**: Upload and view authorized history.
  * **Viewer**: Read-only access to shared history and downloads.
* **Key Lifecycle Management**: Create custom or auto-generated keys (e.g. `CB-XXXXXXX`), set expiration durations, and deactivate keys on demand.

### 🎨 Modern UI / UX
* Built with a sleek dark-mode glassmorphic theme.
* Responsive design tailored for mobile phones, tablets, and ultra-wide desktop monitors.
* Non-intrusive toast notifications for incoming clips.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph LAN ["Local Wi-Fi Network (LAN)"]
        subgraph Devices ["Connected Devices"]
            PC["💻 Desktop / Laptop (Browser)"]
            Phone["📱 Smartphone / Tablet (Browser)"]
        end

        subgraph ClientApp ["Client (Vite + React) :5173"]
            UI["React 19 UI / Lucide Icons"]
            SocketClient["Socket.IO Client"]
            ApiClient["Fetch API Client"]
        end

        subgraph ServerApp ["Server (Node.js + Express) :5000"]
            ExpressApp["Express API Router"]
            SocketServer["Socket.IO Gateway"]
            MulterUpload["Multer File Storage (/uploads)"]
            NetUtils["LAN IP Auto-Discovery"]
        end

        subgraph Database ["Persistence Layer"]
            Mongo[("MongoDB (clipbridge)")]
        end
    end

    PC <--> |HTTP / WebSocket| ClientApp
    Phone <--> |QR Code / HTTP / WebSocket| ClientApp
    ClientApp <--> |Reverse Proxy / REST API| ExpressApp
    ClientApp <--> |WebSockets (ws://)| SocketServer
    ExpressApp --> MulterUpload
    ExpressApp --> Mongo
    SocketServer <--> |Broadcast Events| ClientApp
```

---

## 📂 Project Structure

```text
clipbridge/
├── Server/                     # Backend API & WebSocket Server
│   ├── src/
│   │   ├── config/             # Database connection setup (Mongoose)
│   │   │   └── db.js
│   │   ├── middleware/         # Auth, file upload (Multer), and validators
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── models/             # Mongoose schemas (SharedItem, AccessKey)
│   │   │   ├── AccessKey.js
│   │   │   └── SharedItem.js
│   │   ├── routes/             # REST API routes
│   │   │   ├── history.js
│   │   │   ├── items.js
│   │   │   ├── keys.js
│   │   │   └── network.js
│   │   ├── socket/             # Socket.IO connection & event handlers
│   │   │   └── index.js
│   │   ├── utils/              # Network interface discovery & diagnostics
│   │   │   └── network.js
│   │   └── server.js           # Server entry point & startup bootstrapping
│   ├── uploads/                # Local storage for uploaded media & files
│   ├── .env                    # Server environment variables
│   ├── package.json
│   └── server.js               # Proxy entry point
│
├── client/                     # Frontend Single Page Application
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── assets/             # Images and styles
│   │   ├── components/         # Modular UI components
│   │   │   ├── DevicesModal.jsx        # Online LAN devices list
│   │   │   ├── Header.jsx              # Navigation, status, & actions
│   │   │   ├── HistoryModal.jsx        # Searchable archive & stats
│   │   │   ├── KeyManagerModal.jsx     # Admin access key generator
│   │   │   ├── LiveStream.jsx          # Live feed of shared items
│   │   │   ├── MediaPreviewModal.jsx   # In-browser media player/viewer
│   │   │   ├── QrModal.jsx             # QR code modal for mobile join
│   │   │   └── ShareBar.jsx            # Text & file input sharing bar
│   │   ├── services/
│   │   │   ├── api.js          # REST API endpoints wrapper
│   │   │   └── socket.js       # Socket.IO client instance
│   │   ├── App.jsx             # Main application orchestrator
│   │   ├── App.css             # Component-level styling
│   │   ├── index.css           # Global design system & theme variables
│   │   └── main.jsx            # React root mount
│   ├── index.html
│   ├── package.json
│   └── vite.config.js          # Vite config with LAN host & proxy setup
│
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* [npm](https://www.npmjs.com/) (bundled with Node.js)
* [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, or a remote MongoDB connection string

---

### 1. Backend Server Setup

1. Open a terminal and navigate to the `Server` directory:
   ```bash
   cd Server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   A default `.env` file is located in the `Server` directory:
   ```env
   PORT=5000
   CLIENT_PORT=5173
   MONGO_URI=mongodb://127.0.0.1:27017/clipbridge
   UPLOAD_DIR=uploads
   MASTER_KEY=admin123
   ```
   *Edit these values if you use an external MongoDB connection or custom ports.*

4. Start the server:
   ```bash
   # Development mode with nodemon auto-reload:
   npm run dev

   # Production mode:
   npm start
   ```

   Upon starting, the server automatically binds to `0.0.0.0` and prints your local Wi-Fi addresses in the console:
   ```text
   🚀 ===================================================
      ClipBridge Server is LIVE on Local Network
      Local Address:   http://localhost:5000
      Wi-Fi LAN IP:    http://192.168.1.15:5000
      Client Web App:  http://192.168.1.15:5173
      Upload Storage:  D:\DDON\Python\clipbridge\Server\uploads
   ===================================================
   ```

---

### 2. Frontend Client Setup

1. Open a second terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

   The client will start and be available at:
   * **Local Machine**: `http://localhost:5173`
   * **Network Devices**: `http://<YOUR_LAN_IP>:5173` (e.g., `http://192.168.1.15:5173`)

---

## 📱 Connecting Mobile Devices & Other PCs

1. Ensure the other device is connected to the **same Wi-Fi / Local Area Network**.
2. On your host computer, click the **QR Code** button in the ClipBridge navigation bar.
3. Scan the displayed QR code with your mobile phone camera or tablet.
4. The web application will instantly open in your mobile browser with full sharing capabilities!

---

## 🔑 Access Keys & Roles

ClipBridge provides an access key system to control access to the historical archive and administrative operations:

| Role | Permissions |
| :--- | :--- |
| **Admin** | View History, Download Files, Upload, Delete Items, Manage & Issue Keys |
| **Contributor** | View History, Download Files, Upload |
| **Viewer** | View History, Download Files (Read-only) |

### Default Admin Credentials
* **Bootstrap Master Key**: When first initialized, the server automatically generates an initial admin key:
  ```text
  CB-MASTER2026
  ```
  *(or you can authenticate using the configured `MASTER_KEY` environment variable, e.g., `admin123`)*
* Enter this key under **History** or the **Key Manager** modal (`🔑` icon) to unlock key creation, history searches, and deletion privileges.

---

## 📡 API Reference

### Shared Items (`/api/items`)
* `GET /api/items/recent?limit=30` - Retrieve recent items for the live workspace.
* `POST /api/items/text` - Share a text snippet or web link.
  * Body: `{ text: string, deviceName: string, deviceId: string }`
* `POST /api/items/upload` - Upload single or multiple files (multipart form data).
* `DELETE /api/items/:id` - Delete a shared item and its physical file.

### History & Archive (`/api/history`)
* `POST /api/history/verify` - Validate an access key and check capabilities.
* `GET /api/history?page=1&limit=20&type=all&search=query` - Search and page through historical archives (`x-access-key` header required).
* `GET /api/history/stats` - Summary statistics of stored clips and files.

### Key Management (`/api/keys`)
* `GET /api/keys` - List all access keys (Admin only).
* `POST /api/keys` - Create a new key with specified expiration and permissions.
* `PATCH /api/keys/:id` - Activate / deactivate an access key.
* `DELETE /api/keys/:id` - Revoke and remove an access key.

### Network Diagnostics (`/api/network`)
* `GET /api/network/info` - Get host machine network interfaces, primary LAN IP, and connection URLs.

---

## ⚡ Socket.IO Real-Time Events

| Event | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `device:register` | Client &rarr; Server | `{ deviceName, deviceId, deviceType }` | Registers client metadata |
| `device:list` | Server &rarr; Client | `Array<Device>` | Broadcasts list of online devices |
| `item:new` | Server &rarr; Client | `SharedItem` | Emitted when a new clip or file is uploaded |
| `item:deleted` | Server &rarr; Client | `{ id }` | Emitted when an item is removed |
| `clipboard:broadcast`| Client &rarr; Server | `{ text }` | Ephemeral clipboard broadcast |
| `clipboard:receive`  | Server &rarr; Client | `{ text, senderSocketId, timestamp }` | Received ephemeral clipboard content |

---

## ⚙️ Environment Variables

### Server (`Server/.env`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for the Express and Socket.IO HTTP server |
| `CLIENT_PORT`| `5173` | Port for the client Vite development server |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/clipbridge` | MongoDB connection URI |
| `UPLOAD_DIR` | `uploads` | Directory name for uploaded files relative to Server |
| `MASTER_KEY` | `admin123` | Server owner master override key |

---

## 🛠️ Tech Stack

* **Frontend**:
  * [React 19](https://react.dev/) & [Vite](https://vitejs.dev/)
  * [Lucide React](https://lucide.dev/) (Icons)
  * [qrcode.react](https://github.com/zpao/qrcode.react) (QR Code rendering)
  * [Socket.IO Client](https://socket.io/docs/v4/client-api/)
* **Backend**:
  * [Node.js](https://nodejs.org/) (ES Modules)
  * [Express 5](https://expressjs.com/)
  * [Socket.IO 4](https://socket.io/)
  * [Multer](https://github.com/expressjs/multer)
  * [Mongoose](https://mongoosejs.com/)
* **Database**:
  * [MongoDB](https://www.mongodb.com/)

---

## 📄 License

This project is licensed under the **ISC License**. Feel free to use and modify it for your personal or organizational workflow.
