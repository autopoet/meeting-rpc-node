import { useState, type ChangeEvent, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Users, Clock, Plus } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const ROOMS = [
  { value: 'Conference Room A', label: 'Conference Room A', capacity: '20 seats' },
  { value: 'Conference Room B', label: 'Conference Room B', capacity: '10 seats' },
  { value: 'Small Meeting Room C', label: 'Meeting Room C', capacity: '6 seats' },
  { value: 'Board Room', label: 'Board Room', capacity: '30 seats' },
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
      const msg = err.response?.data?.message || 'Connection failed. Is the server running?';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="glass w-full max-w-lg rounded-2xl p-8 border border-slate-700/60 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">New Booking</h2>
                    <p className="text-xs text-slate-500">Reserve a meeting room</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Organizer & Subject */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> Organizer
                    </label>
                    <input
                      name="organizer"
                      value={form.organizer}
                      onChange={handleChange}
                      required
                      placeholder="Zhang San"
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Participants
                    </label>
                    <input
                      name="participants"
                      type="number"
                      min="1"
                      value={form.participants}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Meeting Subject</label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Q2 Planning Session"
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all"
                  />
                </div>

                {/* Room Select */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Conference Room
                  </label>
                  <select
                    name="roomName"
                    value={form.roomName}
                    onChange={handleChange}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all"
                  >
                    {ROOMS.map(r => (
                      <option key={r.value} value={r.value}>
                        {r.label} — {r.capacity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Start Time
                    </label>
                    <input
                      name="startTime"
                      type="datetime-local"
                      value={form.startTime}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> End Time
                    </label>
                    <input
                      name="endTime"
                      type="datetime-local"
                      value={form.endTime}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
                    >
                      ⚠ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-sky-500/20"
                  >
                    {loading ? 'Checking...' : 'Book Room →'}
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
