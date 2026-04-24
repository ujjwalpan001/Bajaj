/**
 * InputPanel.jsx
 * Enhanced input section with:
 *  - SmartTextarea (real-time validation)
 *  - Edge Case Simulator buttons (cycle / duplicate / invalid / complex)
 *  - Auto-convert: comma or newline separated → array
 *  - Format hint card
 */
import { useState } from "react";
import SmartTextarea from "./SmartTextarea";

// ── Edge case presets ─────────────────────────────────────────────────────────
const PRESETS = [
  {
    label: "Simple Tree",
    icon: "🌳",
    color: "border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
    value: "A->B\nA->C\nB->D",
  },
  {
    label: "Multi-root",
    icon: "🌿",
    color: "border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    value: "A->B\nA->C\nC->D\nX->Y\nY->Z",
  },
  {
    label: "⚠ Cycle Case",
    icon: "🔄",
    color: "border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
    value: "A->B\nB->C\nC->A",
  },
  {
    label: "⚠ Duplicates",
    icon: "🔁",
    color: "border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
    value: "A->B\nA->C\nA->B\nB->D\nA->C",
  },
  {
    label: "❌ Invalid Mix",
    icon: "🚫",
    color: "border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20",
    value: "A->B\nA->A\na->b\nAB->C\n1->2\nA->B->C\n",
  },
  {
    label: "Complex All",
    icon: "🧩",
    color: "border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
    value: "A->B\nA->C\nB->D\nB->E\nC->F\nD->G\nX->Y\nY->Z\nA->B\nabc\nA->A\n1->2\nP->Q\nQ->P",
  },
];

export default function InputPanel({ onSubmit, loading }) {
  const [raw, setRaw]     = useState("A->B\nA->C\nB->D");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    const lines = raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setError("Please enter at least one edge string.");
      return;
    }

    await onSubmit(lines);
  };

  return (
    <div className="glass-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
          <span className="text-xl">📡</span> Node Relationship Input
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          One edge per line in{" "}
          <code className="font-mono text-brand-600 dark:text-brand-400 text-xs bg-brand-50 dark:bg-brand-900/30 px-1.5 py-0.5 rounded">
            X-&gt;Y
          </code>{" "}
          format · uppercase letters only · auto-validates in real-time
        </p>
      </div>

      {/* Edge Case Simulator */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
          🧪 Edge Case Simulator
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setRaw(p.value); setError(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${p.color}`}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Smart Textarea */}
      <SmartTextarea
        value={raw}
        onChange={(v) => { setRaw(v); setError(""); }}
        placeholder={"A->B\nA->C\nB->D"}
      />

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1.5 animate-fade-in">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Submit */}
      <button
        id="submit-button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 disabled:from-slate-400 disabled:to-slate-400 text-white shadow-lg hover:shadow-brand-500/25 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2 animate-pulse-glow"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Processing…
          </>
        ) : (
          <>⚡ Process Nodes</>
        )}
      </button>

      {/* Rules hint */}
      <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
        <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Validation rules:</p>
        <p>✅ Valid: <code className="font-mono">A-&gt;B</code>, <code className="font-mono">Z-&gt;X</code></p>
        <p>❌ Self-loop: <code className="font-mono">A-&gt;A</code> &nbsp;|&nbsp; Lowercase: <code className="font-mono">a-&gt;b</code> &nbsp;|&nbsp; Multi-char: <code className="font-mono">AB-&gt;C</code></p>
        <p>⚠ Duplicate edges → logged, first occurrence used &nbsp;|&nbsp; Multi-parent → first parent wins</p>
      </div>
    </div>
  );
}
