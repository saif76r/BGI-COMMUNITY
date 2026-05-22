import React, { useState } from 'react';
import { Shield, Key, Mail, User, Phone, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { UserRole, User as UserType } from '../types';
import { DEFAULT_USERS } from '../db';
import { motion } from 'motion/react';
// @ts-ignore
import logoImg from '../assets/images/bgi_clean_logo_1779446230793.png';

interface LoginScreenProps {
  onLoginSuccess: (user: UserType) => void;
  allUsers: UserType[];
  onRegisterUser: (newUser: UserType) => void;
}

export default function LoginScreen({ onLoginSuccess, allUsers, onRegisterUser }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('PR Department');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // Forgot Password / Verification states
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [verificationWalkthrough, setVerificationWalkthrough] = useState<{
    show: boolean;
    email: string;
    code: string;
    inputCode: string;
    verified: boolean;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please provide both email and password credentials.');
      return;
    }

    // Match simulated user
    const matched = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      if (matched.status === 'Pending') {
        setErrorMessage('Your membership status is currently Pending admin approval.');
        return;
      }

      // Enforce custom password verification
      const expectedPassword = matched.password || 'password123';
      if (password !== expectedPassword) {
        setErrorMessage('🔒 Invalid password. Please check your credentials and try again.');
        return;
      }

      onLoginSuccess(matched);
    } else {
      setErrorMessage('User with this email not found. Please click "Register Account" below to register a new account.');
      return;
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName || !regEmail || !regPhone) {
      setErrorMessage('All fields are requested to complete registrations.');
      return;
    }

    const emailExists = allUsers.some(u => u.email.toLowerCase() === regEmail.toLowerCase());
    if (emailExists) {
      setErrorMessage('This email is already registered with BGI.');
      return;
    }

    // Trigger simulated verification code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationWalkthrough({
      show: true,
      email: regEmail,
      code: randomCode,
      inputCode: '',
      verified: false
    });
  };

  const confirmVerification = () => {
    if (!verificationWalkthrough) return;
    if (verificationWalkthrough.inputCode === verificationWalkthrough.code) {
      // Add member as safe active or pending depending on role
      const bgiId = `BGI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newCreated: UserType = {
        id: Math.random().toString(),
        name: regName,
        email: regEmail,
        role: 'Member', // new signups are default member
        department: regDepartment,
        phone: regPhone,
        memberId: bgiId,
        status: 'Active', // Instantly active for demo purposes so user enjoys it!
        joinDate: new Date().toISOString().split('T')[0],
        verified: true,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(regName)}`,
        password: regPassword || 'password123',
        position: 'Member'
      };

      onRegisterUser(newCreated);
      setVerificationWalkthrough(prev => prev ? { ...prev, verified: true } : null);
      
      setTimeout(() => {
        setVerificationWalkthrough(null);
        // Instant login
        onLoginSuccess(newCreated);
      }, 1500);
    } else {
      setErrorMessage('Incorrect verification token. Try again.');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotMessage('Please enter your registered email first.');
      return;
    }
    setForgotMessage(`Password reset link sent to ${forgotEmail}. (Simulated OK)`);
    setTimeout(() => {
      setIsForgotMode(false);
      setForgotMessage('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative gradient glowing spots in background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-lg relative bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-3 group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full blur opacity-40 group-hover:opacity-50 transition duration-1000"></div>
            <img
              src={logoImg}
              alt="BGI Community Logo"
              referrerPolicy="no-referrer"
              className="relative w-24 h-24 rounded-full border border-cyan-400/30 object-cover shadow-xl bg-slate-950 shadow-cyan-500/10"
            />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            BGI Community
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Internal Operations & Member Portal
          </p>
        </div>

        {/* Normal Login Mode */}
        {isLogin && !isForgotMode && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@bgi.org"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotMode(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Key className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-lg font-medium">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-semibold py-2.5 px-4 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all text-sm mb-4"
            >
              Sign In to Dashboard
            </button>

            <div className="text-center">
              <span className="text-xs text-slate-500">Don’t have an internal account? </span>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setErrorMessage(''); }}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                Register Self-Service
              </button>
            </div>
          </form>
        )}

        {/* Self-Service Registration Form */}
        {!isLogin && !isForgotMode && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="E.g. Tanvir Hossain"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Official Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@bgi.org"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Department</label>
              <select
                value={regDepartment}
                onChange={(e) => setRegDepartment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm"
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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Key className="w-5 h-5 animate-pulse" />
                </span>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Set your account password"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Phone className="w-5 h-5" />
                </span>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+880 17XX-XXXXXX"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-lg font-medium">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-semibold py-2.5 px-4 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all text-sm mb-4"
            >
              Verify & Register
            </button>

            <div className="text-center">
              <span className="text-xs text-slate-500">Already registered? </span>
              <button
                type="button"
                onClick={() => { setIsLogin(true); setErrorMessage(''); }}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                Sign In Now
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password Mode */}
        {isForgotMode && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <h3 className="text-white text-md font-semibold tracking-wide flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" /> Simulated Password Recovery
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Enter your official registered email below. We will simulate sending a single-use verification token.
            </p>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Associated Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="E.g. admin@bgi.org"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                />
              </div>
            </div>

            {forgotMessage && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs rounded-lg font-medium">
                {forgotMessage}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-cyan-500 text-slate-950 font-semibold py-2 px-4 rounded-xl hover:bg-cyan-400 transition-colors text-sm font-display"
              >
                Send Request
              </button>
              <button
                type="button"
                onClick={() => { setIsForgotMode(false); setForgotMessage(''); }}
                className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-xl hover:bg-slate-705 transition-colors text-sm font-display"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Simulated Email Verification Code Modal Walkthrough */}
      {verificationWalkthrough && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-white text-sm font-semibold font-display">Simulated OTP Verifier</h4>
                <p className="text-[11px] text-slate-400">Verifying {verificationWalkthrough.email}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/20 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Simulated OTP SMS/EMAIL Send Code</p>
              <span className="text-2xl font-mono font-bold text-emerald-400 tracking-wider">
                {verificationWalkthrough.code}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">Enter Verification Code</label>
              <input
                type="text"
                placeholder="Ex. 123456"
                value={verificationWalkthrough.inputCode}
                onChange={(e) => setVerificationWalkthrough({ ...verificationWalkthrough, inputCode: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-center font-mono focus:outline-none focus:border-cyan-500 text-lg"
              />
            </div>

            {verificationWalkthrough.verified ? (
              <div className="p-2.5 bg-emerald-950/50 text-emerald-300 text-xs rounded text-center border border-emerald-800 font-semibold animate-bounce">
                Token matched successfully! Redirecting...
              </div>
            ) : (
              <button
                type="button"
                onClick={confirmVerification}
                className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Confirm Verification Token
              </button>
            )}

            <button
              type="button"
              onClick={() => setVerificationWalkthrough(null)}
              className="w-full text-slate-500 hover:text-slate-400 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
