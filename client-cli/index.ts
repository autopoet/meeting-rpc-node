import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { DateTime } from 'luxon';

// Load Proto
const PROTO_PATH = path.resolve(__dirname, '../proto/meeting.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const meetingProto = grpc.loadPackageDefinition(packageDefinition) as any;
const client = new meetingProto.meeting.MeetingService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

/**
 * Promisified RPC Calls
 */
const bookMeeting = (meeting: any) => new Promise((resolve, reject) => {
  client.bookMeeting(meeting, (err: any, response: any) => err ? reject(err) : resolve(response));
});

const queryById = (meetingId: number) => new Promise((resolve, reject) => {
  client.queryById({ meetingId }, (err: any, response: any) => err ? reject(err) : resolve(response));
});

const queryByOrganizer = (organizerName: string) => new Promise((resolve, reject) => {
  client.queryByOrganizer({ organizerName }, (err: any, response: any) => err ? reject(err) : resolve(response));
});

const cancelMeeting = (meetingId: number) => new Promise((resolve, reject) => {
  client.cancelMeeting({ meetingId }, (err: any, response: any) => err ? reject(err) : resolve(response));
});

async function main() {
  p.intro(`${pc.bgBlue(pc.white(' MeetingFlow RPC Client '))}`);

  while (true) {
    const action = await p.select({
      message: 'What would you like to do?',
      options: [
        { value: 'book', label: '📅 Book a Meeting', hint: 'Schedule new meeting' },
        { value: 'query_id', label: '🔍 Query by ID', hint: 'Find specific booking' },
        { value: 'query_org', label: '👤 Query by Organizer', hint: 'List for a person' },
        { value: 'cancel', label: '❌ Cancel Meeting', hint: 'Remove a booking' },
        { value: 'exit', label: '👋 Exit', hint: 'Bye' },
      ],
    });

    if (p.isCancel(action) || action === 'exit') break;

    try {
      if (action === 'book') {
        const data = await p.group({
          organizer: () => p.text({ message: 'Organizer Name', placeholder: 'e.g. Zhang San' }),
          subject: () => p.text({ message: 'Meeting Subject', placeholder: 'e.g. Design Sync' }),
          roomName: () => p.select({
            message: 'Select Room',
            options: [
              { value: 'Room A (Grand)', label: 'Room A' },
              { value: 'Room B (Medium)', label: 'Room B' },
              { value: 'Room C (Small)', label: 'Room C' },
            ]
          }),
          participants: () => p.text({ message: 'Participant Count', placeholder: 'e.g. 5' }),
          startTime: () => p.text({ message: 'Start Time (YYYY-MM-DD HH:mm)', placeholder: '2026-04-20 14:00' }),
          endTime: () => p.text({ message: 'End Time (YYYY-MM-DD HH:mm)', placeholder: '2026-04-20 15:30' }),
        });

        const s = p.spinner();
        s.start('Connecting to RPC Server...');
        
        const res: any = await bookMeeting({
          ...data,
          participants: parseInt(data.participants as string),
          startTime: DateTime.fromFormat(data.startTime as string, 'yyyy-MM-dd HH:mm').toISO(),
          endTime: DateTime.fromFormat(data.endTime as string, 'yyyy-MM-dd HH:mm').toISO(),
        });

        s.stop(res.success ? 'Request Processed' : 'Request Failed');

        if (res.success) {
          p.note(`Meeting ID: ${pc.green(res.meetingId)}\nMessage: ${res.message}`, 'Success');
        } else {
          p.cancel(`Error: ${pc.red(res.message)}`);
        }
      }

      if (action === 'query_id') {
        const id = await p.text({ message: 'Enter Meeting ID' });
        if (p.isCancel(id)) continue;

        const res: any = await queryById(parseInt(id as string));
        p.note(
          `Subject: ${pc.cyan(res.subject)}\nRoom: ${res.roomName}\nTime: ${DateTime.fromISO(res.startTime).toLocaleString(DateTime.DATETIME_MED)}`,
          `Booking Details`
        );
      }

      if (action === 'query_org') {
        const name = await p.text({ message: 'Organizer Name' });
        if (p.isCancel(name)) continue;

        const res: any = await queryByOrganizer(name as string);
        if (res.meetings.length === 0) {
          p.log.warn('No meetings found for this organizer.');
        } else {
          const list = res.meetings.map((m: any) => `[ID: ${m.id}] ${m.subject} (${m.roomName})`).join('\n');
          p.note(list, `Meetings for ${name}`);
        }
      }

      if (action === 'cancel') {
        const id = await p.text({ message: 'Enter Meeting ID to Cancel' });
        if (p.isCancel(id)) continue;

        const res: any = await cancelMeeting(parseInt(id as string));
        if (res.success) p.log.success(res.message);
        else p.log.error(res.message);
      }

    } catch (err: any) {
      p.log.error(`RPC Error: ${err.message || 'Unknown error'}`);
    }
  }

  p.outro('Thank you for using MeetingFlow!');
}

main().catch(console.error);
