/**
 * ResultsPanel – renders the full API response:
 * trees, invalid entries, duplicate edges, and summary.
 */
import { useState } from "react";
import TreeVisualization from "./TreeVisualization";
import SummaryCards from "./SummaryCards";

function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card overflow-hidden animate-slide-up">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            {title}
          </h3>
        </div>
        <span
          className={`text-slate-400 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-700/50">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPanel({ data, onReset }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bfhl-result.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const meta = {
    user_id: data.user_id,
    email_id: data.email_id,
    college_roll_number: data.college_roll_number,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Results
        </h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            ← New Query
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl text-sm font-medium text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors duration-200 flex items-center gap-2"
          >
            {copied ? "✓ Copied!" : "📋 Copy JSON"}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-brand-500/20"
          >
            ⬇ Download JSON
          </button>
        </div>
      </div>

      {/* Summary */}
      <SummaryCards summary={data.summary ?? {}} meta={meta} />

      {/* Hierarchies */}
      <Section
        title={`Tree Hierarchies (${(data.hierarchies ?? []).length})`}
        icon="🌳"
      >
        {data.hierarchies && data.hierarchies.length > 0 ? (
          <div className="flex flex-col gap-6">
            {data.hierarchies.map((h, i) => (
              <div
                key={`${h.root}-${i}`}
                className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="tag-green">Root: {h.root}</span>
                  {h.has_cycle && <span className="tag-red">⚠ Cycle</span>}
                  {!h.has_cycle && h.depth !== undefined && (
                    <span className="tag-green">Depth: {h.depth}</span>
                  )}
                </div>
                <TreeVisualization
                  root={h.root}
                  tree={h.tree}
                  hasCycle={h.has_cycle}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-4">
            No valid hierarchies found.
          </p>
        )}
      </Section>

      {/* Invalid entries */}
      <Section
        title={`Invalid Entries (${(data.invalid_entries ?? []).length})`}
        icon="🚫"
        defaultOpen={(data.invalid_entries ?? []).length > 0}
      >
        {data.invalid_entries && data.invalid_entries.length > 0 ? (
          <div className="flex flex-col gap-2">
            {data.invalid_entries.map((entry, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/40 animate-fade-in"
              >
                <span className="tag-red mt-0.5 shrink-0">
                  ✕ {String(entry.entry)}
                </span>
                <span className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {entry.reason}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-4">
            No invalid entries.
          </p>
        )}
      </Section>

      {/* Duplicate edges */}
      <Section
        title={`Duplicate Edges (${(data.duplicate_edges ?? []).length})`}
        icon="🔁"
        defaultOpen={(data.duplicate_edges ?? []).length > 0}
      >
        {data.duplicate_edges && data.duplicate_edges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.duplicate_edges.map((edge, i) => (
              <span key={i} className="tag-yellow animate-fade-in">
                ⚠ {edge}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-4">
            No duplicate edges.
          </p>
        )}
      </Section>

      {/* Raw JSON */}
      <Section title="Raw JSON Response" icon="{ }" defaultOpen={false}>
        <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 overflow-x-auto custom-scroll max-h-80">
          {JSON.stringify(data, null, 2)}
        </pre>
      </Section>
    </div>
  );
}
