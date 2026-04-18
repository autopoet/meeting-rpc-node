import { useState, type ChangeEvent, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Users, Clock, Plus } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const ROOMS = [
  { value: 'A号会议室 (20人)', label: 'A号会议室', capacity: '20座' },
  { value: 'B号会议室 (10人)', label: 'B号会议室', capacity: '10座' },
  { value: '董事会会议室 (30人)', label: '董事会会议室', capacity: '30座' },
  { value: '小会议室 C (6人)', label: '小会议室 C', capacity: '6座' },
];

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  organizer: string;
  subject: string;
  roomName: string;
  startTime: string;
  endTime: string;
  participants: string;
}

export function BookingModal({ isOpen, onClose, onSuccess }: BookingModalProps) {
  const [form, setForm] = useState<FormData>({
    organizer: '',
    subject: '',
    roomName: ROOMS[0]?.value ?? '',
    startTime: '',
    endTime: '',
    participants: '5',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_BASE}/meetings`, {
        ...form,
        participants: parseInt(form.participants),
      });

      if (res.data.success) {
        onSuccess();
        onClose();
        setForm({ organizer: '', subject: '', roomName: ROOMS[0]?.value ?? '', startTime: '', endTime: '', participants: '5' });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || '连接服务器失败，请检查后端程序。';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="glass w-full max-w-lg rounded-3xl p-8 border border-slate-700/60 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">发起会议预约</h2>
                    <p className="text-xs text-slate-500 font-bold tracking-widest mt-0.5">RESERVE A ROOM</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-700/50 text-slate-500 hover:text-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2.5 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-sky-400" /> 预约人姓名
                    </label>
                    <input
                      name="organizer"
                      value={form.organizer}
                      onChange={handleChange}
                      required
                      placeholder="例如：张三"
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all placeholder-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2.5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-violet-400" /> 参会人数
                    </label>
                    <input
                      name="participants"
                      type="number"
                      min="1"
                      value={form.participants}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2.5">会议主题 / 事项</label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    placeholder="请输入会议讨论的核心内容"
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all placeholder-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2.5 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> 选择会议室
                  </label>
                  <select
                    name="roomName"
                    value={form.roomName}
                    onChange={handleChange}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all cursor-pointer"
                  >
                    {ROOMS.map(r => (
                      <option key={r.value} value={r.value}>
                        {r.label} — {r.capacity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2.5 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> 开始时间
                    </label>
                    <input
                      name="startTime"
                      type="datetime-local"
                      value={form.startTime}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2.5 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> 结束时间
                    </label>
                    <input
                      name="endTime"
                      type="datetime-local"
                      value={form.endTime}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-bold">
                    提醒：{error}
                  </motion.div>
                )}

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-slate-700/50 text-slate-400 hover:text-white font-bold transition-all">
                    取消
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-black transition-all shadow-lg shadow-sky-500/20">
                    {loading ? '冲突检测中...' : '立即提交预约'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
