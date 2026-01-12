import { NodeData } from '../types';

export const getNodeStyles = (
  node: NodeData, 
  isSelected: boolean, 
  isMultiSelected: boolean, 
  isSelectionMode: boolean
) => {
  const level = node.level || 0;
  
  // Base classes
  let bgClass = "";
  let borderClass = "";
  let shadowClass = "";
  let mainTextClass = "";
  let zIndexClass = "z-10";

  if (isMultiSelected) {
    // Multi-select Mode Highlight (Green)
    bgClass = "bg-green-100";
    borderClass = "border-4 border-green-500";
    shadowClass = "shadow-[0_0_20px_rgba(34,197,94,0.5)]";
    mainTextClass = "text-green-900";
    zIndexClass = "z-50";
  } else if (isSelected && !isSelectionMode) {
    // NEW Selected Style: High Contrast Dark (Black & Gold)
    // This provides a strong visual cue for "Focus" against the generally light canvas
    bgClass = "bg-slate-900";
    borderClass = "border-[5px] border-yellow-400"; 
    shadowClass = "shadow-[0_0_40px_rgba(250,204,21,0.6)] scale-110";
    mainTextClass = "text-yellow-400";
    zIndexClass = "z-50";
  } else {
    // Level-based aesthetics
    switch (level) {
        case 0: // Root - Now uses the "Golden" style (previously used for selection)
            bgClass = "bg-yellow-100";
            borderClass = "border-4 border-yellow-500";
            shadowClass = "shadow-[0_0_35px_rgba(234,179,8,0.7)]";
            mainTextClass = "text-yellow-900";
            zIndexClass = "z-40";
            break;
        case 1: // Level 1: Blue
            bgClass = "bg-blue-50";
            borderClass = "border-4 border-blue-500";
            shadowClass = "shadow-[0_0_20px_rgba(59,130,246,0.3)]";
            mainTextClass = "text-blue-900";
            zIndexClass = "z-30";
            break;
        case 2: // Level 2: Violet
            bgClass = "bg-violet-50";
            borderClass = "border-4 border-violet-500";
            shadowClass = "shadow-[0_0_20px_rgba(139,92,246,0.3)]";
            mainTextClass = "text-violet-900";
            zIndexClass = "z-20";
            break;
        case 3: // Level 3: Rose
            bgClass = "bg-rose-50";
            borderClass = "border-4 border-rose-500";
            shadowClass = "shadow-[0_0_20px_rgba(244,63,94,0.3)]";
            mainTextClass = "text-rose-900";
            zIndexClass = "z-10";
            break;
        default: // Level 4+: Cyan
            bgClass = "bg-cyan-50";
            borderClass = "border-4 border-cyan-500";
            shadowClass = "shadow-[0_0_20px_rgba(6,182,212,0.3)]";
            mainTextClass = "text-cyan-900";
            zIndexClass = "z-0";
            break;
    }
  }

  const animClass = node.isLoading ? "animate-breathe" : "";
  const className = `node-wrapper absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none select-none flex items-center justify-center text-center rounded-full transition-[transform,background-color,border-color,box-shadow,width,height] duration-300 pointer-events-auto ${bgClass} ${borderClass} ${shadowClass} ${animClass} ${zIndexClass}`;
  
  // Increase size slightly to look good with thick borders
  const size = (level === 0 || isSelected) ? 130 : 110;

  return {
    className,
    mainTextClass,
    size
  };
};