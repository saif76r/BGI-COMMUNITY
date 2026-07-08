import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send,
  Hash,
  Megaphone,
  Plus,
  Heart,
  Shield
} from 'lucide-react';

import {
  ChatMessage,
  DiscussionThread,
  User as UserType,
  UserRole
} from '../types';

interface CommunicationViewProps {
  chats: ChatMessage[];
  discussions: DiscussionThread[];
  currentUser: UserType;
  onSendChatMessage: (msg: ChatMessage) => void;
  onAddDiscussion: (disc: DiscussionThread) => void;
  onAddForumComment: (
    discId: string,
    comment: {
      authorName: string;
      authorRole: UserRole;
      content: string;
      date: string;
    }
  ) => void;
}

export default function CommunicationView({
  chats = [],
  discussions = [],
  currentUser,
  onSendChatMessage,
  onAddDiscussion,
  onAddForumComment
}: CommunicationViewProps) {

  // Early return fallback to guarantee that currentUser is fully loaded
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 font-mono text-sm">
        Initializing secure user session...
      </div>
    );
  }

  const [activeSegment, setActiveSegment] =
    useState<'chat' | 'forums'>('chat');

  // =========================
  // CHANNEL ACCESS CONTROL
  // =========================

  const [activeChannel, setActiveChannel] =
    useState('#general');

  const departmentChannels: Record<string, string> = {
    'IT Department': '#it',
    'PR Department': '#pr',
    'Marketing Department': '#marketing',
    'HR Department': '#hr',
    'Graphics Department': '#graphics',
    'Management Department': '#management',
    'Communication Department': '#communication',
    'Research Department': '#research',
    'Sports Department': '#sports',
    'Education Department': '#education',
    'Emergency Department': '#emergency'
  };

  const userDeptChannel = currentUser?.department
    ? (departmentChannels[currentUser.department] || null)
    : null;

  const isAdminOrModerator =
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'Moderator';

  // Memoizing channels ensures we don't trigger layout loop re-renders
  const allowedChannels = useMemo(() => {
    const baseChannels = ['#general'];
    if (isAdminOrModerator) {
      baseChannels.push('#announcements', '#admins');
      Object.values(departmentChannels).forEach(ch => {
        if (!baseChannels.includes(ch)) {
          baseChannels.push(ch);
        }
      });
    } else if (userDeptChannel) {
      baseChannels.push(userDeptChannel);
    }
    return baseChannels;
  }, [isAdminOrModerator, userDeptChannel]);

  // =========================
  // STATES
  // =========================

  const [typedMessage, setTypedMessage] = useState('');

  const [showForumModal, setShowForumModal] =
    useState(false);

  const [newDiscTitle, setNewDiscTitle] =
    useState('');

  const [newDiscContent, setNewDiscContent] =
    useState('');

  const [newDiscCat, setNewDiscCat] =
    useState('General Discussion');

  const [expandedForumId, setExpandedForumId] =
    useState<string | null>(null);

  const [typedForumComment, setTypedForumComment] =
    useState('');

  const [likedForums, setLikedForums] =
    useState<string[]>([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Safe Date string parser prevents crash when receiving Firestore Timestamps as Objects
  const formatDisplayDate = (dateVal: any): string => {
    if (!dateVal) return '';
    if (typeof dateVal === 'string') return dateVal;
    if (typeof dateVal === 'object') {
      // Check if it's a Firestore Timestamp
      if (dateVal && 'seconds' in dateVal) {
        return new Date(dateVal.seconds * 1000).toISOString().split('T')[0];
      }
      // Check if it's a JS Date instance
      if (dateVal instanceof Date) {
        return dateVal.toISOString().split('T')[0];
      }
    }
    return String(dateVal);
  };

  // =========================
  // FILTERED CHATS
  // =========================

  const filteredChats = useMemo(() => {
    return (chats || []).filter(
      c =>
        c &&
        c.channelId === activeChannel &&
        allowedChannels.includes(c.channelId)
    );
  }, [chats, activeChannel, allowedChannels]);

  // =========================
  // AUTO SCROLL
  // =========================

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [filteredChats.length, activeChannel]);

  // =========================
  // PROTECT CHANNEL ACCESS
  // =========================

  useEffect(() => {
    if (!allowedChannels.includes(activeChannel)) {
      setActiveChannel('#general');
    }
  }, [activeChannel, allowedChannels]);

  // =========================
  // SEND MESSAGE
  // =========================

  const handleChatSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!typedMessage.trim()) return;

    if (!allowedChannels.includes(activeChannel))
      return;

    const userMsg: ChatMessage = {
      id: `chat-${Math.random().toString()}`,
      channelId: activeChannel,
      senderId: currentUser?.id || 'unknown-id',
      senderName: currentUser?.name || 'Anonymous User',
      senderRole: currentUser?.role || 'Member',
      content: typedMessage,
      timestamp: new Date().toISOString()
    };

    onSendChatMessage(userMsg);

    setTypedMessage('');
  };

  // =========================
  // CREATE DISCUSSION
  // =========================

  const handleCreateForumSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!newDiscTitle || !newDiscContent)
      return;

    const newDisc: DiscussionThread = {
      id: `dsc-${Math.floor(
        100 + Math.random() * 900
      )}`,
      title: newDiscTitle,
      authorId: currentUser?.id || 'unknown-id',
      authorName: currentUser?.name || 'Anonymous User',
      authorRole: currentUser?.role || 'Member',
      content: newDiscContent,
      commentsCount: 0,
      likes: [],
      date: new Date()
        .toISOString()
        .split('T')[0],
      category: newDiscCat,
      comments: []
    };

    onAddDiscussion(newDisc);

    setShowForumModal(false);

    setNewDiscTitle('');
    setNewDiscContent('');
  };

  // =========================
  // POST COMMENT
  // =========================

  const handlePostCommentSubmit = (
    discId: string
  ) => {
    if (!typedForumComment.trim()) return;

    const cObj = {
      id: Math.random().toString(),
      authorName: currentUser?.name || 'Anonymous User',
      authorRole: currentUser?.role || 'Member',
      content: typedForumComment,
      date: new Date()
        .toISOString()
        .split('T')[0]
    };

    onAddForumComment(discId, cObj);

    setTypedForumComment('');
  };

  // =========================
  // LIKE FORUM
  // =========================

  const toggleLikeForum = (id: string) => {
    setLikedForums(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }

      return [...prev, id];
    });
  };

  return (
    <div className="space-y-6 font-sans">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-wide">
            Communication Hub & Chatrooms
          </h2>

          <p className="text-xs text-slate-400">
            Department-based secure communication system.
          </p>
        </div>

        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">

          <button
            onClick={() =>
              setActiveSegment('chat')
            }
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSegment === 'chat'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Chat
          </button>

          <button
            onClick={() =>
              setActiveSegment('forums')
            }
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSegment === 'forums'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Forums ({discussions.length})
          </button>

        </div>
      </div>

      {/* CHAT SECTION */}
      {activeSegment === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-4 h-[580px]">

          {/* SIDEBAR (Desktop Mode) */}
          <div className="p-4 bg-slate-950/80 border-r border-slate-800 space-y-5 hidden md:block overflow-y-auto h-full scrollbar-thin scrollbar-thumb-slate-800">

            {/* GENERAL */}
            <div className="space-y-2">

              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                Public Channels
              </span>

              <div className="space-y-1">

                <button
                  onClick={() =>
                    setActiveChannel('#general')
                  }
                  className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-mono transition-all ${
                    activeChannel === '#general'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Hash className="w-4 h-4" />
                  general
                </button>

                {isAdminOrModerator && (
                  <button
                    onClick={() =>
                      setActiveChannel(
                        '#announcements'
                      )
                    }
                    className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-mono transition-all ${
                      activeChannel ===
                      '#announcements'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Megaphone className="w-4 h-4" />
                    announcements
                  </button>
                )}

                {isAdminOrModerator && (
                  <button
                    onClick={() =>
                      setActiveChannel('#admins')
                    }
                    className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-mono transition-all ${
                      activeChannel === '#admins'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    admins-only
                  </button>
                )}

              </div>
            </div>

            {/* DEPARTMENT CHANNELS */}
            <div className="space-y-2">

              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                Department Channels
              </span>

              <div className="space-y-1">

                {allowedChannels
                  .filter(
                    ch =>
                      ch !== '#general' &&
                      ch !== '#announcements' &&
                      ch !== '#admins'
                  )
                  .map(channel => (
                    <button
                      key={channel}
                      onClick={() =>
                        setActiveChannel(channel)
                      }
                      className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-mono transition-all ${
                        activeChannel === channel
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Hash className="w-4 h-4" />
                      {channel.replace('#', '')}
                    </button>
                  ))}

              </div>
            </div>
          </div>

          {/* CHAT AREA */}
          <div className="col-span-1 md:col-span-3 flex flex-col h-full overflow-hidden">

            {/* CHANNEL INFO HEADER */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">

              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-400" />

                <span className="text-white font-bold">
                  {activeChannel}
                </span>
              </div>

              <span className="text-[10px] text-slate-500 hidden sm:inline">
                Secure department communication
              </span>

            </div>

            {/* MOBILE CHANNEL SELECTOR BAR (Swipable) */}
            <div className="md:hidden flex items-center gap-2 px-3 py-2 bg-slate-950 border-b border-slate-800/80 overflow-x-auto shrink-0 select-none no-scrollbar">
              {allowedChannels.map(channel => {
                const isAnn = channel === '#announcements';
                const isAdminCh = channel === '#admins';
                const isActive = activeChannel === channel;
                return (
                  <button
                    key={channel}
                    onClick={() => setActiveChannel(channel)}
                    className={`shrink-0 text-[11px] px-3 py-1.5 rounded-lg font-mono flex items-center gap-1 transition-all ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {isAnn ? <Megaphone className="w-3.5 h-3.5" /> : isAdminCh ? <Shield className="w-3.5 h-3.5" /> : <Hash className="w-3.5 h-3.5" />}
                    {channel.replace('#', '')}
                  </button>
                );
              })}
            </div>

            {/* CHAT LIST CONTAINER */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[390px] md:h-[430px] min-h-[250px] bg-slate-900/40">

              {filteredChats.length > 0 ? (
                filteredChats.map(msg => {

                  const isUser =
                    msg.senderId === currentUser.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isUser
                          ? 'items-end'
                          : 'items-start'
                      }`}
                    >

                      <span className="text-[10px] mb-1 text-slate-400 px-1">
                        {msg.senderName} ({msg.senderRole})
                      </span>

                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs shadow-sm ${
                          isUser
                            ? 'bg-cyan-500 text-slate-950 rounded-tr-none font-medium'
                            : 'bg-slate-950 border border-slate-800 text-white rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-500 text-xs py-16 font-mono">
                  No messages in {activeChannel}.
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* INPUT FORM */}
            <form
              onSubmit={handleChatSubmit}
              className="p-4 border-t border-slate-800 flex gap-2 bg-slate-950 shrink-0"
            >

              <input
                type="text"
                value={typedMessage}
                onChange={e =>
                  setTypedMessage(e.target.value)
                }
                placeholder={`Message ${activeChannel}`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-slate-500"
              />

              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-3 rounded-xl transition-colors active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>

            </form>
          </div>
        </div>
      )}

      {/* FORUM SECTION */}
      {activeSegment === 'forums' && (
        <div className="space-y-4">

          <div className="flex items-center justify-between">

            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">
              Community Discussion Forums
            </h3>

            <button
              onClick={() => setShowForumModal(true)}
              className="px-3 py-1.5 bg-slate-900 text-slate-200 border border-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 hover:border-slate-700 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Start Thread
            </button>

          </div>

          <div className="space-y-4">

            {discussions.map((disc) => {

              const liked =
                likedForums.includes(disc.id);

              const isExpanded =
                expandedForumId === disc.id;

              return (
                <div
                  key={disc.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
                >

                  <div className="flex justify-between items-start gap-4">

                    <div className="space-y-2 flex-1">

                      <span className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                        {disc.category}
                      </span>

                      <h4 className="text-white font-bold">
                        {disc.title}
                      </h4>

                      <p className="text-slate-300 text-sm leading-relaxed">
                        {disc.content}
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        toggleLikeForum(disc.id)
                      }
                      className={`flex items-center gap-1 text-xs px-3 py-2 rounded-lg transition-all active:scale-95 shrink-0 ${
                        liked
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          liked ? 'fill-red-400' : ''
                        }`}
                      />
                      Like
                    </button>

                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">

                    <span>
                      {disc.authorName} ({disc.authorRole}) • {formatDisplayDate(disc.date)}
                    </span>

                    <button
                      onClick={() =>
                        setExpandedForumId(
                          isExpanded ? null : disc.id
                        )
                      }
                      className="text-cyan-400 font-semibold hover:underline"
                    >
                      Comments (
                      {disc.comments?.length || 0})
                    </button>

                  </div>

                  {isExpanded && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">

                      {disc.comments &&
                      disc.comments.length > 0 ? (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                          {disc.comments.map(c => (
                            <div
                              key={c.id}
                              className="bg-slate-900 p-3 rounded-lg border border-slate-800/50"
                            >

                              <div className="text-[10px] text-slate-500 mb-1">
                                {c.authorName} ({c.authorRole}) • {formatDisplayDate(c.date)}
                              </div>

                              <p className="text-sm text-slate-300">
                                {c.content}
                              </p>

                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">
                          No comments yet.
                        </p>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-slate-850">

                        <input
                          type="text"
                          value={typedForumComment}
                          onChange={(e) =>
                            setTypedForumComment(
                              e.target.value
                            )
                          }
                          placeholder="Write a reply..."
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handlePostCommentSubmit(
                              disc.id
                            )
                          }
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 rounded-lg text-sm font-bold transition-colors"
                        >
                          Send
                        </button>

                      </div>
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        </div>
      )}

      {/* FORUM MODAL */}
      {showForumModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">

            <h3 className="text-white text-lg font-bold">
              Create Discussion Thread
            </h3>

            <form
              onSubmit={handleCreateForumSubmit}
              className="space-y-4"
            >

              <input
                type="text"
                required
                placeholder="Thread title"
                value={newDiscTitle}
                onChange={(e) =>
                  setNewDiscTitle(e.target.value)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              />

              <textarea
                rows={4}
                required
                placeholder="Thread content"
                value={newDiscContent}
                onChange={(e) =>
                  setNewDiscContent(e.target.value)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
              />

              <select
                value={newDiscCat}
                onChange={(e) =>
                  setNewDiscCat(e.target.value)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="General Discussion">
                  General Discussion
                </option>

                <option value="Technical">
                  Technical
                </option>

                <option value="Management">
                  Management
                </option>

                <option value="Community">
                  Community
                </option>
              </select>

              <div className="flex gap-2 pt-2">

                <button
                  type="submit"
                  className="flex-1 bg-cyan-500 text-slate-950 py-3 rounded-xl font-bold hover:bg-cyan-400 transition-colors"
                >
                  Create Thread
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowForumModal(false)
                  }
                  className="flex-1 bg-slate-800 text-white py-3 rounded-xl hover:bg-slate-700 transition-colors"
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

