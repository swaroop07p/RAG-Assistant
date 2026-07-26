import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-darkBg p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 shadow-inner">
        <FileQuestion size={32} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">404</h1>
      <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mt-1">Page not found</p>
      <p className="text-xs text-slate-500 dark:text-slate-500 max-w-xs mt-2">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition shadow-md shadow-brand-500/20"
      >
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </div>
  );
};