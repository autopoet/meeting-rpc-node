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
  BookMarked,
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

  // Fetch list + stats
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
      setError('Cannot connect to server. Please run `npm run server` first.');
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Cancel / Delete
  const handleCancel = async (id: number) => {
    if (!window.confirm(`Cancel booking #${id}? This cannot be undone.`)) return;
    setCancellingId(id);
    try {
      await axios.delete(`${API_BASE}/meetings/${id}`);
      setMeetings(prev => prev.filter(m => m.id !== id));
      setStats(prev => prev ? { ...prev, total: prev.total - 1 } : null);
    } catch {
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  // Filtered list
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
      <aside className="fixed left-0 top-0 h-full w-[72px] flex flex-col items-center py-6 gap-8 bg-[#0c1120]/80 backdrop-blur-xl border-r border-slate-800/50 z-30">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center shadow-lg shadow-sky-500/20 flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </div>

        {/* Nav Icons */}
        <nav className="flex flex-col gap-5 mt-2">
          <button className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25" title="Dashboard">
            <LayoutDashboard className="w-5 h-5" />
          </button>
          <button className="p-2.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all" title="Bookings">
            <BookMarked className="w-5 h-5" />
          </button>
        </nav>

        {/* Status dot */}
        <div className="mt-auto mb-2 flex flex-col items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="text-[9px] text-slate-600 uppercase tracking-widest">{error ? 'Offline' : 'Live'}</span>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="ml-[72px] flex-1 p-6 md:p-10 max-w-6xl w-full">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-3xl font-bold text-white tracking-tight"
            >
              Meeting Dashboard
            </motion.h1>
            <p className="text-slate-500 text-sm mt-1">Real-time gRPC-powered room management</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-700/50 hover:border-slate-600 text-slate-400 hover:text-white transition-all"
              title="Refresh"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold shadow-lg shadow-sky-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </button>
          </div>
        </header>

        {/* Stats */}
        <StatsBar stats={stats} loading={statsLoading} />

        {/* Search + list section */}
        <section>
          <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
              All Reservations
              {!loading && (
                <span className="ml-2 text-slate-600 font-normal normal-case tracking-normal">
                  ({filtered.length} shown)
                </span>
              )}
            </h2>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by subject, organizer, or room..."
                className="pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 w-64 transition-all"
              />
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 mb-6"
              >
                <ServerCrash className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-slate-600"
            >
              <CalendarX2 className="w-12 h-12 mb-4 opacity-40" />
              <p className="text-base font-medium">
                {search ? 'No meetings match your search.' : 'No bookings yet.'}
              </p>
              {!search && (
                <p className="text-sm mt-1 opacity-60">
                  Click "New Booking" or use the CLI to add one.
                </p>
              )}
            </motion.div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="glass rounded-2xl p-5 animate-pulse border border-slate-800/60 h-20" />
              ))}
            </div>
          )}

          {/* Meeting cards */}
          {!loading && (
            <div className="space-y-3">
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

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAll}
      />
    </div>
  );
}
