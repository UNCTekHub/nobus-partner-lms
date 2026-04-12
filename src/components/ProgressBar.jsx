export default function ProgressBar({ value, max, size = 'md', showLabel = true, color = 'nobus' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colors = {
    nobus: 'bg-nobus-500',
    accent: 'bg-accent-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${colors[color]} ${heights[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1">{pct}% complete</p>
      )}
    </div>
  );
}
