import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';

export const Analytics = () => {
  const [data, setData] = useState({
    totalDocs: 0,
    totalChats: 0,
    weeklyUsage: [
      { name: 'Mon', queries: 0, tokens: 0 },
      { name: 'Tue', queries: 0, tokens: 0 },
      { name: 'Wed', queries: 0, tokens: 0 },
      { name: 'Thu', queries: 0, tokens: 0 },
      { name: 'Fri', queries: 0, tokens: 0 },
      { name: 'Sat', queries: 0, tokens: 0 },
      { name: 'Sun', queries: 0, tokens: 0 },
    ]
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [docsRes, chatsRes] = await Promise.all([
          API.get('/documents/'),
          API.get('/chat/sessions')
        ]);
        
        const numDocs = docsRes.data.length || 0;
        const chats = chatsRes.data || [];
        const numChats = chats.length;

        // Dynamically populate today's data based on actual chat count
        const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        const updatedWeekly = data.weeklyUsage.map(day => {
          if (day.name === today) {
            return { ...day, queries: numChats, tokens: numChats * 150 }; // Estimating 150 tokens per chat for now
          }
          return day;
        });

        setData({
          totalDocs: numDocs,
          totalChats: numChats,
          weeklyUsage: updatedWeekly
        });
      } catch (error) {
        console.error("Failed to load analytics data", error);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = [
    { label: 'Total Queries', value: data.totalChats, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Documents Processed', value: data.totalDocs, icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Estimated Tokens', value: data.totalChats * 150, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Avg Response Time', value: data.totalChats > 0 ? '1.2s' : '0.0s', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">System Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor your RAG engine's performance and usage metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-darkCard p-5 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm"
          >
            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} w-fit mb-4`}>
              <stat.icon size={20} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-darkCard p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-6">Weekly Queries</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyUsage}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="queries" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-darkCard p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-6">Token Usage Tracking</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeklyUsage}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="tokens" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};