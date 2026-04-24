/**
 * SmartTextarea.jsx
 * Real-time validating textarea. Each line is individually analysed
 * using the client-side mirror of the backend rules.
 * Shows: ✅ valid | ❌ invalid | ⚠ duplicate | (grey) empty
 */
import { useState, useRef } from "react";
import { analyseLines } from "../utils/clientValidation";

/**
 * Returns a Tailwind class set for a given validation status.
 */
function statusStyle(status) {
  switch (status) {
    case "valid":     return { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/10" };
    case "invalid":   return { dot: "bg-red-500",     text: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-900/10" };
    case "duplicate": return { dot: "bg-amber-500",   text: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-900/10" };
    default:          return { dot: "bg-slate-300",   text: "text-slate-400 dark:text-slate-600",     bg: "bg-transparent" };
  }
}

function statusIcon(status) {
  switch (status) {
    case "valid":     return "✅";
    case "invalid":   return "❌";
    case "duplicate": return "⚠️";
    default:          return "";
  }
}

export default function SmartTextarea({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

  const lineResults = analyseLines(value);
  const validCount   = lineResults.filter((r) => r.status === "valid").length;
  const invalidCount = lineResults.filter((r) => r.status === "invalid").length;
  const dupCount     = lineResults.filter((r) => r.status === "duplicate").length;

  return (
    <div className="flex flex-col gap-2">
      {/* Stats bar */}
      <div className="flex items-center gap-3 flex-wrap text-xs font-medium">
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          {validCount} valid
        </span>
        <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          {invalidCount} invalid
        </span>
        <span className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          {dupCount} duplicate
        </span>
      </div>

      {/* Textarea */}
      <div
        className={`relative rounded-xl border-2 transition-all duration-200 ${
          focused
            ? "border-brand-500 shadow-lg shadow-brand-500/10"
            : "border-slate-200 dark:border-slate-600"
        } bg-white dark:bg-slate-900/60`}
      >
        <textarea
          id="edge-input"
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={9}
          placeholder={placeholder}
          spellCheck={false}
          className="w-full font-mono text-sm px-4 py-3 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none resize-none custom-scroll"
        />
        {/* Edge count badge */}
        <div className="absolute top-2.5 right-3 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md pointer-events-none">
          {lineResults.filter((r) => r.status !== "empty").length} edges
        </div>
      </div>

      {/* Per-line indicators */}
      {lineResults.some((r) => r.status !== "empty") && (
        <div className="rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-900/30 divide-y divide-slate-100 dark:divide-slate-700/30 max-h-44 overflow-y-auto custom-scroll">
          {lineResults.map((result, i) => {
            if (result.status === "empty") return null;
            const s = statusStyle(result.status);
            return (
              <div
                key={i}
                className={`flex items-start gap-2 px-3 py-1.5 text-xs ${s.bg}`}
              >
                <span className="mt-0.5 text-sm leading-none">{statusIcon(result.status)}</span>
                <span className={`font-mono font-medium ${s.text}`}>{result.line}</span>
                {result.reason && (
                  <span className="ml-auto text-slate-400 dark:text-slate-500 text-[10px] text-right leading-tight max-w-[200px]">
                    {result.reason}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
