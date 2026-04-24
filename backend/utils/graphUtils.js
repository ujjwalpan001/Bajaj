/**
 * @file graphUtils.js
 * @description Utility functions for building and processing hierarchical graph structures.
 * All edge logic, cycle detection, tree building, and depth calculation reside here.
 */

/**
 * Validates a single edge string.
 * Rules:
 *  - Must match format `X->Y`
 *  - X and Y must be single uppercase letters (A-Z)
 *  - No self-loops (X !== Y)
 *  - No lowercase letters, digits, or multi-character nodes
 *
 * @param {string} edge - The raw edge string, e.g. "A->B"
 * @returns {{ valid: boolean, reason?: string }}
 */
export const validateEdge = (edge) => {
  if (typeof edge !== "string" || edge.trim() === "") {
    return { valid: false, reason: "Empty or non-string entry" };
  }

  const trimmed = edge.trim();

  // Must be exactly the pattern: one uppercase letter, "->", one uppercase letter
  const pattern = /^([A-Z])->([A-Z])$/;
  const match = trimmed.match(pattern);

  if (!match) {
    return {
      valid: false,
      reason: `"${trimmed}" does not match format X->Y (single uppercase letters only)`,
    };
  }

  const [, from, to] = match;

  if (from === to) {
    return { valid: false, reason: `"${trimmed}" is a self-loop` };
  }

  return { valid: true };
};

/**
 * Builds an adjacency list and tracks parent assignments.
 * Enforces:
 *  - Deduplication: first occurrence of an edge wins; later occurrences go to duplicates
 *  - Single parent: each node can only have one parent; later parent edges are silently ignored
 *
 * @param {string[]} validEdges - List of already-validated edge strings
 * @returns {{
 *   adjacency: Object.<string, string[]>,
 *   parentOf: Object.<string, string>,
 *   duplicateEdges: string[],
 *   allNodes: Set<string>
 * }}
 */
export const buildGraph = (validEdges) => {
  /** Adjacency list: parent → [children] */
  const adjacency = {};

  /** Tracks which node already has a parent (first-parent-wins) */
  const parentOf = {};

  /** Edges seen before to detect duplicates */
  const seenEdges = new Set();

  /** Edges that appeared more than once */
  const duplicateEdges = [];

  /** All node identifiers encountered */
  const allNodes = new Set();

  for (const edge of validEdges) {
    const [from, to] = edge.split("->").map((s) => s.trim());

    allNodes.add(from);
    allNodes.add(to);

    // --- Duplicate detection ---
    if (seenEdges.has(edge)) {
      if (!duplicateEdges.includes(edge)) {
        duplicateEdges.push(edge);
      }
      continue; // skip processing duplicate
    }
    seenEdges.add(edge);

    // --- Multi-parent: first parent wins ---
    if (parentOf[to] !== undefined) {
      // `to` already has a parent; silently ignore this edge
      continue;
    }

    // Register parent
    parentOf[to] = from;

    // Build adjacency list
    if (!adjacency[from]) adjacency[from] = [];
    adjacency[from].push(to);
  }

  return { adjacency, parentOf, duplicateEdges, allNodes };
};

/**
 * Detects whether a cycle exists within a connected component starting at `root`.
 * Uses iterative DFS with a "currently in stack" (grey) set.
 *
 * @param {string} root - Starting node
 * @param {Object.<string, string[]>} adjacency - Full adjacency list
 * @returns {boolean} true if a cycle is found
 */
export const detectCycle = (root, adjacency) => {
  /** Nodes fully processed */
  const visited = new Set();

  /** Nodes currently on the DFS path (recursion stack) */
  const inStack = new Set();

  /**
   * Inner recursive DFS helper.
   * @param {string} node
   * @returns {boolean}
   */
  const dfs = (node) => {
    visited.add(node);
    inStack.add(node);

    const children = adjacency[node] || [];
    for (const child of children) {
      if (!visited.has(child)) {
        if (dfs(child)) return true;
      } else if (inStack.has(child)) {
        // Back-edge found → cycle
        return true;
      }
    }

    inStack.delete(node);
    return false;
  };

  return dfs(root);
};

/**
 * Recursively builds a nested tree object from the adjacency list.
 * Each node maps to an object of its children.
 *
 * Example output for A → { B: { D: {} }, C: {} }
 *
 * @param {string} node - Current node
 * @param {Object.<string, string[]>} adjacency - Adjacency list
 * @param {Set<string>} [visited] - Guards against infinite loops in unexpected cycles
 * @returns {Object} Nested tree
 */
export const buildTree = (node, adjacency, visited = new Set()) => {
  if (visited.has(node)) return {}; // safety guard
  visited.add(node);

  const children = adjacency[node] || [];
  const subtree = {};

  for (const child of children) {
    subtree[child] = buildTree(child, adjacency, new Set(visited));
  }

  return subtree;
};

/**
 * Calculates the depth (longest root-to-leaf path) of the tree.
 * Depth of a single node (no children) = 1.
 *
 * @param {string} node - Root of the subtree
 * @param {Object.<string, string[]>} adjacency - Adjacency list
 * @param {Set<string>} [visited] - Guards against cycles
 * @returns {number}
 */
export const calculateDepth = (node, adjacency, visited = new Set()) => {
  if (visited.has(node)) return 0; // cycle guard
  visited.add(node);

  const children = adjacency[node] || [];
  if (children.length === 0) return 1;

  let maxChildDepth = 0;
  for (const child of children) {
    const d = calculateDepth(child, adjacency, new Set(visited));
    if (d > maxChildDepth) maxChildDepth = d;
  }

  return 1 + maxChildDepth;
};
