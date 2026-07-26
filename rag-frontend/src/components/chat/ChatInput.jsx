import React, { useState, useRef, useEffect } from 'react';
import { Send, LayoutList } from 'lucide-react';

export const ChatInput = ({ onSend, disabled, onOpenDocSelector }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition shadow-sm">
      
      <button
        onClick={onOpenDocSelector}
        className="p-2.5 text-slate-400 hover:text-brand-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition shrink-0"
        title="Select Documents to Query"
      >
        <LayoutList size={20} />
      </button>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your documents..."
        disabled={disabled}
        className="w-full max-h-[150px] bg-transparent resize-none outline-none py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 custom-scrollbar"
        rows={1}
      />

      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 transition shadow-sm ${
          text.trim() && !disabled 
            ? 'bg-brand-600 text-white hover:bg-brand-700' 
            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Send size={18} className={text.trim() && !disabled ? 'translate-x-0.5' : ''} />
      </button>
    </div>
  );
};