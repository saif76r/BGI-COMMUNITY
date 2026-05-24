import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Paperclip, Send, Hash, User, Users, Megaphone, Flame, Award, ThumbsUp, Plus, Trash2, Heart, Shield, RefreshCw } from 'lucide-react';
import { ChatMessage, DiscussionThread, User as UserType, UserRole } from '../types';
import { motion } from 'motion/react';

interface CommunicationViewProps {
  chats: ChatMessage[];
  discussions: DiscussionThread[];
  currentUser: UserType;
  onSendChatMessage: (msg: ChatMessage) => void;
  onAddDiscussion: (disc: DiscussionThread) => void;
  onAddForumComment: (discId: string, comment: { authorName: string; authorRole: UserRole; content: string; date: string }) => void;
}

export default function CommunicationView({
  chats,
  discussions,
  currentUser,
  onSendChatMessage,
  onAddDiscussion,
  onAddForumComment
}: CommunicationViewProps) {
  const [activeSegment, setActiveSegment] = useState<'chat' | 'forums'>('chat');

  // Chat Sub-states
  const [activeChannel, setActiveChannel] = useState('#general');
  const [typedMessage, setTypedMessage] = useState('');
  
  // Custom automated typing simulations helper reference
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Discussion forum Sub-states
  const [showForumModal, setShowForumModal] = useState(false);
  const [newDiscTitle, setNewDiscTitle] = useState('');
  const [newDiscContent, setNewDiscContent] = useState('');
  const [newDiscCat, setNewDiscCat] = useState('General Discussion');

  // Exploded Forum replies state
  const [expandedForumId, setExpandedForumId] = useState<string | null>(null);
  const [typedForumComment, setTypedForumComment] = useState('');

  // Likes tracking index state
  const [likedForums, setLikedForums] = useState<string[]>([]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, activeChannel, activeSegment]);

  // Automated friendly peer chat auto-responder simulations
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

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

    // Launch chatbot replica to provide simulated responses and community feedback
   
  };

  const handleCreateForumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscTitle || !newDiscContent) return;

    const newDisc: DiscussionThread = {
      id: `dsc-${Math.floor(100 + Math.random() * 900)}`,
      title: newDiscTitle,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content: newDiscContent,
      commentsCount: 0,
      likes: [],
      date: new Date().toISOString().split('T')[0],
      category: newDiscCat,
      comments: []
    };

    onAddDiscussion(newDisc);
    setShowForumModal(false);

    // clear states
    setNewDiscTitle('');
    setNewDiscContent('');
  };

  const handlePostCommentSubmit = (discId: string) => {
    if (!typedForumComment.trim()) return;

    const cObj = {
      id: Math.random().toString(),
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content: typedForumComment,
      date: new Date().toISOString().split('T')[0]
    };

    onAddForumComment(discId, cObj);
    setTypedForumComment('');
  };

  const toggleLikeForum = (id: string) => {
    setLikedForums(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-wide">Communication Hub & Chatrooms</h2>
          <p className="text-xs text-slate-400">Collaborate inside live channels, send direct messages, and publish forum discussion boards.</p>
        </div>

        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSegment('chat')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSegment === 'chat' ? 'bg-cyan-500 text-slate-950 font-display' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Coordinator Chat
          </button>
          <button
            onClick={() => setActiveSegment('forums')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSegment === 'forums' ? 'bg-cyan-500 text-slate-950 font-display' : 'text-slate-400 hover:text-white'
            }`}
          >
            Discussion Forums ({discussions.length})
          </button>
        </div>
      </div>

      {/* SEGMENT 1: LIVE INTERACTIVE CO-ORDINATION CHAT */}
      {activeSegment === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-4 min-h-[500px] max-h-[600px] h-[580px]">
          {/* Channel Sidebar */}
          <div className="p-4 bg-slate-950/80 border-r border-slate-800 space-y-5 col-span-1 hidden md:block">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Core Public Channels</span>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveChannel('#general')}
                  className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg transition-colors font-mono font-semibold ${
                    activeChannel === '#general' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-90 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    general
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                </button>

                <button
                  onClick={() => setActiveChannel('#announcements')}
                  className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg transition-colors font-mono font-semibold ${
                    activeChannel === '#announcements' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-90 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4" />
                    broadcasts
                  </span>
                </button>

                <button
                  onClick={() => setActiveChannel('#admins')}
                  className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg transition-colors font-mono font-semibold ${
                    activeChannel === '#admins' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-90 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    admins-only
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 font-mono">Simulate Direct Messages</span>
              <div className="space-y-1">
                {(['Sarah Rahman', 'Tanvir Hossain', 'Nabila Hasan'] as const).map(userNick => (
                  <button
                    key={userNick}
                    onClick={() => setActiveChannel(`@${userNick.toLowerCase().split(' ')[0]}`)}
                    className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors text-left truncate ${
                      activeChannel === `@${userNick.toLowerCase().split(' ')[0]}` ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0"></div>
                    <span className="truncate">{userNick}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Core Chat Interface Column */}
          <div className="col-span-1 md:col-span-3 flex flex-col justify-between bg-slate-900 overflow-hidden relative">
            {/* Header info bar */}
            <div className="p-3.5 bg-slate-950/40 border-b border-slate-850 flex justify-between items-center px-4 relative">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-white text-sm font-bold font-mono">{activeChannel}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1"></span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono italic">
                Simulated response chatbot is active in this room.
              </span>
            </div>

            {/* Chats Feed Scroller */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[440px]">
              {chats.filter(c => c.channelId === activeChannel).length > 0 ? (
                chats.filter(c => c.channelId === activeChannel).map((msg) => {
                  const isUser = msg.senderId === currentUser.id;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[10px] font-bold ${isUser ? 'text-cyan-400' : 'text-emerald-400'}`}>
                          {msg.senderName}
                        </span>
                        <span className="text-[9px] px-1 bg-slate-800 text-slate-400 rounded uppercase text-[8px] font-mono">
                          {msg.senderRole}
                        </span>
                      </div>
                      <div className={`p-3 rounded-2xl text-xs font-sans leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-emerald-600/90 to-cyan-600/90 text-white rounded-tr-none'
                          : 'bg-slate-950/90 border border-slate-850 text-slate-200 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-500 italic text-xs">
                  This room transcript is empty. Type a welcoming comment below.
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Submission toolbar */}
            <form onSubmit={handleChatSubmit} className="p-3 bg-slate-950/80 border-t border-slate-800 flex gap-2 items-center">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder={`Speak in ${activeChannel}...`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-2.5 rounded-xl transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SEGMENT 2: COMMUNITY DISCUSSION FORUM THREADINGS */}
      {activeSegment === 'forums' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">BGI General Discussion Forums</h3>
            <button
              onClick={() => setShowForumModal(true)}
              className="px-3 py-1.5 bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Start Forum Thread
            </button>
          </div>

          <div className="space-y-4">
            {discussions.map((disc) => {
              const liked = likedForums.includes(disc.id);
              const isExploded = expandedForumId === disc.id;

              return (
                <div key={disc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-705 transition-colors space-y-4">
                  <div className="flex gap-4 items-start justify-between">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="text-[9px] font-mono px-1.5 bg-slate-800 text-slate-400 rounded uppercase tracking-wider font-bold">
                        {disc.category}
                      </span>
                      <h4 className="text-base font-bold text-white tracking-wide truncate">{disc.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-sans">{disc.content}</p>
                    </div>

                    <div className="flex gap-1 items-center shrink-0">
                      <button
                        onClick={() => toggleLikeForum(disc.id)}
                        className={`p-2 rounded-full transition-colors flex items-center gap-1.5 text-xs ${liked ? 'bg-red-950/50 text-red-400 border border-red-900' : 'bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-350'}`}
                        title="React thread"
                      >
                        <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-400 text-red-400' : 'text-slate-400'}`} />
                        <span>Upvotes {liked ? 1 : 0}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-850 flex items-center justify-between flex-wrap gap-2.5 text-[11px] font-mono text-slate-500">
                    <div className="flex gap-1.5 items-center">
                      <span className="text-slate-400">{disc.authorName}</span>
                      <span className="text-[9px] bg-slate-800 text-slate-500 px-1 rounded">{disc.authorRole}</span>
                      <span>•</span>
                      <span>{disc.date}</span>
                    </div>

                    <button
                      onClick={() => setExpandedForumId(isExploded ? null : disc.id)}
                      className="text-cyan-400 hover:underline font-bold flex items-center gap-1"
                    >
                      Comments & Responses ({disc.comments?.length || 0})
                    </button>
                  </div>

                  {/* Comment Thread breakdown drawer */}
                  {isExploded && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-3 mt-4">
                      <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Responses ({disc.comments?.length || 0})</div>
                      
                      {disc.comments && disc.comments.length > 0 ? (
                        <div className="space-y-2.5 divide-y divide-slate-850/40">
                          {disc.comments.map(c => (
                            <div key={c.id} className="pt-2 text-xs">
                              <div className="flex justify-between font-mono text-[10px] text-zinc-500 mb-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-300 font-bold">{c.authorName}</span>
                                  <span className="px-1 bg-slate-900 border border-slate-800 text-[9px] text-slate-500 uppercase rounded">{c.authorRole}</span>
                                </div>
                                <span>{c.date}</span>
                              </div>
                              <p className="text-slate-350 leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-900">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic py-2">No comments published yet. Be the first to reply!</p>
                      )}

                      {/* Comment typing input */}
                      <div className="pt-2.5 flex gap-2">
                        <input
                          type="text"
                          value={typedForumComment}
                          onChange={(e) => setTypedForumComment(e.target.value)}
                          placeholder="Type your response suggestion..."
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-505"
                        />
                        <button
                          type="button"
                          onClick={() => handlePostCommentSubmit(disc.id)}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs px-4 py-2 rounded-lg font-bold"
                        >
                          Send Reply
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

      {/* START DISCUSSIONS FORUM MODAL */}
      {showForumModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-white font-display font-medium text-lg">Launch Community Thread</h3>

            <form onSubmit={handleCreateForumSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Thread Subject Line</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Volunteer scheduling adjustments"
                  value={newDiscTitle}
                  onChange={(e) => setNewDiscTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Core Suggestion / Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Expand on the problems, suggestions, or outlines you want to discuss."
                  value={newDiscContent}
                  onChange={(e) => setNewDiscContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-505 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Thread Category</label>
                <select
                  value={newDiscCat}
                  onChange={(e) => setNewDiscCat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 text-xs text-slate-400 focus:outline-none"
                >
                  <option value="General Discussion">General Discussion</option>
                  <option value="Strategy & Engagement">Strategic Engagement</option>
                  <option value="Social Impact">Social & volunteerism</option>
                  <option value="Technical Suggestions">Academic & CSE Wing</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold py-2 px-4 rounded-xl"
                >
                  Confirm Thread
                </button>
                <button
                  type="button"
                  onClick={() => setShowForumModal(false)}
                  className="bg-slate-800 text-zinc-300 font-semibold py-2 px-4 rounded-xl hover:bg-slate-700 transition-colors text-xs"
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
