import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Default mock datasets used if db.json does not exist
const DEFAULT_USERS = [
  {
    id: '1',
    name: 'Administrator Chief',
    email: 'admin@gmail.com',
    role: 'Admin',
    department: 'Management Department',
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

const DEFAULT_ANNOUNCEMENTS = [
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

const DEFAULT_EVENTS = [
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

const DEFAULT_CHATS = [
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

const DEFAULT_DISCUSSIONS = [
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

const DEFAULT_TASKS = [
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

interface DatabaseSchema {
  users: any[];
  announcements: any[];
  events: any[];
  chats: any[];
  discussions: any[];
  tasks: any[];
}

// Ensure database file logic
function loadDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading database file, resetting to defaults", err);
  }
  const defaultDB: DatabaseSchema = {
    users: DEFAULT_USERS,
    announcements: DEFAULT_ANNOUNCEMENTS,
    events: DEFAULT_EVENTS,
    chats: DEFAULT_CHATS,
    discussions: DEFAULT_DISCUSSIONS,
    tasks: DEFAULT_TASKS
  };
  saveDB(defaultDB);
  return defaultDB;
}

function saveDB(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Helper to merge lists securely
function unionById(serverList: any[], clientList: any[]) {
  const map = new Map();
  // Server items take initial precedence
  for (const item of serverList) {
    map.set(item.id, item);
  }
  // Client updates overwrite or append
  for (const item of clientList) {
    const existing = map.get(item.id);
    if (existing) {
      // Overwrite keeping latest values
      map.set(item.id, { ...existing, ...item });
    } else {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

// API Routes
app.get("/api/db", (req, res) => {
  res.json(loadDB());
});

// Single point sync API which handles robust bi-directional updates securely
app.post("/api/db/sync", (req, res) => {
  const clientData = req.body;
  const serverData = loadDB();

  // We perform smart merge
  const mergedUsers = unionById(serverData.users, clientData.users || []);
  const mergedAnnouncements = unionById(serverData.announcements, clientData.announcements || []);
  const mergedEvents = unionById(serverData.events, clientData.events || []);
  const mergedChats = unionById(serverData.chats, clientData.chats || []);
  const mergedDiscussions = unionById(serverData.discussions, clientData.discussions || []);
  const mergedTasks = unionById(serverData.tasks, clientData.tasks || []);

  const mergedDB: DatabaseSchema = {
    users: mergedUsers,
    announcements: mergedAnnouncements,
    events: mergedEvents,
    chats: mergedChats,
    discussions: mergedDiscussions,
    tasks: mergedTasks
  };

  saveDB(mergedDB);
  res.json(mergedDB);
});

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running internally on port ${PORT}`);
  });
}

startServer();
