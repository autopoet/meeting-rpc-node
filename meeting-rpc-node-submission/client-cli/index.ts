import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import * as p from '@clack/prompts';
import { color } from '@clack/prompts';
import { DateTime } from 'luxon';

const PROTO_PATH = path.resolve(__dirname, '../proto/meeting.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const meetingProto = (grpc.loadPackageDefinition(packageDefinition) as any).meeting;
const client = new meetingProto.MeetingService('localhost:50051', grpc.credentials.createInsecure());

async function main() {
  console.log('\n');
  p.intro(color.bgCyan(color.black(' 会议室预约系统 CLI 管理端 ')));

  while (true) {
    const action = await p.select({
      message: '您想执行什么操作？',
      options: [
        { value: 'book', label: '📅 发起新会议预约' },
        { value: 'query_id', label: '🔍 按 ID 查询预约' },
        { value: 'query_org', label: '👤 按预约人查询列表' },
        { value: 'cancel', label: '❌ 取消现有预约' },
        { value: 'exit', label: '🚪 退出系统' },
      ],
    });

    if (p.isCancel(action) || action === 'exit') {
        p.outro(color.yellow('感谢使用，再见！'));
        break;
    }

    if (action === 'book') {
      const form = await p.group({
        organizer: () => p.text({ message: '请输入预约人姓名：', placeholder: '例如：张三' }),
        subject: () => p.text({ message: '请输入会议主题：', placeholder: '例如：架构讨论' }),
        roomName: () => p.select({
          message: '请选择会议室：',
          options: [
            { value: 'A号会议室 (20人)', label: 'A号会议室' },
            { value: 'B号会议室 (10人)', label: 'B号会议室' },
            { value: '董事会会议室 (30人)', label: '董事会会议室' },
            { value: '小会议室 C (6人)', label: '小会议室 C' },
          ],
        }),
        startTime: () => p.text({ message: '开始时间 (格式: YYYY-MM-DD HH:mm)：', placeholder: DateTime.now().toFormat('yyyy-MM-dd HH:mm') }),
        endTime: () => p.text({ message: '结束时间 (格式: YYYY-MM-DD HH:mm)：', placeholder: DateTime.now().plus({ hours: 1 }).toFormat('yyyy-MM-dd HH:mm') }),
        participants: () => p.text({ message: '参会人数：', placeholder: '5' }),
      });

      const s = p.spinner();
      s.start('正在进行冲突检测并提交预约...');
      
      const startIso = DateTime.fromFormat(form.startTime as string, 'yyyy-MM-dd HH:mm').toISO();
      const endIso = DateTime.fromFormat(form.endTime as string, 'yyyy-MM-dd HH:mm').toISO();

      client.bookMeeting({ ...form, startTime: startIso, endTime: endIso, participants: parseInt(form.participants as string) }, (err: any, response: any) => {
        s.stop();
        if (err) p.note(color.red('错误：' + err.message), '提交失败');
        else if (response.success) p.note(color.green('预约成功！ID 为: ' + response.meeting.id), '完成');
        else p.note(color.red('预约冲突：' + response.message), '冲突');
      });
      await new Promise(r => setTimeout(r, 1000));
    }

    if (action === 'query_id') {
      const id = await p.text({ message: '请输入会议 ID：' });
      client.queryById({ id: parseInt(id as string) }, (err: any, response: any) => {
        if (err || !response.subject) p.note(color.red('未找到该 ID 的会议。'), '查询失败');
        else p.note(JSON.stringify(response, null, 2), `查询结果 #${response.id}`);
      });
      await new Promise(r => setTimeout(r, 1000));
    }

    if (action === 'query_org') {
        const org = await p.text({ message: '请输入预约人姓名：' });
        client.queryByOrganizer({ organizer: org as string }, (err: any, response: any) => {
          if (err || !response.meetings) p.note(color.red('查询失败。'), '错误');
          else p.note(`${response.meetings.length} 场相关的会议记录`, '查询成功');
        });
        await new Promise(r => setTimeout(r, 1000));
    }

    if (action === 'cancel') {
        const id = await p.text({ message: '请输入要取消的会议 ID：' });
        const confirm = await p.confirm({ message: `确定要取消 #${id} 吗？` });
        if (confirm) {
            client.cancelMeeting({ id: parseInt(id as string) }, (err: any, response: any) => {
              if (err || !response.success) p.note(color.red('取消失败：' + (err?.message || response?.message)), '错误');
              else p.note(color.green('会议已成功取消。'), '成功');
            });
        }
        await new Promise(r => setTimeout(r, 1000));
    }
  }
}

main().catch(console.error);
