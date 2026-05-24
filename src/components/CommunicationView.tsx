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

  const [activeChannel, setActiveChannel] =
    useState('#general');

  const [typedMessage, setTypedMessage] =
    useState('');

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

  const chatContainerRef =
    useRef<HTMLDivElement>(null);

  // =========================
  // CHANNELS
  // =========================

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
  // FORCE VALID CHANNEL
  // =========================

  useEffect(() => {
    if (!allowedChannels.includes(activeChannel)) {
      setActiveChannel('#general');
    }
  }, []);

  // =========================
  // AUTO SCROLL
  // =========================

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [filteredChats]);

  // =========================
  // FILTER CHAT
  // =========================

  const filteredChats = chats.filter(
    c => c.channelId === activeChannel
  );

  // =========================
  // SEND MESSAGE
  // =========================

  const handleChatSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!typedMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: `chat-${Math.random()}`,
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
  // CREATE FORUM
  // =========================

  const handleCreateForumSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!newDiscTitle || !newDiscContent)
      return;

    const newDisc: DiscussionThread = {
      id: `dsc-${Math.random()}`,
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
  // COMMENT
  // =========================

  const handlePostCommentSubmit = (
    discId: string
  ) => {
    if (!typedForumComment.trim()) return;

    onAddForumComment(discId, {
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content: typedForumComment,
      date: new Date()
        .toISOString()
        .split('T')[0]
    });

    setTypedForumComment('');
  };

  // =========================
  // LIKE
  // =========================

  const toggleLikeForum = (id: string) => {
    setLikedForums(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 font-sans h-full min-h-0">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h2 className="text-xl font-bold text-white">
            Communication Hub
          </h2>

          <p className="text-xs text-slate-400">
            Secure Department Communication
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">

          <button
            onClick={() => setActiveSegment('chat')}
            className={`px-4 py-2 rounded-lg text-xs font-bold ${
              activeSegment === 'chat'
                ? 'bg-cyan-500 text-black'
                : 'text-slate-400'
            }`}
          >
            Chat
          </button>

          <button
            onClick={() =>
              setActiveSegment('forums')
            }
            className={`px-4 py-2 rounded-lg text-xs font-bold ${
              activeSegment === 'forums'
                ? 'bg-cyan-500 text-black'
                : 'text-slate-400'
            }`}
          >
            Forums
          </button>

        </div>
      </div>

      {/* CHAT */}
      {activeSegment === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex h-[600px]">

          {/* SIDEBAR */}
          <div className="w-[250px] bg-slate-950 border-r border-slate-800 p-4 overflow-y-auto flex-shrink-0">

            <div className="space-y-1">

              {allowedChannels.map(channel => (

                <button
                  key={channel}
                  onClick={() =>
                    setActiveChannel(channel)
                  }
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    activeChannel === channel
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {channel === '#announcements' ? (
                    <Megaphone className="w-4 h-4" />
                  ) : channel === '#admins' ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <Hash className="w-4 h-4" />
                  )}

                  {channel.replace('#', '')}
                </button>

              ))}

            </div>
          </div>

          {/* CHAT AREA */}
          <div className="flex-1 flex flex-col min-h-0">

            {/* TOP */}
            <div className="p-4 border-b border-slate-800 flex items-center gap-2">

              <Hash className="w-4 h-4 text-cyan-400" />

              <span className="text-white font-bold">
                {activeChannel}
              </span>

            </div>

            {/* MESSAGES */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
            >

              {filteredChats.length > 0 ? (
                filteredChats.map(msg => {

                  const isUser =
                    msg.senderId === currentUser.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isUser
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >

                      <div
                        className={`max-w-[75%] rounded-2xl p-3 text-sm ${
                          isUser
                            ? 'bg-cyan-500 text-black'
                            : 'bg-slate-800 text-white'
                        }`}
                      >

                        <div className="text-[10px] opacity-70 mb-1">
                          {msg.senderName}
                        </div>

                        {msg.content}

                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-500 py-10 text-sm">
                  No messages yet.
                </div>
              )}

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
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
              />

              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-black p-3 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </button>

            </form>
          </div>
        </div>
      )}

      {/* FORUMS */}
      {activeSegment === 'forums' && (
        <div className="space-y-4">

          <div className="flex justify-between items-center">

            <h3 className="text-slate-400 text-sm">
              Community Forums
            </h3>

            <button
              onClick={() =>
                setShowForumModal(true)
              }
              className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Thread
            </button>

          </div>

          {discussions.map(disc => {

            const liked =
              likedForums.includes(disc.id);

            const expanded =
              expandedForumId === disc.id;

            return (
              <div
                key={disc.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
              >

                <div className="flex justify-between">

                  <div>
                    <h4 className="text-white font-bold">
                      {disc.title}
                    </h4>

                    <p className="text-slate-400 text-sm mt-2">
                      {disc.content}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      toggleLikeForum(disc.id)
                    }
                    className={`p-2 rounded-lg ${
                      liked
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        liked ? 'fill-red-400' : ''
                      }`}
                    />
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}