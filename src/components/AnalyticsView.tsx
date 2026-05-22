import React, { useState } from 'react';
import { FileBarChart, Download, CheckCircle, FileSpreadsheet, RefreshCw, BarChart3, PieChart, Info, ShieldAlert } from 'lucide-react';
import { User, Event } from '../types';
import { motion } from 'motion/react';

interface AnalyticsViewProps {
  users: User[];
  events: Event[];
}

export default function AnalyticsView({ users, events }: AnalyticsViewProps) {
  // Mock Exports state variables
  const [exportType, setExportType] = useState<'PDF' | 'Excel' | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const triggerExport = (type: 'PDF' | 'Excel') => {
    setExportType(type);
    setIsExporting(true);
    setFeedback('');

    setTimeout(() => {
      setIsExporting(false);
      setExportType(null);
      setFeedback(`BGI_Community_Report_May_2026.${type === 'PDF' ? 'pdf' : 'xlsx'} successfully generated and stored to downloads!`);

      setTimeout(() => {
        setFeedback('');
      }, 4000);
    }, 1800);
  };

  // Derive simple breakdowns
  const adminCount = users.filter(u => u.role === 'Admin').length;
  const modCount = users.filter(u => u.role === 'Moderator').length;
  const memCount = users.filter(u => u.role === 'Member').length;

  const totalRegisteredEventsSeats = events.reduce((sum, e) => sum + e.registeredUsers.length, 0);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-xl font-display font-bold text-white tracking-wide">BGI Community Operational Analytics & Performance Reports</h2>
        <p className="text-xs text-slate-400">Generate compliance dossiers, inspect batch activity turnouts, and deploy structured export tables.</p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2.5 font-mono animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Reports generation console */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

        <div className="lg:col-span-12 space-y-4 relative">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] uppercase font-bold tracking-widest">
            <FileBarChart className="w-4 h-4" /> Comprehensive Data Compilers
          </div>
          <h3 className="text-lg font-display font-bold text-white tracking-tight">Export Unified Community Rosters & Logs</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-sans text-slate-405">
            BGI system compiles the full user registry database, active task timeline progressions, notice board posts, and upcoming scheduler indices. Clean and format indices with a single click.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              onClick={() => triggerExport('PDF')}
              disabled={isExporting}
              className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold px-4 py-2.5 rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md hover:scale-[1.02] disabled:opacity-50"
            >
              {isExporting && exportType === 'PDF' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting && exportType === 'PDF' ? 'Compiling Dossier PDF...' : 'Assemble & Export PDF Report'}
            </button>

            <button
              onClick={() => triggerExport('Excel')}
              disabled={isExporting}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isExporting && exportType === 'Excel' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              )}
              {isExporting && exportType === 'Excel' ? 'Structuring Sheets...' : 'Assemble & Export Excel (xlsx)'}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Analytics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metric block 1: Roll distribution bars */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Administrative Role Distributions</h4>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Total Administrators ({adminCount})</span>
                <span className="text-white font-bold">{((adminCount / users.length) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                <div className="bg-gradient-to-r from-red-500 to-amber-500 h-full" style={{ width: `${(adminCount / users.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Moderators Executive ({modCount})</span>
                <span className="text-white font-bold">{((modCount / users.length) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full" style={{ width: `${(modCount / users.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Verified Forum Members ({memCount})</span>
                <span className="text-white font-bold">{((memCount / users.length) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full" style={{ width: `${(memCount / users.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Metric block 2: Engagement numbers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Active Forum Engagement Indices</h4>
            <PieChart className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center h-[120px]">
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                <span className="text-slate-400">Events Seats Reserved: <span className="text-white font-bold">{totalRegisteredEventsSeats}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                <span className="text-slate-400">Registered System Members: <span className="text-white font-bold">{users.length} profiles</span></span>
              </div>
            </div>

            <div className="border border-slate-850 rounded-xl p-3 bg-slate-950/60 text-center font-mono space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Operational Density</div>
              <div className="text-xl font-black text-cyan-400">98.2 / 100</div>
              <div className="text-[9px] text-slate-500">Exceptional stability rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit reports disclaimer lines */}
      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed text-slate-400">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-white font-mono">Accreditation Policy Note</h4>
          <p>
            Operational reports generated from BGI Secure portal comply with standard administrative guidelines. Ensure security clearances are validated before publishing Excel rosters to public channels.
          </p>
        </div>
      </div>
    </div>
  );
}
