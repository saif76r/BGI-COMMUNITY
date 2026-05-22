import React from 'react';
import { Users, Calendar, Megaphone, Pin, HelpCircle, ChevronRight, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { Announcement, Event, User } from '../types';
import { motion } from 'motion/react';

interface DashboardViewProps {
  users: User[];
  announcements: Announcement[];
  events: Event[];
  currentUser: User;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ 
  users, 
  announcements, 
  events, 
  currentUser, 
  onNavigate
}: DashboardViewProps) {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const pendingUsers = users.filter(u => u.status === 'Pending').length;

  const urgentNotice = announcements.find(a => a.category === 'Urgent');
  const recentNotices = announcements.slice(0, 3);

  // SVG Custom Charts Data points
  const memberGrowthData = [
    { month: 'Jan', count: 18 },
    { month: 'Feb', count: 24 },
    { month: 'Mar', count: 32 },
    { month: 'Apr', count: 45 },
    { month: 'May', count: 58 },
  ];

  // SVG Chart Dimensions & Computations
  const maxMemberCount = Math.max(...memberGrowthData.map(d => d.count)) * 1.2;
  const chartWidth = 500;
  const chartHeight = 200;

  return (
    <div className="space-y-6 font-sans">
      {/* Welcome Banner */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-2xl -ml-20 -mb-20"></div>

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {currentUser.role} Portal
              </span>
              {urgentNotice && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1 animate-pulse">
                  <Pin className="w-3 h-3" /> Pinned Bulletin
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-medium text-slate-150 tracking-tight">
              Welcome back, <span className="font-bold text-white bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{currentUser.name}</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Manage core assets, schedule activities, view notice boards, and sync departments right from the console.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('messages')}
              className="bg-slate-950/80 text-cyan-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4" /> Message Hub
            </button>
            <button
              onClick={() => onNavigate('members')}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              <Users className="w-4 h-4 text-slate-950" /> BGI Directory
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">Members</span>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-2.5">
            <h2 className="text-3xl font-display font-bold text-white">{totalUsers}</h2>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="text-emerald-500 font-bold">{activeUsers} Active</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-500 font-bold">{pendingUsers} Pending</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">Total Growth</span>
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-2.5">
            <h2 className="text-3xl font-display font-bold text-white">+210%</h2>
            <p className="text-[11px] text-slate-500 mt-1">Increasing quarterly members intake</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">Active Events</span>
            <Calendar className="w-5 h-5 text-pink-400" />
          </div>
          <div className="mt-2.5">
            <h2 className="text-3xl font-display font-bold text-white">{events.length}</h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Next schedule: {events[0]?.date || 'None scheduled'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts & Interactive Statistics grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Metric 1: Member Intake scale */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Batchwise Member Intake</h3>
              <p className="text-xs text-slate-400 mt-0.5">Incremental intake numbers mapped from Q1 to current</p>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>

          {/* Interactive Custom SVG Graph */}
          <div className="h-[210px] w-full bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 relative flex flex-col justify-between">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2={chartWidth - 20} y2="20" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="40" y1="80" x2={chartWidth - 20} y2="80" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="40" y1="140" x2={chartWidth - 20} y2="140" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="40" y1="180" x2={chartWidth - 20} y2="180" stroke="#334155" strokeWidth="1.5" />

              {/* Curves Area */}
              <path
                d={`
                  M 40, ${180 - (memberGrowthData[0].count / maxMemberCount) * 160}
                  L 140, ${180 - (memberGrowthData[1].count / maxMemberCount) * 160}
                  L 240, ${180 - (memberGrowthData[2].count / maxMemberCount) * 160}
                  L 340, ${180 - (memberGrowthData[3].count / maxMemberCount) * 160}
                  L 440, ${180 - (memberGrowthData[4].count / maxMemberCount) * 160}
                  L 440, 180
                  L 40, 180
                  Z
                `}
                fill="url(#blue-gradient)"
                opacity="0.15"
              />

              {/* Curve Line */}
              <path
                d={`
                  M 40, ${180 - (memberGrowthData[0].count / maxMemberCount) * 160}
                  L 140, ${180 - (memberGrowthData[1].count / maxMemberCount) * 160}
                  L 240, ${180 - (memberGrowthData[2].count / maxMemberCount) * 160}
                  L 340, ${180 - (memberGrowthData[3].count / maxMemberCount) * 160}
                  L 440, ${180 - (memberGrowthData[4].count / maxMemberCount) * 160}
                `}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Dynamic Coordinate Points and hover tags */}
              {memberGrowthData.map((d, idx) => {
                const cx = 40 + idx * 100;
                const cy = 180 - (d.count / maxMemberCount) * 160;
                return (
                  <g key={d.month} className="group/dot cursor-pointer">
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6"
                      fill="#3b82f6"
                      className="transition-all duration-300 origin-center group-hover/dot:r-8 hover:fill-[#60a5fa]"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="12"
                      fill="#3b82f6"
                      opacity="0"
                      className="transition-all duration-300 hover:opacity-[0.15]"
                    />
                    <text
                      x={cx}
                      y={cy - 12}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      className="opacity-0 group-hover/dot:opacity-100 transition-opacity bg-slate-900 duration-200"
                    >
                      {d.count}
                    </text>
                    <text
                      x={cx}
                      y="196"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="var(--font-mono)"
                    >
                      {d.month}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between items-center px-4 font-mono text-[10px] text-slate-500">
              <span>* Hover node points to review specific database counts.</span>
              <span className="text-blue-400">Total verified intake: {totalUsers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements and Quick Bulletin boards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pinned bullet lists */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Community Notice Board</h3>
            </div>
            <button
              onClick={() => onNavigate('notices')}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-0.5"
            >
              View All Board <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentNotices.length > 0 ? (
              recentNotices.map((ann) => (
                <div key={ann.id} className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 hover:border-slate-700/80 transition-all flex gap-3 relative overflow-hidden">
                  {ann.pinned && (
                    <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center">
                      <Pin className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                  )}
                  <span className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${
                    ann.category === 'Urgent' ? 'bg-red-500 animate-pulse' :
                    ann.category === 'Finance' ? 'bg-pink-400' :
                    ann.category === 'Event' ? 'bg-emerald-400' : 'bg-slate-400'
                  }`} />
                  <div className="space-y-1">
                    <div className="flex gap-2 items-center flex-wrap">
                      <h4 className="text-sm font-bold text-slate-200">{ann.title}</h4>
                      <span className="text-[10px] px-1.5 bg-slate-800 text-slate-400 rounded uppercase font-mono">{ann.category}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{ann.content}</p>
                    <div className="flex gap-3 text-[10px] text-slate-500 font-mono pt-1.5">
                      <span>By: {ann.publishedBy} ({ann.publisherRole})</span>
                      <span>•</span>
                      <span>{ann.date}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">No active announcements publish logs found.</p>
            )}
          </div>
        </div>

        {/* Side Panel: Forums & Reminders */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Upcoming Events</h3>
            <button
              onClick={() => onNavigate('events')}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
            >
              Calendar Schedule
            </button>
          </div>

          <div className="space-y-3">
            {events.slice(0, 2).map((evt) => (
              <div key={evt.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-2 group">
                <div className="flex justify-between items-start gap-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{evt.title}</h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-pink-500/10 text-pink-400 rounded uppercase shrink-0">
                    {evt.category}
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{evt.date} @ {evt.time}</span>
                  </div>
                  <div className="truncate text-slate-400">
                    Loc: {evt.location}
                  </div>
                </div>
                <div className="pt-1.5 flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">{evt.registeredUsers.length} Registered</span>
                  <button
                    onClick={() => onNavigate('events')}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    Manage Seats &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Support Card */}
          <div className="p-4 bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 rounded-xl space-y-2 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 text-slate-800/20 translate-x-3 translate-y-3">
              <HelpCircle className="w-20 h-20" />
            </div>
            <h4 className="text-xs font-bold font-display text-white">Need Administrative Support?</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Connect with Committee Moderators directly inside the <span className="underline text-cyan-400 cursor-pointer" onClick={() => onNavigate('messages')}>Internal Messaging Chatboard</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
