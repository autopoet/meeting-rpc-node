import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 正在注入演示数据...');

  // 1. 清理旧数据
  await prisma.meeting.deleteMany();

  const now = new Date();

  const sampleMeetings = [
    {
      organizer: '爱丽丝',
      roomName: 'A号会议室 (20人)',
      subject: 'Q2 季度战略规划会议',
      startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2小时前
      endTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),  // 1小时前
      participants: 12,
    },
    {
      organizer: '陈博文',
      roomName: '董事会会议室 (30人)',
      subject: '紧急系统架构评审',
      startTime: new Date(now.getTime() - 30 * 60 * 1000),    // 30分钟前
      endTime: new Date(now.getTime() + 60 * 60 * 1000),     // 1小时后 (进行中)
      participants: 8,
    },
    {
      organizer: '张三',
      roomName: 'B号会议室 (10人)',
      subject: '前端开发负责人面试',
      startTime: new Date(now.getTime() + 1 * 60 * 60 * 1000), // 1小时后
      endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),  // 2小时后
      participants: 4,
    },
    {
      organizer: '李华',
      roomName: '小会议室 C (6人)',
      subject: '每周设计周会',
      startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 明天
      endTime: new Date(now.getTime() + 25 * 60 * 60 * 1000),
      participants: 6,
    },
    {
      organizer: '王五',
      roomName: '董事会会议室 (30人)',
      subject: '产品迭代讨论会 - V2.0',
      startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 后天
      endTime: new Date(now.getTime() + 50 * 60 * 60 * 1000),
      participants: 15,
    },
  ];

  for (const m of sampleMeetings) {
    await prisma.meeting.create({ data: m });
  }

  console.log('✅ 注入成功！已创建 5 条中文会议数据。');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
