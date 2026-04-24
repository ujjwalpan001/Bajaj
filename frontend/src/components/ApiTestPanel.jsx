/**
 * ApiTestPanel.jsx
 * Built-in mini Postman for testing the /bfhl API right inside the UI.
 * Supports GET and POST with a JSON body editor, shows response with
 * status badge, latency, and formatted JSON output.
 */
import { useState } from "react";

const DEFAULT_BODY = JSON.stringify({ data: ["A->B", "A->C", "B->D"] }, null, 2);
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ApiTestPanel() {
  const [method, setMethod]   = useState("POST");
  const [url, setUrl]         = useState(`${API_BASE}/bfhl`);
  const [body, setBody]       = useState(DEFAULT_BODY);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [latency, setLatency] = useState(null);
  const [bodyError, setBodyError] = useState("");

  const handleSend = async () => {
    setError("");
    setBodyError("");
    setResponse(null);
    setLatency(null);

    // Validate JSON body for POST
    let parsedBody = null;
    if (method === "POST") {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        setBodyError("Invalid JSON body.");
        return;
      }
    }

    setLoading(true);
    const start = performance.now();

    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      if (parsedBody) options.body = JSON.stringify(parsedBody);

      const res = await fetch(url, options);
      const elapsed = performance.now() - start;
      const json = await res.json().catch(() => null);

      setLatency(Math.round(elapsed));
      setResponse({ status: res.status, ok: res.ok, body: json });
    } catch (err) {
      setError(err.message || "Network error — make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    if (!status) return "";
    if (status >= 200 && status < 300) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700";
    if (status >= 400) return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-300 dark:border-red-700";
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-300 dark:border-amber-700";
  };

  return (
    <div className="glass-card p-6 flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-lg">
          🧪
        </div>
        <div>
          <h2 className="font-bold text-slate-800 dark:text-slate-100">API Tester</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Built-in mini Postman — test any endpoint</p>
        </div>
      </div>

      {/* Request bar */}
      <div className="flex gap-2">
        {/* Method selector */}
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/40 cursor-pointer"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>

        {/* URL input */}
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/40 min-w-0"
          placeholder="http://localhost:5000/bfhl"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 text-white text-sm font-semibold transition-all duration-200 shadow-md flex items-center gap-2 shrink-0"
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            "▶ Send"
          )}
        </button>
      </div>

      {/* Request body (POST only) */}
      {method === "POST" && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Request Body (JSON)
          </label>
          <textarea
            value={body}
            onChange={(e) => { setBody(e.target.value); setBodyError(""); }}
            rows={6}
            spellCheck={false}
            className={`font-mono text-xs px-4 py-3 rounded-xl border bg-slate-900 text-emerald-400 placeholder-slate-600 focus:outline-none focus:ring-2 resize-none custom-scroll ${
              bodyError
                ? "border-red-500 focus:ring-red-500/30"
                : "border-slate-700 focus:ring-brand-500/30"
            }`}
          />
          {bodyError && (
            <p className="text-xs text-red-500">{bodyError}</p>
          )}
        </div>
      )}

      {/* Errors */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 animate-fade-in">
          ⚠ {error}
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="flex flex-col gap-3 animate-slide-up">
          {/* Response meta */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor(response.status)}`}>
              {response.status} {response.ok ? "OK" : "ERROR"}
            </span>
            {latency !== null && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                ⚡ {latency}ms
              </span>
            )}
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono ml-auto">
              Content-Type: application/json
            </span>
          </div>

          {/* Response body */}
          <div className="relative">
            <pre className="font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl p-4 overflow-x-auto max-h-72 custom-scroll leading-relaxed">
              {JSON.stringify(response.body, null, 2)}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(response.body, null, 2))}
              className="absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
