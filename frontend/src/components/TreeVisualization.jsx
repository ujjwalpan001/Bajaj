/**
 * TreeNode – recursively renders a nested tree object as an expandable UI.
 * Supports collapse/expand per node.
 */
import { useState } from "react";

function TreeNodeItem({ name, children, depth = 0 }) {
  const hasChildren = children && Object.keys(children).length > 0;
  const [expanded, setExpanded] = useState(true);

  // Color palette cycles through depths
  const depthColors = [
    "text-brand-600 dark:text-brand-400",
    "text-purple-600 dark:text-purple-400",
    "text-emerald-600 dark:text-emerald-400",
    "text-amber-600 dark:text-amber-400",
    "text-pink-600 dark:text-pink-400",
  ];
  const bgColors = [
    "bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800",
    "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
  ];

  const colorClass = depthColors[depth % depthColors.length];
  const bgClass = bgColors[depth % bgColors.length];

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bgClass} transition-all duration-200 animate-fade-in`}
        style={{ marginLeft: depth * 20 }}
      >
        {/* Toggle button */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded((e) => !e)}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${colorClass} hover:bg-white/40 dark:hover:bg-black/20 transition-transform duration-200 ${
              expanded ? "rotate-0" : "-rotate-90"
            }`}
          >
            ▾
          </button>
        ) : (
          <span className="w-5 h-5 flex items-center justify-center text-slate-300 dark:text-slate-600 text-xs">
            ●
          </span>
        )}

        {/* Node label */}
        <span
          className={`font-mono font-semibold text-sm ${colorClass}`}
        >
          {name}
        </span>

        {/* Leaf badge */}
        {!hasChildren && (
          <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
            leaf
          </span>
        )}

        {/* Count badge */}
        {hasChildren && (
          <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400">
            {Object.keys(children).length}{" "}
            {Object.keys(children).length === 1 ? "child" : "children"}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="flex flex-col gap-1">
          {Object.entries(children).map(([childName, grandChildren]) => (
            <TreeNodeItem
              key={childName}
              name={childName}
              children={grandChildren}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Main export: renders the root of a tree hierarchy.
 */
export default function TreeVisualization({ root, tree, hasCycle }) {
  if (hasCycle) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-bounce-in">
        <span className="text-2xl">🔄</span>
        <div>
          <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
            Cycle Detected
          </p>
          <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">
            Root <span className="font-mono font-bold">{root}</span> forms a
            circular reference
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 animate-slide-up">
      <TreeNodeItem name={root} children={tree} depth={0} />
    </div>
  );
}
