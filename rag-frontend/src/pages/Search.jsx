import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, SlidersHorizontal, FileText, Database, Zap, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { PDFViewerModal } from '../components/document/PDFViewerModal';
import API from '../api/axios';
import toast from 'react-hot-toast';

export const Search = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('semantic'); 
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // PDF Viewer State
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);

  // Fetch documents on mount so we can link search results to actual PDFs
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await API.get('/documents/');
        setDocuments(res.data);
      } catch (err) {
        console.error("Failed to load docs for viewer");
      }
    };
    fetchDocs();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setResults([]);

    try {
      const res = await API.post(`/search/${searchType}`, {
        query: query,
        top_k: 10
      });
      setResults(res.data.results || []);
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewPdf = (result) => {
    const matchedDoc = documents.find(d => d.id === result.document_id || d.original_name === result.document_name);
    if (matchedDoc) {
      setActiveDoc({ doc: matchedDoc, page: result.page_number });
    } else {
      toast.error('Original document not found. It may have been deleted.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center py-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Deep Document Search</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Find exactly what you're looking for across your entire knowledge base.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-darkCard p-4 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 w-full">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts, keywords, or extract data..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-brand-500 rounded-xl outline-none text-slate-900 dark:text-slate-100 transition shadow-inner"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative shrink-0 w-full sm:w-auto">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-brand-500 transition cursor-pointer"
              >
                <option value="semantic">Semantic (Meaning)</option>
                <option value="keyword">Keyword (Exact)</option>
                <option value="hybrid">Hybrid (Both)</option>
              </select>
              <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="w-full sm:w-auto justify-center px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl shadow-lg shadow-brand-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Results Area */}
      <div className="space-y-4">
        {isSearching && (
          <div className="py-12 flex flex-col items-center text-slate-400">
            <Zap size={32} className="animate-pulse text-brand-500 mb-3" />
            <p className="text-sm font-medium animate-pulse">Scanning vector database...</p>
          </div>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Database size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No results found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your query or switching the search type.</p>
          </div>
        )}

        {!isSearching && results.map((result, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-darkCard p-5 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm hover:shadow-md transition group flex flex-col"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{result.document_name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-brand-600 dark:text-brand-400 font-semibold bg-brand-50 dark:bg-brand-900/40 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
                      Page {result.page_number}
                    </span>
                    {result.score && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded uppercase tracking-wider">
                        {(result.score * 100).toFixed(1)}% Match
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleViewPdf(result)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 rounded-lg transition flex items-center gap-1.5"
              >
                <Eye size={14} /> View in PDF
              </button>
            </div>
            
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 prose prose-sm dark:prose-invert max-w-none prose-p:m-0">
              <ReactMarkdown>{result.text}</ReactMarkdown>
            </div>
          </motion.div>
        ))}
      </div>

      {activeDoc && (
        <PDFViewerModal doc={activeDoc.doc} initialPage={activeDoc.page} onClose={() => setActiveDoc(null)} />
      )}
    </div>
  );
};