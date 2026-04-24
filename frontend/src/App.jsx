/**
 * @file App.jsx
 * @description Root application component.
 * Manages global state: dark mode, API loading, results.
 */
import { useState, useEffect } from "react";
import InputPanel from "./components/InputPanel";
import ResultsPanel from "./components/ResultsPanel";
import Spinner from "./components/Spinner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  // ── Dark mode ─────────────────────────────────────────────────────────────
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("bfhl-dark");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("bfhl-dark", String(dark));
  }, [dark]);

  // ── API state ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState("");

  /**
   * Sends data to POST /bfhl and stores the response.
   * @param {string[]} lines - Array of edge strings
   */
  const handleSubmit = async (lines) => {
    setLoading(true);
    setApiError("");
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/bfhl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: lines }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const json = await res.json();
      setResult(json);
    } catch (err) {
      setApiError(
        err.message ||
          "Could not reach the API. Make sure the backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-300">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-white/30 dark:border-slate-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm font-mono">BF</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">
                BFHL Node Processor
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Hierarchical Relationship Analyzer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* API status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              REST API
            </div>

            {/* Dark mode toggle */}
            <button
              id="dark-mode-toggle"
              onClick={() => setDark((d) => !d)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200 text-lg"
              title="Toggle dark mode"
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero banner */}
        {!result && !loading && (
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-medium mb-4">
              <span className="animate-pulse">●</span>
              Bajaj Finserv Health — Coding Challenge
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold gradient-text mb-3 leading-tight">
              Hierarchical Node Relationship
              <br />
              <span className="text-slate-800 dark:text-slate-100">
                Processing Engine
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Parse, validate, and visualize directed graph relationships.
              Detects cycles, handles multi-parent conflicts, deduplicates
              edges, and builds nested trees in one API call.
            </p>
          </div>
        )}

        {/* Content layout */}
        {!result && !loading && (
          <div className="max-w-2xl mx-auto animate-slide-up">
            <InputPanel onSubmit={handleSubmit} loading={loading} />
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-6 animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Processing your nodes…
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Building graph, detecting cycles, constructing trees
              </p>
            </div>
            {/* Progress dots */}
            <div className="flex gap-2">
              {["Validating", "Building Graph", "Detecting Cycles", "Rendering"].map(
                (step, i) => (
                  <span
                    key={step}
                    className="text-xs px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-800 animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    {step}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* API error */}
        {apiError && !loading && (
          <div className="max-w-2xl mx-auto animate-bounce-in">
            <div className="glass-card p-6 border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-900/20">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">
                    API Error
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                    {apiError}
                  </p>
                  <button
                    onClick={() => setApiError("")}
                    className="mt-3 text-xs font-medium text-red-600 dark:text-red-400 underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
            {/* Still show input so user can retry */}
            <div className="mt-6">
              <InputPanel onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="animate-fade-in">
            <ResultsPanel
              data={result}
              onReset={() => {
                setResult(null);
                setApiError("");
              }}
            />
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-700/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            BFHL Hierarchical Node Processor · Bajaj Finserv Health Coding Challenge
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            POST /bfhl · Node.js + Express · React + Tailwind
          </p>
        </div>
      </footer>
    </div>
  );
}
