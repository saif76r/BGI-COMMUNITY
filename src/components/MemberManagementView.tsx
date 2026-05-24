import React, { useState } from 'react';
import { Search, Filter, UserPlus, CreditCard, Shield, MoreVertical, CheckCircle, XCircle, Trash2, Mail, Phone, Hash, Users, Download, Eye, Calendar, Edit, ShieldAlert } from 'lucide-react';
import { User, UserRole } from '../types';
import { motion } from 'motion/react';
// @ts-ignore
import logoImg from '../assets/images/bgi_clean_logo_1779446230793.png';

interface MemberManagementViewProps {
  users: User[];
  currentUser: User;
  onAddMember: (member: User) => void;
  onUpdateStatus: (id: string, status: 'Active' | 'Inactive' | 'Pending') => void;
  onUpdateRole: (id: string, role: UserRole) => void;
  onUpdateMemberDetails?: (id: string, updatedFields: Partial<User>) => void;
  onDeleteMember: (id: string) => void;
}

export default function MemberManagementView({
  users,
  currentUser,
  onAddMember,
  onUpdateStatus,
  onUpdateRole,
  onUpdateMemberDetails,
  onDeleteMember
}: MemberManagementViewProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Add Member Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Member');
  const [newDept, setNewDept] = useState('PR Department');
  const [newPosition, setNewPosition] = useState('Member');

  // Promote/Edit Member Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('Member');
  const [editDept, setEditDept] = useState('PR Department');
  const [editPosition, setEditPosition] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive' | 'Pending'>('Active');

  // Selected User for Digital ID generation
  const [selectedIDGenerationUser, setSelectedIDGenerationUser] = useState<User | null>(users[1] || users[0]);
  const [showIDCardModal, setShowIDCardModal] = useState(false);

  // Derive unique lists dynamic filters
  const departments = [
    'All',
    'PR Department',
    'Marketing Department',
    'HR Department',
    'IT Department',
    'Graphics Department',
    'Mailing Department',
    'Management Department',
    'Communication Department',
    'Collaboration (Collab) Department',
    'Recent Info Department & Post',
    'Photography Department',
    'Creative & Design Department',
    'Operation Department',
    'Research Department',
    'Sports Department',
    'Education Department',
    'Emergency Department'
  ];
  // Filtered list
const filteredUsers = users.filter(user => {

  // Admin & Moderator can see all users
  if (
    currentUser.role !== 'Admin' &&
    currentUser.role !== 'Moderator'
  ) {
    if (user.department !== currentUser.department) {
      return false;
    }
  }

  const matchesSearch =
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.memberId.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesDept =
    selectedDept === 'All' || user.department === selectedDept;

  const matchesStatus =
    selectedStatus === 'All' || user.status === selectedStatus;

  return matchesSearch && matchesDept && matchesStatus;
});
  const handleAddNewMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPhone) return;

    // Generate random mock member ID e.g., BGI-2026-6182
    const generatedId = `BGI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdDate = new Date().toISOString().split('T')[0];

    const newObj: User = {
      id: Math.random().toString(),
      name: newName,
      email: newEmail,
      phone: newPhone,
      role: newRole,
      department: newDept,
      memberId: generatedId,
      status: 'Active',
      joinDate: createdDate,
      verified: true,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newName)}`,
      position: newPosition || 'Member',
      password: 'password123'
    };

    onAddMember(newObj);
    setShowAddModal(false);
    
    // Clear states
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewPosition('Member');
  };

  const handleEditMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (onUpdateMemberDetails) {
      onUpdateMemberDetails(editingUser.id, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        role: editRole,
        department: editDept,
        position: editPosition || 'Member',
        status: editStatus
      });
    } else {
      onUpdateRole(editingUser.id, editRole);
      onUpdateStatus(editingUser.id, editStatus);
    }

    // Update selected ID card visual too if we changed their profile
    if (selectedIDGenerationUser?.id === editingUser.id) {
      setSelectedIDGenerationUser({
        ...selectedIDGenerationUser,
        name: editName,
        email: editEmail,
        phone: editPhone,
        role: editRole,
        department: editDept,
        position: editPosition || 'Member',
        status: editStatus
      });
    }

    setEditingUser(null);
  };

  const isEditable = currentUser.role === 'Admin' || currentUser.role === 'Moderator';

  // ID Printing Simulator trigger
  const triggerPrintCard = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-wide">BGI Community Members</h2>
          <p className="text-xs text-slate-400">Search profiles, generate smartcards, edit statuses, and assign executive roles.</p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => {
              if (selectedIDGenerationUser) {
                setShowIDCardModal(true);
              }
            }}
            className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Launch ID Card Generator
          </button>

          {isEditable && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/10"
            >
              <UserPlus className="w-4 h-4" />
              Register Profile
            </button>
          )}
        </div>
      </div>

      {/* Directory Filter Panel */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative col-span-1 md:col-span-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, ID, email..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs transition-colors"
          />
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs text-slate-300 transition-colors"
          >
            <option value="All">All Departments</option>
            {departments.slice(1).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs text-slate-300 transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Grid of Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedIDGenerationUser(user)}
              className={`bg-slate-900 border rounded-xl p-4 space-y-3 relative transition-all cursor-pointer ${
                selectedIDGenerationUser?.id === user.id ? 'border-emerald-500/80 ring-1 ring-emerald-500/30' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Quick Profile Heading */}
              <div className="flex gap-3.5 items-start">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                />
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white truncate">{user.name}</h3>
                    <span className={`text-[9px] px-1.5 rounded uppercase font-bold shrink-0 ${
                      user.role === 'Admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      user.role === 'Moderator' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400">{user.memberId}</div>
                  <div className="text-xs text-slate-400 truncate">{user.department}</div>
                  <div className="text-[10px] font-bold text-emerald-400 font-mono mt-1 tracking-wide bg-emerald-950/30 border border-emerald-900/40 px-1.5 py-0.5 rounded w-fit">
                    ★ {user.position || 'Member'}
                  </div>
                </div>

                {/* Card Status Indicator */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`h-2 w-2 rounded-full ${
                    user.status === 'Active' ? 'bg-emerald-500' :
                    user.status === 'Inactive' ? 'bg-red-500' :
                    'bg-amber-400'
                  }`} />
                </div>
              </div>

              {/* Contact Data details */}
              <div className="pt-2 border-t border-slate-850 grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{user.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Joined {user.joinDate}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-[10px] text-slate-500 uppercase">Ver: {user.verified ? 'Verified' : 'Pending'}</span>
                </div>
              </div>

              {/* Administrative Permissions actions */}
              {isEditable && (
                <div className="pt-2.5 border-t border-slate-850 flex justify-between items-center gap-2">
                  <div className="flex gap-1.5">
                    {/* Status Toggles */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus(user.id, 'Active'); }}
                      className={`p-1 rounded text-[10px] font-mono ${user.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'}`}
                      title="Set status Active"
                    >
                      Active
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus(user.id, 'Inactive'); }}
                      className={`p-1 rounded text-[10px] font-mono ${user.status === 'Inactive' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'}`}
                      title="Set status Inactive"
                    >
                      Block
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Role changer (Admin only) */}
                    {currentUser.role === 'Admin' && (
                      <select
                        value={user.role}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdateRole(user.id, e.target.value as UserRole)}
                        className="bg-slate-950 text-[10px] border border-slate-800 rounded font-mono px-1 py-0.5 text-slate-400 focus:outline-none"
                      >
                        <option value="Member">Member</option>
                        <option value="Moderator">Moderator</option>
                        <option value="Admin">Admin</option>
                      </select>
                    )}

                    {currentUser.role === 'Admin' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingUser(user);
                          setEditName(user.name);
                          setEditEmail(user.email);
                          setEditPhone(user.phone || '');
                          setEditRole(user.role);
                          setEditDept(user.department);
                          setEditPosition(user.position || 'Member');
                          setEditStatus(user.status);
                        }}
                        className="p-1 px-1.5 rounded text-[10px] bg-slate-950 text-cyan-400 hover:text-cyan-300 border border-slate-800 font-mono flex items-center gap-1 hover:border-cyan-500/50"
                        title="Promote Member / Change Position & Details"
                      >
                        <Edit className="w-3 h-3" /> Edit/Promote
                      </button>
                    )}

                    {currentUser.role === 'Admin' && user.id !== currentUser.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); if(confirm(`Delete ${user.name}?`)) onDeleteMember(user.id); }}
                        className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/25 rounded transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-3 bg-slate-900 border border-slate-800 p-8 rounded-xl text-center">
            <Users className="w-10 h-10 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-400 italic">No community members match your current filter searches.</p>
          </div>
        )}
      </div>

      {/* Digital Smart Identification Card Frame */}
      {selectedIDGenerationUser && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 space-y-3">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live ID Engine
            </span>
            <h3 className="text-lg font-display font-bold text-white tracking-tight">Generate BGI Smart Card Badge</h3>
            <p className="text-xs text-slate-405 text-slate-400 leading-relaxed font-sans">
              Select any profile in the grid above. The engine instantaneously auto-bundles credentials, department barcodes, verification seals, and security watermarks into compliance smart cards matching modern BGI standards.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowIDCardModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4py-2 px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" /> Preview & Export Smart ID Badge
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 flex justify-center">
            {/* Visual Smartcard mockup layout */}
            <div className="w-[320px] h-[480px] bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
              {/* Top Security Line with Chip */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
              
              {/* Custom patterns in card */}
              <div className="absolute top-6 left-6 w-16 h-16 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full filter blur-xl"></div>
              <div className="absolute bottom-6 right-6 w-20 h-20 bg-gradient-to-bl from-cyan-500/15 to-transparent rounded-full filter blur-xl"></div>

              {/* ID Header */}
              <div className="flex justify-between items-center pt-1.5">
                <div>
                  <h4 className="text-xs font-bold font-display text-white tracking-wide">BGI Community</h4>
                  <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Digital RFID Smartcard</p>
                </div>
                <img
                  src={logoImg}
                  alt="BGI Logo"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-cyan-400/30 object-cover bg-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                />
              </div>

              {/* RFID microchip mockup */}
              <div className="w-8 h-6 bg-amber-400/20 border border-amber-400/50 rounded-md my-1 relative overflow-hidden">
                <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-amber-400/40"></div>
                <div className="absolute left-1/2 top-0 w-[0.5px] h-full bg-amber-400/40"></div>
              </div>

              {/* Center User Image */}
              <div className="flex flex-col items-center space-y-2 mt-2">
                <img
                  src={selectedIDGenerationUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedIDGenerationUser.name)}`}
                  alt={selectedIDGenerationUser.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-2xl object-cover bg-slate-900 border-2 border-slate-800 shadow-md p-1"
                />
                
                <div className="text-center">
                  <h3 className="text-md font-bold text-white tracking-wide">{selectedIDGenerationUser.name}</h3>
                  <div className="text-[11px] text-emerald-400 font-mono font-bold uppercase tracking-wider mb-1">
                    ★ {selectedIDGenerationUser.position || 'Member'}
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    selectedIDGenerationUser.role === 'Admin' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    selectedIDGenerationUser.role === 'Moderator' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {selectedIDGenerationUser.role}
                  </span>
                </div>
              </div>

              {/* ID Card Fields */}
              <div className="space-y-1.5 pt-4 text-[10px] font-mono border-t border-slate-850">
                <div className="flex justify-between">
                  <span className="text-slate-500">MEMBER ID</span>
                  <span className="text-slate-200 font-bold">{selectedIDGenerationUser.memberId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">WING/DEPT</span>
                  <span className="text-slate-300 truncate max-w-[150px]">{selectedIDGenerationUser.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ISSUE DATE</span>
                  <span className="text-slate-350 text-slate-400">{selectedIDGenerationUser.joinDate}</span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="space-y-1 pt-3 border-t border-slate-850">
                <div className="flex justify-center select-none opacity-60">
                  <div className="flex gap-[1.5px] items-center h-8">
                    {[1,2,1,3,1,2,4,1,2,3,1,1,2,3,2,1,1,2,1,4,1,2,3,2,1].map((bar, index) => (
                      <div
                        key={index}
                        className="bg-white"
                        style={{ width: `${bar * 1}px`, height: '100%' }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[7px] text-center font-mono text-slate-600 uppercase tracking-widest">
                  SECURE BGI RFID WATERMARK LOG {selectedIDGenerationUser.id.substring(0, 6)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Profile Dialog / Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-white font-display font-bold text-lg">Register Official Profile</h3>
            
            <form onSubmit={handleAddNewMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Sarah Rahman"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Official Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@bgi.org"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mobile No</label>
                <input
                  type="tel"
                  required
                  placeholder="+880 1712345678"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  {departments.slice(1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {currentUser.role === 'Admin' && (
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Authority Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Member">Member</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Designated Position</label>
                    <input
                      type="text"
                      required
                      placeholder="EX. General Secretary"
                      value={newPosition}
                      onChange={(e) => setNewPosition(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold py-2 px-4 rounded-xl hover:brightness-110 transition-all text-sm"
                >
                  Confirm Profile Creation
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

      {/* ID Card PDF Mock Export Modal */}
      {showIDCardModal && selectedIDGenerationUser && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-white font-display font-bold text-md">Compliance BGI Smart Card badge</h3>
              <button
                onClick={() => setShowIDCardModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close (X)
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              To trigger a vector print rendering of the following BGI Badge, configure local target layouts or click standard print.
            </p>

            <div className="flex justify-center py-4 bg-slate-950 rounded-xl border border-slate-800">
              {/* Full smart card for export preview */}
              <div className="w-[280px] h-[400px] bg-slate-900 rounded-xl relative p-4 flex flex-col justify-between border-2 border-emerald-500/50 shadow-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-[11px] font-bold text-white uppercase font-display">BGI Official</h4>
                    <p className="text-[7px] text-slate-500 font-mono">RFID IDENTITY CARD</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <img
                      src={logoImg}
                      alt="BGI Logo"
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full border border-cyan-400/30 object-cover bg-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.1)]"
                    />
                    <span className="text-[8px] font-mono font-bold text-emerald-400">VERIFIED</span>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <img
                    src={selectedIDGenerationUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedIDGenerationUser.name)}`}
                    alt=""
                    className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 object-cover"
                  />
                  <div className="text-center">
                    <h3 className="text-sm font-bold text-white">{selectedIDGenerationUser.name}</h3>
                    <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">
                      ★ {selectedIDGenerationUser.position || 'Member'}
                    </div>
                    <p className="text-[9px] font-mono text-cyan-400">{selectedIDGenerationUser.memberId}</p>
                  </div>
                </div>

                <div className="space-y-1 text-[9px] font-mono border-t border-slate-800 pt-2 text-slate-350">
                  <div className="flex justify-between">
                    <span className="text-slate-500">DEPT/WING:</span>
                    <span className="text-slate-200">{selectedIDGenerationUser.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">JOIN DATE:</span>
                    <span className="text-slate-200">{selectedIDGenerationUser.joinDate}</span>
                  </div>
                </div>

                {/* Micro Barcode bottom footer */}
                <div className="flex flex-col items-center gap-0.5 pt-2 border-t border-slate-800">
                  <div className="flex gap-[1px] h-5 justify-center opacity-70">
                    {[1,2,3,1,1,2,1,2,1,3,2,1,1,2,1,3].map((bar, i) => (
                      <div key={i} className="bg-white w-[1px] h-full" style={{ width: `${bar * 1}px` }} />
                    ))}
                  </div>
                  <p className="text-[6px] text-slate-500 font-mono tracking-widest">{selectedIDGenerationUser.memberId}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={triggerPrintCard}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold py-2.5 rounded-lg text-xs font-display transition-all hover:brightness-105 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download PDF Vector Export
              </button>
              <button
                onClick={() => setShowIDCardModal(false)}
                className="bg-slate-800 text-white font-semibold px-4 rounded-lg text-xs hover:bg-slate-705"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promotion / Edit Member Details Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-white font-display font-bold text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
                Promote / Edit Member
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-450 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Custom Designation Position</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. General Secretary, Dept. Head, Treasurer, Advisor, Volunteer"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 border-emerald-500/20 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm font-semibold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Specify the custom board designation or title for this user.</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Permission Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Member">Member (View & Submit Files)</option>
                    <option value="Moderator">Moderator (Review Files & Manage Events)</option>
                    <option value="Admin">Admin (CEO Executive Controls)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Status Access</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Blocked</option>
                    <option value="Pending">Pending Approval</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Department Wing</label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  {departments.slice(1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold py-2 px-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all text-xs"
                >
                  Save Promotion Details
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-slate-850 border border-slate-800 text-white font-semibold py-2 px-4 rounded-xl hover:bg-slate-700 text-xs"
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
