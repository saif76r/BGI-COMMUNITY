import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Award, CheckSquare, Plus, CheckCircle, Download, FileText, Gift, Bookmark } from 'lucide-react';
import { Event, User } from '../types';
import { motion } from 'motion/react';

interface EventManagementViewProps {
  events: Event[];
  currentUser: User;
  onAddEvent: (event: Event) => void;
  onRegisterEvent: (eventId: string, userId: string) => void;
  onToggleAttendance: (eventId: string, userId: string) => void;
  allUsers: User[];
}

export default function EventManagementView({
  events,
  currentUser,
  onAddEvent,
  onRegisterEvent,
  onToggleAttendance,
  allUsers
}: EventManagementViewProps) {
  // New Event states
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-06-15');
  const [time, setTime] = useState('15:00 - 17:00');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [category, setCategory] = useState<'Workshop' | 'Seminar' | 'Social' | 'Meeting' | 'Festival'>('Workshop');

  // Certificate Modal state
  const [certificateDetails, setCertificateDetails] = useState<{
    userName: string;
    eventTitle: string;
    date: string;
    certId: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'registered' | 'moderate'>('all');

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;

    const newEvt: Event = {
      id: `evt-${Math.floor(100 + Math.random() * 900)}`,
      title,
      description,
      date,
      time,
      location,
      organizer: currentUser.name,
      capacity,
      registeredUsers: [],
      attendance: [],
      category
    };

    onAddEvent(newEvt);
    setShowAddModal(false);

    // clear fields
    setTitle('');
    setDescription('');
    setLocation('');
  };

  const isModeratorOrAdmin = currentUser.role === 'Admin' || currentUser.role === 'Moderator';

  // Toggle user registrations
  const handleRegToggle = (eventId: string) => {
    onRegisterEvent(eventId, currentUser.id);
  };

  // Generate certificate data
  const handleGenerateCertificate = (evt: Event) => {
    const randomHex = Math.random().toString(16).substr(2, 8).toUpperCase();
    const certNumber = `BGIC-${evt.id.substring(4)}-${randomHex}`;
    setCertificateDetails({
      userName: currentUser.name,
      eventTitle: evt.title,
      date: evt.date,
      certId: certNumber
    });
  };

  // Filtered views
  const filteredEvents = events.filter(e => {
    if (activeTab === 'registered') {
      return e.registeredUsers.includes(currentUser.id);
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-wide">BGI Calendars & Community Forums</h2>
          <p className="text-xs text-slate-400">Join academic workshops, confirm panel reservations, and generate participation awards.</p>
        </div>

        {isModeratorOrAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" /> Create Scheduled Activity
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'all' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          All Scheduled Activities
          {activeTab === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400"></div>}
        </button>

        <button
          onClick={() => setActiveTab('registered')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'registered' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          My Registered Seats ({events.filter(e => e.registeredUsers.includes(currentUser.id)).length})
          {activeTab === 'registered' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400"></div>}
        </button>
      </div>

      {/* Visual Directory of events cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map(evt => {
          const isRegistered = evt.registeredUsers.includes(currentUser.id);
          const hasAttended = evt.attendance.includes(currentUser.id);
          const isFull = evt.registeredUsers.length >= evt.capacity;

          return (
            <div key={evt.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 relative overflow-hidden group hover:border-slate-705">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-mono font-bold ${
                    evt.category === 'Workshop' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                    evt.category === 'Festival' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                    evt.category === 'Seminar' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {evt.category}
                  </span>
                  <h3 className="text-base font-bold text-white tracking-wide group-hover:text-cyan-400 transition-colors pt-1.5">{evt.title}</h3>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="text-xs text-slate-500 font-mono">Max Capacity</div>
                  <span className="text-sm font-mono font-black text-slate-200">{evt.registeredUsers.length} / {evt.capacity}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">{evt.description}</p>

              {/* Dynamic Schedules Details metadata */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{evt.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{evt.time}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-1">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">{evt.location}</span>
                </div>
              </div>

              {/* Primary action controls */}
              <div className="pt-2 flex flex-wrap gap-2.5 items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRegToggle(evt.id)}
                    disabled={isFull && !isRegistered}
                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                      isRegistered
                        ? 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25'
                        : isFull
                          ? 'bg-slate-800 text-slate-500 border border-slate-850 cursor-not-allowed'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                    }`}
                  >
                    {isRegistered ? 'Resign Reservation Seat' : isFull ? 'Seat reservations full' : 'Reserve active seat'}
                  </button>

                  {/* Certifications Generator Trigger */}
                  {isRegistered && (
                    <button
                      onClick={() => handleGenerateCertificate(evt)}
                      className={`text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                        hasAttended
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60 hover:text-white'
                      }`}
                      title={hasAttended ? 'Generate Participation Certificate' : 'Certificate releases upon Moderator attendance sign off'}
                    >
                      <Award className="w-4 h-4" />
                      {hasAttended ? 'Export Award Certificate' : 'Requires Attendance Check'}
                    </button>
                  )}
                </div>

                {isRegistered && (
                  <span className={`text-[10px] font-mono font-semibold flex items-center gap-1.5 ${hasAttended ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <CheckCircle className="w-4 h-4" />
                    {hasAttended ? 'Attended (Settle)' : 'Seat Locked'}
                  </span>
                )}
              </div>

              {/* Moderator Panel Drawer within specific event */}
              {isModeratorOrAdmin && (
                <div className="mt-4 pt-4 border-t border-slate-850 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Attendance Panel (Moderators/Admin)</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Registered Candidates: {evt.registeredUsers.length}</span>
                  </div>

                  {evt.registeredUsers.length > 0 ? (
                    <div className="max-h-[140px] overflow-y-auto divide-y divide-slate-850/50 bg-slate-950/40 rounded-lg p-2.5 border border-slate-850">
                      {evt.registeredUsers.map(uid => {
                        const candidate = allUsers.find(u => u.id === uid);
                        if (!candidate) return null;
                        const present = evt.attendance.includes(uid);

                        return (
                          <div key={uid} className="flex justify-between items-center py-1.5 text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-300">{candidate.name}</span>
                              <span className="text-[10px] text-slate-500">({candidate.memberId})</span>
                            </div>
                            <button
                              onClick={() => onToggleAttendance(evt.id, uid)}
                              className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border transition-colors ${
                                present
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                            >
                              {present ? 'Present ✅' : 'Mark Present'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[11px] font-mono text-slate-500 italic text-center py-3 bg-slate-950/40 rounded-lg border border-slate-850">
                      No candidate has booked active reservations for this scheduled event yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE EVENT MODAL DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-white font-display font-black text-lg">Schedule BGI Event Forum</h3>

            <form onSubmit={handleCreateEventSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Event Forum Title</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Robotics Open Exhibition"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Interactive Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed breakdown of panels, speakers, and schedule rules."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Forum Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Hour Schedules</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex. 14:00 - 16:30"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Location Room</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex. Auditorium Level 4"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Capacity Cap</label>
                  <input
                    type="number"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value) || 50)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Forum Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Social">Social</option>
                  <option value="Festival">Festival</option>
                  <option value="Meeting">Meeting</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold py-2 px-4 rounded-xl hover:brightness-105 active:scale-95 transition-all text-sm"
                >
                  Publish Forum Activity
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-xl hover:bg-slate-700 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPORTABLE COMPLIANCE PARTICIPATION AWARD MODAL SCREEN */}
      {certificateDetails && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-3xl w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-white font-display font-medium text-md">BGI Certificate of Excellence Generator</h3>
              </div>
              <button
                onClick={() => setCertificateDetails(null)}
                className="text-slate-400 hover:text-white font-semibold text-sm font-sans"
              >
                Close (X)
              </button>
            </div>

            {/* Custom styled vector graphics decorative border Certificate Frame */}
            <div className="p-4 bg-slate-950 rounded-xl relative overflow-hidden flex justify-center border border-slate-850">
              {/* Outer double border framing */}
              <div className="w-full max-w-2xl bg-[#090d16] border-8 border-amber-600/30 p-8 text-center relative font-serif text-slate-350 space-y-6 select-none shadow-inner">
                {/* Visual vector decorative corner bounds */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400"></div>
                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400"></div>
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400"></div>
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400"></div>

                <div className="space-y-1">
                  <h4 className="text-sm font-mono tracking-[4px] uppercase text-amber-400">BGI Community Organization</h4>
                  <p className="text-[10px] font-sans text-slate-500 uppercase tracking-widest leading-none">Internal Educational Accreditation Wing</p>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-serif text-slate-100 font-medium italic">Certificate of Active Participation</h2>
                  <p className="text-xs font-sans text-slate-400 leading-none">This honors index warrants that</p>
                </div>

                <div className="py-2">
                  <h3 className="text-xl font-bold font-sans text-white border-b border-dashed border-amber-500 max-w-md mx-auto pb-1.5 tracking-wide">
                    {certificateDetails.userName}
                  </h3>
                </div>

                <div className="space-y-4 text-xs font-sans text-slate-400 leading-relaxed max-w-lg mx-auto">
                  <p>
                    has successfully registered, attended validation counters, and completed the comprehensive operational module for
                  </p>
                  <h4 className="text-sm font-bold text-slate-200 uppercase font-display font-mono tracking-wide">{certificateDetails.eventTitle}</h4>
                  <p className="text-[10px] text-slate-500">
                    conducted and certified on standard schedules: <span className="text-slate-400">{certificateDetails.date}</span> at BGI Local Center Hubs.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 text-[10px] font-mono items-end border-t border-slate-850">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-8 flex items-center justify-center border-b border-slate-700 text-slate-400 italic text-[11px]">
                      ~ Executive Admin ~
                    </div>
                    <span className="text-slate-500 pt-1">BGI COMMITTEE BOARD</span>
                  </div>

                  <div className="flex flex-col items-center">
                    {/* Simulated security stamp stamp */}
                    <div className="w-14 h-14 bg-gradient-to-tr from-amber-500/10 to-transparent border border-amber-500/30 rounded-full flex items-center justify-center text-[8px] font-bold text-amber-500/80 uppercase rotate-12 scale-90">
                      Accredited
                    </div>
                    <span className="text-slate-500 pt-1">REGISTRATION SEAL</span>
                  </div>
                </div>

                <div className="pt-2 text-[9px] font-mono text-slate-600 flex justify-between">
                  <span>REF INDEX: {certificateDetails.certId}</span>
                  <span>DIGITAL ACCREDITATION VALID</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold py-2.5 rounded-lg text-xs font-display flex items-center justify-center gap-1.5 hover:brightness-105 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" /> Download Certificate (PDF)
              </button>
              <button
                onClick={() => setCertificateDetails(null)}
                className="bg-slate-800 text-white font-semibold py-2.5 px-5 rounded-lg text-xs hover:bg-slate-705"
              >
                Dismiss Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
