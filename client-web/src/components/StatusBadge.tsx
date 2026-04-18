
interface StatusBadgeProps {
  startTime: string;
  endTime: string;
}

export function StatusBadge({ startTime, endTime }: StatusBadgeProps) {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  let label: string;
  let classes: string;

  if (now < start) {
    label = '待开始';
    classes = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  } else if (now >= start && now <= end) {
    label = '运行中';
    classes = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse';
  } else {
    label = '已结束';
    classes = 'bg-slate-500/15 text-slate-500 border-slate-600/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${classes}`}>
      {now >= start && now <= end && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
      )}
      {label}
    </span>
  );
}
