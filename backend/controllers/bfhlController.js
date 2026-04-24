/**
 * @file controllers/bfhlController.js
 * @description Controller for POST /bfhl endpoint.
 * Orchestrates validation, graph building, cycle detection, tree construction,
 * depth calculation, and response formatting.
 * Returns processing_steps[] and execution_time_ms for the UI Step Timeline.
 */

import {
  validateEdge,
  buildGraph,
  detectCycle,
  buildTree,
  calculateDepth,
} from "../utils/graphUtils.js";
import { getElapsedMs } from "../middleware/timer.js";

// ── Static response metadata ──────────────────────────────────────────────────
const RESPONSE_META = {
  user_id: "UjjawalPandey_19072003",
  email_id: "pandey_ujjawal@srmap.edu.in",
  college_roll_number: "AP23110011211",
};

/**
 * POST /bfhl handler.
 *
 * Processing pipeline:
 *  Step 1  →  Parse input array
 *  Step 2  →  Validate each edge (format, case, self-loop)
 *  Step 3  →  Deduplicate edges (first-occurrence wins)
 *  Step 4  →  Build adjacency list + enforce single-parent rule
 *  Step 5  →  Identify root nodes
 *  Step 6  →  Detect cycles via DFS
 *  Step 7  →  Build nested trees & calculate depths
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const processBFHL = (req, res) => {
  /** Ordered log of processing steps returned to the UI */
  const processingSteps = [];

  /** Helper: push a step entry */
  const addStep = (step, name, detail, icon = "⚙️") => {
    processingSteps.push({ step, name, detail, icon, status: "done" });
  };

  try {
    const { data } = req.body;

    // ── Step 1: Parse ────────────────────────────────────────────────────────
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        error: "Request body must contain a `data` array.",
      });
    }

    addStep(
      1,
      "Input Parsing",
      `Received ${data.length} raw entr${data.length === 1 ? "y" : "ies"}`,
      "📥"
    );

    // ── Step 2: Validation ───────────────────────────────────────────────────
    const validEdges = [];
    const invalidEntries = [];

    for (const entry of data) {
      const result = validateEdge(entry);
      if (result.valid) {
        validEdges.push(entry.trim());
      } else {
        invalidEntries.push({ entry, reason: result.reason });
      }
    }

    addStep(
      2,
      "Edge Validation",
      `${validEdges.length} valid, ${invalidEntries.length} invalid — only X->Y format (uppercase single letters) accepted`,
      "✅"
    );

    // ── Step 3 & 4: Build graph (dedup + single-parent) ───────────────────────
    const { adjacency, parentOf, duplicateEdges, allNodes } =
      buildGraph(validEdges);

    addStep(
      3,
      "Deduplication",
      duplicateEdges.length > 0
        ? `${duplicateEdges.length} duplicate edge(s) found and skipped: ${duplicateEdges.join(", ")}`
        : "No duplicate edges detected",
      "🔁"
    );

    addStep(
      4,
      "Graph Construction",
      `Built adjacency list with ${allNodes.size} node(s); multi-parent conflicts resolved (first-parent wins)`,
      "🔗"
    );

    // ── Step 5: Root identification ──────────────────────────────────────────
    const childNodes = new Set(Object.keys(parentOf));
    const roots = [...allNodes].filter((n) => !childNodes.has(n)).sort();

    addStep(
      5,
      "Root Identification",
      roots.length > 0
        ? `Found ${roots.length} root(s): ${roots.join(", ")}`
        : "No root nodes found (empty or fully cyclic graph)",
      "🌱"
    );

    // ── Step 6 & 7: Cycle detection + tree building ──────────────────────────
    const hierarchies = [];
    let totalCycles = 0;
    let largestDepth = 0;
    let largestRoot = null;
    let cycleRoots = [];

    for (const root of roots) {
      const hasCycle = detectCycle(root, adjacency);

      if (hasCycle) {
        totalCycles++;
        cycleRoots.push(root);
        hierarchies.push({ root, tree: {}, has_cycle: true });
        continue;
      }

      const tree = buildTree(root, adjacency);
      const depth = calculateDepth(root, adjacency);

      hierarchies.push({ root, tree, has_cycle: false, depth });

      if (
        depth > largestDepth ||
        (depth === largestDepth && largestRoot !== null && root < largestRoot)
      ) {
        largestDepth = depth;
        largestRoot = root;
      }
    }

    addStep(
      6,
      "Cycle Detection (DFS)",
      totalCycles > 0
        ? `${totalCycles} cycle(s) detected at root(s): ${cycleRoots.join(", ")} — back-edge found during DFS`
        : "No cycles detected in any tree",
      "🔄"
    );

    addStep(
      7,
      "Tree Construction",
      `Built ${hierarchies.filter((h) => !h.has_cycle).length} tree(s) recursively; max depth = ${largestDepth || 0}`,
      "🌳"
    );

    // ── Summary ──────────────────────────────────────────────────────────────
    const summary = {
      total_trees: roots.length,
      total_cycles: totalCycles,
      largest_tree_root: largestRoot,
    };

    // ── Respond ──────────────────────────────────────────────────────────────
    const execution_time_ms = getElapsedMs(req);

    return res.status(200).json({
      ...RESPONSE_META,
      execution_time_ms,
      processing_steps: processingSteps,
      hierarchies,
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges,
      summary,
    });
  } catch (err) {
    console.error("[/bfhl] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};
