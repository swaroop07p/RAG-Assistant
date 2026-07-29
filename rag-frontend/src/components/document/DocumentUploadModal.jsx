import React, { useState, useRef } from "react";
import { X, UploadCloud, File, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipLoader } from "react-spinners";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { addNotification } from "../../utils/notifications";

export const DocumentUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState(1); // 1: Initial, 2: After 20s, 3: After 35s
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      toast.error("Only PDF files are allowed.");
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadStage(1); // Reset to first stage

    // Timer 1: Switch to Stage 2 after 20 seconds
    const timer1 = setTimeout(() => {
      setUploadStage(2);
    }, 20000);

    // Timer 2: Switch to Stage 3 after 35 seconds (20s + 15s)
    const timer2 = setTimeout(() => {
      setUploadStage(3);
    }, 35000);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

      const response = await fetch(`${baseUrl}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      // Clear both timers if the upload finishes early
      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = 'Failed to upload document.';
        
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = `Validation Error: ${errorData.detail[0].msg}`;
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          }
        }
        throw new Error(errorMessage);
      }
      
      toast.success('Document uploaded and processed successfully!');
      addNotification('Document Processed', 'Your PDF has been successfully embedded.');
      onUploadSuccess();
      handleClose();
    } catch (error) {
      console.error("Upload Error:", error);
      clearTimeout(timer1);
      clearTimeout(timer2);
      toast.error(error.message || 'Failed to upload document due to a network error.');
    } finally {
      setIsUploading(false);
      setUploadStage(1);
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploadStage(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-darkCard w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-darkBorder"
        >
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Upload PDF
            </h3>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                  ${
                    isDragging
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                      : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="application/pdf"
                  className="hidden"
                />
                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 mb-4">
                  <UploadCloud size={32} />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PDF files up to 50MB
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg shrink-0">
                    <File size={20} />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <button
                    onClick={() => setFile(null)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Dynamic Loading Animation Messages based on 3 stages */}
            {isUploading && (
              <div className="mt-6 flex flex-col items-center justify-center p-4 bg-brand-50 dark:bg-brand-900/10 rounded-xl">
                <ClipLoader color="#3b82f6" size={30} />
                {uploadStage === 1 && (
                  <p className="text-sm font-medium text-brand-700 dark:text-brand-400 mt-3 text-center">
                    Extracting text, running OCR, and generating embeddings...
                  </p>
                )}
                {uploadStage === 2 && (
                  <p className="text-sm font-medium text-brand-700 dark:text-brand-400 mt-3 text-center">
                    Your document is being processed. Please wait, as documents with many pages require additional processing time.
                  </p>
                )}
                {uploadStage === 3 && (
                  <p className="text-sm font-medium text-brand-700 dark:text-brand-400 mt-3 text-center">
                    Your PDF contains scanned pages. We're applying Optical Character Recognition (OCR) to extract the text. Please wait a moment.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? "Processing..." : "Upload & Process"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};