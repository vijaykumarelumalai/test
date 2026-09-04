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
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [metrics, setMetrics] = useState({});
  const [recentActivity, setRecentActivity] = useState({});
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [isLabourMode, setIsLabourMode] = useState(false);

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
  }, []);

  // Worker Mobile Portal Mode
  if (isLabourMode) {
    return <WorkerMobilePortal onBackToAdmin={() => setIsLabourMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans antialiased text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onSwitchToLabourView={() => setIsLabourMode(true)}
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
          {activeTab === 'dashboard' && (
            <>
              {/* Dashboard Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Welcome back, Super Admin! Here's what's happening today.
                  </p>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-black text-blue-700 block tracking-wide uppercase">
                    Manage People
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Build The Future
                  </span>
                </div>
              </div>

              {/* 5 KPI Metric Cards */}
              <MetricCards metrics={metrics} />

              {/* Main Content Grid: Attendance Table (Left 8 cols) & Analytics (Right 4 cols) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8">
                  <AttendanceWidget onAttendanceSaved={loadDashboardData} />
                </div>
                <div className="xl:col-span-4">
                  <AnalyticsWidgets metrics={metrics} onNavigate={setActiveTab} />
                </div>
              </div>

              {/* Bottom 3 Activity Feed Cards */}
              <RecentActivityWidgets 
                recentActivity={recentActivity} 
                onNavigate={setActiveTab} 
              />
            </>
          )}

          {activeTab === 'labour' && (
            <LabourDirectory onOpenAddWorker={() => setShowAddWorkerModal(true)} />
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Attendance Roster</h2>
                <p className="text-xs text-slate-500 mt-1">Select any date to log or review past attendance and variable daily wages</p>
              </div>
              <AttendanceWidget onAttendanceSaved={loadDashboardData} />
            </div>
          )}

          {activeTab === 'advances' && <AdvancesManager />}

          {activeTab === 'loans' && <LoanManager />}

          {activeTab === 'reports' && <ReportsManager />}

          {activeTab === 'settings' && <SettingsManager />}
        </main>
      </div>

      {/* Add Worker Modal */}
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
