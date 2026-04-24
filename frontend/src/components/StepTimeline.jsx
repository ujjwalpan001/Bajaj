/**
 * StepTimeline.jsx
 * Animated step-by-step execution log.
 * Shows each processing stage returned by the backend (processing_steps[]).
 * Steps appear with staggered CSS animation for a progressive reveal effect.
 */

const STEP_ICONS = {
  "📥": "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  "✅": "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  "🔁": "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  "🔗": "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  "🌱": "bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800",
  "🔄": "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
  "🌳": "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
};

const DEFAULT_ICON_STYLE =
  "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";

export default function StepTimeline({ steps }) {
  if (!steps || steps.length === 0) {
    return (
      <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-6">
        No processing steps available.
      </p>
    );
  }

  return (
    <div className="relative flex flex-col gap-0">
      {/* Vertical connector line */}
      <div className="absolute left-[23px] top-8 bottom-4 w-px bg-gradient-to-b from-brand-300 via-purple-300 to-transparent dark:from-brand-700 dark:via-purple-700 opacity-50" />

      {steps.map((step, i) => {
        const iconStyle = STEP_ICONS[step.icon] ?? DEFAULT_ICON_STYLE;

        return (
          <div
            key={step.step}
            className="relative flex items-start gap-4 pb-5 animate-slide-up"
            style={{ animationDelay: `${i * 110}ms`, animationFillMode: "both" }}
          >
            {/* Step icon bubble */}
            <div
              className={`relative z-10 shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl ${iconStyle}`}
            >
              {step.icon}
            </div>

            {/* Step content */}
            <div className="flex-1 pt-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Step {step.step}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${iconStyle}`}>
                  {step.status === "done" ? "✓ Done" : step.status}
                </span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm mt-0.5">
                {step.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {step.detail}
              </p>
            </div>
          </div>
        );
      })}

      {/* Final done badge */}
      <div
        className="relative z-10 self-start ml-0 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md animate-bounce-in"
        style={{ animationDelay: `${steps.length * 110 + 100}ms`, animationFillMode: "both" }}
      >
        <span>🎉</span> Processing Complete
      </div>
    </div>
  );
}
