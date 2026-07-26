import React, { useState, useEffect } from 'react';
import { X, Sparkles, Tag, FileText, ListChecks } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/axios';
import { ClipLoader } from 'react-spinners';

export const SummaryModal = ({ doc, onClose }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!doc) return;
      try {
        const res = await API.get(`/summary/${doc.id}`);
        setSummaryData(res.data);
      } catch (error) {
        setSummaryData({ short_summary: doc.summary || "No summary available." });
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [doc]);

  if (!doc) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-darkCard w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-darkBorder flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">AI Document Summary</h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">{doc.original_name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ClipLoader color="#3b82f6" size={36} />
                <p className="text-sm text-slate-500 mt-3">Fetching detailed summary...</p>
              </div>
            ) : (
              <>
                {/* Short Overview */}
                <div className="bg-brand-50/50 dark:bg-brand-900/10 p-4 rounded-xl border border-brand-100 dark:border-brand-900/30">
                  <h4 className="text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <FileText size={14} /> High-Level Overview
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {summaryData.short_summary || doc.summary}
                  </p>
                </div>

                {/* Detailed Summary */}
                {summaryData.detailed_summary && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ListChecks size={14} /> Detailed Summary
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      {summaryData.detailed_summary}
                    </p>
                  </div>
                )}

                {/* Key Topics */}
                {summaryData.key_topics && summaryData.key_topics.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Tag size={14} /> Key Topics & Insights
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {summaryData.key_topics.map((topic, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-900/30">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};