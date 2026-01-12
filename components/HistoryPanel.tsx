import React from 'react';
import { History, Circle, Share2, Trash2, Navigation } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onClear: () => void;
  onItemClick: (nodeId: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClear, onItemClick }) => {
  return (
    <div className="absolute top-6 right-6 z-40 w-64 flex flex-col items-end pointer-events-none">
      {/* Header */}
      <div className="glass-panel px-4 py-2 rounded-full mb-4 pointer-events-auto flex items-center justify-between gap-4 text-sm font-semibold text-gray-800 shadow-sm">
        <div className="flex items-center gap-2">
            <History size={14} />
            <span>Directory</span>
        </div>
        <button 
            onClick={onClear} 
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-white/50"
            title="Clear Canvas & History"
        >
            <Trash2 size={14} />
        </button>
      </div>

      {/* List - Chronological Order (Top to Bottom) */}
      <div className="flex flex-col gap-2 w-full pointer-events-auto max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
        {history.map((item) => (
            <button 
                key={item.id}
                onClick={() => item.nodeId && onItemClick(item.nodeId)}
                disabled={!item.nodeId}
                className="glass-panel p-3 rounded-xl flex items-center justify-between text-sm transition-all hover:bg-white/60 hover:scale-[1.02] active:scale-95 group text-left w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`
                        flex-shrink-0 w-2 h-2 rounded-full 
                        ${item.action === 'create' ? 'bg-black' : 'bg-yellow-400'}
                    `} />
                    <span className="font-medium text-gray-700 truncate">{item.text}</span>
                </div>
                {item.action === 'expand' ? (
                    <Share2 size={12} className="text-gray-400 opacity-50 group-hover:opacity-100" />
                ) : (
                    <Circle size={12} className="text-gray-400 opacity-50 group-hover:opacity-100" />
                )}
            </button>
        ))}
        {history.length === 0 && (
            <div className="text-right text-xs text-gray-400 pr-2 italic">
                Start by adding an idea...
            </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;