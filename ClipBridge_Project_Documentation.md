# ClipBridge --- Project Documentation

**Tagline:** Your Network. Your Server. Your Files.\
**Project type:** Self-hosted, local-network file and message-sharing
web application\
**Proposed stack:** MongoDB, Express.js, React.js, Node.js (MERN)

> **Project status note:** This document describes the intended design.
> Before submitting the project, update the feature status, API routes,
> environment variables, and screenshots to match the code that is
> actually implemented and tested. Do not describe planned functionality
> as completed.

------------------------------------------------------------------------

## 1. Project Overview

ClipBridge is designed to help people share messages, links, documents,
images, and videos between devices connected to the same local network.
A computer on the network runs the ClipBridge server and stores shared
content, allowing authorized users to retrieve previously shared items
while the server is running.

Unlike a temporary transfer that disappears when the sender disconnects,
ClipBridge is intended to retain shared content on the host computer.
Its distinguishing feature is permission-controlled historical access:
the server owner can issue access keys that grant another person access
to specific content or a defined set of permissions.

The project is intended to be useful for personal devices, small teams,
classrooms, and local environments where users want to transfer files
without depending on a third-party cloud storage service.

## 2. Problem Statement

People often move content between laptops, phones, and tablets using
messaging applications, email, USB drives, or cloud storage. These
approaches may require accounts, internet access, external services,
repeated uploads, or extra steps to retrieve older content.

ClipBridge aims to provide a simple local-network alternative where: -
Devices on the same Wi-Fi network can access a shared web interface. -
Users can send text and upload files to a host-controlled server. -
Previously shared content can be retrieved later, subject to retention
and access rules. - The server owner can control who is allowed to
access selected historical content.

## 3. Goals and Scope

### Primary goals

1.  Provide a responsive web interface that works on desktop and mobile
    browsers.
2.  Support creating, viewing, and retrieving text messages and shared
    files.
3.  Store message records and file metadata in MongoDB.
4.  Store uploaded file contents on the host computer's local disk.
5.  Provide clear API boundaries and maintainable server-side code.
6.  Protect historical content through authorization checks.

### Initial scope

Build a reliable minimum viable product (MVP) first: 1. API health check
and database connection. 2. Create and list text messages. 3. Upload,
list, and download files. 4. Display historical items in the React
interface. 5. Add permission-controlled access keys. 6. Add real-time
updates only after the basic workflow works.

## 4. Intended Features

  -----------------------------------------------------------------------
  Feature                 Purpose                 Suggested status
  ----------------------- ----------------------- -----------------------
  Local-network web       Open ClipBridge from    To verify
  access                  devices on the same     
                          Wi-Fi network           

  Text and link sharing   Save and retrieve short To verify
                          messages and URLs       

  File upload and         Share documents,        To verify
  download                images, and videos      

  Persistent history      Retrieve items stored   To verify
                          earlier on the host     
                          server                  

  Access keys             Grant limited access to To verify
                          selected content        

  Access revocation and   Disable or expire keys  To verify
  expiry                  when no longer needed   

  Real-time updates       Notify connected users  Optional / later
                          when new items arrive   

  Responsive interface    Support desktop and     To verify
                          mobile screen sizes     
  -----------------------------------------------------------------------

Only mark a feature as complete after it has been implemented and
tested.

## 5. Technology Stack

-   **React.js:** Builds the user interface and client-side
    interactions.
-   **Node.js:** Runs the server-side JavaScript application.
-   **Express.js:** Defines REST API endpoints and middleware.
-   **MongoDB:** Stores messages, file metadata, and access-key records.
-   **Mongoose:** Defines schemas and interacts with MongoDB.
-   **Multer:** Handles multipart file uploads.
-   **Socket.IO (optional):** Provides real-time notifications.
-   **Local disk storage:** Stores the actual uploaded file contents on
    the host computer.
-   **Vite:** Runs and builds the React frontend during development.
-   **Git and GitHub:** Track changes and host the source repository.
-   **CodeZero:** Intended to support the AI-assisted development
    workflow required by the assessment. Document only the CodeZero
    tasks actually performed.

## 6. System Architecture

``` text
Phone / Tablet / Laptop Browser
              |
              | HTTP / REST API
              v
        React Frontend
              |
              v
       Express + Node.js
         /           \
        v             v
   MongoDB        Local Uploads
(messages,        (actual file
metadata, keys)    contents)
```

If Socket.IO is implemented, it can be added for real-time events
between the server and connected browsers.

