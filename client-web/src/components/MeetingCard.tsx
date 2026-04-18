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
  return new Date(iso).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
}

export function MeetingCard({ meeting, index, onCancel, cancelling }: MeetingCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="group glass rounded-3xl p-6 border border-slate-800/60 hover:border-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/5 transition-all duration-300"
    >
      <div className="flex flex-col gap-5">
        {/* Top: Header Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-500 font-black uppercase leading-none">ID</span>
              <span className="text-base font-black text-sky-400">#{meeting.id}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                  {meeting.subject}
                </h3>
                <StatusBadge startTime={meeting.startTime} endTime={meeting.endTime} />
              </div>
              <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> 预约人：{meeting.organizer}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => onCancel(meeting.id)}
            disabled={cancelling}
            className="p-2.5 rounded-xl text-slate-700 hover:text-red-400 hover:bg-red-400/10 border border-transparent transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom: Meta Info */}
        <div className="grid grid-cols-1 gap-3 pt-4 border-t border-slate-700/30">
          <div className="flex items-center gap-2.5 text-slate-400 text-sm font-medium">
            <MapPin className="w-4 h-4 text-sky-400/80" />
            <span>{meeting.roomName}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400 text-sm font-medium">
            <Users className="w-4 h-4 text-violet-400/80" />
            <span>预计 {meeting.participants} 人参会</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400 text-sm font-medium">
            <Clock className="w-4 h-4 text-amber-400/80" />
            <span>{formatDate(meeting.startTime)} | {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
