import React from 'react';
import { FileText, Trash2, FolderOpen, Calendar, ChevronRight } from 'lucide-react';
import { PRDItem } from '../types';

interface PRDListPanelProps {
  savedPRDs: PRDItem[];
  isOpen: boolean;
  onToggle: () => void;
  onSelectPRD: (prd: PRDItem) => void;
  onDeletePRD: (id: string) => void;
}

const PRDListPanel: React.FC<PRDListPanelProps> = ({ 
  savedPRDs, 
  isOpen, 
  onToggle, 
  onSelectPRD, 
  onDeletePRD 
}) => {
  return (
    <div className={`absolute top-6 left-6 z-40 flex flex-col items-start transition-all duration-300 ${isOpen ? 'h-[calc(100vh-3rem)]' : 'h-auto'}`}>
      
      {/* Toggle Button */}
      <button 
        onClick={onToggle}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full shadow-sm glass-panel text-gray-800 font-semibold text-sm transition-all hover:bg-white/50
          ${isOpen ? 'bg-slate-900 text-white border-slate-800' : ''}
        `}
      >
        <FolderOpen size={16} className={isOpen ? "text-yellow-400" : "text-gray-600"} />
        <span>PRD Library</span>
        {savedPRDs.length > 0 && (
          <span className="bg-yellow-400 text-black text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[1.2em] text-center">
            {savedPRDs.length}
          </span>
        )}
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="mt-3 w-80 glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-fade-in-up flex-1 border border-white/60 bg-white/40 backdrop-blur-xl">
          <div className="p-4 border-b border-white/30 bg-white/20">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saved Documents</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-2">
            {savedPRDs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm italic">
                    <FileText size={32} className="mb-2 opacity-20" />
                    No PRDs generated yet.
                </div>
            ) : (
                savedPRDs.map((prd) => (
                    <div 
                        key={prd.id} 
                        className="group relative bg-white/40 hover:bg-white/80 rounded-xl p-3 transition-all cursor-pointer border border-transparent hover:border-yellow-200 hover:shadow-md"
                        onClick={() => onSelectPRD(prd)}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-800 text-sm line-clamp-1 pr-6">{prd.title}</h4>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeletePRD(prd.id); }}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
                             <Calendar size={10} />
                             {new Date(prd.timestamp).toLocaleDateString()}
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {prd.keywords.slice(0, 3).map((k, i) => (
                                <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                    {k}
                                </span>
                            ))}
                            {prd.keywords.length > 3 && (
                                <span className="text-[10px] text-gray-400">+{prd.keywords.length - 3}</span>
                            )}
                        </div>
                        
                        <div className="absolute right-2 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={14} className="text-gray-400" />
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PRDListPanel;