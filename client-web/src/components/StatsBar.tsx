import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, CheckCircle2 } from 'lucide-react';

interface Stats {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  totalParticipants: number;
  activeRooms: number;
}

interface StatsBarProps {
  stats: Stats | null;
  loading: boolean;
}

const statItems = (s: Stats) => [
  { label: 'Total Bookings', value: s.total, icon: Calendar, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  { label: 'Active Rooms', value: s.activeRooms, icon: MapPin, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  { label: 'Total Participants', value: s.totalParticipants, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { label: 'Completed', value: s.completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
];

export function StatsBar({ stats, loading }: StatsBarProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="glass rounded-2xl p-5 animate-pulse border border-slate-800/60">
            <div className="h-3 w-20 bg-slate-700/50 rounded mb-3" />
            <div className="h-8 w-12 bg-slate-700/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      {statItems(stats).map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass rounded-2xl p-5 border border-slate-800/60"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
              <p className="text-3xl font-bold text-white tabular-nums">{item.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl border ${item.bg}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
