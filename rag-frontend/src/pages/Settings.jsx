import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Moon, Sun, Monitor, ShieldAlert, LogOut } from 'lucide-react';

export const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences and application layout.</p>
      </div>

      <div className="bg-white dark:bg-darkCard rounded-2xl border border-slate-300 dark:border-darkBorder shadow-sm overflow-hidden">
        
        {/* Profile Section */}
        <div className="p-6 border-b border-slate-200 dark:border-darkBorder">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">Profile Information</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xl font-bold shadow-sm">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{user?.full_name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                <Mail size={14} /> {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Preferences */}
        <div className="p-6 border-b border-slate-200 dark:border-darkBorder">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">Appearance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => toggleTheme('light')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${theme === 'light' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              <Sun size={24} />
              <span className="text-sm font-semibold">Light</span>
            </button>
            <button
              onClick={() => toggleTheme('dark')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${theme === 'dark' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              <Moon size={24} />
              <span className="text-sm font-semibold">Dark</span>
            </button>
            <button
              onClick={() => toggleTheme('system')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${theme === 'system' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              <Monitor size={24} />
              <span className="text-sm font-semibold">System</span>
            </button>
          </div>
        </div>

        {/* Danger Zone & Logout */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <button 
              onClick={logout}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-300 hover:bg-slate-200 dark:bg-slate-600 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Sign Out of Account
            </button>
            <button 
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 mt-2"
            >
              <ShieldAlert size={16} /> Delete Account
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
};