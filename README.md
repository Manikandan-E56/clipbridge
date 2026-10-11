
# ClipBridge

### Your Network. Your Server. Your Files.

ClipBridge is a self-hosted, local-network file and message-sharing platform that allows devices connected to the same Wi-Fi network to share text, links, documents, images, and videos through a user-controlled server. Unlike traditional file-sharing applications that depend on external cloud storage, ClipBridge keeps shared content on the server owner's machine and maintains a history of previously shared content for later retrieval.

Its key feature is a permission-based historical access system that allows authorized users to retrieve older messages and files using access keys issued according to the server owner's permissions, even when the original sender is offline.

---

## Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Local Network Access](#-local-network-access)
- [Security and Privacy](#-security-and-privacy)
- [Development Workflow](#-development-workflow)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚨 The Problem

Sharing content between personal devices or people on the same local network often requires third-party messaging applications, email, cloud drives, or external file-transfer services.

These approaches can introduce unnecessary steps, depend on internet connectivity, or make it inconvenient to retrieve previously shared content.

Another common problem occurs when someone needs an old document or message but the original sender is no longer available to share it again.

## 💡 Our Solution

ClipBridge provides a centralized, self-hosted sharing environment where the user's own device acts as the server.

Users connected to the same local network can share content through a browser-based interface. The server stores shared content and its metadata, maintains historical records, and controls access to previously shared items.

### Core principles

- **Local-first:** Designed for sharing over a local network.
- **Self-hosted:** The server owner controls where content is stored.
- **Persistent history:** Previously shared content can be retrieved while the server is running and the content is retained.
- **Controlled access:** Access to historical content can be governed by permissions and access keys.
- **Cross-device:** Access the application from supported desktop and mobile browsers.

---

## ✨ Key Features

### 1. Cross-Device Sharing
Share content between laptops, smartphones, tablets, and other devices connected to the same network.

### 2. Text and Link Sharing
Share text messages, URLs, notes, and other text-based content without relying on an external messaging service.

### 3. File Sharing
Upload and retrieve supported files, including documents, images, and videos, through the application.

### 4. Persistent Message and File History
Shared content can remain available after the original sender disconnects. Users can revisit previously shared content according to the configured retention and access policies.

### 5. Permission-Based Historical Access
The server owner can grant access to selected historical messages or files through an access-key mechanism.

Access should be restricted to the specific content and permissions associated with the issued key.

### 6. User-Controlled Storage
Uploaded files are stored on the host server's local disk, while MongoDB stores the associated metadata and application records.

### 7. Real-Time Updates
Socket.IO can be used to notify connected clients when new content is shared, reducing the need to refresh the page manually.

### 8. Local-Network Operation
The application is designed for devices that can reach the host server over the same local network, without requiring a publicly accessible cloud server.

> Availability depends on the host device being powered on, the backend running, and the network allowing communication between devices.

---

## 🔄 How It Works

1. **Start the server:** The host runs ClipBridge on a computer connected to the local network.
2. **Connect devices:** Other devices open the application using the host computer's local IP address and application port.
3. **Share content:** Users send text messages, links, documents, images, or videos.
4. **Store content:** The server saves supported uploaded files locally and stores their metadata and associated records in MongoDB.
5. **Retrieve history:** Authorized users can access retained messages and files without requiring the original sender to be online.
6. **Control access:** The server owner manages access to historical content using the application's permission and access-key mechanism.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Interactive, responsive user interface |
| Vite | Frontend development and build tooling |
| Node.js | Backend JavaScript runtime |
| Express.js | REST API and server-side request handling |
| MongoDB | Persistent application data and file metadata |
| Mongoose | MongoDB object modelling |
| Socket.IO | Real-time communication and updates |
| Multer | Multipart file upload handling |
| Local File System | Storage for uploaded files |
| Git | Version control |
| GitHub | Source code hosting and collaboration |
| Code0 | AI-assisted development workflow |

---

## 🏗️ Project Architecture

```text
                    ClipBridge
                         |
          +--------------+--------------+
          |                             |
     React Frontend                Other Devices
          |                             |
          +--------------+--------------+
                         |
                  Local Wi-Fi Network
                         |
                  Node.js + Express
                         |
            +------------+------------+
            |            |            |
        REST APIs     Socket.IO    Access Control
            |            |            |
            +------------+------------+
                         |
              +----------+----------+
              |                     |
           MongoDB             Local Storage
              |                     |
       Message Records       Images and Videos
       File Metadata         Documents and Files
       Access Records        Uploaded Content
```

### Storage Design

**MongoDB stores:**
- Message and sharing records
- File names, sizes, and storage references
- Timestamps and relevant metadata
- Room information and access permissions

**Local storage holds:**
- Uploaded documents
- Images
- Videos
- Other supported files

Large files are stored separately from MongoDB, avoiding the need to place every uploaded file directly inside a database document.

---

## 🚀 Getting Started

Follow these instructions to run ClipBridge locally on Windows.

### Prerequisites

Install the following software:

- [Node.js LTS](https://nodejs.org/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a configured MongoDB Atlas database
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)

### 1. Clone the Repository

Replace the example URL with your actual public GitHub repository URL.

```bash
git clone https://github.com/Manikandan-e56/ClipBridge.git
cd ClipBridge
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/clipbridge
UPLOAD_DIR=uploads
```

Use your actual MongoDB connection string if you use MongoDB Atlas or another database configuration.

Keep environment variables and credentials private.

### 4. Start MongoDB

If using a local MongoDB installation, ensure the MongoDB service is running.

In PowerShell:

```powershell
Get-Service MongoDB
```

If the service is stopped, start PowerShell as Administrator and run:

```powershell
Start-Service MongoDB
```

### 5. Start the Backend

From the `server` directory:

```bash
npm run dev
```

The backend should start on the configured port once the database connection succeeds.

### 6. Install Frontend Dependencies

Open a second terminal:

```bash
cd client
npm install
```

### 7. Start the Frontend

```bash
npm run dev -- --host 0.0.0.0
```

Open the local URL printed by Vite in your terminal.

> Use the actual scripts and configuration defined in your repository. The commands above assume your project uses the standard Vite and Express setup described here.

---

## 🌐 Local Network Access

To access ClipBridge from another device on the same Wi-Fi network:

1. Find the host computer's IPv4 address.

   ```powershell
   ipconfig
   ```

2. Identify the IPv4 address of the active Wi-Fi adapter.

3. Open the frontend using the host's IP address and Vite's port, for example:

   ```text
   http://192.168.1.25:5173
   ```

4. Ensure the backend is listening on a network-accessible interface and the frontend API configuration directs requests to the host backend.

5. Configure Windows Firewall to allow only the required ports on trusted private networks.

**Important:** The example IP address is illustrative. Use the actual address assigned to your host computer.

When the host server is stopped or unreachable, other devices cannot access its stored content through ClipBridge. This is a self-hosted application, not a cloud service that remains online independently.

---

## 🔐 Security and Privacy

ClipBridge is designed around user-controlled storage and controlled access. Secure deployment requires appropriate safeguards.

- Keep `.env` files, database credentials, and private keys out of version control.
- Validate file types and sizes before accepting uploads.
- Generate unpredictable access keys and store them securely.
- Scope each key to the intended resources and permissions.
- Support expiration and revocation of access keys.
- Prevent unauthorized users from accessing uploaded files directly.
- Validate all API requests on the server, not only in the frontend.
- Avoid exposing MongoDB or unnecessary development ports to the network.
- Use authentication and authorization where required by the application's access model.
- Define a retention policy for historical content and deleted files.

Local-network access alone does not guarantee security. Devices connected to the same network should not automatically be trusted with every stored message or file.

---

## 🤖 Development Workflow

ClipBridge was developed as a full-stack project using the MERN stack, with Code0 incorporated into the development workflow.

Code0 was used as an AI-assisted development tool to support implementation and problem-solving. AI-generated suggestions were reviewed and tested as part of the development process.

Examples of suitable development tasks to document include:

- React component development and interface improvements.
- Express route implementation and REST API debugging.
- MongoDB schema design and database integration.
- File upload handling and local storage integration.
- Refactoring, validation, and test-case development.

**Note:** Update this section to accurately reflect which Code0 features you used, the tasks it actually assisted with, and the tests you personally ran. AI-generated code should be reviewed and understood before submission.

---

## 🔮 Future Improvements

Potential improvements include:

- QR-code-based device connection.
- More granular permissions for individual files and collections.
- Secure user authentication and device management.
- Configurable retention policies and automatic cleanup.
- Transfer progress and resumable large-file uploads.
- File integrity verification using cryptographic hashes.
- Search and filtering across historical content.
- Docker-based installation for easier self-hosting.
- Optional end-to-end encryption for sensitive content.

These are possible future enhancements and are not necessarily part of the current implementation.

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them.
4. Commit your changes with a meaningful message.
5. Open a pull request describing the changes.

Please avoid committing credentials, private files, or uploaded user content.

---

## 📄 License

Choose a license before publishing the repository. If you want others to use, modify, and distribute ClipBridge, consider the [MIT License](https://opensource.org/license/mit).

Add a `LICENSE` file to the repository if you choose MIT or another license.

---

**ClipBridge — Share locally. Store on your own server. Access with permission.**
