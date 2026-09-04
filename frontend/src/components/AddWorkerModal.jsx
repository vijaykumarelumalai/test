import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  MessageSquareShare,
  Sparkles
} from 'lucide-react';
import { api } from '../api';
import { translations } from '../translations';

export default function AddWorkerModal({ isOpen, onClose, onWorkerCreated, language = 'en' }) {
  const t = translations[language] || translations.en;
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    workerType: 'PERMANENT',
    department: '',
    dailyWage: '',
    emergencyContact: ''
  });

  const [departments, setDepartments] = useState([]);
  const [customDept, setCustomDept] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getDepartments().then(res => {
        const depts = res.departments || [];
        setDepartments(depts);
        if (depts.length > 0 && !formData.department) {
          setFormData(prev => ({ ...prev, department: depts[0] }));
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const finalDept = customDept.trim() || formData.department || 'General Site';
      const res = await api.createWorker({
        ...formData,
        department: finalDept
      });
      setCreatedResult(res);
      if (onWorkerCreated) onWorkerCreated();
    } catch (err) {
      setError(err.message || 'Failed to create worker');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = () => {
    if (createdResult?.welcomeMessage?.fullText) {
      navigator.clipboard.writeText(createdResult.welcomeMessage.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleClose = () => {
    setCreatedResult(null);
    setError('');
    setFormData({
      name: '',
      phone: '',
      workerType: 'PERMANENT',
      department: departments[0] || '',
      dailyWage: '',
      emergencyContact: ''
    });
    setCustomDept('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">{t.addNewWorker || 'Add New Labour'}</h2>
              <p className="text-xs text-blue-200">Auto-assigns VK-XXX ID & default PIN</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {createdResult ? (
            /* Success & Bilingual SMS View */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <h3 className="font-extrabold text-base text-emerald-900 dark:text-emerald-200">
                  {t.onboardingSuccess || 'Worker Successfully Onboarded!'}
                </h3>
                <div className="mt-2 flex items-center justify-center gap-3">
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-black tracking-wider">
                    ID: {createdResult.worker.labour_id}
                  </span>
                  <span className="px-3 py-1 bg-white dark:bg-slate-850 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-bold">
                    {t.pin || 'PIN'}: {createdResult.worker.defaultPin}
                  </span>
                </div>
              </div>

              {/* Bilingual Message Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-4 h-4" /> {t.welcomeSms || 'Welcome SMS (Tamil & English)'}
                  </span>
                  <button
                    onClick={handleCopyMessage}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? (t.copied || 'Copied!') : (t.copyText || 'Copy Text')}
                  </button>
                </div>

                {/* Message Content */}
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2 font-medium bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 max-h-36 overflow-y-auto">
                  <p className="text-slate-900 dark:text-white">{createdResult.welcomeMessage.english}</p>
                  <p className="text-slate-600 dark:text-slate-400 font-tamil border-t border-slate-100 dark:border-slate-800 pt-2">
                    {createdResult.welcomeMessage.tamil}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={createdResult.welcomeMessage.whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
                >
                  <MessageSquareShare className="w-4 h-4" />
                  <span>{t.sendViaWhatsApp || 'Send via WhatsApp'}</span>
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-3 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
                >
                  {t.done || 'Done'}
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-900/50">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.workerFullName || 'Full Name'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                />
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.mobileNumberDigits || 'Mobile Number (10 digits)'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9840123456"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                  Last 4 digits will automatically become their default login PIN.
                </span>
              </div>

              {/* Worker Type & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.workerType || 'Worker Type'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.workerType}
                    onChange={(e) => setFormData({ ...formData, workerType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden"
                  >
                    <option value="PERMANENT">{t.permanent || 'Permanent'}</option>
                    <option value="TEMPORARY">{t.temporary || 'Temporary'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.departmentSite || 'Department / Site'}
                  </label>
                  {departments.length > 0 && !customDept ? (
                    <select
                      value={formData.department}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setCustomDept(' ');
                        } else {
                          setFormData({ ...formData, department: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      <option value="__CUSTOM__">+ New Department...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter department/site name"
                      value={customDept.trim()}
                      onChange={(e) => setCustomDept(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden"
                    />
                  )}
                </div>
              </div>

              {/* Daily Wage Rate */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.defaultDailyWageRate || 'Default Daily Wage Rate (₹)'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.dailyWage}
                    onChange={(e) => setFormData({ ...formData, dailyWage: e.target.value })}
                    placeholder="Enter daily wage amount"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.emergencyContactOptional || 'Emergency Contact (Optional)'}
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="Optional contact number"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition active:scale-95 disabled:opacity-50"
                >
                  {loading ? (t.onboardingLabour || 'Onboarding Labour...') : (t.onboardLabour || 'Onboard & Generate ID')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
