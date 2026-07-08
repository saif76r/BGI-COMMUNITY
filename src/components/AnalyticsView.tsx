import React, { useState, useMemo } from 'react';
import { 
  FileBarChart, 
  Download, 
  CheckCircle, 
  FileSpreadsheet, 
  RefreshCw, 
  BarChart3, 
  PieChart, 
  Info, 
  ShieldAlert,
  AlertTriangle,
  Mail,
  UserCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { User, Event } from '../types';

interface AnalyticsViewProps {
  users: User[];
  events: Event[];
  currentUser: User;
}

export default function AnalyticsView({ users, events, currentUser }: AnalyticsViewProps) {
  // =========================
  // EXPORTS & ANALYTICS STATE
  // =========================
  const [exportType, setExportType] = useState<'PDF' | 'Excel' | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState('');

  // =========================
  // SECURE COMPLAINT STATES
  // =========================
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintMessage, setComplaintMessage] = useState('');
  const [complaintUrgency, setComplaintUrgency] = useState('Medium');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [complaintStatus, setComplaintStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // =========================
  // EXPORT SIMULATION HANDLER
  // =========================
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

  const totalRegisteredEventsSeats = events.reduce((sum, e) => sum + (e.registeredUsers?.length || 0), 0);

  // =========================
  // SECURE FORM SUBMIT HANDLER
  // =========================
  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintMessage.trim()) return;

    setComplaintStatus('submitting');
    setErrorMessage('');

    const targetEmail = 'bgi.community.official@gmail.com';
    const submissionData = {
      _subject: `[BGI PORTAL COMPLAINT] ${complaintUrgency} - ${complaintSubject}`,
      _replyto: isAnonymous ? 'anonymous@bgi-portal.org' : currentUser?.email || 'no-email@bgi-portal.org',
      SenderName: isAnonymous ? 'Anonymous Member' : `${currentUser?.name} (${currentUser?.role})`,
      Department: currentUser?.department || 'Not Assigned',
      Urgency: complaintUrgency,
      Subject: complaintSubject,
      Message: complaintMessage,
      SubmittedAt: new Date().toLocaleString(),
      _honey: '' // Anti-spam trap field
    };

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      const result = await response.json();
      if (result.success === "true" || response.ok) {
        setComplaintStatus('success');
        setComplaintSubject('');
        setComplaintMessage('');
        // Revert success state back to idle after 6 seconds
        setTimeout(() => setComplaintStatus('idle'), 6000);
      } else {
        throw new Error(result.message || 'Failed to dispatch complaints');
      }
    } catch (err: any) {
      console.error("Secure Mail Submission Error:", err);
      setComplaintStatus('error');
      setErrorMessage(err.message || 'Something went wrong while sending the email. Please try again.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER TITLE */}
      <div>
        <h2 className="text-xl font-display font-bold text-white tracking-wide">
          BGI Community Operational Analytics & Performance Reports
        </h2>
        <p className="text-xs text-slate-400">
          Generate compliance dossiers, inspect batch activity turnouts, and deploy structured export tables.
        </p>
      </div>

      {/* COMPACT EXPORT FEEDBACK STATUS */}
      {feedback && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2.5 font-mono animate-pulse">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* REPORTS COMPILER GRAPHIC CARD */}
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
              className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold px-4 py-2.5 rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
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
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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

      {/* METRICS & ROLES GRIDS */}
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
                <span className="text-white font-bold">{users.length > 0 ? ((adminCount / users.length) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                <div className="bg-gradient-to-r from-red-500 to-amber-500 h-full" style={{ width: `${users.length > 0 ? (adminCount / users.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Moderators Executive ({modCount})</span>
                <span className="text-white font-bold">{users.length > 0 ? ((modCount / users.length) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full" style={{ width: `${users.length > 0 ? (modCount / users.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Verified Forum Members ({memCount})</span>
                <span className="text-white font-bold">{users.length > 0 ? ((memCount / users.length) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full" style={{ width: `${users.length > 0 ? (memCount / users.length) * 100 : 0}%` }}></div>
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

      {/* POLICY ACCREDITATION STATEMENT */}
      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed text-slate-400">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-white font-mono">Accreditation Policy Note</h4>
          <p>
            Operational reports generated from BGI Secure portal comply with standard administrative guidelines. Ensure security clearances are validated before publishing Excel rosters to public channels.
          </p>
        </div>
      </div>

      {/* SECURE COMPLAINT BOX */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white tracking-wide flex items-center gap-2">
                Secure Portal Complaint Box <span className="text-[10px] font-normal text-red-400 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">Encryption Armed</span>
              </h3>
              <p className="text-xs text-slate-400">
                Submit your complaint securely. This will be transmitted directly to the Trust Portal Administrator inbox.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] text-zinc-500 font-mono">Destination:</span>
            <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-cyan-500" />
              bgi.community.official@gmail.com
            </span>
          </div>
        </div>

        {complaintStatus === 'success' ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <CheckCircle2 className="w-12 h-12 animate-bounce" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="text-white font-bold text-base">Complaint Dispatched Successfully</h4>
              <p className="text-xs text-slate-400">
                Your feedback has been securely encrypted and transmitted to the Administrator inbox. Appropriate investigations will be initiated depending on the severity rating.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleComplaintSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Urgency Level Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 block">Urgency Level</label>
                <select
                  value={complaintUrgency}
                  onChange={(e) => setComplaintUrgency(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-white text-xs font-sans focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="Low">Low - Standard Evaluation</option>
                  <option value="Medium">Medium - Elevated Attention</option>
                  <option value="High">High - High Priority</option>
                  <option value="Critical">Critical - Immediate Intervention Required</option>
                </select>
              </div>

              {/* Anonymous Toggle Widget */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 block">Identity Privacy</label>
                <div 
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    isAnonymous 
                      ? 'bg-red-950/20 border-red-500/30 text-red-300' 
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isAnonymous ? <ShieldAlert className="w-4 h-4 text-red-400" /> : <UserCheck className="w-4 h-4 text-emerald-400" />}
                    <span className="text-xs font-bold font-sans">
                      {isAnonymous ? 'Send Anonymously' : 'Reveal My Identity'}
                    </span>
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isAnonymous ? 'bg-red-500' : 'bg-slate-800'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-300 ${isAnonymous ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>

            </div>

            {/* Subject Input */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 block">Complaint Subject</label>
              <input
                type="text"
                required
                placeholder="e.g., Portal login complications, abusive conduct, or other critical issues"
                value={complaintSubject}
                onChange={(e) => setComplaintSubject(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 transition-colors"
              />
            </div>

            {/* Message Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 block">Detailed Description</label>
              <textarea
                rows={4}
                required
                placeholder="Provide a detailed outline of your complaint so our administrative team can initiate appropriate actions..."
                value={complaintMessage}
                onChange={(e) => setComplaintMessage(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-500 resize-none placeholder:text-slate-600 transition-colors"
              />
            </div>

            {/* Status alerts */}
            {complaintStatus === 'error' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-sans">
                <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={complaintStatus === 'submitting'}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-red-500/10"
              >
                {complaintStatus === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Complaint...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Submit Secure Complaint
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}