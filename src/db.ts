import { User, Announcement, Event, ChatMessage, DiscussionThread, Task, ResourceFile, FinancialTransaction } from './types';

// Default mock profiles for quick logging in
export const DEFAULT_USERS: User[] = [
  {
    id: '1',
    name: 'Administrator Chief',
    email: 'admin@gmail.com',
    role: 'Admin',
    department: 'Management Department',
    batch: '21st Batch',
    phone: '+880 1712-345678',
    memberId: 'BGI-2024-001',
    status: 'Active',
    joinDate: '2024-01-15',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    position: 'CEO & Founder',
    password: '0967'
  },
  {
    id: '2',
    name: 'Sarah Rahman',
    email: 'moderator@gmail.com',
    role: 'Moderator',
    department: 'Collaboration (Collab) Department',
    batch: '22nd Batch',
    phone: '+880 1819-876543',
    memberId: 'BGI-2024-042',
    status: 'Active',
    joinDate: '2024-03-10',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    position: 'Dept. Head',
    password: '0967'
  },
  {
    id: '3',
    name: 'Tanvir Hossain',
    email: 'member@bgi.org',
    role: 'Member',
    department: 'IT Department',
    batch: '23rd Batch',
    phone: '+880 1611-223344',
    memberId: 'BGI-2025-109',
    status: 'Active',
    joinDate: '2025-02-01',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    position: 'General Secretary',
    password: 'password123'
  },
  {
    id: '4',
    name: 'Nabila Hasan',
    email: 'nabila@bgi.org',
    role: 'Member',
    department: 'Marketing Department',
    batch: '23rd Batch',
    phone: '+880 1515-998877',
    memberId: 'BGI-2025-115',
    status: 'Active',
    joinDate: '2025-03-15',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
    position: 'Marketing Executive',
    password: 'password123'
  },
  {
    id: '5',
    name: 'Ariful Islam',
    email: 'arif@bgi.org',
    role: 'Member',
    department: 'Graphics Department',
    batch: '24th Batch',
    phone: '+880 1912-554433',
    memberId: 'BGI-2026-004',
    status: 'Pending',
    joinDate: '2026-05-01',
    verified: false,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    position: 'Member',
    password: 'password123'
  }
];

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'BGI Annual Community Summit 2026',
    content: 'We are thrilled to announce the upcoming BGI Annual summit. This event will align all departments, showcase accomplishments of different wings, and unveil the roadmap for 2026-2027. Registration is free but mandatory.',
    publishedBy: 'Administrator Chief',
    publisherRole: 'Admin',
    date: '2026-05-18',
    pinned: true,
    category: 'Event'
  },
  {
    id: 'ann-2',
    title: 'Membership Fee Adjustments for Q3',
    content: 'The Executive committee has decided to stabilize membership fees starting July. Members with backdated dues are requested to settle accounts using the updated payment gateways available in the Finance board.',
    publishedBy: 'Sarah Rahman',
    publisherRole: 'Moderator',
    date: '2026-05-15',
    pinned: false,
    category: 'Finance'
  },
  {
    id: 'ann-3',
    title: 'New Health Safety Protocols for Campus Hub',
    content: 'Please ensure you carry your BGI ID smartcards when entering the shared hub. This will ensure safety and allow automated attendance logs for current workshops.',
    publishedBy: 'Administrator Chief',
    publisherRole: 'Admin',
    date: '2026-05-10',
    pinned: true,
    category: 'Urgent'
  }
];

export const DEFAULT_EVENTS: Event[] = [
  {
    id: 'evt-1',
    title: 'Executive Leadership Workshop',
    description: 'A 2-day session featuring guest lecturers from leading organizations on operational excellence, team building, and scalable governance models in community systems.',
    date: '2026-06-05',
    time: '14:00 - 17:30',
    location: 'BGI Auditorium (Level 4)',
    organizer: 'Events Team',
    capacity: 50,
    registeredUsers: ['2', '3', '4'],
    attendance: ['2', '3'],
    category: 'Workshop'
  },
  {
    id: 'evt-2',
    title: 'AI and Robotics Open Exhibition',
    description: 'Showcasing custom research, computer-vision models, and mechanical robotics developed by the CS and EEE departments of BGI.',
    date: '2026-06-18',
    time: '10:00 - 16:00',
    location: 'Central Plaza Exhibit Arena',
    organizer: 'IT Department',
    capacity: 250,
    registeredUsers: ['1', '3', '4', '5'],
    attendance: [],
    category: 'Festival'
  },
  {
    id: 'evt-3',
    title: 'Monthly General Assembly Meeting',
    description: 'A touchpoint for every active member to participate, discuss budget status updates, suggest structural changes, and present reports.',
    date: '2026-05-28',
    time: '18:00 - 19:30',
    location: 'Zoom Virtual Link & Main Hall Office',
    organizer: 'Executive Board',
    capacity: 500,
    registeredUsers: ['1', '2', '3', '4'],
    attendance: [],
    category: 'Meeting'
  }
];

