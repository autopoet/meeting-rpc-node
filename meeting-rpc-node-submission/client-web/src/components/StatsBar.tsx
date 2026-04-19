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
  { label: '预约总数', value: s.total, icon: Calendar, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  { label: '可用房间', value: s.activeRooms, icon: MapPin, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  { label: '累计参会人数', value: s.totalParticipants, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { label: '已完成会议', value: s.completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
];

export function StatsBar({ stats, loading }: StatsBarProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="glass rounded-3xl p-6 animate-pulse border border-slate-800/60">
            <div className="h-3 w-20 bg-slate-700/50 rounded mb-4" />
            <div className="h-10 w-16 bg-slate-700/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
      {statItems(stats).map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 }}
          className="glass rounded-3xl p-6 border border-slate-800/60 hover:bg-slate-800/20 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 group-hover:text-slate-400 transition-colors">
                {item.label}
              </p>
              <p className="text-4xl font-black text-white tabular-nums tracking-tight">{item.value}</p>
            </div>
            <div className={`p-3.5 rounded-2xl border ${item.bg}`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
