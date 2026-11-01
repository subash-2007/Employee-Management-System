import React, { useState, useEffect } from 'react';
import { 
  Settings, Building2, Mail, Phone, Clock, 
  RotateCcw, CheckCircle2, Shield, Database, Save
} from 'lucide-react';
import { api } from '../services/api';
import { CompanySettings } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface SettingsPageProps {
  onDataReset?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onDataReset }) => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reset confirmation
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      showToast('System configuration saved successfully');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetSampleData = async () => {
    setResetting(true);
    try {
      await api.resetSampleData();
      showToast('Sample dataset restored successfully!');
      loadSettings();
      if (onDataReset) onDataReset();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResetting(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Loading system preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">System Preferences & Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure organization identity, standard working hours, and sample database seeding.
        </p>
      </div>

      {/* Organization Details Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5 text-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-600" /> Organization Profile
            </h3>
            <p className="text-3xs text-slate-400 mt-0.5">Company branding displayed across system headers and exports</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              value={settings.company_name}
              onChange={e => setSettings({ ...settings, company_name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Corporate Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={e => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">HR Contact Email</label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Support Phone</label>
            <input
              type="text"
              value={settings.contact_phone}
              onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Official Working Hours</label>
            <input
              type="text"
              value={settings.working_hours}
              onChange={e => setSettings({ ...settings, working_hours: e.target.value })}
              placeholder="09:00 AM - 06:00 PM"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Default Employee ID Prefix</label>
            <input
              type="text"
              value={settings.auto_emp_prefix}
              onChange={e => setSettings({ ...settings, auto_emp_prefix: e.target.value })}
              placeholder="AUS-EMP"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
      </form>

      {/* Database Management & Diagnostics */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" /> Database & Demonstration Data
            </h3>
            <p className="text-3xs text-slate-400 mt-0.5">SQLite engine with foreign key cascades and seed dataset</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            SQLite Active (ems.db)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900">Restore Auspify Technologies Demo Data</h4>
            <p className="text-3xs text-slate-500 mt-0.5 max-w-md">
              Reset all employees, departments, designations, and attendance records back to the pristine internship sample dataset.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            disabled={resetting}
            className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {resetting ? 'Resetting...' : 'Reset Sample Data'}
          </button>
        </div>
      </div>

      {/* Reset Confirmation */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetSampleData}
        title="Reset Sample Records"
        message="Are you sure you want to restore the default sample dataset? This will overwrite recent modifications with the default 15+ employees, 5 departments, 12 designations, and attendance records."
        confirmText="Restore Demo Dataset"
        isDestructive={true}
      />
    </div>
  );
};
