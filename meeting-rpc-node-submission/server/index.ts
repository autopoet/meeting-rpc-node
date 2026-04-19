// ============================================================
// MeetingFlow - gRPC Server + REST API Gateway
// Implements: bookMeeting, queryById, queryByOrganizer, cancelMeeting
// ============================================================

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { PrismaClient } from '@prisma/client';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

// ─── Types ───────────────────────────────────────────────────
interface MeetingRecord {
  id: number;
  organizer: string;
  roomName: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  participants: number;
}

// ─── Constants ───────────────────────────────────────────────
const PROTO_PATH = path.resolve(__dirname, '../proto/meeting.proto');
const GRPC_PORT = 50051;
const REST_PORT = 3001;

// ─── Prisma (SQLite) ─────────────────────────────────────────
const prisma = new PrismaClient();

// ─── gRPC Protocol Loading ────────────────────────────────────
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const meetingProto = grpc.loadPackageDefinition(packageDefinition) as any;
const meetingPackage = meetingProto.meeting;

// ─── Helper: Format meeting for gRPC response ─────────────────
function formatMeeting(m: any) {
  return {
    ...m,
    startTime: m.startTime instanceof Date ? m.startTime.toISOString() : m.startTime,
    endTime: m.endTime instanceof Date ? m.endTime.toISOString() : m.endTime,
  };
}

// ─── Helper: Check time overlap ───────────────────────────────
async function detectConflict(roomName: string, startTime: Date, endTime: Date, excludeId?: number) {
  return prisma.meeting.findFirst({
    where: {
      roomName,
      id: excludeId ? { not: excludeId } : undefined,
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });
}

// ─── gRPC Service Implementation ──────────────────────────────
const grpcServer = new grpc.Server();

grpcServer.addService(meetingPackage.MeetingService.service, {

  /**
   * bookMeeting: 预约会议室（含冲突检测）
   */
  bookMeeting: async (call: any, callback: any) => {
    const req = call.request;
    console.log(`[gRPC] bookMeeting → "${req.subject}" by ${req.organizer}`);

    try {
      const startTime = new Date(req.startTime);
      const endTime = new Date(req.endTime);

      // Validate time range
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return callback(null, { success: false, message: 'Invalid date format. Use ISO 8601.', meetingId: -1 });
      }
      if (startTime >= endTime) {
        return callback(null, { success: false, message: 'Start time must be before end time.', meetingId: -1 });
      }

      // Conflict detection
      const conflict = await detectConflict(req.roomName, startTime, endTime);
      if (conflict) {
        console.warn(`[gRPC] ⚠ Conflict: ${req.roomName} is occupied by "${conflict.subject}" (ID ${conflict.id})`);
        return callback(null, {
          success: false,
          message: `Room conflict: "${conflict.subject}" is already scheduled in ${req.roomName} during this time.`,
          meetingId: -1,
        });
      }

      // Persist to database
      const saved = await prisma.meeting.create({
        data: {
          organizer: req.organizer,
          roomName: req.roomName,
          subject: req.subject,
          startTime,
          endTime,
          participants: req.participants,
        },
      });

      console.log(`[gRPC] ✓ Meeting booked — ID: ${saved.id}`);
      callback(null, { success: true, message: 'Meeting booked successfully!', meetingId: saved.id });
    } catch (err: any) {
      console.error(`[gRPC] ✗ bookMeeting error: ${err.message}`);
      callback(null, { success: false, message: `Server error: ${err.message}`, meetingId: -1 });
    }
  },

  /**
   * queryById: 根据 ID 查询会议预约信息
   */
  queryById: async (call: any, callback: any) => {
    const { meetingId } = call.request;
    console.log(`[gRPC] queryById → ID: ${meetingId}`);

    try {
      const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
      if (meeting) {
        console.log(`[gRPC] ✓ Found: "${meeting.subject}"`);
        callback(null, formatMeeting(meeting));
      } else {
        callback({ code: grpc.status.NOT_FOUND, details: `Meeting ID ${meetingId} not found.` });
      }
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, details: err.message });
    }
  },

  /**
   * queryByOrganizer: 根据组织者姓名查询所有会议预约
   */
  queryByOrganizer: async (call: any, callback: any) => {
    const { organizerName } = call.request;
    console.log(`[gRPC] queryByOrganizer → "${organizerName}"`);

    try {
      const meetings = await prisma.meeting.findMany({
        where: { organizer: organizerName },
        orderBy: { startTime: 'asc' },
      });
      console.log(`[gRPC] ✓ Found ${meetings.length} meeting(s) for "${organizerName}"`);
      callback(null, { meetings: meetings.map(formatMeeting) });
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, details: err.message });
    }
  },

  /**
   * cancelMeeting: 取消指定会议预约
   */
  cancelMeeting: async (call: any, callback: any) => {
    const { meetingId } = call.request;
    console.log(`[gRPC] cancelMeeting → ID: ${meetingId}`);

    try {
      await prisma.meeting.delete({ where: { id: meetingId } });
      console.log(`[gRPC] ✓ Meeting ID ${meetingId} cancelled`);
      callback(null, { success: true, message: `Meeting #${meetingId} has been cancelled.` });
    } catch (err: any) {
      console.warn(`[gRPC] Meeting ID ${meetingId} not found`);
      callback(null, { success: false, message: 'Meeting not found or already cancelled.' });
    }
  },
});

