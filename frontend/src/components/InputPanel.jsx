/**
 * InputPanel – textarea with auto-conversion, example presets,
 * and submit button.
 */
import { useState } from "react";

const PRESETS = [
  { label: "Simple Tree", value: "A->B\nA->C\nB->D" },
  { label: "Multi-root", value: "A->B\nC->D\nD->E" },
  { label: "With Cycle", value: "A->B\nB->C\nC->A" },
  {
    label: "Complex",
    value:
      "A->B\nA->C\nB->D\nB->E\nC->F\nD->G\nX->Y\nY->Z\nA->B\nabc\nA->A\n1->2",
  },
];

export default function InputPanel({ onSubmit, loading }) {
  const [raw, setRaw] = useState("A->B\nA->C\nB->D");
  const [error, setError] = useState("");

  /**
   * Converts the textarea value to an array of trimmed, non-empty strings
   * and calls onSubmit.
   */
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
        <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
          Node Relationship Input
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Enter one edge per line (or comma-separated) in the format{" "}
          <code className="font-mono text-brand-600 dark:text-brand-400 text-xs bg-brand-50 dark:bg-brand-900/30 px-1.5 py-0.5 rounded">
            X-&gt;Y
          </code>
          . Uppercase letters only.
        </p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setRaw(p.value);
              setError("");
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-200"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          id="edge-input"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setError("");
          }}
          rows={8}
          placeholder={"A->B\nA->C\nB->D"}
          className="w-full font-mono text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 input-ring resize-none custom-scroll"
        />
        <div className="absolute top-3 right-3">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded-md">
            {raw.split(/[\n,]+/).filter((s) => s.trim()).length} edges
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-2 animate-fade-in">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Submit */}
      <button
        id="submit-button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-500 to-blue-500 hover:from-brand-600 hover:to-blue-600 disabled:from-slate-400 disabled:to-slate-400 text-white shadow-lg hover:shadow-brand-500/30 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2 animate-pulse-glow"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin-slow" />
            Processing…
          </>
        ) : (
          <>
            <span>⚡</span> Process Nodes
          </>
        )}
      </button>

      {/* Format hint */}
      <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p className="font-medium text-slate-600 dark:text-slate-300 mb-2">
          Input rules:
        </p>
        <p>✅ Valid: <code className="font-mono">A-&gt;B</code>, <code className="font-mono">Z-&gt;X</code></p>
        <p>❌ Invalid: <code className="font-mono">A-&gt;A</code> (self-loop), <code className="font-mono">a-&gt;b</code> (lowercase), <code className="font-mono">AB-&gt;C</code> (multi-char)</p>
        <p>⚠ Duplicates and multi-parent edges are handled automatically.</p>
      </div>
    </div>
  );
}
