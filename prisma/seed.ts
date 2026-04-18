import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding meeting data...');

  // 1. Clear existing
  await prisma.meeting.deleteMany();

  const now = new Date();

  const sampleMeetings = [
    {
      organizer: 'Alice Johnson',
      roomName: 'Conference Room A',
      subject: 'Quarterly Strategy Planning',
      startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),  // 1 hour ago
      participants: 12,
    },
    {
      organizer: 'Bob Chen',
      roomName: 'Board Room',
      subject: 'Urgent System Architecture Review',
      startTime: new Date(now.getTime() - 30 * 60 * 1000),    // 30 mins ago
      endTime: new Date(now.getTime() + 60 * 60 * 1000),     // 1 hour later (ONGOING)
      participants: 8,
    },
    {
      organizer: 'Zhang San',
      roomName: 'Conference Room B',
      subject: 'Interview: Frontend Lead Candidate',
      startTime: new Date(now.getTime() + 1 * 60 * 60 * 1000), // 1 hour later
      endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),  // 2 hours later
      participants: 4,
    },
    {
      organizer: 'Emma Wilson',
      roomName: 'Small Meeting Room C',
      subject: 'Weekly Team Sync (Design)',
      startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(now.getTime() + 25 * 60 * 60 * 1000),
      participants: 6,
    },
  ];

  for (const m of sampleMeetings) {
    await prisma.meeting.create({ data: m });
  }

  console.log('✅ Seed successful! 4 meetings created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
