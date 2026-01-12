import React from 'react';
import { CheckSquare, FileText } from 'lucide-react';
import { NodeData } from '../types';

interface SelectionPanelProps {
  selectedNodes: NodeData[];
  onClear: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isPRDPanelOpen: boolean;
}

const SelectionPanel: React.FC<SelectionPanelProps> = ({
  selectedNodes,
  onClear,
  onGenerate,
  isGenerating,
  isPRDPanelOpen
}) => {
  if (selectedNodes.length === 0) return null;

  return (
    <div className={`absolute left-6 z-40 w-64 flex flex-col gap-2 animate-fade-in-up transition-all duration-300 ${isPRDPanelOpen ? 'top-[420px]' : 'top-20'}`}>
        <div className="glass-panel p-4 rounded-2xl shadow-lg border-2 border-green-100 bg-white/60 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <CheckSquare size={16} className="text-green-600"/>
                    Selected ({selectedNodes.length})
                </h3>
                <button 
                    onClick={onClear} 
                    className="text-xs text-gray-400 hover:text-red-500"
                >
                    Clear
                </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4 max-h-[150px] overflow-y-auto no-scrollbar">
                {selectedNodes.map(node => (
                    <span key={node.id} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                        {node.text}
                    </span>
                ))}
            </div>

            <button 
                onClick={onGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <span className="animate-pulse">Generating...</span>
                ) : (
                    <>
                        <FileText size={14} />
                        Generate PRD
                    </>
                )}
            </button>
        </div>
    </div>
  );
};

export default SelectionPanel;