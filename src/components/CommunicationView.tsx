import React, { useState, useEffect, useRef } from 'react';
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
  chats,
  discussions,
  currentUser,
  onSendChatMessage,
  onAddDiscussion,
  onAddForumComment
}: CommunicationViewProps) {

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

  const userDeptChannel =
    departmentChannels[currentUser.department] || null;

  const isAdminOrModerator =
    currentUser.role === 'Admin' ||
    currentUser.role === 'Moderator';

  const allowedChannels = isAdminOrModerator
    ? [
        '#general',
        '#announcements',
        '#admins',
        ...Object.values(departmentChannels)
      ]
    : ['#general', userDeptChannel].filter(Boolean);

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

  // =========================
  // AUTO SCROLL
  // =========================

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [chats, activeChannel]);

  // =========================
  // PROTECT CHANNEL ACCESS
  // =========================

  useEffect(() => {
    if (!allowedChannels.includes(activeChannel)) {
      setActiveChannel('#general');
    }
  }, [activeChannel, allowedChannels]);

  // =========================
  // FILTERED CHATS
  // =========================

  const filteredChats = chats.filter(
    c =>
      c.channelId === activeChannel &&
      allowedChannels.includes(c.channelId)
  );

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
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
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
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
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
      authorName: currentUser.name,
      authorRole: currentUser.role,
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

          {/* SIDEBAR */}
          <div className="p-4 bg-slate-950/80 border-r border-slate-800 space-y-5 hidden md:block">

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
                  className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-mono ${
                    activeChannel === '#general'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
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
                    className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-mono ${
                      activeChannel ===
                      '#announcements'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
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
                    className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-mono ${
                      activeChannel === '#admins'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
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
                      className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-mono ${
                        activeChannel === channel
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
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
          <div className="col-span-1 md:col-span-3 flex flex-col">

            <div className="p-4 border-b border-slate-800 flex items-center justify-between">

              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-400" />

                <span className="text-white font-bold">
                  {activeChannel}
                </span>
              </div>

              <span className="text-[10px] text-slate-500">
                Secure department communication
              </span>

            </div>

            {/* CHAT LIST */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

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

                      <span className="text-[10px] mb-1 text-slate-400">
                        {msg.senderName}
                      </span>

                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                          isUser
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-950 border border-slate-800 text-white'
                        }`}
                      >
                        {msg.content}
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-500 text-xs py-10">
                  No messages in this channel.
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* INPUT */}
            <form
              onSubmit={handleChatSubmit}
              className="p-4 border-t border-slate-800 flex gap-2"
            >

              <input
                type="text"
                value={typedMessage}
                onChange={e =>
                  setTypedMessage(e.target.value)
                }
                placeholder={`Message ${activeChannel}`}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              />

              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-3 rounded-xl"
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
              className="px-3 py-1.5 bg-slate-900 text-slate-200 border border-slate-800 rounded-lg text-xs font-bold flex items-center gap-1"
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

                      <span className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-400 uppercase">
                        {disc.category}
                      </span>

                      <h4 className="text-white font-bold">
                        {disc.title}
                      </h4>

                      <p className="text-slate-300 text-sm">
                        {disc.content}
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        toggleLikeForum(disc.id)
                      }
                      className={`flex items-center gap-1 text-xs px-3 py-2 rounded-lg ${
                        liked
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-slate-950 text-slate-400'
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
                      {disc.authorName} • {disc.date}
                    </span>

                    <button
                      onClick={() =>
                        setExpandedForumId(
                          isExpanded ? null : disc.id
                        )
                      }
                      className="text-cyan-400"
                    >
                      Comments (
                      {disc.comments?.length || 0})
                    </button>

                  </div>

                  {isExpanded && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">

                      {disc.comments &&
                      disc.comments.length > 0 ? (
                        disc.comments.map(c => (
                          <div
                            key={c.id}
                            className="bg-slate-900 p-3 rounded-lg"
                          >

                            <div className="text-[11px] text-slate-500 mb-1">
                              {c.authorName} • {c.date}
                            </div>

                            <p className="text-sm text-slate-300">
                              {c.content}
                            </p>

                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">
                          No comments yet.
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">

                        <input
                          type="text"
                          value={typedForumComment}
                          onChange={(e) =>
                            setTypedForumComment(
                              e.target.value
                            )
                          }
                          placeholder="Write a reply..."
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handlePostCommentSubmit(
                              disc.id
                            )
                          }
                          className="bg-cyan-500 text-slate-950 px-4 rounded-lg text-sm font-bold"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">

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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white"
              />

              <textarea
                rows={4}
                required
                placeholder="Thread content"
                value={newDiscContent}
                onChange={(e) =>
                  setNewDiscContent(e.target.value)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white"
              />

              <select
                value={newDiscCat}
                onChange={(e) =>
                  setNewDiscCat(e.target.value)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white"
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

              <div className="flex gap-2">

                <button
                  type="submit"
                  className="flex-1 bg-cyan-500 text-slate-950 py-3 rounded-xl font-bold"
                >
                  Create Thread
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowForumModal(false)
                  }
                  className="flex-1 bg-slate-800 text-white py-3 rounded-xl"
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