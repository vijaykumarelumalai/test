import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import MetricCards from './components/MetricCards';
import AttendanceWidget from './components/AttendanceWidget';
import AnalyticsWidgets from './components/AnalyticsWidgets';
import RecentActivityWidgets from './components/RecentActivityWidgets';
import LabourDirectory from './components/LabourDirectory';
import AdvancesManager from './components/AdvancesManager';
import LoanManager from './components/LoanManager';
import ReportsManager from './components/ReportsManager';
import SettingsManager from './components/SettingsManager';
import AddWorkerModal from './components/AddWorkerModal';
import WorkerMobilePortal from './components/WorkerMobilePortal';
import { 
  CalendarCheck, 
  UserPlus, 
  Banknote, 
  CreditCard, 
  FileSpreadsheet, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from './api';

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
      const [mRes, actRes] = await Promise.all([
        api.getMetrics(),
        api.getRecentActivity()
      ]);
      setMetrics(mRes.metrics || {});
      setRecentActivity(actRes || {});
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  // Dedicated Worker Mobile Portal Page
  if (activeTab === 'worker-portal') {
    return <WorkerMobilePortal onBackToAdmin={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans antialiased text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onSwitchToLabourView={() => setActiveTab('worker-portal')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header */}
        <TopHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* ======================================================== */}
          {/* PAGE 1: DEDICATED DASHBOARD / EXECUTIVE COMMAND CENTER   */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Dashboard Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Welcome back, Super Admin! Centralized overview of VK Traders workforce and finances.
                  </p>
                </div>

                {/* Quick Action Buttons to Jump to Separate Pages */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Attendance Page</span>
                  </button>
                  <button
                    onClick={() => setShowAddWorkerModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/30 transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Labour</span>
                  </button>
                </div>
              </div>

              {/* 5 Top KPI Metric Cards */}
              <MetricCards metrics={metrics} />

              {/* Analytics Row: Donut Chart + Comparison Bars */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                  <AnalyticsWidgets metrics={metrics} onNavigate={setActiveTab} />
                </div>
                <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="font-bold text-sm text-slate-900">Quick Module Access</h3>
                      <span className="text-[11px] font-semibold text-slate-400">Separate Pages</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() => setActiveTab('labour')}
                        className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 text-left transition group"
                      >
                        <UserPlus className="w-5 h-5 text-blue-600 mb-2" />
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Labour Directory</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Manage workers & IDs</p>
                      </button>

                      <button
                        onClick={() => setActiveTab('attendance')}
                        className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-300 text-left transition group"
                      >
                        <CalendarCheck className="w-5 h-5 text-emerald-600 mb-2" />
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Mark Attendance</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Roster & daily wage</p>
                      </button>

                      <button
                        onClick={() => setActiveTab('advances')}
                        className="p-4 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200/80 hover:border-rose-300 text-left transition group"
                      >
                        <Banknote className="w-5 h-5 text-rose-600 mb-2" />
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-700">Advances Ledger</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Log cash advances</p>
                      </button>

                      <button
                        onClick={() => setActiveTab('loans')}
                        className="p-4 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200/80 hover:border-purple-300 text-left transition group"
                      >
                        <CreditCard className="w-5 h-5 text-purple-600 mb-2" />
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700">Worker Loans</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Amortized deductions</p>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Need month-end reports?</span>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Open Reports Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom 3 Activity Feed Cards */}
              <RecentActivityWidgets 
                recentActivity={recentActivity} 
                onNavigate={setActiveTab} 
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 2: DEDICATED LABOUR DIRECTORY PAGE                  */}
          {/* ======================================================== */}
          {activeTab === 'labour' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <LabourDirectory onOpenAddWorker={() => setShowAddWorkerModal(true)} />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 3: DEDICATED ATTENDANCE MANAGEMENT PAGE             */}
          {/* ======================================================== */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Daily Attendance Roster</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select any date to log or review past attendance, half-days, and variable daily wages
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  Auto Wage Multiplier: 1.0x / 0.5x / 0.0x
                </span>
              </div>
              <AttendanceWidget onAttendanceSaved={loadDashboardData} />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 4: DEDICATED ADVANCES PAGE                          */}
          {/* ======================================================== */}
          {activeTab === 'advances' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <AdvancesManager />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 5: DEDICATED LOANS PAGE                             */}
          {/* ======================================================== */}
          {activeTab === 'loans' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <LoanManager />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 6: DEDICATED REPORTS & PAYROLL PAGE                 */}
          {/* ======================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <ReportsManager />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 7: DEDICATED SETTINGS & CONFIGURATION PAGE          */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <SettingsManager />
            </div>
          )}

        </main>
      </div>

      {/* Add Worker Modal (Callable from any page) */}
      <AddWorkerModal
        isOpen={showAddWorkerModal}
        onClose={() => setShowAddWorkerModal(false)}
        onWorkerCreated={() => {
          loadDashboardData();
        }}
      />
    </div>
  );
}
