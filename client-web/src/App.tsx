import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  RefreshCcw,
  Plus,
  Search,
  ServerCrash,
  CalendarX2,
  LayoutDashboard,
  CalendarDays,
} from 'lucide-react';

import { MeetingCard } from './components/MeetingCard';
import { StatsBar } from './components/StatsBar';
import { BookingModal } from './components/BookingModal';

// ─── Types ────────────────────────────────────────────────────
interface Meeting {
  id: number;
  organizer: string;
  roomName: string;
  subject: string;
  startTime: string;
  endTime: string;
  participants: number;
}

interface Stats {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  totalParticipants: number;
  activeRooms: number;
}

const API_BASE = 'http://localhost:3001/api';

// ─── App ──────────────────────────────────────────────────────
export default function App() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setStatsLoading(true);
    setError(null);

    try {
      const [meetingsRes, statsRes] = await Promise.all([
        axios.get<Meeting[]>(`${API_BASE}/meetings`),
        axios.get<Stats>(`${API_BASE}/meetings/stats`),
      ]);
      setMeetings(meetingsRes.data);
      setStats(statsRes.data);
    } catch {
      setError('无法连接到服务器。请确保后端服务 (npm run server) 已启动。');
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleCancel = async (id: number) => {
    if (!window.confirm(`确定取消编号为 #${id} 的会议预约吗？此操作无法撤销。`)) return;
    setCancellingId(id);
    try {
      await axios.delete(`${API_BASE}/meetings/${id}`);
      setMeetings(prev => prev.filter(m => m.id !== id));
      setStats(prev => prev ? { ...prev, total: prev.total - 1 } : null);
    } catch {
      alert('操作失败，请重试。');
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = meetings.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.subject.toLowerCase().includes(q) ||
      m.organizer.toLowerCase().includes(q) ||
      m.roomName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-200 font-sans">
      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 h-full w-[80px] flex flex-col items-center py-8 gap-10 bg-[#0c1120]/80 backdrop-blur-3xl border-r border-slate-800/50 z-30 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center shadow-lg shadow-sky-500/20 flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="3">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </div>

        <nav className="flex flex-col gap-6 mt-4">
          <button className="p-3.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-inner" title="概览仪表盘">
            <LayoutDashboard className="w-6 h-6" />
          </button>
          <button className="p-3.5 rounded-2xl text-slate-600 hover:text-slate-300 hover:bg-slate-800/60 transition-all" title="预约记录">
            <CalendarDays className="w-6 h-6" />
          </button>
        </nav>

        <div className="mt-auto mb-4 flex flex-col items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{error ? '离线' : '服务正常'}</span>
        </div>
      </aside>

      {/* ── Main (WIDER CONTAINER) ────────────────────── */}
      <main className="ml-[80px] flex-1 p-8 md:p-12 max-w-7xl mx-auto w-full">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl md:text-4xl font-black text-white tracking-tight">
              会议室预约看板
            </motion.h1>
            <p className="text-slate-500 font-bold text-sm mt-2 tracking-wide uppercase">Real-time room management dashboard</p>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={fetchAll} disabled={loading} className="p-3.5 rounded-2xl border border-slate-700/50 hover:bg-slate-800/40 text-slate-400 hover:text-white transition-all shadow-sm">
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-black shadow-xl shadow-sky-500/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-5 h-5" />
              新建会议预约
            </button>
          </div>
        </header>

        {/* Stats */}
        <StatsBar stats={stats} loading={statsLoading} />

        {/* Search + Section Header */}
        <section>
          <div className="flex items-center justify-between mb-8 gap-6 flex-wrap">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-8 h-px bg-slate-800"></span>
              当前预约记录
              {!loading && (
                <span className="text-slate-700 font-bold lowercase tracking-normal bg-slate-800/50 px-2 py-0.5 rounded-md">
                  {filtered.length}
                </span>
              )}
            </h2>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600 group-focus-within:text-sky-400 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索主题、预约人或会议室..."
                className="pl-12 pr-6 py-3.5 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-sky-500/40 focus:ring-4 focus:ring-sky-500/5 w-80 transition-all"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 mb-8 font-bold text-sm">
                <ServerCrash className="w-6 h-6" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && !error && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-slate-700">
              <CalendarX2 className="w-16 h-16 mb-6 opacity-30 stroke-[1]" />
              <p className="text-lg font-bold">没有找到相关的会议记录</p>
              {!search && <p className="text-sm mt-2 opacity-50 font-medium">点击“新建会议预约”开始添加第一个行程</p>}
            </motion.div>
          )}

          {/* Loading Grid */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map(i => (
                <div key={i} className="glass rounded-3xl p-6 h-64 animate-pulse border border-slate-800/60" />
              ))}
            </div>
          )}

          {/* 🌟 MEETING CARDS GRID VIEW */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((meeting, idx) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    index={idx}
                    onCancel={handleCancel}
                    cancelling={cancellingId === meeting.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchAll} />
    </div>
  );
}
