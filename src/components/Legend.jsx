export default function Legend() {
  const items = [
    { color: 'bg-brand-500', label: 'Boundary Points' },
    { color: 'bg-emerald-500', label: 'Closest Point A' },
    { color: 'bg-rose-500', label: 'Closest Point B' },
    { color: 'bg-amber-400', shape: 'line', label: 'Closest Pair Line' },
    { color: 'bg-brand-300', shape: 'area', label: 'Parcel Polygon' },
  ];

  return (
    <div className="animate-fade-in-up">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        Legend
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            {item.shape === 'line' ? (
              <div className="w-4 h-0.5 rounded-full bg-amber-400" />
            ) : item.shape === 'area' ? (
              <div className="w-4 h-3 rounded-sm bg-brand-300/40 border border-brand-400/60" />
            ) : (
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
            )}
            <span className="text-xs text-slate-600 dark:text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
