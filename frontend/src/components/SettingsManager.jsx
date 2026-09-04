import React, { useState, useEffect } from "react";
import { 
  Settings, UserCheck, Mail, Lock, Phone, Calendar, Camera, Moon, Sun, Bell, BellOff, History, 
  Globe, Shield, LogOut, FileText, MessageSquare, HelpCircle, Save, CheckCheck, Trash2, 
  Eye, EyeOff, ExternalLink, Info 
} from "lucide-react";
import { api } from "../api";
import { translations } from "../translations";

export default function SettingsManager({ language = "en", onLanguageChange, onThemeChange, onSettingsSaved }) {
  const t = translations[language] || translations.en;
  const [activeSubTab, setActiveSubTab] = useState("account");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  const [settings, setSettings] = useState({
    super_admin_name: "Super Admin",
    super_admin_email: "admin@vktraders.com",
    super_admin_password: "admin123",
    super_admin_phone: "+91 98765 43210",
    super_admin_dob: "1988-06-15",
    super_admin_avatar: "",
    theme: "light",
    language: language || "en",
    time_zone: "Asia/Kolkata (IST +05:30)",
    website_url: "https://vktraders.in",
    notifications_enabled: "1",
    morning_reminder_time: "09:00",
    night_reminder_time: "20:00",
    google_client_id: "",
    company_name: "VK Traders",
    system_notes: "1. Verify worker daily wage overrides before saving attendance.\n2. Reconcile cash advances every Saturday afternoon.\n3. Process month-end salary ledger by the 1st of every month.",
    terms_conditions: "VK Traders Labour Management Terms & Conditions:\n- Daily attendance is recorded at 9:00 AM daily.\n- Half-day work is credited at 0.5x daily wage rate.\n- Advances and loan repayment deductions are settled against monthly wages."
  });

  const calculateAge = (dobString) => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  const currentAge = calculateAge(settings.super_admin_dob);

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.settings) {
        setSettings(prev => ({ ...prev, ...res.settings }));
        if (res.settings.language && onLanguageChange) onLanguageChange(res.settings.language);
        if (res.settings.theme && onThemeChange) onThemeChange(res.settings.theme);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.getAuditLogs(40);
      setAuditLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadSettings();
    loadAuditLogs();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      await api.updateSettings(settings, settings.super_admin_email);
      setSaved(true);
      if (onLanguageChange && settings.language) onLanguageChange(settings.language);
      if (onThemeChange && settings.theme) onThemeChange(settings.theme);
      if (onSettingsSaved) onSettingsSaved();
      loadAuditLogs();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleClearLogs = async () => {
    if (confirm("Are you sure you want to clear the audit trail?")) {
      try {
        await api.clearAuditLogs();
        loadAuditLogs();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handlePurgeMockData = async () => {
    if (confirm("Are you sure you want to purge all static mock/sample data? This will clear workers, attendance, advances, and loans.")) {
      try {
        await api.purgeMockData();
        loadAuditLogs();
        alert("All static mock records have been purged. Database is now clean.");
        window.location.reload();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleTestReminder = async () => {
    try {
      const res = await api.checkAttendanceReminder();
      if (res.reminderTriggered) {
        setTestResult("Reminder triggered for " + res.unmarkedWorkers + " pending labourers! Check the notification bell.");
      } else {
        setTestResult("All labourers marked for today! No alert triggered.");
      }
      setTimeout(() => setTestResult(""), 5000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, super_admin_avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    if (confirm(t.confirmLogout || "Are you sure you want to log out?")) {
      localStorage.removeItem("vk_token");
      window.location.reload();
    }
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSubmitted(true);
    setTimeout(() => {
      setSupportMessage("");
      setSupportSubmitted(false);
    }, 4000);
  };

  const tabs = [
    { id: "account", label: t.tabAccount || "Super Admin Profile", icon: UserCheck },
    { id: "preferences", label: t.tabPreferences || "Theme & Preferences", icon: Moon },
    { id: "security", label: t.tabSecurity || "OAuth & Security", icon: Shield },
    { id: "audit", label: t.tabAudit || "System Audit Logs", icon: History },
    { id: "notes", label: t.tabNotes || "Notes & Policy", icon: FileText },
    { id: "faq", label: t.tabHelpFaq || "Help, FAQ & Feedback", icon: HelpCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.settingsTitle || "System Settings & Administration"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.settingsSubtitle || "Configure super admin profile, security credentials, themes, notifications, audit trail, and system parameters"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-blue-600/30 transition active:scale-95"
          >
            {saved ? <CheckCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? (t.settingsSaved || "Settings Saved!") : (t.saveSettings || "Save Settings")}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout || "Logout"}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
                isActive 
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20" 
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeSubTab === "account" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md overflow-hidden ring-4 ring-blue-50 dark:ring-slate-800">
                {settings.super_admin_avatar ? (
                  <img src={settings.super_admin_avatar} alt="Super Admin" className="w-full h-full object-cover" />
                ) : (
                  <span>VK</span>
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md transition" title="Upload Avatar">
                <Camera className="w-4 h-4" />
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{settings.super_admin_name || "Super Admin"}</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">VK Traders Master Administrator</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{settings.super_admin_email}</p>
            </div>
            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{t.calculatedAge || "Age"}</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{currentAge} {t.yearsOld || "yrs"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Role</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">SUPER_ADMIN</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.accountDetails || "Super Admin Account Details"}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{t.accountSubtitle || "Manage master credentials and personal profile"}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">Live Sync</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.adminName || "Super Admin Full Name"}</label>
                <input type="text" value={settings.super_admin_name} onChange={e => setSettings({ ...settings, super_admin_name: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-hidden transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.adminEmail || "Official Email Address"}</label>
                <input type="email" value={settings.super_admin_email} onChange={e => setSettings({ ...settings, super_admin_email: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-hidden transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.adminPassword || "Super Admin Password"}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={settings.super_admin_password} onChange={e => setSettings({ ...settings, super_admin_password: e.target.value })} className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-hidden transition" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.mobileNumber || "Mobile Number"}</label>
                <input type="tel" value={settings.super_admin_phone} onChange={e => setSettings({ ...settings, super_admin_phone: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-hidden transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.dateOfBirth || "Date of Birth (DOB)"}</label>
                <input type="date" value={settings.super_admin_dob} onChange={e => setSettings({ ...settings, super_admin_dob: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-hidden transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.calculatedAge || "Auto Calculated Age"}</label>
                <div className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-xs font-extrabold text-blue-700 dark:text-blue-400 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span>{currentAge} {t.yearsOld || "years old"}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">(Computed from DOB)</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button type="button" onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition">
                {saved ? <CheckCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saved ? (t.settingsSaved || "Saved!") : (t.saveSettings || "Save Changes")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "preferences" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.themeSettings || "Theme & Appearance"}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Customize application visual appearance, localization, and automated reminder alerts</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <label className="text-xs font-bold text-slate-900 dark:text-white">{t.languageSetting || "System Interface Language"}</label>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Reflects on every single page, module, table header, button, and widget in real-time.</p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button type="button" onClick={() => { setSettings({ ...settings, language: "en" }); if (onLanguageChange) onLanguageChange("en"); }} className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${settings.language === "en" ? "bg-blue-600 text-white border-blue-600 shadow-xs" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"}`}>
                  <span>🇬🇧</span>
                  <span>{t.languageEnglish || "English"}</span>
                </button>
                <button type="button" onClick={() => { setSettings({ ...settings, language: "ta" }); if (onLanguageChange) onLanguageChange("ta"); }} className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${settings.language === "ta" ? "bg-blue-600 text-white border-blue-600 shadow-xs" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"}`}>
                  <span>🇮🇳</span>
                  <span>{t.languageTamil || "தமிழ் (Tamil)"}</span>
                </button>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <label className="text-xs font-bold text-slate-900 dark:text-white">{t.themeSettings || "Theme Settings"}</label>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Select clean light workspace or dark mode for the admin portal.</p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button type="button" onClick={() => { setSettings({ ...settings, theme: "light" }); if (onThemeChange) onThemeChange("light"); }} className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${settings.theme === "light" ? "bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-xs" : "bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"}`}>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>{t.lightTheme || "Light Theme"}</span>
                </button>
                <button type="button" onClick={() => { setSettings({ ...settings, theme: "dark" }); if (onThemeChange) onThemeChange("dark"); }} className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${settings.theme === "dark" ? "bg-blue-600 text-white border-blue-600 shadow-xs" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"}`}>
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span>{t.darkTheme || "Dark Theme"}</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.timeZone || "System Time Zone"}</label>
              <input type="text" value={settings.time_zone} onChange={e => setSettings({ ...settings, time_zone: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.websiteLink || "Official Website Link"}</label>
              <div className="relative">
                <input type="url" value={settings.website_url} onChange={e => setSettings({ ...settings, website_url: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500" />
                <a href={settings.website_url} target="_blank" rel="noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400 hover:text-blue-800">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {settings.notifications_enabled === "1" ? <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <BellOff className="w-5 h-5 text-rose-500" />}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.notificationsStatus || "Attendance Notifications (9:00 AM & 8:00 PM)"}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{settings.notifications_enabled === "1" ? (t.notificationsOn || "Notifications active.") : (t.notificationsOff || "Notifications muted.")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setSettings({ ...settings, notifications_enabled: settings.notifications_enabled === "1" ? "0" : "1" })} className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${settings.notifications_enabled === "1" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}`}>
                    <span>{settings.notifications_enabled === "1" ? "ENABLED" : "MUTED"}</span>
                  </button>
                  <button type="button" onClick={handleTestReminder} className="px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800 transition">Test Alert</button>
                </div>
              </div>
              {testResult && <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mt-2">{testResult}</div>}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "security" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.oauthDetails || "OAuth 2.0 & Authentication Details"}</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">{t.oauthSubtitle || "Google Single Sign-On configuration and session tokens"}</p>
            </div>
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.googleAuthStatus || "Google Single Sign-On Status"}</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${settings.google_client_id ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300" : "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300"}`}>
                  {settings.google_client_id ? (t.configured || "Configured") : (t.notConfigured || "Master Credentials Active")}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Enables VK Traders administrators to sign in using verified Google accounts (@vktraders.com).</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.googleClientId || "Google OAuth Client ID"}</label>
              <input type="text" placeholder="e.g. 1234567890-abcdef.apps.googleusercontent.com" value={settings.google_client_id} onChange={e => setSettings({ ...settings, google_client_id: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition" />
            </div>
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <span className="font-bold text-blue-900 dark:text-blue-300 block">{t.sessionExpiry || "Session Expiry Configuration"}</span>
              <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5 pt-1">
                <li>Super Admin JWT Bearer Token: Valid for 7 Days</li>
                <li>Labour Mobile Portal Session: Valid for 30 Days</li>
                <li>Cryptographic Algorithm: HMAC SHA-256 with salted pin hashing</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "audit" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.auditTrail || "System Activity & Audit Log"}</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">{t.auditSubtitle || "Chronological immutable log of all administrative actions"}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={loadAuditLogs} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition">Refresh</button>
              <button type="button" onClick={handlePurgeMockData} className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800 transition flex items-center gap-1" title="Purge mock data and reset all worker, attendance, advances, and loans tables">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset System Data</span>
              </button>
              <button type="button" onClick={handleClearLogs} className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900/50 transition flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.clearAuditLogs || "Clear Log"}</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">{t.action || "Action"}</th>
                  <th className="py-3 px-4">{t.module || "Module"}</th>
                  <th className="py-3 px-4">{t.details || "Details"}</th>
                  <th className="py-3 px-4">{t.user || "User"}</th>
                  <th className="py-3 px-4">{t.timestamp || "Timestamp"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {loadingLogs ? (
                  <tr><td colSpan="6" className="py-8 text-center text-slate-400 dark:text-slate-500">Loading activity records...</td></tr>
                ) : auditLogs.length === 0 ? (
                  <tr><td colSpan="6" className="py-8 text-center text-slate-400 dark:text-slate-500">{t.noAuditLogs || "No audit records logged yet."}</td></tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 dark:text-slate-500">#{log.id}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-extrabold text-[10px]">{log.action}</span></td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{log.module}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={log.details}>{log.details}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">{log.user_email}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{log.created_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === "notes" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.termsAndConditions || "Terms, Policies & Administrative Notes"}</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Internal notes, payroll guidelines, and terms of service</p>
            </div>
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.systemNotes || "Internal Administrator Notes"}</label>
              <textarea rows="5" value={settings.system_notes} onChange={e => setSettings({ ...settings, system_notes: e.target.value })} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition leading-relaxed" placeholder="Add instructions for payroll and supervisor teams..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.termsAndConditions || "Terms & Conditions for Workers & Administration"}</label>
              <textarea rows="5" value={settings.terms_conditions} onChange={e => setSettings({ ...settings, terms_conditions: e.target.value })} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition leading-relaxed" placeholder="Terms and conditions displayed in worker portal..." />
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button type="button" onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition">
                {saved ? <CheckCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saved ? (t.settingsSaved || "Saved!") : (t.saveNotes || "Save Notes & Policies")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "faq" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.faqTitle || "Frequently Asked Questions (FAQ)"}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Common questions about credentials, payroll formula, and portal logins</p>
              </div>
              <HelpCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{t.faqQ1 || "How do I reset or change the Super Admin password?"}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t.faqA1 || "Navigate to Settings -> Super Admin Profile tab, update the password field, and click Save Settings. The new password will take effect immediately for future logins."}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{t.faqQ2 || "How is worker Net Payable calculated?"}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t.faqA2 || "Net Payable = (Days Present x 1.0 + Half Days x 0.5) x Daily Wage Override - Advances - Monthly Loan Deduction."}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{t.faqQ3 || "How do labourers log into their mobile portal?"}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t.faqA3 || "Workers click Switch to Worker View and log in using their 10-digit registered mobile number and 4-digit PIN (defaulted to the last 4 digits of their phone number)."}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.helpFeedback || "Help & Support Feedback"}</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">{t.feedbackDesc || "Need technical assistance or want to suggest improvements for VK Traders?"}</p>
            </div>
            {supportSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCheck className="w-4 h-4" />
                <span>Thank you! Your support ticket/feedback has been registered successfully.</span>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message / Feedback Description</label>
                  <textarea rows="4" value={supportMessage} onChange={e => setSupportMessage(e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition" placeholder="Describe your question, request, or issue in detail..." required />
                </div>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition">
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.submitFeedback || "Submit Support Ticket"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
