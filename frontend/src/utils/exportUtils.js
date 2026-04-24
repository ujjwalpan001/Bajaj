/**
 * @file utils/exportUtils.js
 * @description Utilities for exporting results as PNG image or PDF report.
 * Uses html2canvas for DOM capture and jsPDF for PDF generation.
 */

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Captures a DOM element as a PNG and triggers a download.
 *
 * @param {string} elementId - The id of the element to capture
 * @param {string} [filename="bfhl-tree.png"] - Download filename
 */
export async function exportPNG(elementId, filename = "bfhl-tree.png") {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} not found`);

  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2, // higher resolution
    useCORS: true,
    logging: false,
  });

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

/**
 * Generates a PDF report from the API response data.
 * Includes user info, summary table, hierarchy overview, and a DOM screenshot.
 *
 * @param {Object} data     - Full API response object
 * @param {string} elementId - Element to screenshot and embed in the PDF
 */
export async function exportPDF(data, elementId) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PAGE_W = 210;
  const MARGIN = 15;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  let y = MARGIN;

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, PAGE_W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("BFHL Hierarchical Node Processor", MARGIN, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Bajaj Finserv Health · Coding Challenge Report", MARGIN, 20);
  y = 36;

  // ── Meta info ────────────────────────────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Candidate Details", MARGIN, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const meta = [
    ["User ID", data.user_id],
    ["Email", data.email_id],
    ["Roll Number", data.college_roll_number],
    ["Execution Time", `${data.execution_time_ms ?? "N/A"} ms`],
  ];
  meta.forEach(([label, value]) => {
    doc.setTextColor(100, 100, 100);
    doc.text(`${label}:`, MARGIN, y);
    doc.setTextColor(30, 30, 30);
    doc.text(String(value), MARGIN + 38, y);
    y += 5.5;
  });

  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 6;

  // ── Summary ──────────────────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Summary", MARGIN, y);
  y += 6;
  const summary = data.summary ?? {};
  const summaryRows = [
    ["Total Trees", String(summary.total_trees ?? 0)],
    ["Total Cycles", String(summary.total_cycles ?? 0)],
    ["Largest Tree Root", String(summary.largest_tree_root ?? "—")],
    ["Invalid Entries", String((data.invalid_entries ?? []).length)],
    ["Duplicate Edges", String((data.duplicate_edges ?? []).length)],
  ];
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  summaryRows.forEach(([label, value]) => {
    doc.setTextColor(100, 100, 100);
    doc.text(`${label}:`, MARGIN, y);
    doc.setTextColor(30, 30, 30);
    doc.text(value, MARGIN + 45, y);
    y += 5.5;
  });

  y += 4;
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 6;

  // ── Hierarchies text ─────────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Hierarchies", MARGIN, y);
  y += 6;
  doc.setFontSize(8);
  doc.setFont("courier", "normal");

  (data.hierarchies ?? []).forEach((h) => {
    if (y > 250) {
      doc.addPage();
      y = MARGIN;
    }
    const label = h.has_cycle
      ? `Root: ${h.root}  [⚠ CYCLE DETECTED]`
      : `Root: ${h.root}  depth=${h.depth}`;
    doc.setTextColor(h.has_cycle ? 200 : 30, h.has_cycle ? 50 : 30, 30);
    doc.text(label, MARGIN, y);
    y += 5;
    if (!h.has_cycle) {
      const treeStr = JSON.stringify(h.tree, null, 2);
      const lines = doc.splitTextToSize(treeStr, CONTENT_W);
      lines.slice(0, 12).forEach((line) => {
        doc.setTextColor(80, 80, 80);
        doc.text(line, MARGIN + 4, y);
        y += 4;
      });
    }
    y += 3;
  });

  // ── DOM screenshot ───────────────────────────────────────────────────────────
  try {
    const element = document.getElementById(elementId);
    if (element) {
      if (y > 230) { doc.addPage(); y = MARGIN; }
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 1.5,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const imgW = CONTENT_W;
      const imgH = (canvas.height * imgW) / canvas.width;
      if (y + imgH < 280) {
        doc.addImage(imgData, "PNG", MARGIN, y, imgW, Math.min(imgH, 120));
      }
    }
  } catch (_) {
    // screenshot optional — skip if it fails
  }

  doc.save("bfhl-report.pdf");
}
