# MeetingFlow

> A professional meeting room booking system built with **gRPC**, **TypeScript**, **Node.js**, and **React**.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![gRPC](https://img.shields.io/badge/gRPC-Proto3-orange?logo=grpc)](https://grpc.io)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## ✨ Features

- 🔌 **gRPC Communication** — All 4 core RPC methods implemented in strict Proto3: `bookMeeting`, `queryById`, `queryByOrganizer`, `cancelMeeting`
- 🛡️ **Smart Conflict Detection** — Automatically rejects overlapping bookings for the same room with clear error messages
- 💻 **Interactive CLI Client** — A beautiful terminal client using `@clack/prompts` with spinners and color output
- 🖥️ **Premium Web Dashboard** — A minimalist dark-mode React UI with:
  - Real-time statistics (total bookings, active rooms, participants)
  - One-click booking modal with form validation
  - Live search and filter across all fields
  - Automatic status badges (Upcoming / Ongoing / Completed)
  - Auto-refresh every 30 seconds
- 💾 **Persistent Storage** — SQLite database via Prisma ORM
- 🌐 **REST API Gateway** — Express HTTP bridge for browser compatibility

## 🏗️ Architecture

```
┌─────────────────────┐    gRPC (port 50051)    ┌──────────────────────────┐
│   CLI Client        │ ──────────────────────▶ │                          │
│ (client-cli/)       │                         │    gRPC Server           │
└─────────────────────┘                         │    (server/index.ts)     │
                                                │                          │
┌─────────────────────┐    HTTP (port 3001)     │    + REST API Gateway    │
│   Web Dashboard     │ ──────────────────────▶ │      (Express)           │
│ (client-web/)       │                         │                          │
└─────────────────────┘                         └──────────┬───────────────┘
                                                           │ Prisma ORM
                                                           ▼
                                                   ┌──────────────┐
                                                   │  SQLite DB   │
                                                   │  (prisma/    │
                                                   │   dev.db)    │
                                                   └──────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm** v8 or higher

### 1. Clone & Install

```bash
git clone https://github.com/your-username/meeting-rpc-node.git
cd meeting-rpc-node

# Install root dependencies (server + CLI)
npm install

# Install web dashboard dependencies
npm install --prefix client-web
```

### 2. Initialize Database

```bash
npm run db:migrate
```

### 3. Run (choose your mode)

**Start everything at once (recommended):**
```bash
npm run dev
```

**Or start individually:**
```bash
# Terminal 1: Start gRPC server + REST gateway
npm run server

# Terminal 2: Start web dashboard
npm run web:dev

# Terminal 3: Start interactive CLI
npm run cli
```

### 4. Access

| Service | URL |
|---|---|
| Web Dashboard | http://localhost:5173 |
| REST API | http://localhost:3001/api/meetings |
| gRPC Server | localhost:50051 |

## 📡 RPC Interface Reference

All interfaces defined in [`proto/meeting.proto`](proto/meeting.proto):

| Method | Request | Response | Description |
|---|---|---|---|
| `BookMeeting` | `Meeting` | `BookResponse` | Create booking with conflict check |
| `QueryById` | `QueryByIdRequest` | `Meeting` | Get single booking by ID |
| `QueryByOrganizer` | `QueryByOrganizerRequest` | `MeetingList` | Get all bookings by organizer |
| `CancelMeeting` | `CancelMeetingRequest` | `CancelResponse` | Delete a booking |

### Meeting Data Model

```protobuf
message Meeting {
  int32  id           = 1;  // Auto-generated unique ID
  string organizer    = 2;  // Organizer's name
  string roomName     = 3;  // Room identifier
  string subject      = 4;  // Meeting topic
  string startTime    = 5;  // ISO 8601 datetime
  string endTime      = 6;  // ISO 8601 datetime
  int32  participants = 7;  // Number of attendees
}
```

## 📁 Project Structure

```
meeting-rpc-node/
├── proto/
│   └── meeting.proto          # gRPC interface definition
├── server/
│   └── index.ts               # gRPC server + REST API gateway
├── client-cli/
│   └── index.ts               # Interactive terminal client
├── client-web/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookingModal.tsx
│   │   │   ├── MeetingCard.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
├── prisma/
│   └── schema.prisma          # Database schema
├── docs/
│   └── design.md              # Architecture & design doc
└── package.json
```

## 🔧 Troubleshooting

**Server won't start:**
- Ensure the database is initialized: `npm run db:migrate`
- Check that port `50051` and `3001` are not in use

**Web dashboard shows "Cannot connect":**
- Make sure `npm run server` is running first
- Check CORS: the server must be at `http://localhost:3001`

**CLI shows RPC error:**
- The gRPC server must be running on `localhost:50051`
- Run `npm run server` in a separate terminal

---

*Course project — Xidian University · Computer Networks & Distributed Systems*
