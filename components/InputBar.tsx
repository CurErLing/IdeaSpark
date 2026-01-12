import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

interface InputBarProps {
  onConfirm: (text: string) => void;
  isLoading: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onConfirm, isLoading }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onConfirm(value.trim());
      setValue('');
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-50">
      <form 
        onSubmit={handleSubmit}
        className="glass-panel rounded-full p-2 flex items-center shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]"
      >
        <div className="pl-4 pr-2 text-yellow-500">
          <Sparkles size={20} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a creative seed..."
          className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 font-medium h-10"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className={`
            p-2 rounded-full transition-all duration-300
            ${value.trim() && !isLoading ? 'bg-black text-yellow-400 rotate-0' : 'bg-gray-200 text-gray-400 rotate-90 opacity-50 cursor-not-allowed'}
          `}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default InputBar;