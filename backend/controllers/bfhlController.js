/**
 * @file bfhlController.js
 * @description Controller for POST /bfhl endpoint.
 * Orchestrates validation, graph building, cycle detection, tree construction,
 * depth calculation, and response formatting.
 */

import {
  validateEdge,
  buildGraph,
  detectCycle,
  buildTree,
  calculateDepth,
} from "../utils/graphUtils.js";

// ── Static response metadata ──────────────────────────────────────────────────
const RESPONSE_META = {
  user_id: "UjjawalPandey_19072003",
  email_id: "pandey_ujjawal@srmap.edu.in",
  college_roll_number: "AP23110011211",
};

/**
 * POST /bfhl handler.
 *
 * Steps:
 *  1. Parse and validate the `data` array from the request body.
 *  2. Separate valid edges from invalid entries.
 *  3. Build the directed graph (adjacency list), collecting duplicate edges.
 *  4. Identify root nodes (nodes with no parent).
 *  5. For each root, detect cycles; build tree or mark as cyclic.
 *  6. Compute summary statistics.
 *  7. Return the unified response object.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const processBFHL = (req, res) => {
  try {
    const { data } = req.body;

    // ── 1. Input existence check ─────────────────────────────────────────────
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        error: "Request body must contain a `data` array.",
      });
    }

    // ── 2. Validate each entry ───────────────────────────────────────────────
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

    // ── 3. Build graph ───────────────────────────────────────────────────────
    const { adjacency, parentOf, duplicateEdges, allNodes } =
      buildGraph(validEdges);

    // ── 4. Identify roots ────────────────────────────────────────────────────
    // A root is any node that never appears as a child (not in parentOf values)
    const childNodes = new Set(Object.keys(parentOf));
    const roots = [...allNodes]
      .filter((n) => !childNodes.has(n))
      .sort(); // deterministic order

    // ── 5. Build hierarchies ─────────────────────────────────────────────────
    const hierarchies = [];
    let totalCycles = 0;
    let largestDepth = 0;
    let largestRoot = null;

    for (const root of roots) {
      const hasCycle = detectCycle(root, adjacency);

      if (hasCycle) {
        totalCycles++;
        hierarchies.push({
          root,
          tree: {},
          has_cycle: true,
        });
        // Cyclic trees are excluded from "largest_tree_root" tracking
        continue;
      }

      const tree = buildTree(root, adjacency);
      const depth = calculateDepth(root, adjacency);

      hierarchies.push({
        root,
        tree,
        has_cycle: false,
        depth,
      });

      // Track largest tree (tie → lexicographically smaller root wins)
      if (
        depth > largestDepth ||
        (depth === largestDepth &&
          largestRoot !== null &&
          root < largestRoot)
      ) {
        largestDepth = depth;
        largestRoot = root;
      }
    }

    // ── 6. Summary ───────────────────────────────────────────────────────────
    const summary = {
      total_trees: roots.length,
      total_cycles: totalCycles,
      largest_tree_root: largestRoot,
    };

    // ── 7. Respond ───────────────────────────────────────────────────────────
    return res.status(200).json({
      ...RESPONSE_META,
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
