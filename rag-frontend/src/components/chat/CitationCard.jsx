import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';

export const CitationCard = ({ citation, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(citation)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder text-xs text-slate-700 dark:text-slate-200 shadow-sm hover:shadow hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 cursor-pointer transition text-left group"
      title={`Click to view Page ${citation.page_number} in PDF`}
    >
      <FileText size={13} className="text-brand-500 shrink-0" />
      <span className="font-medium max-w-[140px] truncate">{citation.document_name}</span>
      <span className="text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/40 px-1.5 py-0.5 rounded text-[10px] font-bold">
        Pg {citation.page_number}
      </span>
      <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 text-brand-500 transition shrink-0" />
    </button>
  );
};