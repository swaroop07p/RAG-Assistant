import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, MessageSquareText, Search, 
  BarChart3, Settings, Bot, Sparkles, ChevronRight 
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'RAG Assistant', path: '/chat', icon: MessageSquareText },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" 
        />
      )}

      <aside className={`
        fixed lg:static top-0 left-0 z-40 h-screen w-64 
        bg-white dark:bg-darkCard border-r border-slate-200 dark:border-darkBorder
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Brand Logo */}
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-darkBorder gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="font-bold text-base bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
                DocuMind AI
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Enterprise RAG</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="opacity-40" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Banner */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-brand-900 to-slate-900 text-white text-xs relative overflow-hidden">
          <Sparkles className="absolute right-2 bottom-2 text-brand-400 opacity-20" size={60} />
          <p className="font-semibold text-brand-300 flex items-center gap-1 mb-1">
            <Sparkles size={12} /> Gemini 2.5 Flash
          </p>
          <p className="text-slate-300 leading-relaxed">
            Zero data leakage. Contextually retrieval grounded answers.
          </p>
        </div>

      </aside>
    </>
  );
};