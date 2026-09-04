import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Search, 
  Calendar as CalendarIcon, 
  Bell, 
  User, 
  CheckCheck,
  Clock,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api';

export default function TopHeader({ onToggleSidebar, searchQuery, setSearchQuery }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Formatted date string e.g. "Mon, 16 Jun 2025"
  const formattedToday = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Menu & Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search labour, ID, or anything..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition"
          />
        </div>
      </div>

      {/* Right: Date, Notifications, Profile */}
      <div className="flex items-center gap-3 lg:gap-6">
        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100/80 text-xs font-semibold text-slate-600 border border-slate-200/60">
          <CalendarIcon className="w-4 h-4 text-slate-500" />
          <span>{formattedToday}</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`p-3.5 transition hover:bg-slate-50 ${n.is_read ? 'opacity-70' : 'bg-blue-50/30'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-0.5 ${
                          n.type === 'ATTENDANCE_REMINDER' ? 'bg-amber-100 text-amber-600' :
                          n.type === 'ONBOARDING' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {n.type === 'ATTENDANCE_REMINDER' ? <Clock className="w-4 h-4" /> :
                           n.type === 'ONBOARDING' ? <MessageSquare className="w-4 h-4" /> :
                           <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 leading-tight">{n.title}</p>
                          <p className="text-xs text-slate-600 mt-1 leading-snug">{n.message}</p>
                          {n.tamil_message && (
                            <p className="text-[11px] text-slate-500 mt-1 font-medium leading-snug">{n.tamil_message}</p>
                          )}
                          <span className="text-[10px] text-slate-400 mt-1.5 block">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-200">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
            VK
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">Super Admin</p>
            <p className="text-[11px] font-medium text-slate-500 mt-1">VK Traders</p>
          </div>
        </div>
      </div>
    </header>
  );
}
