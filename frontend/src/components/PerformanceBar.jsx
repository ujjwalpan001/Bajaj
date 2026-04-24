/**
 * PerformanceBar.jsx
 * Shows execution time (from backend), total nodes processed,
 * edges, and other performance metrics in a sleek horizontal bar.
 */
export default function PerformanceBar({ data }) {
  const execTime  = data?.execution_time_ms ?? null;
  const nodeCount = countNodes(data?.hierarchies ?? []);
  const edgeCount = countEdges(data?.hierarchies ?? []);
  const totalInput = (data?.hierarchies?.length ?? 0) +
                     (data?.invalid_entries?.length ?? 0) +
                     (data?.duplicate_edges?.length ?? 0);

  const speed = execTime !== null
    ? execTime < 5   ? { label: "Blazing Fast", color: "text-emerald-500", icon: "⚡" }
    : execTime < 20  ? { label: "Very Fast",    color: "text-green-500",   icon: "🚀" }
    : execTime < 100 ? { label: "Fast",         color: "text-blue-500",    icon: "🏃" }
    :                  { label: "Good",         color: "text-amber-500",   icon: "✅" }
    : null;

  const metrics = [
    { label: "Execution", value: execTime !== null ? `${execTime} ms` : "—", icon: "⏱", color: "text-brand-600 dark:text-brand-400" },
    { label: "Nodes",     value: nodeCount,  icon: "●", color: "text-purple-600 dark:text-purple-400" },
    { label: "Edges",     value: edgeCount,  icon: "→", color: "text-teal-600 dark:text-teal-400" },
    { label: "Trees",     value: data?.summary?.total_trees ?? 0, icon: "🌳", color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Cycles",    value: data?.summary?.total_cycles ?? 0, icon: "🔄", color: "text-red-600 dark:text-red-400" },
  ];

  return (
    <div className="glass-card px-5 py-4 flex items-center justify-between flex-wrap gap-4 animate-slide-up">
      {/* Speed label */}
      {speed && (
        <div className="flex items-center gap-2">
          <span className="text-xl">{speed.icon}</span>
          <div>
            <p className={`text-sm font-bold ${speed.color}`}>{speed.label}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Performance</p>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="flex items-center gap-6 flex-wrap">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col items-center gap-0.5">
            <span className={`text-base font-extrabold font-mono ${m.color}`}>
              {m.icon} {m.value}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium">
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar for execution time (relative, max 200ms) */}
      {execTime !== null && (
        <div className="hidden lg:flex flex-col gap-1 min-w-[120px]">
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-700"
              style={{ width: `${Math.min((execTime / 200) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 text-right">
            {Math.min((execTime / 200) * 100, 100).toFixed(0)}% of 200ms budget
          </span>
        </div>
      )}
    </div>
  );
}

function countNodes(hierarchies) {
  let total = 0;
  for (const h of hierarchies) {
    total += 1 + countTreeNodes(h.tree ?? {});
  }
  return total;
}

function countTreeNodes(tree) {
  if (!tree) return 0;
  let count = 0;
  for (const child of Object.values(tree)) {
    count += 1 + countTreeNodes(child);
  }
  return count;
}

function countEdges(hierarchies) {
  let total = 0;
  for (const h of hierarchies) {
    total += countTreeEdges(h.tree ?? {});
  }
  return total;
}

function countTreeEdges(tree) {
  if (!tree) return 0;
  let count = 0;
  for (const child of Object.values(tree)) {
    count += 1 + countTreeEdges(child);
  }
  return count;
}