// ─── REST API Gateway (for Web Dashboard) ─────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// GET /api/meetings — List all meetings (sorted by startTime)
app.get('/api/meetings', async (req: Request, res: Response) => {
  try {
    const meetings = await prisma.meeting.findMany({ orderBy: { startTime: 'asc' } });
    res.json(meetings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/meetings/stats — Dashboard statistics
app.get('/api/meetings/stats', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const all: MeetingRecord[] = await prisma.meeting.findMany();
    const stats = {
      total: all.length,
      upcoming: all.filter((m: MeetingRecord) => new Date(m.startTime) > now).length,
      ongoing: all.filter((m: MeetingRecord) => new Date(m.startTime) <= now && new Date(m.endTime) >= now).length,
      completed: all.filter((m: MeetingRecord) => new Date(m.endTime) < now).length,
      totalParticipants: all.reduce((sum: number, m: MeetingRecord) => sum + m.participants, 0),
      activeRooms: new Set(all.map((m: MeetingRecord) => m.roomName)).size,
    };
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/meetings/:id — Get single meeting
app.get('/api/meetings/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id'];
    const meeting = await prisma.meeting.findUnique({ where: { id: parseInt(id ?? '0') } });
    if (meeting) res.json(meeting);
    else res.status(404).json({ error: 'Meeting not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meetings — Create new meeting (with conflict detection)
app.post('/api/meetings', async (req: Request, res: Response) => {
  try {
    const { organizer, roomName, subject, startTime, endTime, participants } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format.' });
    }
    if (start >= end) {
      return res.status(400).json({ success: false, message: 'Start time must be before end time.' });
    }

    const conflict = await detectConflict(roomName, start, end);
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Room conflict: "${conflict.subject}" is already scheduled during this time.`,
      });
    }

    const meeting = await prisma.meeting.create({
      data: { organizer, roomName, subject, startTime: start, endTime: end, participants: Number(participants) },
    });

    console.log(`[REST] ✓ New booking via Web — ID: ${meeting.id}, "${meeting.subject}"`);
    res.status(201).json({ success: true, meeting });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/meetings/:id — Cancel a meeting
app.delete('/api/meetings/:id', async (req: Request, res: Response) => {
  try {
    const delId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id'];
    await prisma.meeting.delete({ where: { id: parseInt(delId ?? '0') } });
    res.json({ success: true, message: 'Meeting cancelled.' });
  } catch (err: any) {
    res.status(404).json({ success: false, message: 'Meeting not found.' });
  }
});

// ─── Boot Sequence ─────────────────────────────────────────────
app.listen(REST_PORT, () => {
  console.log(`🌐 REST API Gateway → http://localhost:${REST_PORT}`);
});

grpcServer.bindAsync(
  `0.0.0.0:${GRPC_PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(`[Fatal] gRPC bind failed: ${err.message}`);
      process.exit(1);
    }
    console.log('');
    console.log('  ╔════════════════════════════════════════╗');
    console.log('  ║     MeetingFlow RPC Server  🚀          ║');
    console.log(`  ║   gRPC  → localhost:${GRPC_PORT}            ║`);
    console.log(`  ║   REST  → localhost:${REST_PORT}            ║`);
    console.log(`  ║   Time  → ${new Date().toLocaleTimeString()}              ║`);
    console.log('  ╚════════════════════════════════════════╝');
    console.log('');
  }
);
