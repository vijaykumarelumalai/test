import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck2, 
  Banknote, 
  CreditCard, 
  FileSpreadsheet, 
  Settings, 
  HardHat, 
  Smartphone,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onSwitchToLabourView }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'labour', label: 'Labour', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
    { id: 'advances', label: 'Advances', icon: Banknote },
    { id: 'loans', label: 'Loan', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0d1629] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Branding */}
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight">VK Traders</h1>
                <p className="text-[11px] font-medium text-slate-400">Labour Management</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 space-y-3">
          {/* Worker Mobile View Quick Switch */}
          <button
            onClick={onSwitchToLabourView}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-all hover:border-emerald-500/40 shadow-sm"
          >
            <Smartphone className="w-4 h-4" />
            <span>Worker Mobile View</span>
          </button>

          {/* Decorative Motivational Card from Mockup */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 to-indigo-950/60 p-4 border border-blue-500/20">
            <div className="relative z-10">
              <p className="text-xs font-bold text-blue-200 tracking-wide">People Build Great Things</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Together We Build A Better Tomorrow</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          </div>
        </div>
      </aside>
    </>
  );
}
