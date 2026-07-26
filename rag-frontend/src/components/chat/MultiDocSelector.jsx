import React from 'react';
import { X, FileText, Check, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MultiDocSelector = ({ isOpen, onClose, documents, selectedDocIds, onChange }) => {
  if (!isOpen) return null;

  const toggleDoc = (id) => {
    if (selectedDocIds.includes(id)) {
      onChange(selectedDocIds.filter(docId => docId !== id));
    } else {
      onChange([...selectedDocIds, id]);
    }
  };

  const isAllSelected = selectedDocIds.length === 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-darkCard w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-darkBorder flex flex-col max-h-[80vh]"
        >
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Knowledge Base Filter</h3>
              <p className="text-xs text-slate-500">Select which documents AI should search.</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto p-4 space-y-2 flex-1 custom-scrollbar">
            {/* Global Search Option */}
            <div 
              onClick={() => onChange([])}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                isAllSelected 
                  ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isAllSelected ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}`}>
                  <Database size={18} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isAllSelected ? 'text-brand-900 dark:text-brand-100' : 'text-slate-700 dark:text-slate-300'}`}>Search Entire Library</p>
                  <p className="text-xs text-slate-500">Query across all uploaded PDFs</p>
                </div>
              </div>
              {isAllSelected && <Check size={18} className="text-brand-600 dark:text-brand-400" />}
            </div>

            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Or Select Specific PDFs</p>
            </div>

            {documents.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No documents available.</p>
            ) : (
              documents.map(doc => {
                const isSelected = selectedDocIds.includes(doc.id);
                return (
                  <div 
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      isSelected && !isAllSelected
                        ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' 
                        : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 rounded-lg bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 shrink-0">
                        <FileText size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{doc.original_name}</span>
                    </div>
                    {isSelected && !isAllSelected && <Check size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <button 
              onClick={onClose}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              Apply Filter
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};