export const DEFAULT_CHATS: ChatMessage[] = [
  {
    id: 'c1',
    channelId: '#general',
    senderId: '1',
    senderName: 'Administrator Chief',
    senderRole: 'Admin',
    content: 'Welcome everyone to the official BGI Community Internal Portal!',
    timestamp: '2026-05-20T10:30:00Z'
  },
  {
    id: 'c2',
    channelId: '#general',
    senderId: '3',
    senderName: 'Tanvir Hossain',
    senderRole: 'Member',
    content: 'Wow, this looks amazing. Glad to see the platform launched!',
    timestamp: '2026-05-20T10:35:00Z'
  },
  {
    id: 'c3',
    channelId: '#general',
    senderId: '2',
    senderName: 'Sarah Rahman',
    senderRole: 'Moderator',
    content: 'If anyone finds any difficulties or needs resource access permissions, let me know!',
    timestamp: '2026-05-20T10:42:00Z'
  },
  {
    id: 'c4',
    channelId: '#moderators',
    senderId: '1',
    senderName: 'Administrator Chief',
    senderRole: 'Admin',
    content: 'Let’s review the pending registrations for the upcoming workshop today.',
    timestamp: '2026-05-20T11:00:00Z'
  }
];

export const DEFAULT_DISCUSSIONS: DiscussionThread[] = [
  {
    id: 'dsc-1',
    title: 'How can we increase student participation in tech seminars?',
    authorId: '3',
    authorName: 'Tanvir Hossain',
    authorRole: 'Member',
    content: 'Lately, we’ve seen high registration numbers but only 60-70% actual attendance at tech seminars. What incentives or changes in scheduling can we make to ensure high turnout?',
    commentsCount: 2,
    likes: ['2', '4'],
    date: '2026-05-19',
    category: 'Strategy & Engagement',
    comments: [
      {
        id: 'comm-1',
        authorName: 'Sarah Rahman',
        authorRole: 'Moderator',
        content: 'I think distributing quick participation certificates can definitely boost motivation, which is why we’ve incorporated a feedback and certificate generator into this platform.',
        date: '2026-05-19'
      },
      {
        id: 'comm-2',
        authorName: 'Nabila Hasan',
        authorRole: 'Member',
        content: 'Also, providing refreshments and having the sessions in late afternoons rather than morning hours will increase attendee turnout.',
        date: '2026-05-20'
      }
    ]
  },
  {
    id: 'dsc-2',
    title: 'BGI Community Volunteering Drive Ideas',
    authorId: '2',
    authorName: 'Sarah Rahman',
    authorRole: 'Moderator',
    content: 'We are planning a winter warm-clothing distribution drive and an elementary school teaching initiative. Looking for volunteers and logistics team leads. Share your department ideas here!',
    commentsCount: 0,
    likes: ['1'],
    date: '2026-05-18',
    category: 'Social Impact',
    comments: []
  }
];

