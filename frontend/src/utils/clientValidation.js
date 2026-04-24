/**
 * @file utils/clientValidation.js
 * @description Client-side mirror of the backend validation rules.
 * Used by SmartTextarea for real-time per-line feedback.
 */

/**
 * Validates a single edge string against the same rules as the backend.
 *
 * @param {string} edge
 * @returns {{ status: 'valid'|'invalid'|'empty', reason?: string }}
 */
export function validateEdgeClient(edge) {
  if (typeof edge !== "string" || edge.trim() === "") {
    return { status: "empty" };
  }

  const trimmed = edge.trim();
  const pattern = /^([A-Z])->([A-Z])$/;
  const match = trimmed.match(pattern);

  if (!match) {
    // Give specific reason
    if (/[a-z]/.test(trimmed)) {
      return { status: "invalid", reason: "Lowercase letters not allowed — use uppercase A-Z" };
    }
    if (/\d/.test(trimmed)) {
      return { status: "invalid", reason: "Numbers not allowed — use A-Z only" };
    }
    if (!trimmed.includes("->")) {
      return { status: "invalid", reason: 'Missing "->" separator' };
    }
    const parts = trimmed.split("->");
    if (parts[0].length !== 1 || parts[1]?.length !== 1) {
      return { status: "invalid", reason: "Nodes must be single characters (A-Z)" };
    }
    return { status: "invalid", reason: 'Format must be X->Y (single uppercase letters)' };
  }

  const [, from, to] = match;
  if (from === to) {
    return { status: "invalid", reason: `Self-loop: ${trimmed} — a node cannot point to itself` };
  }

  return { status: "valid" };
}

/**
 * Analyses all lines and returns per-line status including duplicate detection.
 *
 * @param {string} rawText - Full textarea content
 * @returns {Array<{ line: string, status: 'valid'|'invalid'|'duplicate'|'empty', reason?: string }>}
 */
export function analyseLines(rawText) {
  const lines = rawText.split("\n");
  const seen = new Set();
  const results = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const validation = validateEdgeClient(trimmed);

    if (validation.status === "empty") {
      results.push({ line: trimmed, status: "empty" });
      continue;
    }

    if (validation.status === "invalid") {
      results.push({ line: trimmed, status: "invalid", reason: validation.reason });
      continue;
    }

    // Valid edge — check for duplicate
    if (seen.has(trimmed)) {
      results.push({ line: trimmed, status: "duplicate", reason: "Duplicate: only first occurrence is used" });
    } else {
      seen.add(trimmed);
      results.push({ line: trimmed, status: "valid" });
    }
  }

  return results;
}
