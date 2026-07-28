import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Monitor,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  FileText,
  MessageSquare,
  Trash2,
  Clock,
  ChevronDown,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../api/axios";

export const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Profile Menu State
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Theme Dropdown State (Mobile/Compact view)
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Quick Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cachedDocs, setCachedDocs] = useState([]);
  const [cachedChats, setCachedChats] = useState([]);
  const [searchResults, setSearchResults] = useState({ docs: [], chats: [] });

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const themeRef = useRef(null);

  // Load Notifications & Clear Items Older Than 48 Hours
  const loadNotifications = () => {
    const stored = JSON.parse(
      localStorage.getItem("rag_notifications") || "[]",
    );
    const fortyEightHours = 48 * 60 * 60 * 1000;
    const now = Date.now();

    const validNotifs = stored.filter(
      (n) => now - n.timestamp < fortyEightHours,
    );
    if (validNotifs.length !== stored.length) {
      localStorage.setItem("rag_notifications", JSON.stringify(validNotifs));
    }
    setNotifications(validNotifs);
  };

  useEffect(() => {
    loadNotifications();
    window.addEventListener("rag_notification_update", loadNotifications);
    return () =>
      window.removeEventListener("rag_notification_update", loadNotifications);
  }, []);

  // Fetch Documents and Chats for Quick Search
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [docsRes, chatsRes] = await Promise.all([
          API.get("/documents/"),
          API.get("/chat/sessions"),
        ]);
        setCachedDocs(docsRes.data || []);
        setCachedChats(chatsRes.data || []);
      } catch (error) {
        // Silently handle search cache errors
      }
    };
    fetchSearchData();
  }, []);

  // Filter Quick Search Results
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ docs: [], chats: [] });
      return;
    }
    const q = searchQuery.toLowerCase();
    const docs = cachedDocs
      .filter((d) => d.original_name?.toLowerCase().includes(q))
      .slice(0, 3);
    const chats = cachedChats
      .filter((c) => c.title?.toLowerCase().includes(q))
      .slice(0, 3);
    setSearchResults({ docs, chats });
  }, [searchQuery, cachedDocs, cachedChats]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setIsSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setIsNotifOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target))
        setShowThemeMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("rag_notifications", JSON.stringify(updated));
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("rag_notifications", JSON.stringify(updated));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem("rag_notifications", JSON.stringify([]));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md border-b border-slate-200 dark:border-darkBorder px-2 sm:px-6 flex items-center justify-between transition-colors gap-2">
      {/* Left section: Mobile Sidebar Toggle & Interactive Search */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden shrink-0"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Quick Search Field - Visible on all screen sizes now */}
        <div className="relative w-full" ref={searchRef}>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search docs or chats..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-brand-500 rounded-full outline-none text-slate-800 dark:text-slate-200 transition"
          />

          {/* Quick Search Dropdown */}
          <AnimatePresence>
            {isSearchOpen && searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {searchResults.docs.length === 0 &&
                searchResults.chats.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    No matching documents or chats found.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto p-2 space-y-2">
                    {searchResults.docs.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                          Documents
                        </div>
                        {searchResults.docs.map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => {
                              navigate("/documents");
                              setIsSearchOpen(false);
                            }}
                            className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <FileText
                              size={14}
                              className="text-brand-500 shrink-0"
                            />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                              {doc.original_name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.chats.length > 0 && (
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                          Chats
                        </div>
                        {searchResults.chats.map((chat) => (
                          <button
                            key={chat.id}
                            onClick={() => {
                              navigate("/chat");
                              setIsSearchOpen(false);
                            }}
                            className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <MessageSquare
                              size={14}
                              className="text-indigo-500 shrink-0"
                            />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                              {chat.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right section: Theme Selector Dropdown, Notifications & User Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Theme Selector Dropdown (Unified Single Button) */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title="Toggle theme"
          >
            {theme === "light" && <Sun size={15} className="text-amber-500" />}
            {theme === "dark" && <Moon size={15} className="text-blue-400" />}
            {theme === "system" && (
              <Monitor size={15} className="text-brand-500" />
            )}
            <ChevronDown size={12} className="opacity-60" />
          </button>

          <AnimatePresence>
            {showThemeMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-36 bg-white dark:bg-darkCard rounded-xl shadow-xl border border-slate-200 dark:border-darkBorder py-1.5 z-50 overflow-hidden"
              >
                <button
                  onClick={() => {
                    toggleTheme("light");
                    setShowThemeMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition ${theme === "light" ? "bg-slate-100 dark:bg-slate-800 font-semibold text-amber-500" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  <Sun size={14} /> Light
                </button>
                <button
                  onClick={() => {
                    toggleTheme("dark");
                    setShowThemeMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition ${theme === "dark" ? "bg-slate-100 dark:bg-slate-800 font-semibold text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  <Moon size={14} /> Dark
                </button>
                <button
                  onClick={() => {
                    toggleTheme("system");
                    setShowThemeMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition ${theme === "system" ? "bg-slate-100 dark:bg-slate-800 font-semibold text-brand-500" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  <Monitor size={14} /> System
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              if (!isNotifOpen) markAllAsRead();
            }}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-darkCard"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-darkCard rounded-2xl shadow-2xl border border-slate-200 dark:border-darkBorder py-2 z-50 overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Notifications
                  </h4>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-rose-600 dark:text-rose-400 font-medium hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
                      <Bell size={20} className="opacity-30" />
                      No recent notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition relative group border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                      >
                        <div className="pr-6">
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {notif.title}
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                            <Clock size={10} />
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="absolute right-2 top-2 p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-medium text-sm shadow-sm">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
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
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    {user?.full_name || "User"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition"
                >
                  <LogOut size={16} /> Sign out
                </button>
                <button
                  onClick={() => {
                    navigate("/settings");
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 flex items-center gap-2 transition"
                >
                  <Settings size={16} /> Settings
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