export const DEFAULT_TASKS: Task[] = [
  {
    id: 'tsk-1',
    title: 'Approve Pending Member Applications',
    description: 'Review the credentials, department verification documents, and assign BGI specific identification numbers for the 24th batch candidates.',
    status: 'Todo',
    priority: 'High',
    assignee: 'Sarah Rahman',
    department: 'Management Department',
    dueDate: '2026-05-25',
    progress: 30,
    submissions: []
  },
  {
    id: 'tsk-2',
    title: 'Design Flyers for Leadership Workshop',
    description: 'Create scalable visual posters, banners for social channels, and event email headers detailing the schedules, panelists, and register guidelines.',
    status: 'InProgress',
    priority: 'Medium',
    assignee: 'Nabila Hasan',
    department: 'Marketing Department',
    dueDate: '2026-06-01',
    progress: 60,
    submissions: []
  },
  {
    id: 'tsk-3',
    title: 'Audit Financial Expense Ledger of Q1',
    description: 'Verify all physical receipts against recorded operational costs, lunch refreshments, infrastructure utilities, and prepare PDF logs.',
    status: 'Review',
    priority: 'High',
    assignee: 'Administrator Chief',
    department: 'Operation Department',
    dueDate: '2026-05-22',
    progress: 90,
    submissions: []
  },
  {
    id: 'tsk-4',
    title: 'Launch Core Registration Portal v1',
    description: 'Design the layout and logic for internal directories, profile dashboards, and deploy tests to guarantee optimal responsive interactions.',
    status: 'Done',
    priority: 'Medium',
    assignee: 'Tanvir Hossain',
    department: 'IT Department',
    dueDate: '2026-05-18',
    progress: 100,
    submissions: [
      {
        id: 'sub-demo-1',
        fileName: 'BGI_CS_Portal_Architecture_v1.pdf',
        fileSize: '2.4 MB',
        uploadedBy: 'Tanvir Hossain',
        uploadedById: '3',
        uploadedAt: '2026-05-18T14:22:00Z',
        fileContent: 'This document details the software architecture, database schemas, and interface layout blueprints developed for the BGI Portal v1.0, including API contract logs.'
      }
    ]
  }
];

export const DEFAULT_RESOURCES: ResourceFile[] = [
  {
    id: 'file-1',
    name: 'BGI_Community_Constitution_2026.pdf',
    type: 'PDF',
    size: '1.4 MB',
    category: 'Guidelines',
    uploadedBy: 'Administrator Chief',
    uploadedDate: '2026-05-01',
    downloadCount: 142,
    minRoleAccess: 'Member'
  },
  {
    id: 'file-2',
    name: 'Official_Summit_Slide_Template.ppt',
    type: 'PPT',
    size: '4.8 MB',
    category: 'Templates',
    uploadedBy: 'Sarah Rahman',
    uploadedDate: '2026-05-12',
    downloadCount: 29,
    minRoleAccess: 'Member'
  },
  {
    id: 'file-3',
    name: 'Executive_Meeting_Minutes_May_05.pdf',
    type: 'PDF',
    size: '620 KB',
    category: 'Minutes',
    uploadedBy: 'Administrator Chief',
    uploadedDate: '2026-05-06',
    downloadCount: 12,
    minRoleAccess: 'Moderator'
  },
  {
    id: 'file-4',
    name: 'Sponsorship_Proposal_Template_2026.doc',
    type: 'DOC',
    size: '850 KB',
    category: 'Templates',
    uploadedBy: 'Sarah Rahman',
    uploadedDate: '2026-05-14',
    downloadCount: 54,
    minRoleAccess: 'Member'
  }
];

export const DEFAULT_FINANCE: FinancialTransaction[] = [
  {
    id: 'tx-1',
    type: 'Income',
    category: 'Donation',
    amount: 25000,
    date: '2026-05-19',
    description: 'Alumni sponsorship for Annual Robot Exhibition Event 2026',
    recordedBy: 'Administrator Chief',
    refNo: 'BGI-REF-0098'
  },
  {
    id: 'tx-2',
    type: 'Income',
    category: 'Membership Fee',
    amount: 12500,
    date: '2026-05-17',
    description: 'Bulk monthly subscription receipts from CSE Batch 23',
    recordedBy: 'Sarah Rahman',
    refNo: 'BGI-REF-0097'
  },
  {
    id: 'tx-3',
    type: 'Expense',
    category: 'Marketing',
    amount: 4200,
    date: '2026-05-14',
    description: 'Printing cost for Summit brochures and welcome flyers',
    recordedBy: 'Sarah Rahman',
    refNo: 'BGI-REF-0096'
  },
  {
    id: 'tx-4',
    type: 'Expense',
    category: 'Refreshment',
    amount: 1800,
    date: '2026-05-12',
    description: 'Volunteers food items during community hall cleaning camp',
    recordedBy: 'Administrator Chief',
    refNo: 'BGI-REF-0095'
  },
  {
    id: 'tx-5',
    type: 'Income',
    category: 'Event Sponsorship',
    amount: 15000,
    date: '2026-05-08',
    description: 'Co-sponsor branding allocation for tech summit logistics',
    recordedBy: 'Administrator Chief',
    refNo: 'BGI-REF-0094'
  },
  {
    id: 'tx-6',
    type: 'Expense',
    category: 'Infrastructure',
    amount: 6000,
    date: '2026-05-05',
    description: 'High-speed router installation for the community center main workspace',
    recordedBy: 'Administrator Chief',
    refNo: 'BGI-REF-0093'
  }
];

