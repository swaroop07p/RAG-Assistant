import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Sun, Moon, Monitor, Search, Bell, User, LogOut, Menu, X, Shield 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md border-b border-slate-200 dark:border-darkBorder px-4 sm:px-6 flex items-center justify-between transition-colors">
      
      {/* Left section: Mobile Toggle & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="relative hidden md:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Quick search documents or chats..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-brand-500 rounded-full outline-none text-slate-800 dark:text-slate-200 transition"
          />
        </div>
      </div>

      {/* Right section: Theme, Notifications & User Avatar */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Theme Selector Dropdown */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
          <button
            onClick={() => toggleTheme('light')}
            className={`p-1.5 rounded-full transition ${theme === 'light' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-400'}`}
            title="Light Mode"
          >
            <Sun size={15} />
          </button>
          <button
            onClick={() => toggleTheme('dark')}
            className={`p-1.5 rounded-full transition ${theme === 'dark' ? 'bg-slate-700 text-blue-400 shadow-sm' : 'text-slate-400'}`}
            title="Dark Mode"
          >
            <Moon size={15} />
          </button>
          <button
            onClick={() => toggleTheme('system')}
            className={`p-1.5 rounded-full transition ${theme === 'system' ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-sm' : 'text-slate-400'}`}
            title="System Theme"
          >
            <Monitor size={15} />
          </button>
        </div>

        {/* Notifications Icon */}
        <button className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-medium text-sm">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-darkCard rounded-xl shadow-xl border border-slate-200 dark:border-darkBorder py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{user?.full_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};