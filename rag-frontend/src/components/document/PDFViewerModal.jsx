import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export const PDFViewerModal = ({ doc, initialPage = 1, onClose }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  if (!doc) return null;

  // React PDF Viewer uses 0-based index for initialPage
  const targetPageZeroBased = Math.max(0, (initialPage || 1) - 1);

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
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
                {doc.original_name}
              </h3>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
                Navigated to Page {initialPage} of {doc.number_of_pages || 'N/A'}
              </p>
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

          {/* PDF Viewer - Added overflow-x-hidden to prevent body side-scroll */}
          <div className="flex-1 overflow-auto overflow-x-hidden bg-slate-100 dark:bg-slate-900 relative">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer 
                fileUrl={doc.stored_file_url}
                initialPage={targetPageZeroBased}
                plugins={[defaultLayoutPluginInstance]}
                theme={{ theme: 'dark' }}
                // Added auto scale / page fit so it shrinks down on mobile view
                defaultScale={SpecialZoomLevel.PageFit}
              />
            </Worker>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};