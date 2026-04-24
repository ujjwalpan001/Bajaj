/**
 * ResultsPanel.jsx
 * Full results display with:
 *  - PerformanceBar
 *  - SummaryCards
 *  - Tabbed view: Tree View | Graph View | Step-by-Step
 *  - Invalid entries + Duplicate edges sections (collapsible)
 *  - ExportPanel (JSON / PNG / PDF)
 *  - Raw JSON section
 */
import { useState } from "react";
import TreeVisualization from "./TreeVisualization";
import GraphVisualization from "./GraphVisualization";
import StepTimeline from "./StepTimeline";
import SummaryCards from "./SummaryCards";
import PerformanceBar from "./PerformanceBar";
import ExportPanel from "./ExportPanel";

const CAPTURE_ID = "bfhl-capture-zone";

// ── Collapsible section ───────────────────────────────────────────────────────
function Section({ title, icon, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card overflow-hidden animate-slide-up">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{title}</h3>
          {badge !== undefined && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              {badge}
            </span>
          )}
        </div>
        <span className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-700/50">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
            active === tab.id
              ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ResultsPanel({ data, onReset }) {
  const [activeTab, setActiveTab] = useState("tree");
  const [copiedJSON, setCopiedJSON] = useState(false);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  const VIEW_TABS = [
    { id: "tree",  icon: "🌳", label: "Tree View"      },
    { id: "graph", icon: "🕸", label: "Graph View"     },
    { id: "steps", icon: "📋", label: "Step-by-Step"   },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* ── Action bar ─────────────────────────────────────────────────────── */}
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
            onClick={handleCopyJSON}
            className="px-4 py-2 rounded-xl text-sm font-medium text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors duration-200"
          >
            {copiedJSON ? "✓ Copied!" : "📋 Copy JSON"}
          </button>
        </div>
      </div>

      {/* ── Performance ────────────────────────────────────────────────────── */}
      <PerformanceBar data={data} />

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <SummaryCards summary={data.summary ?? {}} meta={data} />

      {/* ── Export ─────────────────────────────────────────────────────────── */}
      <ExportPanel data={data} captureId={CAPTURE_ID} />

      {/* ── Hierarchies (tabbed) ───────────────────────────────────────────── */}
      <div className="glass-card p-5 flex flex-col gap-4 animate-slide-up" id={CAPTURE_ID}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="text-xl">🏗</span>
            Hierarchies
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              {(data.hierarchies ?? []).length}
            </span>
          </h3>
          <div className="w-full sm:w-auto">
            <TabBar tabs={VIEW_TABS} active={activeTab} onChange={setActiveTab} />
          </div>
        </div>

        {/* Tree View */}
        {activeTab === "tree" && (
          <div className="flex flex-col gap-5 animate-fade-in">
            {(data.hierarchies ?? []).length > 0 ? (
              data.hierarchies.map((h, i) => (
                <div key={`${h.root}-${i}`} className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="tag-green">Root: {h.root}</span>
                    {h.has_cycle && <span className="tag-red">⚠ Cycle</span>}
                    {!h.has_cycle && h.depth !== undefined && (
                      <span className="tag-green">Depth: {h.depth}</span>
                    )}
                  </div>
                  <TreeVisualization root={h.root} tree={h.tree} hasCycle={h.has_cycle} depth={h.depth} />
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">No valid hierarchies found.</p>
            )}
          </div>
        )}

        {/* Graph View */}
        {activeTab === "graph" && (
          <div className="animate-fade-in">
            <GraphVisualization hierarchies={data.hierarchies ?? []} />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 text-center">
              Drag nodes · Scroll to zoom · Use MiniMap to navigate · 🔴 Red = cycle
            </p>
          </div>
        )}

        {/* Step-by-Step */}
        {activeTab === "steps" && (
          <div className="animate-fade-in">
            <StepTimeline steps={data.processing_steps ?? []} />
          </div>
        )}
      </div>

      {/* ── Invalid entries ─────────────────────────────────────────────────── */}
      <Section
        title="Invalid Entries"
        icon="🚫"
        badge={(data.invalid_entries ?? []).length}
        defaultOpen={(data.invalid_entries ?? []).length > 0}
      >
        {(data.invalid_entries ?? []).length > 0 ? (
          <div className="flex flex-col gap-2">
            {data.invalid_entries.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 animate-fade-in">
                <span className="tag-red shrink-0 mt-0.5">✕ {String(entry.entry)}</span>
                <span className="text-xs text-red-600 dark:text-red-400 mt-1">{entry.reason}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No invalid entries ✓</p>
        )}
      </Section>

      {/* ── Duplicate edges ─────────────────────────────────────────────────── */}
      <Section
        title="Duplicate Edges"
        icon="🔁"
        badge={(data.duplicate_edges ?? []).length}
        defaultOpen={(data.duplicate_edges ?? []).length > 0}
      >
        {(data.duplicate_edges ?? []).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.duplicate_edges.map((edge, i) => (
              <span key={i} className="tag-yellow animate-fade-in">⚠ {edge}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No duplicates ✓</p>
        )}
      </Section>

      {/* ── Raw JSON ────────────────────────────────────────────────────────── */}
      <Section title="Raw JSON Response" icon="{ }" defaultOpen={false}>
        <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-900 text-emerald-400 rounded-xl p-4 overflow-x-auto custom-scroll max-h-80 leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      </Section>
    </div>
  );
}
