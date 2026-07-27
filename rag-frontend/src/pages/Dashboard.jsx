import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  FileText, MessageSquareText, HardDrive, Clock, 
  UploadCloud, ArrowRight, Activity 
} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { Search,FileBox } from 'lucide-react';

// Helper function to format bytes into KB, MB, or GB
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 MB';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ docs: 0, chats: 0, totalStorage: '0 MB' });
  const [recentDocs, setRecentDocs] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [docsRes, chatsRes] = await Promise.all([
          API.get('/documents/'),
          API.get('/chat/sessions')
        ]);
        
        const docs = docsRes.data || [];
        
        // Calculate total storage sum by checking common size property names (file_size, size, or file_bytes)
        const totalBytes = docs.reduce((acc, doc) => {
          const fileSize = doc.file_size_bytes || 0; // <-- Updated property name
          return acc + fileSize;
        }, 0);

        setStats({ 
          docs: docs.length, 
          chats: chatsRes.data?.length || 0,
          totalStorage: formatBytes(totalBytes)
        });
        setRecentDocs(docs.slice(0, 3)); // Get top 3 recent docs
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Documents', value: stats.docs, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20' },
    { title: 'Chat Sessions', value: stats.chats, icon: MessageSquareText, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
    { title: 'Storage Used', value: stats.totalStorage, icon: HardDrive, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
  <span>Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!</span>
  <FileBox className="text-brand-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" size={26} />
</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here is what's happening with your document intelligence today.
          </p>
        </div>
        <Link 
          to="/documents" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-brand-500/20 transition"
        >
          <UploadCloud size={18} /> Upload New PDF
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-darkCard p-5 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="bg-white dark:bg-darkCard rounded-2xl border border-slate-200 dark:border-darkBorder p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock size={18} className="text-brand-500" /> Recent Documents
            </h2>
            <Link to="/documents" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentDocs.length > 0 ? recentDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-200 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                    <FileText size={16} />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{doc.original_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(doc.upload_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No documents uploaded yet.</p>
            )}
          </div>
        </div>

        {/* Suggested Actions */}
        <div className="bg-white dark:bg-darkCard rounded-2xl border border-slate-200 dark:border-darkBorder p-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Activity size={18} className="text-brand-500" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/chat" className="p-4 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-500 dark:from-brand-950/30 dark:to-indigo-500 border border-brand-100 dark:border-brand-900/50 hover:shadow-md transition group">
              <MessageSquareText size={24} className="text-brand-600 dark:text-brand-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Ask a Question</h3>
              <p className="text-xs text-slate-700 dark:text-slate-900 mt-1">Query your entire library</p>
            </Link>
            <Link to="/search" className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-500 dark:from-emerald-950/30 dark:to-teal-500 border border-emerald-100 dark:border-emerald-900/50 hover:shadow-md transition group">
              <Search size={24} className="text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Deep Search</h3>
              <p className="text-xs text-slate-700 dark:text-slate-900 mt-1">Find exact keywords</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};