/**
 * SummaryCards – displays summary statistics from the API response
 * in a grid of animated cards.
 */
export default function SummaryCards({ summary, meta }) {
  const cards = [
    {
      label: "Total Trees",
      value: summary.total_trees ?? 0,
      icon: "🌳",
      color: "from-emerald-500 to-teal-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    {
      label: "Cycles Found",
      value: summary.total_cycles ?? 0,
      icon: "🔄",
      color: "from-red-500 to-rose-400",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
    },
    {
      label: "Largest Tree Root",
      value: summary.largest_tree_root ?? "—",
      icon: "👑",
      color: "from-amber-500 to-yellow-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
    },
    {
      label: "User ID",
      value: meta?.user_id ?? "—",
      icon: "👤",
      color: "from-brand-500 to-blue-400",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      border: "border-brand-200 dark:border-brand-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`${card.bg} ${card.border} border rounded-2xl p-4 flex flex-col gap-2 animate-slide-up`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">{card.icon}</span>
            <div
              className={`w-2 h-2 rounded-full bg-gradient-to-br ${card.color}`}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {card.label}
            </p>
            <p className="text-xl font-extrabold font-mono text-slate-800 dark:text-slate-100 mt-0.5 truncate">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
