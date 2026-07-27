import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CitationCard } from './CitationCard';

export const ChatMessage = ({ message, onFollowUpClick, onCitationClick }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md border border-white dark:border-slate-800">
          <Bot size={16} />
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div 
          className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
            isUser 
              ? 'bg-brand-600 text-white rounded-tr-sm shadow-sm' 
              : `bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700 ${message.isError ? 'border-rose-300 bg-rose-50 dark:bg-rose-900/20' : ''}`
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Clickable Citations */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.citations.map((cite, idx) => (
              <CitationCard 
                key={idx} 
                citation={cite} 
                onClick={onCitationClick} 
              />
            ))}
          </div>
        )}

        {/* Follow-up Suggestions */}
        {!isUser && message.followUps && message.followUps.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Suggested Questions:</p>
            <div className="flex flex-col gap-2">
              {message.followUps.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => onFollowUpClick(question)}
                  className="text-left w-fit flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-100 dark:border-brand-900/50 bg-brand-50/50 dark:bg-brand-900/10 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/30 text-sm transition"
                >
                  <ChevronRight size={14} className="opacity-50" /> {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 order-2 border border-white dark:border-slate-800">
          <User size={16} />
        </div>
      )}
    </motion.div>
  );
};