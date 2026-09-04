import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import MetricCards from './components/MetricCards';
import AttendanceWidget from './components/AttendanceWidget';
import LabourDirectory from './components/LabourDirectory';
import AdvancesManager from './components/AdvancesManager';
import LoanManager from './components/LoanManager';
import ReportsManager from './components/ReportsManager';
import SettingsManager from './components/SettingsManager';
import AddWorkerModal from './components/AddWorkerModal';
import WorkerMobilePortal from './components/WorkerMobilePortal';
import { 
  CalendarCheck, 
  UserPlus
} from 'lucide-react';
import { api } from './api';
import { translations } from './translations';

export default function App() {
  // Sync tab with URL Hash (e.g. #/dashboard, #/labour, #/attendance, etc.)
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#/', '');
    const validTabs = ['dashboard', 'labour', 'attendance', 'advances', 'loans', 'reports', 'settings', 'worker-portal'];
    return validTabs.includes(hash) ? hash : 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState(getTabFromHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [metrics, setMetrics] = useState({});
  const [recentActivity, setRecentActivity] = useState({});
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);

  // Global Language & Theme & Admin Profile State
  const [language, setLanguage] = useState(() => localStorage.getItem('vk_lang') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('vk_theme') || 'light');
  const [adminProfile, setAdminProfile] = useState({});

  const t = translations[language] || translations.en;

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('vk_lang', newLang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'ta' ? 'en' : 'ta';
    handleLanguageChange(nextLang);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('vk_theme', newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    handleThemeChange(nextTheme);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#020617';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#f1f5f9';
    }
  }, [theme]);

  // Set active tab and update browser URL hash
  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    window.location.hash = `#/${tabId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      setActiveTabState(getTabFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [mRes, actRes, settingsRes] = await Promise.all([
        api.getMetrics().catch(() => ({})),
        api.getRecentActivity().catch(() => ({})),
        api.getSettings().catch(() => ({}))
      ]);
      setMetrics(mRes.metrics || {});
      setRecentActivity(actRes || {});
      if (settingsRes.settings) {
        setAdminProfile(settingsRes.settings);
        if (settingsRes.settings.language && !localStorage.getItem('vk_lang')) {
          setLanguage(settingsRes.settings.language);
        }
        if (settingsRes.settings.theme && !localStorage.getItem('vk_theme')) {
          setTheme(settingsRes.settings.theme);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  // Dedicated Worker Mobile Portal Page
  if (activeTab === 'worker-portal') {
    return <WorkerMobilePortal onBackToAdmin={() => setActiveTab('dashboard')} language={language} />;
  }

  return (
    <div className={`min-h-screen flex font-sans antialiased selection:bg-blue-600 selection:text-white ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-100 text-slate-800'
    }`}>
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onSwitchToLabourView={() => setActiveTab('worker-portal')}
        language={language}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header */}
        <TopHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          language={language}
          onLanguageToggle={toggleLanguage}
          theme={theme}
          onThemeToggle={toggleTheme}
          adminProfile={adminProfile}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-3 sm:p-4 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
          
          {/* ======================================================== */}
          {/* PAGE 1: DEDICATED DASHBOARD / EXECUTIVE COMMAND CENTER   */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
              {/* Dashboard Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t.executiveDashboard || 'Executive Dashboard'}</h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase">
                      {t.live || 'Live'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t.welcomeBack || 'Welcome back, Super Admin! Centralized overview of VK Traders workforce and finances.'}
                  </p>
                </div>

                {/* Quick Action Buttons to Jump to Separate Pages */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>{t.attendancePage || 'Attendance Page'}</span>
                  </button>
                  <button
                    onClick={() => setShowAddWorkerModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/30 transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t.addLabour || 'Add Labour'}</span>
                  </button>
                </div>
              </div>

              {/* 5 Top KPI Metric Cards */}
              <MetricCards metrics={metrics} language={language} />

              {/* Attendance Marking Table directly on Dashboard */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">{t.dailyAttendanceRoster || 'Daily Attendance Roster'}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t.attendanceSubtitle || 'Mark daily presence, half-days, or variable daily wages. Shortcut buttons available for quick bulk marking.'}
                    </p>
                  </div>
                  <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                    Multiplier: 1.0x / 0.5x / 0.0x
                  </span>
                </div>
                <AttendanceWidget onAttendanceSaved={loadDashboardData} language={language} />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 2: DEDICATED LABOUR DIRECTORY PAGE                  */}
          {/* ======================================================== */}
          {activeTab === 'labour' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <LabourDirectory onOpenAddWorker={() => setShowAddWorkerModal(true)} language={language} />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 3: DEDICATED ATTENDANCE MANAGEMENT PAGE             */}
          {/* ======================================================== */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t.dailyAttendanceRoster || 'Daily Attendance Roster'}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t.attendanceSubtitle || 'Select any date to log or review past attendance, half-days, and variable daily wages'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                  Auto Wage Multiplier: 1.0x / 0.5x / 0.0x
                </span>
              </div>
              <AttendanceWidget onAttendanceSaved={loadDashboardData} language={language} />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 4: DEDICATED ADVANCES PAGE                          */}
          {/* ======================================================== */}
          {activeTab === 'advances' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <AdvancesManager language={language} />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 5: DEDICATED LOANS PAGE                             */}
          {/* ======================================================== */}
          {activeTab === 'loans' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <LoanManager language={language} />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 6: DEDICATED REPORTS & PAYROLL PAGE                 */}
          {/* ======================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <ReportsManager language={language} />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 7: DEDICATED SETTINGS & CONFIGURATION PAGE          */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <SettingsManager 
                language={language}
                onLanguageChange={handleLanguageChange}
                onThemeChange={handleThemeChange}
                onSettingsSaved={loadDashboardData}
              />
            </div>
          )}

        </main>
      </div>

      {/* Add Worker Modal (Callable from any page) */}
      <AddWorkerModal
        isOpen={showAddWorkerModal}
        onClose={() => setShowAddWorkerModal(false)}
        language={language}
        onWorkerCreated={() => {
          loadDashboardData();
        }}
      />
    </div>
  );
}