// Helper database manager which handles loading / saving to localStorage
export const getDB = () => {
  const users = localStorage.getItem('bgi_users');
  const announcements = localStorage.getItem('bgi_announcements');
  const events = localStorage.getItem('bgi_events');
  const chats = localStorage.getItem('bgi_chats');
  const discussions = localStorage.getItem('bgi_discussions');
  const tasks = localStorage.getItem('bgi_tasks');
  const resources = localStorage.getItem('bgi_resources');
  const finance = localStorage.getItem('bgi_finance');

  let parsedUsers: User[] = users ? JSON.parse(users) : DEFAULT_USERS;
  parsedUsers = parsedUsers.map(u => {
    if (u.id === '1') {
      return { ...u, email: 'admin@gmail.com', password: '0967', role: 'Admin' };
    }
    if (u.id === '2') {
      return { ...u, email: 'moderator@gmail.com', password: '0967', role: 'Moderator' };
    }
    return u;
  });

  return {
    users: parsedUsers,
    announcements: announcements ? JSON.parse(announcements) : DEFAULT_ANNOUNCEMENTS,
    events: events ? JSON.parse(events) : DEFAULT_EVENTS,
    chats: chats ? JSON.parse(chats) : DEFAULT_CHATS,
    discussions: discussions ? JSON.parse(discussions) : DEFAULT_DISCUSSIONS,
    tasks: tasks ? JSON.parse(tasks) : DEFAULT_TASKS,
    resources: resources ? JSON.parse(resources) : DEFAULT_RESOURCES,
    finance: finance ? JSON.parse(finance) : DEFAULT_FINANCE,
  };
};

// High-fidelity local file persistence layer for massive files/PDFs using IndexedDB and in-memory caching
const dbName = 'BGIOperationsDB';
const storeName = 'files';

const initIDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Global in-memory cache to guarantee ultra-fast synchronous retrieval
const fileMemoryCache: Record<string, string> = {};

export const saveLargeFileContent = (id: string, content: string): void => {
  fileMemoryCache[id] = content;
  initIDB()
    .then((db) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      store.put(content, id);
    })
    .catch((err) => {
      console.error('IndexedDB save failed for file ID: ' + id, err);
    });
};

export const getLargeFileContent = async (id: string): Promise<string | null> => {
  if (fileMemoryCache[id]) {
    return fileMemoryCache[id];
  }
  try {
    const db = await initIDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => {
        const val = request.result || null;
        if (val) {
          fileMemoryCache[id] = val;
        }
        resolve(val);
      };
      request.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.error('IndexedDB read failed for file ID: ' + id, err);
    return null;
  }
};

export const saveDB = (data: {
  users?: User[];
  announcements?: Announcement[];
  events?: Event[];
  chats?: ChatMessage[];
  discussions?: DiscussionThread[];
  tasks?: Task[];
  resources?: ResourceFile[];
  finance?: FinancialTransaction[];
}) => {
  if (data.users) localStorage.setItem('bgi_users', JSON.stringify(data.users));
  if (data.announcements) localStorage.setItem('bgi_announcements', JSON.stringify(data.announcements));
  if (data.events) localStorage.setItem('bgi_events', JSON.stringify(data.events));
  if (data.chats) localStorage.setItem('bgi_chats', JSON.stringify(data.chats));
  if (data.discussions) localStorage.setItem('bgi_discussions', JSON.stringify(data.discussions));
  
  if (data.tasks) {
    // Before saving tasks, extract massive base64 fileContents so we don't exceed the 5MB localStorage limit
    const lightweightTasks = data.tasks.map(task => {
      if (task.submissions && task.submissions.length > 0) {
        return {
          ...task,
          submissions: task.submissions.map(sub => {
            if (sub.fileContent && sub.fileContent.startsWith('data:')) {
              // Extract to high-fidelity store and save lightweight reference pointer
              saveLargeFileContent(sub.id, sub.fileContent);
              return { ...sub, fileContent: `idb:${sub.id}` };
            }
            return sub;
          })
        };
      }
      return task;
    });
    localStorage.setItem('bgi_tasks', JSON.stringify(lightweightTasks));
  }
  
  if (data.resources) localStorage.setItem('bgi_resources', JSON.stringify(data.resources));
  if (data.finance) localStorage.setItem('bgi_finance', JSON.stringify(data.finance));
};
