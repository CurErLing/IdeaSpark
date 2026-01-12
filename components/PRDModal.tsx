import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { PRDItem } from '../types';

interface PRDModalProps {
  prd: PRDItem | null;
  onClose: () => void;
}

const PRDModal: React.FC<PRDModalProps> = ({ prd, onClose }) => {
  if (!prd) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 sm:p-8">
      <div className="bg-white/95 glass-panel w-full max-w-4xl h-full max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-white/50 animate-scale-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white/50">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="text-yellow-500" />
              {prd.title}
            </h2>
            <span className="text-xs text-gray-400 mt-1 pl-7">
              Generated on {new Date(prd.timestamp).toLocaleString()}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none">
          <div className="whitespace-pre-wrap font-serif text-gray-700 leading-relaxed">
            {prd.content}
          </div>
        </div>
        <div className="p-4 bg-white/50 border-t border-gray-100 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PRDModal;