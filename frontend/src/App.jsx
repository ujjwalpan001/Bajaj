/**
 * @file App.jsx
 * @description Root application component.
 * Top-level tabs: Analyzer | API Tester
 * Manages dark mode, API state, and overall layout.
 */
import { useState, useEffect } from "react";
import InputPanel  from "./components/InputPanel";
import ResultsPanel from "./components/ResultsPanel";
import ApiTestPanel from "./components/ApiTestPanel";
import Spinner from "./components/Spinner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const APP_TABS = [
  { id: "analyzer", icon: "⚡", label: "Analyzer"   },
  { id: "tester",   icon: "🧪", label: "API Tester" },
];

export default function App() {
  // ── Dark mode ─────────────────────────────────────────────────────────────
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("bfhl-dark");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("bfhl-dark", String(dark));
  }, [dark]);

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [appTab, setAppTab] = useState("analyzer");

  // ── API state ─────────────────────────────────────────────────────────────
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [apiError, setApiError] = useState("");

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

      setResult(await res.json());
    } catch (err) {
      setApiError(
        err.message || "Could not reach the API. Ensure the backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-300">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-white/30 dark:border-slate-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm font-mono">BF</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">BFHL Node Processor</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Hierarchical Relationship Analyzer</p>
            </div>
          </div>

          {/* App tab bar */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mx-auto">
            {APP_TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setAppTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  appTab === tab.id
                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              REST API
            </div>
            <button
              id="dark-mode-toggle"
              onClick={() => setDark((d) => !d)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xl transition-all duration-200"
              title="Toggle dark mode"
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── ANALYZER TAB ─────────────────────────────────────────────────── */}
        {appTab === "analyzer" && (
          <>
            {/* Hero (only before results) */}
            {!result && !loading && (
              <div className="text-center mb-10 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-medium mb-4">
                  <span className="animate-pulse">●</span>
                  Bajaj Finserv Health — Placement Coding Challenge
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold gradient-text mb-3 leading-tight">
                  Hierarchical Node Relationship
                  <br />
                  <span className="text-slate-800 dark:text-slate-100">Processing Engine</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
                  Real-time validation · DFS cycle detection · Visual graph explorer · Step-by-step execution log · Export to PNG &amp; PDF
                </p>
              </div>
            )}

            {/* Input form */}
            {!result && !loading && (
              <div className="max-w-2xl mx-auto animate-slide-up">
                <InputPanel onSubmit={handleSubmit} loading={loading} />
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-32 gap-6 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Processing your nodes…</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Validating → Building graph → Detecting cycles → Constructing trees</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {["Validating", "Building Graph", "Detecting Cycles", "Rendering Trees"].map((step, i) => (
                    <span
                      key={step}
                      className="text-xs px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-800 animate-pulse"
                      style={{ animationDelay: `${i * 250}ms` }}
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* API error */}
            {apiError && !loading && (
              <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-bounce-in">
                <div className="glass-card p-6 border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-900/10">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-red-700 dark:text-red-400">API Error</p>
                      <p className="text-sm text-red-600 dark:text-red-500 mt-1">{apiError}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Make sure the backend is running: <code className="font-mono">npm start</code> in the <code className="font-mono">backend/</code> folder.
                      </p>
                      <button onClick={() => setApiError("")} className="mt-3 text-xs font-medium text-red-500 underline hover:no-underline">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
                <InputPanel onSubmit={handleSubmit} loading={loading} />
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <div className="animate-fade-in">
                <ResultsPanel
                  data={result}
                  onReset={() => { setResult(null); setApiError(""); }}
                />
              </div>
            )}
          </>
        )}

        {/* ── API TESTER TAB ───────────────────────────────────────────────── */}
        {appTab === "tester" && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">
                🧪 Built-in API Tester
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Test the <code className="font-mono text-brand-600 dark:text-brand-400">POST /bfhl</code> endpoint directly from the UI — no Postman needed.
              </p>
            </div>
            <ApiTestPanel />
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-700/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            BFHL Hierarchical Node Processor · Bajaj Finserv Health Placement Challenge
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            Node.js + Express · React + Tailwind · ReactFlow · DFS
          </p>
        </div>
      </footer>
    </div>
  );
}
