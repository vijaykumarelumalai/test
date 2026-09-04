import React, { useState, useEffect } from 'react';
import { Settings, Building, Clock, Bell, Shield, Save, CheckCheck } from 'lucide-react';
import { api } from '../api';

export default function SettingsManager() {
  const [settings, setSettings] = useState({
    company_name: 'VK Traders',
    morning_reminder_time: '09:00',
    night_reminder_time: '20:00',
    super_admin_email: 'admin@vktraders.com',
    contact_phone: '+91 98765 43210',
    google_client_id: ''
  });

  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    api.getSettings().then(res => {
      if (res.settings) {
        setSettings(prev => ({ ...prev, ...res.settings }));
      }
    }).catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTestReminder = async () => {
    try {
      const res = await api.checkAttendanceReminder();
      if (res.reminderTriggered) {
        setTestResult(`Reminder triggered for ${res.unmarkedWorkers} pending labourers! Check the notification bell.`);
      } else {
        setTestResult('All labourers marked for today! No alert triggered.');
      }
      setTimeout(() => setTestResult(''), 5000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System Settings & Configuration</h2>
        <p className="text-xs text-slate-500 mt-1">Manage organization details, shift reminder timings, and credentials for VK Traders</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Company Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Super Admin Email</label>
              <input
                type="email"
                value={settings.super_admin_email}
                onChange={(e) => setSettings({ ...settings, super_admin_email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Daily Attendance Reminders Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Attendance Reminder Windows</h3>
                <p className="text-[11px] text-slate-400">Automated notification triggers for Super Admin</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestReminder}
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition"
            >
              Test Trigger Now
            </button>
          </div>

          {testResult && (
            <div className="p-3 bg-amber-50 rounded-xl text-xs font-bold text-amber-800 border border-amber-200">
              {testResult}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Morning Reminder Time</label>
              <input
                type="time"
                value={settings.morning_reminder_time}
                onChange={(e) => setSettings({ ...settings, morning_reminder_time: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 9:00 AM (09:00)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Night Closing Reminder Time</label>
              <input
                type="time"
                value={settings.night_reminder_time}
                onChange={(e) => setSettings({ ...settings, night_reminder_time: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 8:00 PM (20:00)</span>
            </div>
          </div>
        </div>

        {/* Google OAuth & Auth Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Google Single Sign-On (OAuth)</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Google OAuth Client ID</label>
            <input
              type="text"
              placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
              value={settings.google_client_id || ''}
              onChange={(e) => setSettings({ ...settings, google_client_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 outline-hidden"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Leave blank to use default master administrator login.
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-95"
        >
          {saved ? <CheckCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Settings Saved!' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
}
