import React, { useState, useEffect } from 'react';
import { getDB, saveDB } from './db';
import { User, Announcement, Event, ChatMessage, DiscussionThread, Task, ResourceFile, TaskSubmission } from './types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';

// Visual Sub-components
import LoginScreen from './components/LoginScreen';
import DashboardView from './components/DashboardView';
import MemberManagementView from './components/MemberManagementView';
import EventManagementView from './components/EventManagementView';
import NoticesView from './components/NoticesView';
import CommunicationView from './components/CommunicationView';
import TaskView from './components/TaskView';
import AnalyticsView from './components/AnalyticsView';
import ProfileView from './components/ProfileView';
// @ts-ignore
import logoImg from './assets/images/bgi_clean_logo_1779446230793.png';

// Iconography
import {
  LayoutDashboard,
  Users,
  Calendar,
  Megaphone,
  MessageSquare,
  CheckSquare,
  TrendingUp,
  LogOut,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';

export default function App() {
  // Authentication session states
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core reactive database states
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Populate data on mount from Firestore
  useEffect(() => {
    // Restore session of the logged-in user from localStorage if it exists
    const savedSession = localStorage.getItem('bgi_current_user');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
        }
      } catch (e) {
        console.error("Failed to restore current user session:", e);
      }
    }

    const seedDatabase = async () => {
      console.log("Seeding Firestore database with default records...");
      try {
        const { DEFAULT_USERS, DEFAULT_ANNOUNCEMENTS, DEFAULT_EVENTS, DEFAULT_CHATS, DEFAULT_DISCUSSIONS, DEFAULT_TASKS } = await import('./db');
        for (const u of DEFAULT_USERS) {
          await setDoc(doc(db, "users", u.id), u);
        }
        for (const a of DEFAULT_ANNOUNCEMENTS) {
          await setDoc(doc(db, "announcements", a.id), a);
        }
        for (const e of DEFAULT_EVENTS) {
          await setDoc(doc(db, "events", e.id), e);
        }
        for (const c of DEFAULT_CHATS) {
          await setDoc(doc(db, "chats", c.id), c);
        }
        for (const d of DEFAULT_DISCUSSIONS) {
          await setDoc(doc(db, "discussions", d.id), d);
        }
        for (const t of DEFAULT_TASKS) {
          await setDoc(doc(db, "tasks", t.id), t);
        }
        console.log("Firestore database seeded successfully.");
      } catch (err) {
        console.error("Failed to seed Firestore database:", err);
      }
    };

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const list: User[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as User);
      });
      if (list.length === 0) {
        seedDatabase();
      } else {
        setUsers(list);
      }
    }, (error) => {
      console.error("Firestore onSnapshot users error:", error);
    });

    const unsubAnnouncements = onSnapshot(collection(db, "announcements"), (snapshot) => {
      const list: Announcement[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Announcement);
      });
      setAnnouncements(list.sort((a, b) => b.date.localeCompare(a.date)));
    }, (error) => {
      console.error("Firestore announcements error:", error);
    });

    const unsubEvents = onSnapshot(collection(db, "events"), (snapshot) => {
      const list: Event[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Event);
      });
      setEvents(list.sort((a,b) => a.date.localeCompare(b.date)));
    }, (error) => {
      console.error("Firestore events error:", error);
    });

    const unsubChats = onSnapshot(collection(db, "chats"), (snapshot) => {
      const list: ChatMessage[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as ChatMessage);
      });
      // Sorting from oldest to newest ensures correct timeline flow for proper scrolling
      setChats(list.sort((a,b) => a.timestamp.localeCompare(b.timestamp)));
    }, (error) => {
      console.error("Firestore chats error:", error);
    });

    const unsubDiscussions = onSnapshot(collection(db, "discussions"), (snapshot) => {
      const list: DiscussionThread[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as DiscussionThread);
      });
      setDiscussions(list.sort((a,b) => b.date.localeCompare(a.date)));
    }, (error) => {
      console.error("Firestore discussions error:", error);
    });

    const unsubTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const list: Task[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Task);
      });
      setTasks(list);
    }, (error) => {
      console.error("Firestore tasks error:", error);
    });

    return () => {
      unsubUsers();
      unsubAnnouncements();
      unsubEvents();
      unsubChats();
      unsubDiscussions();
      unsubTasks();
    };
  }, []);

  const handleLoginSuccess = (userSession: User) => {
    setCurrentUser(userSession);
    localStorage.setItem('bgi_current_user', JSON.stringify(userSession));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bgi_current_user');
  };

  // State sync helpers (Updating localStorage/fallback cache asynchronously)
  const syncUsers = (newUsersList: User[]) => saveDB({ users: newUsersList });
  const syncAnnouncements = (newAnnouncementsList: Announcement[]) => saveDB({ announcements: newAnnouncementsList });
  const syncEvents = (newEventsList: Event[]) => saveDB({ events: newEventsList });
  const syncDiscussions = (newDiscussionsList: DiscussionThread[]) => saveDB({ discussions: newDiscussionsList });
  const syncTasks = (newTasksList: Task[]) => saveDB({ tasks: newTasksList });

  // Directory callbacks
  const handleAddMember = async (item: User) => {
    try {
      await setDoc(doc(db, "users", item.id), item);
      syncUsers([item, ...users]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${item.id}`);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'Active' | 'Inactive' | 'Pending') => {
    try {
      await updateDoc(doc(db, "users", id), { status });
      syncUsers(users.map(u => u.id === id ? { ...u, status } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${id}`);
    }
  };

  const handleUpdateRole = async (id: string, role: User['role']) => {
    try {
      await updateDoc(doc(db, "users", id), { role });
      syncUsers(users.map(u => u.id === id ? { ...u, role } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${id}`);
    }
  };

  const handleUpdateMemberDetails = async (id: string, updatedFields: Partial<User>) => {
    try {
      await updateDoc(doc(db, "users", id), updatedFields);
      syncUsers(users.map(u => u.id === id ? { ...u, ...updatedFields } : u));
      if (currentUser && currentUser.id === id) {
        const nextUser = { ...currentUser, ...updatedFields };
        setCurrentUser(nextUser);
        localStorage.setItem('bgi_current_user', JSON.stringify(nextUser));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${id}`);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", id));
      syncUsers(users.filter(u => u.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
    }
  };

  // Notices callbacks
  const handleAddNotice = async (item: Announcement) => {
    try {
      await setDoc(doc(db, "announcements", item.id), item);
      syncAnnouncements([item, ...announcements]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `announcements/${item.id}`);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      await deleteDoc(doc(db, "announcements", id));
      syncAnnouncements(announcements.filter(a => a.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    }
  };

  // Events callbacks
  const handleAddEvent = async (item: Event) => {
    try {
      await setDoc(doc(db, "events", item.id), item);
      syncEvents([item, ...events]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `events/${item.id}`);
    }
  };

  const handleRegisterEvent = async (eventId: string, userId: string) => {
    try {
      const currentEvent = events.find(evt => evt.id === eventId);
      if (currentEvent) {
        const isRegistered = currentEvent.registeredUsers.includes(userId);
        const registeredUsers = isRegistered
          ? currentEvent.registeredUsers.filter(uid => uid !== userId)
          : [...currentEvent.registeredUsers, userId];
        await updateDoc(doc(db, "events", eventId), { registeredUsers });
        syncEvents(events.map(evt => evt.id === eventId ? { ...evt, registeredUsers } : evt));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `events/${eventId}`);
    }
  };

  const handleToggleAttendance = async (eventId: string, userId: string) => {
    try {
      const currentEvent = events.find(evt => evt.id === eventId);
      if (currentEvent) {
        const hasAttended = currentEvent.attendance.includes(userId);
        const attendance = hasAttended
          ? currentEvent.attendance.filter(uid => uid !== userId)
          : [...currentEvent.attendance, userId];
        await updateDoc(doc(db, "events", eventId), { attendance });
        syncEvents(events.map(evt => evt.id === eventId ? { ...evt, attendance } : evt));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `events/${eventId}`);
    }
  };

  // Chat & Communication callbacks
  const handleSendChatMessage = async (item: ChatMessage) => {
    try {
      // Direct Firestore push. onSnapshot handles real-time UI array synchronization.
      await setDoc(doc(db, "chats", item.id), item);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chats/${item.id}`);
    }
  };

  const handleAddDiscussion = async (item: DiscussionThread) => {
    try {
      await setDoc(doc(db, "discussions", item.id), item);
      syncDiscussions([item, ...discussions]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `discussions/${item.id}`);
    }
  };

  const handleAddForumComment = async (discId: string, commentItem: any) => {
    try {
      const currentDisc = discussions.find(d => d.id === discId);
      if (currentDisc) {
        const comments = [...(currentDisc.comments || []), commentItem];
        await updateDoc(doc(db, "discussions", discId), { comments, commentsCount: comments.length });
        syncDiscussions(discussions.map(d => d.id === discId ? { ...d, comments, commentsCount: comments.length } : d));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `discussions/${discId}`);
    }
  };

  // Tasks callbacks
  const handleAddTask = async (item: Task) => {
    try {
      await setDoc(doc(db, "tasks", item.id), item);
      syncTasks([item, ...tasks]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `tasks/${item.id}`);
    }
  };

  const handleUpdateTaskStatus = async (id: string, newStatus: Task['status']) => {
    try {
      await updateDoc(doc(db, "tasks", id), { status: newStatus });
      syncTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const handleUpdateTaskProgress = async (id: string, progress: number) => {
    try {
      await updateDoc(doc(db, "tasks", id), { progress });
      syncTasks(tasks.map(t => t.id === id ? { ...t, progress } : t));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const handleAddTaskSubmission = async (taskId: string, submission: TaskSubmission) => {
    try {
      const currentTask = tasks.find(t => t.id === taskId);
      if (currentTask) {
        const submissions = currentTask.submissions ? [...currentTask.submissions, submission] : [submission];
        await updateDoc(doc(db, "tasks", taskId), { submissions });
        syncTasks(tasks.map(t => t.id === taskId ? { ...t, submissions } : t));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const handleRemoveTaskSubmission = async (taskId: string, submissionId: string) => {
    try {
      const currentTask = tasks.find(t => t.id === taskId);
      if (currentTask) {
        const submissions = currentTask.submissions ? currentTask.submissions.filter(s => s.id !== submissionId) : [];
        await updateDoc(doc(db, "tasks", taskId), { submissions });
        syncTasks(tasks.map(t => t.id === taskId ? { ...t, submissions } : t));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  // Navigation mapping options
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Smart ID', icon: UserIcon },
    { id: 'members', label: 'Members Directory', icon: Users },
    { id: 'events', label: 'Scheduled Activities', icon: Calendar },
    { id: 'notices', label: 'Notice Boards', icon: Megaphone },
    { id: 'messages', label: 'Communications', icon: MessageSquare },
    { id: 'tasks', label: 'Team Checklists', icon: CheckSquare },
    { id: 'analytics', label: 'Reports & Export', icon: TrendingUp },
  ];

  const handleNavigateDirectly = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Render proper sub-views based on selections
  const renderActiveView = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            users={users}
            announcements={announcements}
            events={events}
            currentUser={currentUser}
            onNavigate={handleNavigateDirectly}
          />
        );
      case 'profile':
        return (
          <ProfileView
            currentUser={currentUser}
            onUpdateMemberDetails={handleUpdateMemberDetails}
          />
        );
      case 'members':
        return (
          <MemberManagementView
            users={users}
            currentUser={currentUser}
            onAddMember={handleAddMember}
            onUpdateStatus={handleUpdateStatus}
            onUpdateRole={handleUpdateRole}
            onUpdateMemberDetails={handleUpdateMemberDetails}
            onDeleteMember={handleDeleteMember}
          />
        );
      case 'events':
        return (
          <EventManagementView
            events={events}
            currentUser={currentUser}
            onAddEvent={handleAddEvent}
            onRegisterEvent={handleRegisterEvent}
            onToggleAttendance={handleToggleAttendance}
            allUsers={users}
          />
        );
      case 'notices':
        return (
          <NoticesView
            announcements={announcements}
            currentUser={currentUser}
            onAddNotice={handleAddNotice}
            onDeleteNotice={handleDeleteNotice}
          />
        );
      case 'messages':
        return (
          <CommunicationView
            chats={chats}
            discussions={discussions}
            currentUser={currentUser}
            onSendChatMessage={handleSendChatMessage}
            onAddDiscussion={handleAddDiscussion}
            onAddForumComment={handleAddForumComment}
          />
        );
      case 'tasks':
        return (
          <TaskView
            tasks={tasks}
            currentUser={currentUser}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onUpdateTaskProgress={handleUpdateTaskProgress}
            onAddSubmission={handleAddTaskSubmission}
            onRemoveSubmission={handleRemoveTaskSubmission}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            users={users}
            events={events}
            currentUser={currentUser} // <-- Passed currentUser to support the Complaint system seamlessly
          />
        );
      default:
        return <div className="text-white">Under Active Development.</div>;
    }
  };

  // Render Login page if session is vacant
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        allUsers={users}
        onRegisterUser={(item) => {
          handleAddMember(item);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none print:bg-white print:text-black">
      {/* Top Identity Info Bar */}
      <header className="bg-slate-900 border-b border-slate-850 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-md print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="BGI Logo"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full border border-cyan-400/30 object-cover shadow bg-slate-950 shadow-cyan-500/5"
            />
            <span className="font-display font-black text-white text-base tracking-tight">BGI Console</span>
          </div>
        </div>

        {/* Current logged session badge details */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => handleNavigateDirectly('profile')}
            className="hidden sm:flex flex-col items-end text-right font-mono text-[10px] cursor-pointer hover:opacity-85 group"
            title="View My Smart ID Profile"
          >
            <span className="text-white font-sans font-bold text-xs group-hover:text-cyan-400 transition-colors">{currentUser.name}</span>
            <span className="text-emerald-400 font-semibold">{currentUser.role} Control</span>
          </div>

          <img
            src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
            alt=""
            referrerPolicy="no-referrer"
            onClick={() => handleNavigateDirectly('profile')}
            className="w-8 h-8 rounded-lg border border-slate-700 object-cover shrink-0 cursor-pointer hover:border-cyan-500 hover:scale-105 transition-all"
            title="View My Smart ID Profile"
          />

          <button
            onClick={handleLogout}
            className="p-1.5 hover:bg-slate-800 rounded bg-slate-950 border border-slate-850 hover:border-slate-705 text-slate-400 hover:text-red-400 transition-colors"
            title="Settle out session logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-8xl mx-auto w-full relative overflow-hidden">
        
        {/* Persistent Side Navigation Drawer - Desktop mode view */}
        <aside className="w-64 border-r border-slate-850 p-4 space-y-5 hidden md:block shrink-0 print:hidden bg-[#0F0F10]">
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 px-3">Primary Wings</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateDirectly(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors font-sans ${
                    isSelected
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl space-y-1.5 font-mono text-[10px] text-zinc-500">
            <p>● Live Portal status ok</p>
            <p className="text-[9px] text-blue-400 font-black">UTC 2026-05-20T15:39:43Z</p>
          </div>
        </aside>

        {/* Collapsible Mobile Side menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 md:hidden flex justify-start">
            <div className="w-64 bg-slate-900 h-full p-4 border-r border-slate-800 space-y-5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="font-display font-black text-white text-md">BGI Divisions</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 p-1 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigateDirectly(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-lg text-left ${
                        activeTab === item.id ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* View Frame scroller Column */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0">
          <div className="max-w-6xl mx-auto py-2">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}