### How a share works

1.  A user opens ClipBridge in a browser.
2.  The user submits a text message or selects a file.
3.  The React client sends the request to the Express API.
4.  The server validates the request and checks permissions.
5.  Text is stored as a database record. For a file, the server stores
    the file on disk and saves its metadata in MongoDB.
6.  Authorized users can view the item and retrieve it later while the
    host server and storage remain available.

## 7. Data Model Proposal

These are suggested schemas; adapt them to the actual implementation.

### Message

-   `content`: message text or shared URL
-   `createdAt`: creation timestamp
-   `createdBy` (optional): user or session identifier
-   `visibility` or `roomId` (optional): scope of the item

### File

-   `originalName`: original uploaded filename
-   `storedName`: server-generated filename used on disk
-   `mimeType`: detected or validated content type
-   `size`: file size in bytes
-   `storagePath`: server-side path or safe storage identifier
-   `createdAt`: upload timestamp
-   `createdBy` (optional): user or session identifier

### AccessKey

-   `keyHash`: hash of the secret key, rather than the raw secret
-   `resourceIds` or `scope`: content the key can access
-   `permissions`: allowed actions, such as view or download
-   `expiresAt` (optional): expiration time
-   `revokedAt` (optional): revocation timestamp
-   `createdAt`: creation timestamp

Access keys should be generated with a cryptographically secure random
generator. Avoid storing raw secrets in the database or logs. Every
protected request must validate the key's scope, permissions, expiry,
and revocation status on the server.

## 8. REST API Proposal

The routes below are a suggested API design, not a claim that these
endpoints already exist.

  ---------------------------------------------------------------------------
  Method                  Endpoint                    Purpose
  ----------------------- --------------------------- -----------------------
  GET                     `/api/health`               Check API and database
                                                      status

  POST                    `/api/messages`             Create a text message

  GET                     `/api/messages`             List messages the
                                                      requester is allowed to
                                                      see

  POST                    `/api/files`                Upload a file

  GET                     `/api/files`                List files the
                                                      requester is allowed to
                                                      see

  GET                     `/api/files/:id/download`   Download an authorized
                                                      file

  POST                    `/api/access-keys`          Create an access key
                                                      with a limited scope

  GET                     `/api/access-keys/:id`      Inspect key metadata,
                                                      if authorized

  DELETE                  `/api/access-keys/:id`      Revoke an access key

  GET                     `/api/access/:key`          Validate a key and
                                                      retrieve permitted
                                                      content
  ---------------------------------------------------------------------------

For production use, avoid placing secret access keys in URLs because
URLs can be recorded in browser history, server logs, and referrer
headers. Prefer an authorization header or a short exchange flow that
converts a key into a limited session token.

## 9. Local Development Setup

### Prerequisites

-   Node.js LTS and npm
-   MongoDB Community Server running locally, or a MongoDB Atlas
    database
-   Git
-   Visual Studio Code
-   CodeZero extension and a supported coding agent, as required by the
    assessment

### Suggested folder structure

``` text
clipbridge/
├── client/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── server.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── services/
│   ├── uploads/
│   ├── .env
│   └── package.json
├── README.md
└── .gitignore
```

This is a target structure. Keep the actual repository consistent with
the files that exist.

### Environment variables

Example `server/.env`:

``` dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/clipbridge
UPLOAD_DIR=uploads
```

For MongoDB Atlas, replace `MONGO_URI` with the correct connection
string and keep credentials private. Never commit `.env` files, database
passwords, access keys, or uploaded private content to GitHub.

### Run the application

Run these commands only if the corresponding `package.json` scripts and
folders have been created.

Terminal 1 --- backend:

``` powershell
cd clipbridge/server
npm install
npm run dev
```

Terminal 2 --- frontend:

``` powershell
cd clipbridge/client
npm install
npm run dev
```

If the frontend uses a Vite proxy, configure `/api` to forward to
`http://127.0.0.1:5000`. Confirm the backend health endpoint in a
browser or API client before testing the frontend.

## 10. Local-Network Access

For other devices on the same Wi-Fi network to connect: 1. Run the
backend and frontend on the host computer. 2. Find the host computer's
private IPv4 address. 3. Configure the development server to listen on
the appropriate network interface. 4. Allow only the required
application ports through Windows Firewall for the trusted private
network. 5. Open the frontend from another device using the host's local
IP address and the frontend port.

Do not expose MongoDB's port to other devices. The application server
should be the only component that connects directly to the database.

