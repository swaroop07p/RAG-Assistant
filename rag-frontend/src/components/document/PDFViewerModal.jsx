import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export const PDFViewerModal = ({ doc, onClose }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  if (!doc) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-6 bg-slate-900/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="bg-white dark:bg-darkBg w-full max-w-6xl h-full sm:h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-darkBorder"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-darkBorder flex justify-between items-center bg-slate-50 dark:bg-darkCard shrink-0">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-md">
                {doc.original_name}
              </h3>
              <p className="text-xs text-slate-500">{doc.number_of_pages} Pages • Uploaded on {new Date(doc.upload_date).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={doc.stored_file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                title="Open original file"
              >
                <ExternalLink size={18} />
              </a>
              <button 
                onClick={onClose} 
                className="p-2 text-slate-500 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* PDF Viewer Body */}
          <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 relative">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer 
                fileUrl={doc.stored_file_url}
                plugins={[defaultLayoutPluginInstance]}
                theme={{ theme: 'dark' }} // You can sync this with ThemeContext if desired
              />
            </Worker>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};