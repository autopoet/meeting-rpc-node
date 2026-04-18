import { motion } from 'framer-motion';

import { MapPin, Users, Clock, Trash2, User } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface Meeting {
  id: number;
  organizer: string;
  roomName: string;
  subject: string;
  startTime: string;
  endTime: string;
  participants: number;
}

interface MeetingCardProps {
  meeting: Meeting;
  index: number;
  onCancel: (id: number) => void;
  cancelling: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function MeetingCard({ meeting, index, onCancel, cancelling }: MeetingCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, scale: 0.96 }}
      transition={{ delay: index * 0.05 }}
      className="group glass rounded-2xl p-5 border border-slate-800/60 hover:border-sky-500/25 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: ID badge + info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* ID Badge */}
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/50 flex flex-col items-center justify-center">
            <span className="text-[9px] text-slate-600 font-bold uppercase leading-none">ID</span>
            <span className="text-sm font-bold text-sky-400 leading-tight">#{meeting.id}</span>
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <h3 className="text-base font-semibold text-white truncate group-hover:text-sky-300 transition-colors">
                {meeting.subject}
              </h3>
              <StatusBadge startTime={meeting.startTime} endTime={meeting.endTime} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400/70 flex-shrink-0" />
                {meeting.roomName}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-violet-400/70 flex-shrink-0" />
                {meeting.participants} attendees
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" />
                {formatDate(meeting.startTime)} · {formatTime(meeting.startTime)} → {formatTime(meeting.endTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Organizer + Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-600 uppercase tracking-wider">Organizer</p>
            <p className="text-sm font-medium text-slate-300 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-500" />
              {meeting.organizer}
            </p>
          </div>

          <button
            onClick={() => onCancel(meeting.id)}
            disabled={cancelling}
            className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-600 hover:border-red-500/20 border border-transparent transition-all"
            title="Cancel booking"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