**Availability limitation:** the host computer must remain powered on,
the server process must be running, and the stored files must remain
available. Local-network access alone does not make the application
accessible when the host is offline or from outside the network.

## 11. Security, Privacy, and Reliability

-   Validate input and return consistent error responses.
-   Enforce file size limits and an allowlist of file types appropriate
    to the MVP.
-   Generate safe server-side filenames; never trust a user-supplied
    path.
-   Keep uploads outside public static directories and serve downloads
    through an authorization-checked route.
-   Prevent path traversal and unauthorized file access.
-   Rate-limit sensitive endpoints and access-key validation.
-   Use secure, scoped, revocable, and optionally expiring access keys.
-   Do not log secrets or expose environment variables in API responses.
-   Restrict CORS and firewall rules to the intended environment.
-   Provide useful handling for unavailable databases, missing files,
    and oversized uploads.
-   Decide on a retention and deletion policy for stored messages and
    files.
-   Back up important content if it must survive host-disk failure.

For an assessment MVP, clearly document any security limitations that
have not yet been addressed.

## 12. Testing Checklist

Before submission, verify the following items manually or with automated
tests:

-   [ ] Backend starts and reports database connection status.
-   [ ] Invalid requests return clear errors.
-   [ ] A text message can be created and retrieved.
-   [ ] A valid file can be uploaded, listed, and downloaded.
-   [ ] Missing files and invalid IDs are handled safely.
-   [ ] File size and file type restrictions work.
-   [ ] Historical items remain available after restarting the server,
    if persistence is implemented.
-   [ ] Unauthorized or expired access keys are rejected.
-   [ ] Revoked keys no longer grant access, if revocation is
    implemented.
-   [ ] The UI handles loading, empty, success, and error states.
-   [ ] The app works from a second device on the same network, if
    local-network support is implemented.
-   [ ] `.env`, credentials, and private uploads are excluded from Git.
-   [ ] README commands have been tested on a clean setup.

## 13. CodeZero Development Experience

Use this section to record what actually happened during development.
Replace the examples below with your real actions and outcomes.

-   **Task 1 --- \[Actual task\]:** Used CodeZero to help with
    \[specific component or implementation\]. Verified the result by
    \[test or review\].
-   **Task 2 --- \[Actual task\]:** Used CodeZero to help with
    \[specific API or database task\]. Verified the result by \[test or
    review\].
-   **Task 3 --- \[Actual task\]:** Used CodeZero to investigate
    \[specific error\]. Resolved it by \[what changed\] and confirmed
    the fix with \[test\].
-   **Task 4 --- \[Actual task, optional\]:** Used CodeZero to refactor
    \[specific module\]. Checked that \[relevant behavior\] still
    worked.
-   **Task 5 --- \[Actual task, optional\]:** Used CodeZero to help
    prepare or run \[specific tests\]. Recorded the result as
    \[outcome\].

AI assistance does not replace code review or testing. The developer is
responsible for understanding the code, checking generated suggestions,
and validating the final behavior.

## 14. GitHub Submission Checklist

-   [ ] Repository is public and has a clear name, such as `ClipBridge`.
-   [ ] Source code and setup instructions are included.
-   [ ] README accurately describes implemented features.
-   [ ] Meaningful commits document development progress.
-   [ ] Git/GitHub operations were performed using the workflow required
    by StartupMeu.
-   [ ] CodeZero usage is described honestly.
-   [ ] No `.env` files, secrets, credentials, or private uploaded files
    are committed.
-   [ ] Screenshots or a short demo are included if available.
-   [ ] Known limitations and incomplete features are documented.
-   [ ] The application has been tested using the documented setup
    steps.

## 15. Future Improvements

Potential enhancements after the core MVP is stable: - Optional user
accounts and authenticated sessions. - Room-based sharing and
finer-grained permissions. - Search and filters for historical items. -
Configurable retention and automatic cleanup. - File previews and
resumable large uploads. - QR code for opening the local web
interface. - Improved audit history for access-key creation, use, and
revocation. - Optional encrypted transport and stronger deployment
hardening.

These are future ideas unless they have been implemented and verified.

------------------------------------------------------------------------

## Summary

ClipBridge aims to provide a self-hosted way to share and retrieve
messages and files across devices on a local network. The key design
idea is persistent, host-controlled storage combined with
permission-limited access to historical content. The MVP should
prioritize reliable text sharing, file handling, clear API design,
database persistence, and safe authorization before adding optional
real-time or convenience features.
