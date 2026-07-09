export default function ResultsPanel({ parseResult, closestPair, computeTime }) {
  if (!parseResult) return null;

  const { points, skipped, totalLines } = parseResult;

  const formatDist = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(3)} km`;
    }
    return `${meters.toFixed(2)} m`;
  };

  return (
    <div className="animate-fade-in-up space-y-4">
      {/* Parse Summary */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Parse Summary
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Total Lines" value={totalLines} color="blue" />
          <StatCard label="Valid Points" value={points.length} color="green" />
          <StatCard label="Skipped" value={skipped.length} color="amber" />
          <StatCard
            label="Parcels"
            value={[...new Set(points.map((p) => p.id).filter(Boolean))].length || '—'}
            color="purple"
          />
        </div>

        {skipped.length > 0 && (
          <details className="mt-3">
            <summary className="text-xs text-amber-600 dark:text-amber-400 cursor-pointer hover:underline">
              View {skipped.length} skipped line{skipped.length > 1 ? 's' : ''}
            </summary>
            <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {skipped.map((s, i) => (
                <li
                  key={i}
                  className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded"
                >
                  <span className="font-medium">Line {s.line}:</span> {s.reason}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* Closest Pair */}
      {closestPair && (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Closest Pair
          </h3>

          <div className="space-y-2">
            <div className="bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-950/40 dark:to-brand-900/20 rounded-xl p-4 border border-brand-200/50 dark:border-brand-800/30">
              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-1">Distance</p>
              <p className="text-2xl font-bold text-brand-700 dark:text-brand-300">
                {formatDist(closestPair.distance)}
              </p>
              {closestPair.distance >= 1000 && (
                <p className="text-xs text-brand-500 dark:text-brand-400 mt-0.5">
                  ({closestPair.distance.toFixed(2)} m)
                </p>
              )}
            </div>

            <PointCard
              label="Point A"
              point={closestPair.point1}
              color="emerald"
            />
            <PointCard
              label="Point B"
              point={closestPair.point2}
              color="rose"
            />

            {computeTime != null && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Computed in{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {computeTime < 1 ? '<1' : computeTime.toFixed(1)} ms
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
    green: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
    purple: 'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300',
  };

  return (
    <div className={`rounded-lg px-3 py-2 ${colorMap[color]}`}>
      <p className="text-[11px] opacity-70 font-medium">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function PointCard({ label, point, color }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <div
        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          color === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      />
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{label}{point.id ? ` · ${point.id}` : ''}</p>
        <p className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
          {point.lat.toFixed(6)}, {point.lon.toFixed(6)}
        </p>
      </div>
    </div>
  );
}
