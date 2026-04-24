/**
 * TreeVisualization.jsx
 * Interactive nested tree with:
 *  - Expand / collapse per node
 *  - Click to highlight a node's subtree
 *  - Depth label shown on root node
 *  - Cycle error state
 */
import { useState, useCallback } from "react";

const DEPTH_COLORS = [
  { bg: "bg-brand-50 dark:bg-brand-900/20   border-brand-200   dark:border-brand-800",   label: "text-brand-600  dark:text-brand-400"   },
  { bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200  dark:border-purple-800",  label: "text-purple-600 dark:text-purple-400"  },
  { bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800", label: "text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-amber-50 dark:bg-amber-900/20   border-amber-200   dark:border-amber-800",   label: "text-amber-600  dark:text-amber-400"   },
  { bg: "bg-pink-50 dark:bg-pink-900/20     border-pink-200    dark:border-pink-800",    label: "text-pink-600   dark:text-pink-400"    },
];

function TreeNodeItem({ name, children, depth, highlighted, onHighlight }) {
  const hasChildren = children && Object.keys(children).length > 0;
  const [expanded, setExpanded] = useState(true);
  const isHighlighted = highlighted.has(name);

  const { bg, label } = DEPTH_COLORS[depth % DEPTH_COLORS.length];

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      // Collect all node names in this subtree
      const subtree = new Set();
      const collect = (n, ch) => {
        subtree.add(n);
        if (ch) Object.entries(ch).forEach(([k, v]) => collect(k, v));
      };
      collect(name, children);
      onHighlight(subtree);
    },
    [name, children, onHighlight]
  );

  return (
    <div className="flex flex-col gap-1">
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200 animate-fade-in
          ${isHighlighted ? "ring-2 ring-brand-400 dark:ring-brand-500 scale-[1.01] shadow-sm" : ""}
          ${bg}`}
        style={{ marginLeft: depth * 20 }}
        title="Click to highlight subtree"
      >
        {/* Expand / collapse */}
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((x) => !x); }}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${label} hover:bg-white/40 dark:hover:bg-black/20 transition-transform duration-200 ${expanded ? "" : "-rotate-90"}`}
          >
            ▾
          </button>
        ) : (
          <span className="w-5 h-5 flex items-center justify-center text-slate-300 dark:text-slate-600 text-[10px]">●</span>
        )}

        {/* Label */}
        <span className={`font-mono font-bold text-sm ${label}`}>{name}</span>

        {/* Depth badge on root nodes */}
        {depth === 0 && (
          <span className="ml-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400">
            root
          </span>
        )}

        {/* Leaf badge */}
        {!hasChildren && (
          <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
            leaf
          </span>
        )}

        {/* Children count */}
        {hasChildren && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500">
            {Object.keys(children).length}
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
              highlighted={highlighted}
              onHighlight={onHighlight}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeVisualization({ root, tree, hasCycle, depth }) {
  const [highlighted, setHighlighted] = useState(new Set());

  const handleHighlight = useCallback((subtreeSet) => {
    setHighlighted((prev) =>
      prev.size === subtreeSet.size && [...subtreeSet].every((n) => prev.has(n))
        ? new Set()   // toggle off if same subtree clicked again
        : subtreeSet
    );
  }, []);

  if (hasCycle) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-bounce-in">
        <span className="text-2xl">🔄</span>
        <div>
          <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Cycle Detected</p>
          <p className="text-xs text-red-500 mt-0.5">
            Root <span className="font-mono font-bold">{root}</span> contains a circular reference (DFS back-edge detected)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 animate-slide-up">
      {/* Depth indicator */}
      {depth !== undefined && (
        <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono font-medium text-brand-500">Depth: {depth}</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span>Click any node to highlight its subtree</span>
          {highlighted.size > 0 && (
            <button
              onClick={() => setHighlighted(new Set())}
              className="ml-auto text-[10px] font-medium text-brand-500 hover:underline"
            >
              Clear highlight
            </button>
          )}
        </div>
      )}
      <TreeNodeItem
        name={root}
        children={tree}
        depth={0}
        highlighted={highlighted}
        onHighlight={handleHighlight}
      />
    </div>
  );
}
