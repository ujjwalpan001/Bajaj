/**
 * @file utils/graphLayout.js
 * @description Converts API `hierarchies[]` into ReactFlow nodes[] and edges[].
 * Uses a subtree-width algorithm to center parents over their children.
 */

const X_GAP = 170; // horizontal gap between sibling nodes
const Y_GAP = 120; // vertical gap between levels

/**
 * Recursively counts the number of leaf nodes in a nested tree object.
 * Used to determine how much horizontal space a subtree needs.
 *
 * @param {Object} tree - Nested tree object
 * @returns {number} Leaf count (minimum 1)
 */
function getLeafCount(tree) {
  if (!tree || Object.keys(tree).length === 0) return 1;
  return Object.values(tree).reduce(
    (sum, child) => sum + getLeafCount(child),
    0
  );
}

/**
 * Recursively places nodes using the subtree-width centring algorithm.
 *
 * @param {string} nodeId     - Unique node ID (prefixed)
 * @param {string} label      - Display label (single letter)
 * @param {Object} children   - Nested children object
 * @param {number} level      - Current depth level
 * @param {number} xStart     - Left boundary of this subtree's x-range
 * @param {boolean} isRoot    - Whether this is a root node
 * @param {string|null} parentId - Parent node ID for edge creation
 * @param {ReactFlowNode[]} nodes - Accumulator
 * @param {ReactFlowEdge[]} edges - Accumulator
 */
function placeSubtree(
  nodeId,
  label,
  children,
  level,
  xStart,
  isRoot,
  parentId,
  nodes,
  edges
) {
  const leafCount = getLeafCount(children);
  const subtreeWidth = leafCount * X_GAP;
  // Centre this node over its subtree
  const x = xStart + subtreeWidth / 2 - X_GAP / 2;

  nodes.push({
    id: nodeId,
    type: "customNode",
    data: { label, isRoot, hasCycle: false },
    position: { x, y: level * Y_GAP },
  });

  if (parentId) {
    edges.push({
      id: `e-${parentId}-${nodeId}`,
      source: parentId,
      target: nodeId,
      type: "smoothstep",
      style: { stroke: "#818cf8", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed", color: "#818cf8" },
    });
  }

  if (!children) return;

  let childXStart = xStart;
  for (const [childLabel, grandChildren] of Object.entries(children)) {
    const childId = `${nodeId}_${childLabel}`;
    const childLeaves = getLeafCount(grandChildren);
    placeSubtree(
      childId,
      childLabel,
      grandChildren,
      level + 1,
      childXStart,
      false,
      nodeId,
      nodes,
      edges
    );
    childXStart += childLeaves * X_GAP;
  }
}

/**
 * Converts the full hierarchies array from the API response into
 * ReactFlow-compatible nodes and edges, laying out independent trees side by side.
 *
 * @param {Array} hierarchies - API response `hierarchies[]`
 * @returns {{ nodes: ReactFlowNode[], edges: ReactFlowEdge[] }}
 */
export function buildFlowGraph(hierarchies) {
  const allNodes = [];
  const allEdges = [];
  let xOffset = 0;

  hierarchies.forEach((hierarchy, treeIndex) => {
    const { root, tree, has_cycle } = hierarchy;
    const prefix = `t${treeIndex}_`; // unique prefix per tree
    const rootId = `${prefix}${root}`;

    if (has_cycle) {
      // Show root with cycle indicator, no subtree
      allNodes.push({
        id: rootId,
        type: "customNode",
        data: { label: root, isRoot: true, hasCycle: true },
        position: { x: xOffset, y: 0 },
      });
      // Self-referencing edge to visually indicate cycle
      allEdges.push({
        id: `cycle-${rootId}`,
        source: rootId,
        target: rootId,
        label: "⚠ CYCLE",
        labelStyle: { fill: "#ef4444", fontWeight: "bold", fontSize: 11 },
        style: { stroke: "#ef4444", strokeWidth: 2, strokeDasharray: "5,3" },
        animated: true,
      });
      xOffset += 2 * X_GAP;
      return;
    }

    const leafCount = getLeafCount(tree) || 1;
    const subtreeWidth = leafCount * X_GAP;

    placeSubtree(
      rootId,
      root,
      tree,
      0,
      xOffset,
      true,
      null,
      allNodes,
      allEdges
    );

    xOffset += subtreeWidth + X_GAP;
  });

  return { nodes: allNodes, edges: allEdges };
}
