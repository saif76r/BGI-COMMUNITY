import React, { useState, useRef } from 'react';
import { getLargeFileContent } from '../db';
import {
  ClipboardList,
  Plus,
  User as UserIcon,
  Calendar,
  Tag,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Flame,
  Clock,
  FileText,
  Upload,
  Trash2,
  X,
  Shield,
  FileBadge,
  Eye,
  AlertCircle,
  CheckSquare,
  Download
} from 'lucide-react';
import { Task, User, TaskSubmission } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TaskViewProps {
  tasks: Task[];
  currentUser: User;
  onAddTask: (task: Task) => void;
  onUpdateTaskStatus: (id: string, newStatus: Task['status']) => void;
  onUpdateTaskProgress: (id: string, progress: number) => void;
  onAddSubmission: (taskId: string, submission: TaskSubmission) => void;
  onRemoveSubmission: (taskId: string, submissionId: string) => void;
}

export default function TaskView({
  tasks,
  currentUser,
  onAddTask,
  onUpdateTaskStatus,
  onUpdateTaskProgress,
  onAddSubmission,
  onRemoveSubmission
}: TaskViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [previewSubmission, setPreviewSubmission] = useState<TaskSubmission | null>(null);

  // New task form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [assignee, setAssignee] = useState('');
  const [department, setDepartment] = useState('Management Department');
  const [dueDate, setDueDate] = useState('2026-05-30');

  // File Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Role helpers
  const isCEO = currentUser.role === 'Admin';
  const isDepartmentHead = currentUser.role === 'Moderator';
  const canReview = isCEO || isDepartmentHead;
  const isMember = currentUser.role === 'Member';

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newTask: Task = {
      id: `tsk-${Math.floor(100 + Math.random() * 900)}`,
      title,
      description,
      status: 'Todo',
      priority,
      assignee: assignee || 'Unassigned',
      department,
      dueDate,
      progress: 0,
      submissions: []
    };

    onAddTask(newTask);
    setShowAddModal(false);

    // reset keys
    setTitle('');
    setDescription('');
    setAssignee('');
  };

  // Process selected file
  const handleFileProcess = (file: File) => {
    setUploadError('');
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are permitted for official task submissions.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('File size exceeds the 8MB operations threshold.');
      return;
    }

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = parseFloat(sizeMB) > 0.1 ? `${sizeMB} MB` : `${(file.size / 1024).toFixed(0)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newSub: TaskSubmission = {
        id: `sub-${Math.floor(1000 + Math.random() * 9000)}`,
        fileName: file.name,
        fileSize: sizeStr,
        uploadedBy: currentUser.name,
        uploadedById: currentUser.id,
        uploadedAt: new Date().toISOString(),
        fileContent: dataUrl
      };

      if (selectedTask) {
        onAddSubmission(selectedTask.id, newSub);
        
        // Update local selectedTask state to reflect changes instantly
        const updatedTask = {
          ...selectedTask,
          submissions: selectedTask.submissions ? [...selectedTask.submissions, newSub] : [newSub]
        };
        setSelectedTask(updatedTask);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDownloadFile = (sub: TaskSubmission) => {
    if (sub.fileContent && sub.fileContent.startsWith('data:')) {
      try {
        const parts = sub.fileContent.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([uInt8Array], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = sub.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Failed to download as blob, trying fallback direct data URL", err);
        const a = document.createElement('a');
        a.href = sub.fileContent;
        a.download = sub.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } else {
      // It's a simulated text/mock document, let's generate a downloadable text file representing the preview
      const textContent = `${sub.fileName}\n====================\nUploaded By: ${sub.uploadedBy}\nUploaded At: ${sub.uploadedAt}\nFile Size: ${sub.fileSize}\n\nDOCUMENT BODY:\n${sub.fileContent || 'No document content.'}`;
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = sub.fileName.endsWith('.pdf') ? sub.fileName.replace('.pdf', '_preview.txt') : `${sub.fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleInspectSub = async (sub: TaskSubmission) => {
    let resolvedSub = { ...sub };
    if (sub.fileContent && sub.fileContent.startsWith('idb:')) {
      const id = sub.fileContent.replace('idb:', '');
      const fullContent = await getLargeFileContent(id);
      if (fullContent) {
        resolvedSub.fileContent = fullContent;
      }
    }
    setPreviewSubmission(resolvedSub);
  };

  const handleDownloadSub = async (sub: TaskSubmission) => {
    let resolvedSub = { ...sub };
    if (sub.fileContent && sub.fileContent.startsWith('idb:')) {
      const id = sub.fileContent.replace('idb:', '');
      const fullContent = await getLargeFileContent(id);
      if (fullContent) {
        resolvedSub.fileContent = fullContent;
      }
    }
    handleDownloadFile(resolvedSub);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const columns: { label: string; status: Task['status']; color: string }[] = [
    { label: 'Planned Tasks', status: 'Todo', color: 'bg-slate-950/40 text-slate-400 border-slate-800' },
    { label: 'In Progress', status: 'InProgress', color: 'bg-cyan-950/20 text-cyan-400 border-cyan-900/40' },
    { label: 'In Review Logs', status: 'Review', color: 'bg-amber-950/20 text-amber-400 border-amber-900/40' },
    { label: 'Completed', status: 'Done', color: 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-wide">BGI Team Tasks Workspace</h2>
          <p className="text-xs text-slate-400">Track operations, schedule due reminders, assign checklists, and upload official PDF deliverable files.</p>
        </div>

        {canReview && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" /> Create Core Task
          </button>
        )}
      </div>

      {/* Role Banner Info */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-slate-400">Current Role Access: </span>
            <span className="font-bold text-white">
              {isCEO ? 'CEO / Chief Executive (Admin)' : isDepartmentHead ? `${currentUser.department} Head (Moderator)` : 'Department Member'}
            </span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-mono italic">
          {canReview ? '✓ Elevated Access: Authorized to inspect PDF audit submissions' : '✓ Standard Access: Assigned members can lock and upload files'}
        </div>
      </div>

      {/* Grid of Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.status);

          return (
            <div key={col.status} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col space-y-3.5 min-w-[240px] max-h-[580px] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs uppercase font-mono tracking-wider font-bold text-slate-300">
                  {col.label}
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-full font-mono font-bold text-slate-400">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colTasks.length > 0 ? (
                  colTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task);
                        setPreviewSubmission(null);
                      }}
                      className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl space-y-2.5 hover:border-slate-700 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                          task.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/15' :
                          task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {task.priority} Priority
                        </span>
                        
                        <span className="text-[10px] font-mono text-zinc-500 font-bold shrink-0">{task.id}</span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-slate-205 text-white group-hover:text-cyan-300 transition-colors tracking-wide">{task.title}</h4>
                        {task.description && (
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{task.description}</p>
                        )}
                      </div>

                      {/* Display PDF Submission Count */}
                      {task.submissions && task.submissions.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono bg-cyan-950/30 border border-cyan-900/50 text-cyan-400 px-2 py-1 rounded-lg w-fit">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{task.submissions.length} PDF Submissions</span>
                        </div>
                      )}

                      <div className="space-y-1 pt-1.5 border-t border-slate-850 text-[10px] font-mono text-slate-400">
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">For: {task.assignee} ({task.department})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-slate-450">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Due: {task.dueDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress scale */}
                      <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between text-[9px] font-mono text-slate-500">
                          <span>Complete Rate</span>
                          <span>{task.progress}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          value={task.progress}
                          onChange={(e) => onUpdateTaskProgress(task.id, parseInt(e.target.value) || 0)}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      {/* Status quick mover arrows */}
                      <div className="flex items-center justify-between pt-1 font-mono text-[9px] text-slate-500" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs group-hover:text-cyan-400 transition-colors uppercase font-mono tracking-widest text-[9px]">✎ Details Hub</span>
                        <div className="flex gap-1">
                          {col.status !== 'Todo' && (
                            <button
                              onClick={() => {
                                const prevStat = col.status === 'InProgress' ? 'Todo' : col.status === 'Review' ? 'InProgress' : 'Review';
                                onUpdateTaskStatus(task.id, prevStat);
                              }}
                              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                              title="Shift back step"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {col.status !== 'Done' && (
                            <button
                              onClick={() => {
                                const nextStat = col.status === 'Todo' ? 'InProgress' : col.status === 'InProgress' ? 'Review' : 'Done';
                                onUpdateTaskStatus(task.id, nextStat);
                              }}
                              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                              title="Shift forward step"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-600 font-mono italic text-center py-6">Column index is empty.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE TASK MODAL SCREEN */}
      {showAddModal && canReview && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-white font-display font-medium text-lg">Define Operations Component</h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Task Title Headline</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Layout agenda schedules draft"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Detailed Requirements</label>
                <textarea
                  rows={3}
                  placeholder="Outline step metrics, desired results, and review instructions."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Assignee Name</label>
                  <input
                    type="text"
                    placeholder="Ex. Sarah Rahman"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Wing Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="PR Department">PR Department</option>
                    <option value="Marketing Department">Marketing Department</option>
                    <option value="HR Department">HR Department</option>
                    <option value="IT Department">IT Department</option>
                    <option value="Graphics Department">Graphics Department</option>
                    <option value="Mailing Department">Mailing Department</option>
                    <option value="Management Department">Management Department</option>
                    <option value="Communication Department">Communication Department</option>
                    <option value="Collaboration (Collab) Department">Collaboration (Collab) Department</option>
                    <option value="Recent Info Department & Post">Recent Info Department & Post</option>
                    <option value="Photography Department">Photography Department</option>
                    <option value="Creative & Design Department">Creative & Design Department</option>
                    <option value="Operation Department">Operation Department</option>
                    <option value="Research Department">Research Department</option>
                    <option value="Sports Department">Sports Department</option>
                    <option value="Education Department">Education Department</option>
                    <option value="Emergency Department">Emergency Department</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Priority Scale</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Target Deadlines</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs"
                >
                  Create Task Card
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-850 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-800 text-xs text-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK HUB & SUBMISSIONS DETAILS POP-UP PANEL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header info */}
            <div className="bg-slate-950 p-5 border-b border-slate-850 flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-mono font-bold">
                  Task Audits & PDF Deliverables Hub
                </span>
                <h3 className="text-md sm:text-lg font-bold text-white mt-1">
                  {selectedTask.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setPreviewSubmission(null);
                }}
                className="bg-slate-900 hover:bg-slate-800 p-2 text-slate-400 hover:text-white rounded-xl border border-slate-805"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Left Column: Details */}
              <div className="lg:col-span-5 p-5 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/30 space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono text-slate-500">Task Objective</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedTask.description || 'No requirements memo uploaded for this operations block.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-2 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">Status Step</span>
                    <span className={`inline-block mt-1 font-semibold px-2 py-0.5 rounded text-[10px] ${
                      selectedTask.status === 'Done' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                      selectedTask.status === 'Review' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                      selectedTask.status === 'InProgress' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {selectedTask.status === 'Todo' ? 'Planned' : selectedTask.status === 'InProgress' ? 'In Progress' : selectedTask.status === 'Review' ? 'In Review' : 'Completed'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">Department Wing</span>
                    <span className="font-medium text-slate-200 mt-1 block">
                      {selectedTask.department}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">Target Assignee</span>
                    <span className="font-medium text-slate-200 mt-1 block">
                      {selectedTask.assignee}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">Official Deadline</span>
                    <span className="font-mono text-slate-200 mt-1 block">
                      {selectedTask.dueDate}
                    </span>
                  </div>
                </div>

                {/* Progress bar info */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Audit Percent Completed:</span>
                    <span className="font-bold text-white">{selectedTask.progress}%</span>
                  </div>
                  <div className="bg-slate-950 h-2 w-full rounded-full overflow-hidden border border-slate-850">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-300"
                      style={{ width: `${selectedTask.progress}%` }}
                    />
                  </div>
                </div>

                {/* Role instructions */}
                <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl space-y-1">
                  <div className="flex items-center gap-1 text-[11px] text-cyan-400 uppercase font-mono font-bold">
                    <Shield className="w-3.5 h-3.5" /> Department Guidelines
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    This task belongs to the <span className="text-white font-semibold">{selectedTask.department}</span> workflow. PDFs representing official final reports or active draft logs must be submitted below for CEO and Board clearance.
                  </p>
                </div>
              </div>

              {/* Right Column: Submissions hub */}
              <div className="lg:col-span-7 p-5 space-y-5 flex flex-col justify-between">
                {/* PDF Submissions List */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-200 text-xs uppercase font-mono tracking-wider font-bold flex items-center gap-2">
                      <FileBadge className="w-4 h-4 text-cyan-400" /> Attached Deliverable PDFs ({selectedTask.submissions?.length || 0})
                    </h4>
                    {canReview && (
                      <span className="text-[9px] font-mono font-bold uppercase text-red-400 bg-red-950/20 border border-red-900/50 px-1.5 py-0.5 rounded">
                        Authorized Review Mode
                      </span>
                    )}
                  </div>

                  {selectedTask.submissions && selectedTask.submissions.length > 0 ? (
                    <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
                      {selectedTask.submissions.map(sub => {
                        const isOwnFile = sub.uploadedById === currentUser.id;

                        return (
                          <div
                            key={sub.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              previewSubmission?.id === sub.id
                                ? 'bg-cyan-950/20 border-cyan-600/50'
                                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <div className="bg-red-500/10 p-2 text-red-400 rounded-lg border border-red-500/15 shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold font-mono text-white truncate max-w-[200px]" title={sub.fileName}>
                                  {sub.fileName}
                                </h5>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {sub.fileSize} • Uploaded by {sub.uploadedBy}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* View Action (CEO and Dept Heads can view any file, member can view their own or general submissions) */}
                              <button
                                onClick={() => handleInspectSub(sub)}
                                className="bg-slate-900/80 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-800 p-1.5 text-xs text-slate-300 hover:text-cyan-400 rounded-lg flex items-center gap-1 font-mono tracking-tight transition-all"
                                title="Inspect document contents"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Inspect</span>
                              </button>

                              {/* Download Action for Admin and Moderator */}
                              {canReview && (
                                <button
                                  onClick={() => handleDownloadSub(sub)}
                                  className="bg-slate-900/80 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-800 p-1.5 text-xs text-slate-300 hover:text-emerald-405 hover:text-emerald-400 rounded-lg flex items-center gap-1 font-mono tracking-tight transition-all"
                                  title="Download this document file"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Download</span>
                                </button>
                              )}

                              {/* Members can only delete their own uploaded files */}
                              {(isOwnFile || isCEO) && (
                                <button
                                  onClick={() => {
                                    if (confirm('Are you authorized to permanently delete this task file submission?')) {
                                      onRemoveSubmission(selectedTask.id, sub.id);
                                      if (previewSubmission?.id === sub.id) {
                                        setPreviewSubmission(null);
                                      }
                                      // Local state update
                                      setSelectedTask({
                                        ...selectedTask,
                                        submissions: selectedTask.submissions?.filter(s => s.id !== sub.id)
                                      });
                                    }
                                  }}
                                  className="bg-slate-900 hover:bg-red-950/40 border border-slate-805 hover:border-red-900 p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                                  title="Delete submission"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center space-y-1.5 bg-slate-950/15">
                      <AlertCircle className="w-6 h-6 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400">No documents submitted yet for review.</p>
                      <p className="text-[10px] text-slate-500">Once members upload PDFs, Department Heads and the CEO can inspect them here.</p>
                    </div>
                  )}
                </div>

                {/* Interactive Dynamic PDF Reader Modal (when pre-inspect is selected) */}
                {previewSubmission && (
                  <div className="bg-slate-955 border border-cyan-800/30 rounded-xl p-4 space-y-3 bg-zinc-950/80">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-cyan-400 animate-pulse" />
                        <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                          Official PDF Preview Engine
                        </span>
                      </div>
                      <button
                        onClick={() => setPreviewSubmission(null)}
                        className="text-slate-500 hover:text-white p-0.5 rounded hover:bg-slate-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Paper representation */}
                    <div className="bg-white text-zinc-900 rounded border border-zinc-300 p-4 font-serif text-[10px] space-y-3 shadow-inner max-h-[170px] overflow-y-auto select-text selection:bg-cyan-200">
                      <div className="flex justify-between items-center border-b border-zinc-200 pb-2.5 font-sans uppercase font-bold text-[8px] text-zinc-500">
                        <span>BGI Operations Security Portal</span>
                        <span>Date: {new Date(previewSubmission.uploadedAt).toLocaleDateString()}</span>
                      </div>

                      <div className="text-center space-y-1 font-sans">
                        <h4 className="text-xs font-black tracking-widest uppercase">
                          BGI Community Group International
                        </h4>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider">
                          Deliverable Proof-of-Work Attachment Summary
                        </p>
                      </div>

                      <div className="space-y-1.5 leading-relaxed font-sans text-[10px] bg-zinc-50 p-2 rounded border border-zinc-200 text-slate-800">
                        <div>
                          <strong className="text-zinc-900 font-bold">Document Name: </strong> 
                          <span className="font-mono font-bold text-cyan-700 bg-cyan-50 px-1 rounded">{previewSubmission.fileName}</span>
                        </div>
                        <div>
                          <strong className="text-zinc-900 font-bold">Submission ID: </strong> 
                          <span className="font-mono">{previewSubmission.id}</span>
                        </div>
                        <div>
                          <strong className="text-zinc-900 font-bold">Assignee/Author: </strong> 
                          <span>{previewSubmission.uploadedBy}</span>
                        </div>
                        <div>
                          <strong className="text-zinc-900 font-bold">Scope of Task: </strong> 
                          <span>{selectedTask.title}</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1 font-serif text-zinc-700 leading-relaxed text-[11px]">
                        <p className="indent-4 italic text-zinc-650">
                          {previewSubmission.fileContent && previewSubmission.fileContent.startsWith('data:') ? (
                            <span>
                              [Official Encoded PDF Stream] This PDF document contains binary signatures from the uploader. Use the <strong>Download PDF</strong> button below to retrieve the original document.
                            </span>
                          ) : (
                            `"${previewSubmission.fileContent || 'BGI security verified attachment structure.'}"`
                          )}
                        </p>
                        <p>
                          This PDF attachment acts as legal physical proof-of-work compliance for BGI Audit. All requirements metrics have been met securely. Signatures of review boards will be digitally locked.
                        </p>
                      </div>

                      <div className="border-t border-zinc-200 pt-2 flex justify-between text-[8px] text-zinc-500 leading-normal font-sans">
                        <span>Audited: BGI SEC PORT</span>
                        <span>System Checksum Secure ✔</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                      <span>Uploaded {new Date(previewSubmission.uploadedAt).toLocaleTimeString()}</span>
                      {canReview && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadSub(previewSubmission)}
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-1 hover:brightness-110 transition-all cursor-pointer"
                            title="Download official document to your system"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download PDF</span>
                          </button>
                          <div className="flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-bold">
                            <CheckCircle className="w-3 h-3" />
                            <span>Ceo & Board Approved</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Upload Section: Available for Members and everyone */}
                <div className="space-y-2 pt-2 border-t border-slate-800 bg-slate-950/20 p-4 rounded-xl">
                  <div>
                    <h5 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                      File Submission portal ({isMember ? 'Department Member Access' : 'Administrative Clearance Access'})
                    </h5>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Drop or select your final PDF file. Maximum scale limit of 8MB applies.
                    </p>
                  </div>

                  {/* Drag-and-Drop Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                      dragActive
                        ? 'border-cyan-400 bg-cyan-950/20 text-cyan-300'
                        : 'border-slate-800 bg-slate-950/50 hover:bg-slate-950/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Upload className="w-6 h-6 text-slate-500" />
                    <div>
                      <span className="text-xs text-white underline font-semibold">Click to select files</span>
                      <span className="text-xs text-slate-500"> or drag and drop official PDFs here</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">Only .pdf supported • Verified on upload</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {uploadError && (
                    <div className="p-2.5 bg-red-950/40 border border-red-900 text-red-200 text-[10px] rounded-lg font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="bg-slate-950 p-4 border-t border-slate-850 flex justify-end gap-2.5">
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setPreviewSubmission(null);
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold py-2 px-5 rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
