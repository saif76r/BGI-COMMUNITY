import React, { useState } from 'react';
import { Megaphone, Pin, Plus, Calendar, User, Tag, Trash2, Bold, Italic, List, ChevronRight, Archive, CheckCircle } from 'lucide-react';
import { Announcement, User as UserType, UserRole } from '../types';
import { motion } from 'motion/react';

interface NoticesViewProps {
  announcements: Announcement[];
  currentUser: UserType;
  onAddNotice: (notice: Announcement) => void;
  onDeleteNotice: (id: string) => void;
}

export default function NoticesView({
  announcements,
  currentUser,
  onAddNotice,
  onDeleteNotice
}: NoticesViewProps) {
  // New State variables
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'General' | 'Urgent' | 'Academic' | 'Event' | 'Finance'>('General');
  const [pinned, setPinned] = useState(false);

  // Simple rich text editor formatting mimics (appending styling markdown or logs)
  const [activeFormat, setActiveFormat] = useState({ bold: false, italic: false, bullets: false });

  // Filters
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'All' | 'General' | 'Urgent' | 'Academic' | 'Event' | 'Finance'>('All');

  const isPublisher = currentUser.role === 'Admin' || currentUser.role === 'Moderator';

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    // Build notice item
    const newNotice: Announcement = {
      id: `ann-${Math.floor(100 + Math.random() * 900)}`,
      title,
      content,
      publishedBy: currentUser.name,
      publisherRole: currentUser.role,
      date: new Date().toISOString().split('T')[0],
      pinned,
      category
    };

    onAddNotice(newNotice);
    setShowEditor(false);

    // reset fields
    setTitle('');
    setContent('');
    setPinned(false);
    setCategory('General');
  };

  const applyTextFormat = (action: 'bold' | 'italic' | 'bullets') => {
    setActiveFormat(prev => {
      const updated = { ...prev, [action]: !prev[action] };
      // Simulate real-time mock text formatting wraps
      if (action === 'bold') {
        setContent(c => c + ' **[Bold Text]** ');
      } else if (action === 'italic') {
        setContent(c => c + ' *[Italic Text]* ');
      } else if (action === 'bullets') {
        setContent(c => c + '\n- Bullet Point ');
      }
      return updated;
    });
  };

  const filteredAnnouncements = announcements.filter(a => {
    return activeCategoryFilter === 'All' || a.category === activeCategoryFilter;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-wide">Notices & Community Broadcast Bulletin</h2>
          <p className="text-xs text-slate-400">Read official circulars, pin academic reminders, and draft customized bulletins.</p>
        </div>

        {isPublisher && (
          <button
            onClick={() => setShowEditor(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            Publish Circular Notice
          </button>
        )}
      </div>

      {/* Categories filters */}
      <div className="flex gap-2 flex-wrap pb-1 overflow-x-auto">
        {(['All', 'General', 'Urgent', 'Academic', 'Event', 'Finance'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border transition-all ${
              activeCategoryFilter === cat
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-505/40 border-cyan-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {cat} Channel
          </button>
        ))}
      </div>

      {/* Pinned Alerts Display */}
      {announcements.some(a => a.pinned) && activeCategoryFilter === 'All' && (
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-mono tracking-widest text-slate-500 flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5 text-amber-400 animate-bounce" /> Pinned Important Circulars
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.filter(a => a.pinned).map(ann => (
              <div key={ann.id} className="bg-slate-900 border border-amber-500/20 rounded-xl p-4 space-y-3 relative overflow-hidden bg-gradient-to-r from-slate-900 to-amber-950/20">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 items-center">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-[10px] uppercase font-mono px-1.5 bg-amber-500/10 text-amber-400 rounded">
                      {ann.category} Alert
                    </span>
                  </div>
                  <Pin className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white tracking-wide">{ann.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{ann.content}</p>
                </div>
                <div className="pt-2 border-t border-slate-850 flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>Drafted by: {ann.publishedBy}</span>
                  <span>{ann.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Notice stack layout */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase font-mono tracking-widest text-slate-500">Notice Circular Archive Logs</h3>

        <div className="space-y-3">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map(ann => (
              <div key={ann.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-705 transition-colors relative">
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-1.5 flex-1 select-text">
                    <div className="flex gap-2 items-center flex-wrap">
                      <h4 className="text-base font-bold text-slate-200">{ann.title}</h4>
                      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 rounded ${
                        ann.category === 'Urgent' ? 'bg-red-500/15 text-red-400' :
                        ann.category === 'Finance' ? 'bg-pink-500/10 text-pink-400' :
                        ann.category === 'Academic' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {ann.category}
                      </span>
                      {ann.pinned && (
                        <span className="bg-amber-500/10 text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-0.5">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">{ann.content}</p>
                  </div>

                  {isPublisher && (
                    <button
                      onClick={() => { if (confirm('Remove bulletin circular?')) onDeleteNotice(ann.id); }}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors shrink-0"
                      title="Remove announcement logs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-850 flex flex-wrap gap-4 items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Published by: <span className="text-slate-350">{ann.publishedBy}</span> ({ann.publisherRole})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ann.date}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-slate-500 italic">
              <Archive className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              There are no active notice logs matching this channel filter.
            </div>
          )}
        </div>
      </div>

      {/* WRITE COMPLIANCE BULLETIN / WRITER POPUP DIALOG */}
      {showEditor && isPublisher && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <h3 className="text-white font-display font-medium text-lg flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-400" /> Draft BGI Community circular
            </h3>

            <form onSubmit={handlePublishSubmit} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Notice/Circular Headline</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Membership Dues Adjustments Q3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              {/* Simulated Rich Text editor helper bar */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400">Circular Copy Content Editor (Markdown Format)</label>
                
                {/* Visual rich text panels helper bar */}
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-950 rounded-t-lg border-t border-x border-slate-800">
                  <button type="button"
                    onClick={() => applyTextFormat('bold')}
                    className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors text-xs flex items-center font-bold"
                    title="Bold snippet input"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button type="button"
                    onClick={() => applyTextFormat('italic')}
                    className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors text-xs flex items-center italic"
                    title="Italic snippet input"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button type="button"
                    onClick={() => applyTextFormat('bullets')}
                    className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors text-xs flex items-center"
                    title="Bullet points formatting"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>
                  <span className="text-[10px] text-slate-500 font-mono">Click to inject formatting markdown templates tags</span>
                </div>

                <textarea
                  rows={6}
                  required
                  placeholder="Draft the circular copy body here. Use standard paragraphs and spacing."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 border-b border-x border-slate-800 rounded-b-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5 py-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Target Channel Folder</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 text-xs focus:outline-none focus:border-cyan-505"
                  >
                    <option value="General">General</option>
                    <option value="Urgent">Urgent Alert</option>
                    <option value="Academic">Academic circular</option>
                    <option value="Event">Event Board</option>
                    <option value="Finance">Finance notice</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5 select-none">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded text-slate-950 border border-slate-800 focus:ring-0"
                  />
                  <label htmlFor="isPinned" className="text-xs text-slate-300 cursor-pointer flex items-center gap-1 font-mono font-bold">
                    <Pin className="w-3.5 h-3.5 text-amber-400" /> Pin on Top Header Board
                  </label>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold py-2.5 rounded-lg text-xs"
                >
                  Confirm & Broadcast Notice
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="bg-slate-850 text-white font-semibold py-2.5 px-4 rounded-lg text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
