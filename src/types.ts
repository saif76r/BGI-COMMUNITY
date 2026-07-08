export type UserRole = 'Admin' | 'Moderator' | 'Member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department: string;
  batch?: string;
  memberId: string; // generated BGI ID (e.g., BGI-2026-0412)
  status: 'Active' | 'Inactive' | 'Pending';
  joinDate: string;
  verified: boolean;
  position?: string; // custom designation e.g. "CEO", "General Secretary", "Dept. Head"
  password?: string; // custom password
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  publishedBy: string;
  publisherRole: UserRole;
  date: string;
  pinned: boolean;
  category: 'General' | 'Urgent' | 'Academic' | 'Event' | 'Finance';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  capacity: number;
  registeredUsers: string[]; // List of user IDs
  attendance: string[]; // List of user IDs who attended
  category: 'Workshop' | 'Seminar' | 'Social' | 'Meeting' | 'Festival';
  image?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string; // e.g. '#general', '#announcements', '#moderators' or direct message userId
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
}

export interface DiscussionThread {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  commentsCount: number;
  likes: string[]; // array of userIds
  date: string;
  category: string;
  comments: {
    id: string;
    authorName: string;
    authorRole: UserRole;
    content: string;
    date: string;
  }[];
}

export interface TaskSubmission {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string; // User Name
  uploadedById: string; // User ID
  uploadedAt: string; // ISO String or date label
  fileContent?: string; // Simulated content string or Base64 data url
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'InProgress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  assignee: string; // Name or ID
  department: string;
  dueDate: string;
  progress: number; // 0 to 100
  submissions?: TaskSubmission[];
}

export interface ResourceFile {
  id: string;
  name: string;
  type: 'PDF' | 'DOC' | 'XLS' | 'PPT' | 'Image';
  size: string;
  category: 'Guidelines' | 'Templates' | 'Minutes' | 'Finance' | 'Others';
  uploadedBy: string;
  uploadedDate: string;
  downloadCount: number;
  minRoleAccess: UserRole;
}

export interface FinancialTransaction {
  id: string;
  type: 'Income' | 'Expense';
  category: 'Donation' | 'Membership Fee' | 'Event Sponsorship' | 'Infrastructure' | 'Operations' | 'Marketing' | 'Refreshment';
  amount: number;
  date: string;
  description: string;
  recordedBy: string;
  refNo: string; // reference receipt tracking code
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  totalIncome: number;
  totalExpense: number;
  netReserve: number;
  upcomingEventsCount: number;
  announcementsCount: number;
}
