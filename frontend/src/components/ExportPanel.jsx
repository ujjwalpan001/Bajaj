/**
 * ExportPanel.jsx
 * Download buttons: JSON, PNG (tree screenshot), PDF report.
 */
import { useState } from "react";
import { exportPNG, exportPDF } from "../utils/exportUtils";

export default function ExportPanel({ data, captureId }) {
  const [pngLoading, setPngLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pngDone, setPngDone]       = useState(false);
  const [pdfDone, setPdfDone]       = useState(false);

  const handleJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "bfhl-result.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePNG = async () => {
    setPngLoading(true);
    try {
      await exportPNG(captureId, "bfhl-tree.png");
      setPngDone(true);
      setTimeout(() => setPngDone(false), 2000);
    } catch (e) {
      console.error("PNG export failed:", e);
    } finally {
      setPngLoading(false);
    }
  };

  const handlePDF = async () => {
    setPdfLoading(true);
    try {
      await exportPDF(data, captureId);
      setPdfDone(true);
      setTimeout(() => setPdfDone(false), 2000);
    } catch (e) {
      console.error("PDF export failed:", e);
    } finally {
      setPdfLoading(false);
    }
  };

  const BtnIcon = ({ loading, done, defaultIcon }) => {
    if (loading) return <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />;
    if (done)    return <span>✓</span>;
    return <span>{defaultIcon}</span>;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mr-1">
        Export:
      </span>

      {/* JSON */}
      <button
        onClick={handleJSON}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-200"
      >
        <span>{ }</span> JSON
      </button>

      {/* PNG */}
      <button
        onClick={handlePNG}
        disabled={pngLoading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 disabled:opacity-60"
      >
        <BtnIcon loading={pngLoading} done={pngDone} defaultIcon="🖼" />
        PNG
      </button>

      {/* PDF */}
      <button
        onClick={handlePDF}
        disabled={pdfLoading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-60"
      >
        <BtnIcon loading={pdfLoading} done={pdfDone} defaultIcon="📄" />
        PDF Report
      </button>
    </div>
  );
}
