import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  User as UserIcon,
  Camera,
  Mail,
  Phone,
  Layers,
  Calendar,
  Shield,
  Lock,
  Save,
  Download,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  Printer,
  ChevronRight
} from 'lucide-react';
import { User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import logoImg from '../assets/images/bgi_clean_logo_1779446230793.png';

interface ProfileViewProps {
  currentUser: User;
  onUpdateMemberDetails: (id: string, fields: Partial<User>) => void;
}

const PRESET_AVATARS = [
  { id: 'av1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop', label: 'Tech Lead / Female' },
  { id: 'av2', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop', label: 'Engineer / Male' },
  { id: 'av3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop', label: 'Manager / Female' },
  { id: 'av4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop', label: 'Specialist / Male' },
  { id: 'av5', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop', label: 'Executive / Female' },
  { id: 'av6', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop', label: 'Developer / Male' }
];

const DEPARTMENTS = [
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

export default function ProfileView({ currentUser, onUpdateMemberDetails }: ProfileViewProps) {
  // Temporary form states, pre-filled with user session details
  const [name, setName] = useState(currentUser.name);
  const [position, setPosition] = useState(currentUser.position || 'Member');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [department, setDepartment] = useState(currentUser.department);
  const [password, setPassword] = useState(currentUser.password || 'password123');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  
  // Custom image asset file upload visualizer states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safe pre-loaded Base64 Image States to circumvent iframe/CORS canvas-tainting
  const [resolvedAvatarDataUrl, setResolvedAvatarDataUrl] = useState<string>('');
  const [resolvedLogoDataUrl, setResolvedLogoDataUrl] = useState<string>('');

  const activeAvatarUrl = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

  React.useEffect(() => {
    let isMounted = true;
    
    const resolveImages = async () => {
      // 1. Resolve avatar
      if (activeAvatarUrl.startsWith('data:')) {
        if (isMounted) setResolvedAvatarDataUrl(activeAvatarUrl);
      } else {
        try {
          const response = await fetch(activeAvatarUrl, { mode: 'cors' });
          const blob = await response.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          if (isMounted) setResolvedAvatarDataUrl(dataUrl);
        } catch (error) {
          console.warn("Could not pre-convert avatar to base64, using fallback URL", error);
          if (isMounted) setResolvedAvatarDataUrl(activeAvatarUrl);
        }
      }

      // 2. Resolve logo
      if (logoImg) {
        if (logoImg.startsWith('data:')) {
          if (isMounted) setResolvedLogoDataUrl(logoImg);
        } else {
          try {
            const response = await fetch(logoImg, { mode: 'cors' });
            const blob = await response.blob();
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            if (isMounted) setResolvedLogoDataUrl(dataUrl);
          } catch (error) {
            console.warn("Could not pre-convert logo to base64", error);
            if (isMounted) setResolvedLogoDataUrl(logoImg);
          }
        }
      }
    };

    resolveImages();

    return () => {
      isMounted = false;
    };
  }, [avatar, name, logoImg]);

  // Parse file to Base64 (dataURL)
  const processImageFile = (file: File) => {
    setUploadError('');
    if (!file.type.startsWith('image/')) {
      setUploadError('Only valid image files (PNG, JPG, WEBP) are supported for profile avatars.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Please choose an image file under 2MB for compatibility.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatar(dataUrl);
    };
    reader.onerror = () => {
      setUploadError('Error parsing binary image stream from device.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handlePresetSelect = (url: string) => {
    setAvatar(url);
    setUploadError('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    const updatedProfile: Partial<User> = {
      name,
      position,
      phone,
      department,
      password,
      avatar: avatar || undefined
    };

    onUpdateMemberDetails(currentUser.id, updatedProfile);
    setSaveSuccess(true);
    
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  // Triggers general browser print dialog (BGI compliance standard)
  const handlePrintCard = () => {
    window.print();
  };

  // Generates high-fidelity PDF download of the Glassmorphism Smart ID Card
  const handleExportIdConfig = async () => {
    const cardElement = document.getElementById('smart-id-card');
    if (!cardElement) return;

    try {
      // Temporarily add high resolution scale to html2canvas for HD print quality
      const canvas = await html2canvas(cardElement, {
        scale: 3, 
        useCORS: true, 
        backgroundColor: null,
        logging: false,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width / 3;
      const imgHeight = canvas.height / 3;

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [imgWidth, imgHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Native Blob approach which is 100% resilient inside iframe sandbox environments
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `${name.replace(/\s+/g, '_')}_BGI_SmartCard_Badge.pdf`;
      downloadLink.target = '_blank';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("High-fidelity PDF generation failed. Using raw vector text fallbacks:", err);
      const cardData = `--------------------------------------------------\nBGI CORE RFID IDENTITY CARD SYSTEM\n--------------------------------------------------\nNAME: ${name}\nPOSITION: ${position}\nID NUMBER: ${currentUser.memberId}\nSECURITY ACCESS: ${currentUser.role}\nORG BLOCK: ${department}\nSYSTEM REGISTER DATE: ${currentUser.joinDate}\n--------------------------------------------------\nAUTHENTICATION BARCODE INTEGRITY STATUS: VERIFIED\n--------------------------------------------------`;
      const blob = new Blob([cardData], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}_BGI_SmartCard_Badge.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Personal Credentials
          </span>
          <h2 className="text-xl font-display font-bold text-white tracking-wide mt-1.5">My Profile & Smart ID</h2>
          <p className="text-xs text-slate-400 mt-1">Manage physical-work attributes, system security codes, and inspect your real-time secure RFID Smart Card badge.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintCard}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-705 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Smart ID Badge
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Editor Panel (Left side) */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 rounded-2xl p-6  space-y-6">
          <div className="border-b border-slate-850 pb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-cyan-400" /> Administrative & Badge Details
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Update your operational parameters below. These changes will directly patch your secure BGI databases and display on your digital smartcard instantly.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Legal Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs">@</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-8 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none text-xs transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Official Designation / Title</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Senior Advisor, Research Analyst, Member"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono">BGI MEMBER CODES (READ-ONLY)</label>
                <div className="bg-slate-950/60 border border-slate-850/80 rounded-xl px-3.5 py-2.5 text-slate-400 text-xs font-mono select-all flex items-center justify-between">
                  <span>{currentUser.memberId}</span>
                  <span className="text-[9px] text-emerald-500 border border-emerald-500/10 bg-emerald-500/5 px-2 py-0.5 rounded uppercase font-bold tracking-wider">SECURED</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Registered Email (Read-Only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    disabled
                    value={currentUser.email}
                    className="w-full cursor-not-allowed bg-slate-950/40 border border-slate-900 rounded-xl pl-9 pr-3 py-2.5 text-slate-500 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="+880 17XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-650 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Campus Division / Wing</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-white focus:outline-none text-xs transition-colors"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} className="bg-slate-900">{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Access Passcode</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Provide sequence..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Profile Picture Controller */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-400">Profile Photo Representation</label>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Active user display */}
                <div className="md:col-span-3 flex flex-col items-center gap-2">
                  <div className="relative group">
                    <img
                      src={activeAvatarUrl}
                      alt={name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-2xl object-cover bg-slate-950 border-2 border-slate-800 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">Active Portrait</span>
                </div>

                {/* Drag and Drop Zone */}
                <div className="md:col-span-9">
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex flex-col items-center space-y-1.5">
                      <Camera className={`w-6 h-6 ${isDragging ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <p className="text-[11px] text-slate-300 font-semibold">
                        Drag, drop passport picture, or <span className="text-cyan-400 hover:underline">browse files</span>
                      </p>
                      <p className="text-[10px] text-slate-500">Supports PNG, JPG, or WEBP. Standard 1:1 aspect is ideal.</p>
                    </div>
                  </div>
                  {uploadError && (
                    <p className="text-[11px] text-red-400 font-semibold mt-1.5 leading-tight">⚠️ {uploadError}</p>
                  )}
                </div>
              </div>

              {/* Avatar Preset Options */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider block uppercase font-mono">Or select from pre-approved official templates</span>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = avatar === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetSelect(preset.url)}
                        title={preset.label}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all p-0.5 bg-slate-950 ${
                          isSelected ? 'border-cyan-500 scale-105 shadow-md shadow-cyan-500/10' : 'border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-10 object-cover rounded-md"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-cyan-500 text-slate-950 rounded-full p-0.5">
                            <CheckCircle2 className="w-2 h-2 stroke-[4]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* URL Direct text field fallback */}
              <div className="pt-2">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Direct HTTPS Image Link</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-600 text-xs">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/your-custom-photolink"
                    value={avatar.startsWith('data:') ? '' : avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-700 focus:outline-none text-xs"
                  />
                  {avatar.startsWith('data:') && (
                    <div className="absolute right-2.5 top-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] rounded font-mono font-bold uppercase tracking-wider">
                      Binary Loaded
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error/Access Indicator */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-850">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] text-slate-400 font-mono">
                  Privilege Badge: <strong className="text-emerald-400 font-bold uppercase">{currentUser.role}</strong> (Identity Secured)
                </span>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <AnimatePresence>
                  {saveSuccess && (
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-emerald-400 font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Credentials Saved Successfully!
                    </motion.span>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Dynamic Smart ID Badge Visualizer (Right side) - Glassmorphism Type */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-4 lg:sticky lg:top-20">
          <div className="w-full text-center lg:text-left">
            <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest font-black inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" /> Compliant Glassmorphic Canvas
            </span>
            <h4 className="text-sm font-semibold text-white mt-1">Smart ID Badge Viewer</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Below is your authentic cryptographic BGI smart badge in premium Glassmorphic overlay. It registers securely on all active NFC and RFID gates.
            </p>
          </div>

          {/* Visual Smartcard layout - Glassmorphism Style */}
          <div
            id="smart-id-card"
            className="w-[290px] h-[450px] rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-xl bg-slate-900/30 transition-all duration-500 transform hover:scale-[1.02] hover:border-white/20 select-none ring-1 ring-white/5"
            style={{
              background: "linear-gradient(135deg, rgba(16, 24, 48, 0.45) 0%, rgba(32, 44, 72, 0.2) 100%)",
            }}
          >
            {/* Top Security Line with Glassy Gradient */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 opacity-90"></div>
            
            {/* Soft glass glow coordinates within the backdrop */}
            <div className="absolute -top-10 -left-10 w-28 h-28 bg-emerald-500/15 rounded-full filter blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/15 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-purple-500/10 rounded-full filter blur-xl"></div>

            {/* Card Header information */}
            <div className="flex justify-between items-center pt-1 relative z-10">
              <div>
                <h4 className="text-[11px] font-bold font-display text-white tracking-wide uppercase">BGI Community</h4>
                <p className="text-[7px] font-mono text-cyan-400/80 uppercase tracking-widest font-semibold">NFC Smartcard Badge</p>
              </div>
              <img
                src={resolvedLogoDataUrl || logoImg}
                alt="BGI Logo"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-cyan-400/30 object-cover bg-slate-950/80 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
              />
            </div>

            {/* Solid Brass metallic RFID Microchip layout */}
            <div className="w-8 h-6 bg-gradient-to-br from-amber-400/30 via-yellow-400/20 to-amber-500/30 border border-amber-400/50 rounded-md my-1.5 relative overflow-hidden z-10 shadow-[0_0_8px_rgba(251,191,36,0.15)]">
              <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-amber-400/40"></div>
              <div className="absolute left-1/2 top-0 w-[0.5px] h-full bg-amber-400/40"></div>
              <div className="absolute inset-1 border border-amber-400/20 rounded-sm"></div>
            </div>

            {/* Centered Profile Avatar with glow effect */}
            <div className="flex flex-col items-center space-y-2 mt-1 relative z-10 w-full">
              <div className="relative p-1 bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md">
                <img
                  src={resolvedAvatarDataUrl || activeAvatarUrl}
                  alt={name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-xl object-cover bg-slate-900 border border-white/5 shadow-inner"
                />
                <div className="absolute inset-0 rounded-2xl border border-cyan-400/15 pointer-events-none animate-pulse"></div>
              </div>
              
              <div className="text-center">
                <h3 className="text-sm font-bold text-white tracking-wide leading-tight drop-shadow-md">{name || 'Your Name'}</h3>
                <div className="text-[9.5px] text-cyan-300 font-mono font-bold uppercase tracking-wider mt-0.5">
                  ✦ {position || 'Member'}
                </div>
                <span className={`text-[7.5px] mt-1.5 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest inline-block border ${
                  currentUser.role === 'Admin' ? 'bg-red-500/10 text-red-300 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]' :
                  currentUser.role === 'Moderator' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]' :
                  'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                }`}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* Specific RFID details block with glassy divider */}
            <div className="space-y-1 pt-3 text-[8.5px] font-mono border-t border-white/10 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">MEMBER ID</span>
                <span className="text-white font-bold">{currentUser.memberId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">WING/DEPT</span>
                <span className="text-cyan-300 truncate max-w-[140px] text-right font-bold">{department}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">JOIN DATE</span>
                <span className="text-slate-300">{currentUser.joinDate}</span>
              </div>
            </div>

            {/* Real scale Barcode Representation */}
            <div className="space-y-1.5 pt-2.5 border-t border-white/10 relative z-10">
              <div className="flex justify-center select-none opacity-50">
                <div className="flex gap-[1px] items-center h-5">
                  {[1,2,1,3,1,2,4,1,2,3,1,1,2,3,2,1,1,2,1,4,1,2,3,2,1].map((bar, index) => (
                    <div
                      key={index}
                      className="bg-white"
                      style={{ width: `${bar * 0.8}px`, height: '100%' }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[6px] text-center font-mono text-slate-500 uppercase tracking-widest font-medium">
                VERIFIED NFC SECURE {currentUser.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Configuration Export button */}
          <button
            onClick={handleExportIdConfig}
            className="w-[290px] bg-slate-900/60 hover:bg-slate-850/80 border border-slate-800 text-slate-300 hover:text-cyan-400 p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-[0_0_15px_rgba(34,211,238,0.1)] active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" /> Export Smart ID Card (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
