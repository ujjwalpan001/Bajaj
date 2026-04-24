/**
 * GraphVisualization.jsx
 * Visual graph rendering using @xyflow/react.
 * Custom nodes with colour coding: root (blue), leaf (grey), cycle (red).
 * Includes MiniMap, Controls, and Background grid.
 */
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "@xyflow/react";
import { useEffect, useCallback } from "react";
import "@xyflow/react/dist/style.css";
import { buildFlowGraph } from "../utils/graphLayout";

// ── Custom node ───────────────────────────────────────────────────────────────
function CustomNode({ data }) {
  const base =
    "min-w-[52px] h-[52px] flex items-center justify-center rounded-full font-mono font-bold text-lg border-2 shadow-md transition-all duration-200 cursor-pointer";

  const style = data.hasCycle
    ? "bg-red-100 dark:bg-red-900/60 border-red-500 text-red-700 dark:text-red-300 ring-2 ring-red-400/40 animate-pulse"
    : data.isRoot
    ? "bg-gradient-to-br from-brand-500 to-purple-500 border-brand-700 text-white shadow-brand-500/30"
    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-brand-400 hover:scale-105";

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-400" />
      <div className={`${base} ${style}`}>
        {data.hasCycle ? "⚠" : data.label}
      </div>
      {data.hasCycle && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-500 whitespace-nowrap">
          CYCLE
        </div>
      )}
      {data.isRoot && !data.hasCycle && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-brand-500 whitespace-nowrap">
          {data.label}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-400" />
    </div>
  );
}

const nodeTypes = { customNode: CustomNode };

// ── Main component ────────────────────────────────────────────────────────────
export default function GraphVisualization({ hierarchies }) {
  const { nodes: initialNodes, edges: initialEdges } = buildFlowGraph(hierarchies ?? []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Re-layout when hierarchies change
  useEffect(() => {
    const { nodes: n, edges: e } = buildFlowGraph(hierarchies ?? []);
    setNodes(n);
    setEdges(e);
  }, [hierarchies, setNodes, setEdges]);

  const miniMapNodeColor = useCallback((node) => {
    if (node.data?.hasCycle) return "#ef4444";
    if (node.data?.isRoot) return "#6366f1";
    return "#94a3b8";
  }, []);

  if (!hierarchies || hierarchies.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
        No hierarchies to visualize.
      </div>
    );
  }

  return (
    <div className="w-full h-[480px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        attributionPosition="bottom-right"
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background
          color="#6366f1"
          gap={20}
          size={0.5}
          className="opacity-20 dark:opacity-10"
        />
        <Controls className="[&>button]:bg-white dark:[&>button]:bg-slate-800 [&>button]:border-slate-200 dark:[&>button]:border-slate-600" />
        <MiniMap
          nodeColor={miniMapNodeColor}
          className="!bg-white/80 dark:!bg-slate-800/80 !border-slate-200 dark:!border-slate-700 rounded-lg"
          maskColor="rgba(0,0,0,0.08)"
        />
      </ReactFlow>
    </div>
  );
}
