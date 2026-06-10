'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAppState } from '@/context/AppContext';
import { 
  Zap, Bot, Sparkles, Send, Shield, Activity, Users, FileText, 
  Bell, Check, X, ShieldAlert, ArrowRight, ShieldCheck, ChevronRight, 
  User, Key, Database, Mail, Phone, Calendar, Clock, MapPin, Lock,
  Smartphone, Monitor, RefreshCw, BarChart2, QrCode, Star, Play,
  CheckCircle2, AlertTriangle, Moon, Sun
} from 'lucide-react';

// Animated Numbers Counter for Live Telemetry
const AnimatedCounter: React.FC<{ value: number; suffix?: string; delay?: number }> = ({ value, suffix = '', delay = 0 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2.5; // seconds
    const totalSteps = 60;
    const stepTime = (duration * 1000) / totalSteps;
    const increment = Math.ceil(end / totalSteps);

    const timeout = setTimeout(() => {
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        } else {
          setCount(start);
        }
      }, stepTime);
      return () => clearInterval(timer);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return <span ref={ref} className="tabular-nums">{count.toLocaleString()}{suffix}</span>;
};

export default function LandingPage() {
  const { user, theme, toggleTheme, showToast } = useAppState();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState<'student' | 'warden' | 'security' | 'parent'>('student');
  const [sandboxQuery, setSandboxQuery] = useState('');
  const [sandboxMessages, setSandboxMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    {
      role: 'assistant',
      content: `### 🤖 Sentinel AI Sandbox
Welcome to DORM-X AI. You can test my capabilities directly in this sandbox!

Try asking me:
- **"What is the outpass curfew rule?"**
- **"Generate system status statistics"**
- **"Explain warden leave approvals flow"**`
    }
  ]);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const sandboxEndRef = useRef<HTMLDivElement>(null);

  // Landing page interactive showcase mockup states
  const [mockLeaves, setMockLeaves] = useState([
    { id: 1, name: 'Sameer Sen [103]', reason: 'Medical Checkup', type: 'OUTPASS', status: 'Pending' },
    { id: 2, name: 'Rohan Dev [312]', reason: 'Weekend Visit Home', type: 'VACATION', status: 'Pending' }
  ]);
  const [showMockForm, setShowMockForm] = useState(false);
  const [mockType, setMockType] = useState('Short Exit (30m)');
  const [mockReason, setMockReason] = useState('');
  const [mockSos, setMockSos] = useState(false);
  
  const [scanLoading, setScanLoading] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scannedStudent, setScannedStudent] = useState('');

  const [liveScans, setLiveScans] = useState<Array<{ time: string; text: string; status: 'SUCCESS' | 'WARNING' | 'SYS' }>>([
    { time: '10:45:01', text: 'NFC Core initialization handshake', status: 'SYS' },
    { time: '10:45:03', text: 'NFC reader nodes reporting ONLINE', status: 'SYS' }
  ]);

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const names = ['Alok Kumar', 'Sameer Sen', 'Sneha Rao', 'Rohan Dev', 'Priyanka Das', 'Subham Patra'];
    const blocks = ['Pulaha', 'Rohini', 'Arundhati', 'Block-A', 'Block-B'];
    const types = ['EXIT Scan Approved', 'ENTRY Scan Logged'];
    
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const name = names[Math.floor(Math.random() * names.length)];
      const block = blocks[Math.floor(Math.random() * blocks.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const status = type.includes('EXIT') ? 'SUCCESS' : 'WARNING';
      
      setLiveScans(prev => [
        ...prev.slice(-8), 
        { time: timeStr, text: `${type}: ${name} [${block}]`, status: status as any }
      ]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      quote: 'DORM-X transformed our outpass approval workflow. Leaves that used to take 2 hours of queues and paperwork are now approved by wardens in seconds.',
      author: 'Dr. Debabrata Giri',
      role: 'Hostel Registrar, Tech Campus',
      stars: 5
    },
    {
      quote: 'The real-time parent WhatsApp notification sync has solved our safety concerns. Parents know exactly when students exit or enter the gate.',
      author: 'Prof. Sandhya Rani',
      role: 'Chief Warden, VSSUT block',
      stars: 5
    },
    {
      quote: 'The security log telemetry has speeded up visitor registration by 400%. We no longer use paper registers. Delivery log system is exceptional.',
      author: 'Commandant R. K. Singh',
      role: 'Chief Security Officer',
      stars: 5
    }
  ];

  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockReason.trim()) return;
    setMockLeaves(prev => [
      ...prev,
      {
        id: Date.now(),
        name: 'You [Mock Pulaha-203]',
        reason: mockReason,
        type: mockType.toUpperCase(),
        status: 'Pending'
      }
    ]);
    setMockReason('');
    setShowMockForm(false);
    showToast('Mock Outpass request filed! Click "Warden Module" tab to approve it.', 'success');
  };

  const handleMockApprove = (id: number) => {
    setMockLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
  };

  const handleMockReject = (id: number) => {
    setMockLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
  };

  const triggerScan = () => {
    setScanLoading(true);
    setScanSuccess(false);
    setTimeout(() => {
      setScanLoading(false);
      setScanSuccess(true);
      const approved = mockLeaves.find(l => l.status === 'Approved');
      if (approved) {
        setScannedStudent(approved.name);
      } else {
        setScannedStudent('Alok Kumar [203]');
      }
    }, 1200);
  };


  const handleCTA = () => {
    if (user) {
      router.push(`/${user.roleType}`);
    } else {
      router.push('/login');
    }
  };

  const handleSandboxSend = async (text: string) => {
    if (!text.trim() || sandboxLoading) return;
    const userMsg = { role: 'user' as const, content: text };
    setSandboxMessages(prev => [...prev, userMsg]);
    setSandboxQuery('');
    setSandboxLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dorm-x-server-production.up.railway.app';
      const response = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      
      if (data.reply) {
        setSandboxMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setSandboxMessages(prev => [...prev, { role: 'assistant', content: 'Sandbox connection active, but no response payload returned.' }]);
      }
    } catch (error) {
      // Fallback response for offline sandbox testing
      setTimeout(() => {
        let reply = '';
        const q = text.toLowerCase();
        if (q.includes('curfew') || q.includes('outpass') || q.includes('rule')) {
          reply = `### ⏰ Outpass & Curfew Policy
- **Curfew Time**: Strictly 9:00 PM.
- **Leave Request Deadline**: Requests must be submitted at least 2 hours prior to exit.
- **Escalation**: Unapproved late returns trigger automatic notification ciphers to Warden & Parents.`;
        } else if (q.includes('status') || q.includes('stat') || q.includes('generate')) {
          reply = `### 📊 Real-Time Telemetry Report
- **Total Residents**: 12,450
- **Active Outpasses**: 389 (100% Verified)
- **SOS Triggers**: 0 (Operational Standby)
- **System Integrity**: 99.99% Encrypted`;
        } else {
          reply = `I am DORM-X Sentinel AI. I supervise digital outpass workflows, sync parent security updates, and deliver live telemetry logs.`;
        }
        setSandboxMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }, 1000);
    } finally {
      setSandboxLoading(false);
    }
  };

  useEffect(() => {
    sandboxEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sandboxMessages, sandboxLoading]);

  // SVG Custom Telemetry Sparkline Animation Config
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 2, ease: "easeInOut" }
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-clip selection:bg-[#00E5FF]/20 selection:text-[#00E5FF]">
      
      {/* 1. DYNAMIC AURORA & GRID MESH BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.06)_0%,transparent_70%)] blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.07)_0%,transparent_70%)] blur-[120px]" />
        <div className="absolute bottom-10 left-10 w-[55vw] h-[55vw] rounded-full bg-[radial-gradient(circle,rgba(0,255,178,0.04)_0%,transparent_70%)] blur-[130px]" />
        
        {/* Fine grid line overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(0,229,255,0.1),transparent_80%)]" />
      </div>

      {/* 2. PREMIUM STICKY NAVBAR */}
      <header className="sticky top-0 z-[100] w-full border-b border-white/[0.06] bg-[#030712]/70 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#00E5FF] to-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg shadow-[#00E5FF]/20 border border-[#00E5FF]/20 relative group overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Zap className="text-white w-5 h-5 relative z-10" />
            </div>
            <span className="text-xl font-extrabold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              DORM-X
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {['features', 'modules', 'analytics', 'security', 'ai-core'].map((link) => (
              <a 
                key={link}
                href={`#${link}`} 
                className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-[#00E5FF] hover:translate-y-[-1px] transition-all"
              >
                {link.replace('-', ' ')}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl border border-white/[0.08] hover:border-white/20 flex items-center justify-center cursor-pointer transition-colors"
              title="Toggle Theme Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-slate-400 hover:text-white" /> : <Moon className="w-4 h-4 text-slate-400 hover:text-white" />}
            </button>

            <button 
              onClick={() => router.push('/login')}
              className="hidden sm:block text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Login
            </button>

            <button 
              id="nav-get-started-btn"
              onClick={handleCTA}
              className="px-5 py-2.5 bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] hover:from-[#00E5FF] hover:to-[#00E5FF] text-white rounded-xl text-xs font-extrabold uppercase tracking-widest cursor-pointer transition-all shadow-md active:scale-95 border border-white/10"
            >
              {user ? 'Go To Dashboard' : 'Request Demo'}
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-28 lg:pt-32 lg:pb-40 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left column info */}
        <div className="lg:col-span-6 space-y-8 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-slate-300 shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]">Next-Gen Campus Telemetry</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-white leading-[1.08] uppercase"
          >
            Reinventing <br />
            Hostel Management <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#7C3AED] to-[#00FFB2] bg-300% animate-shimmer">
              For The AI Era.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-medium"
          >
            DORM-X is an intelligent campus operating system combining hostel management, security monitoring, digital outpasses, emergency response, and parent communication into one platform.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <button 
              onClick={handleCTA}
              className="px-8 py-4 bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] hover:brightness-110 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-[#00E5FF]/10 active:scale-95 border border-white/10 flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#modules"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 text-white flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-[#00FFB2]" /> Watch Demo
            </a>
          </motion.div>
        </div>

        {/* Right column: 3D floating dashboard mockup */}
        <div className="lg:col-span-6 relative h-[500px] w-full flex items-center justify-center">
          <div className="absolute w-[450px] h-[450px] bg-[#00E5FF]/5 rounded-full filter blur-[100px] animate-pulse" />
          
          <div className="relative w-full h-full flex items-center justify-center transform perspective-1000 rotate-x-6 rotate-y-[-12] rotate-z-3 scale-95 md:scale-100">
            
            {/* Pulsing network lines connecting the cards */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 500 500" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="netGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="netGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00FFB2" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              
              {/* Paths */}
              <motion.path 
                d="M 120 120 Q 280 140 400 180" 
                stroke="url(#netGrad1)" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
                fill="none" 
              />
              <motion.path 
                d="M 400 180 Q 420 300 370 380" 
                stroke="url(#netGrad2)" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
                fill="none" 
              />
              <motion.path 
                d="M 370 380 Q 260 410 150 400" 
                stroke="url(#netGrad1)" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
                fill="none" 
              />
              <motion.path 
                d="M 150 400 Q 110 260 120 120" 
                stroke="url(#netGrad2)" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
                fill="none" 
              />
              
              {/* Pulsing glowing nodes running along the paths */}
              <circle r="3" fill="#00E5FF">
                <animateMotion dur="6s" repeatCount="indefinite" path="M 120 120 Q 280 140 400 180" />
              </circle>
              <circle r="3" fill="#7C3AED">
                <animateMotion dur="5s" repeatCount="indefinite" path="M 400 180 Q 420 300 370 380" />
              </circle>
              <circle r="3" fill="#00FFB2">
                <animateMotion dur="7s" repeatCount="indefinite" path="M 370 380 Q 260 410 150 400" />
              </circle>
              <circle r="3" fill="#00E5FF">
                <animateMotion dur="5.5s" repeatCount="indefinite" path="M 150 400 Q 110 260 120 120" />
              </circle>
            </svg>

            {/* Card 1: Student QR Pass */}
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              whileHover={{ scale: 1.05, zIndex: 50, borderColor: 'rgba(0, 229, 255, 0.4)', boxShadow: '0 0 25px rgba(0, 229, 255, 0.2)' }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-4 w-60 glass-panel p-5 rounded-[2rem] border-[#00E5FF]/20 shadow-2xl z-20 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20">
                    <User className="w-4 h-4 text-[#00E5FF]" />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black uppercase text-white tracking-wider">Student Wallet</h4>
                    <p className="text-[7px] text-slate-500 font-extrabold uppercase">Gate Pass Ticket</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#00FFB2] animate-pulse" />
              </div>
              <div className="bg-black/40 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5 mb-3 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#00E5FF]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <QrCode className="w-24 h-24 text-slate-200" />
                <div className="laser-line rounded-lg opacity-40"></div>
                <p className="text-[8px] font-mono text-[#00E5FF] mt-2 tracking-widest uppercase font-extrabold">DX-8201-SECURE</p>
              </div>
              <div className="flex justify-between items-center text-[8px] font-extrabold text-slate-400">
                <span>Gate Status: APPROVED</span>
                <span className="text-[#00FFB2]">Night Outpass</span>
              </div>
            </motion.div>

            {/* Card 2: Warden Approvals Queue */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              whileHover={{ scale: 1.05, zIndex: 50, borderColor: 'rgba(124, 58, 237, 0.4)', boxShadow: '0 0 25px rgba(124, 58, 237, 0.2)' }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-6 right-4 w-64 glass-panel p-5 rounded-[2rem] border-white/10 shadow-2xl z-10 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-300">Approval Queue</span>
                </div>
                <span className="px-2 py-0.5 bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/30 rounded-full text-[6px] font-black uppercase">Warden Desk</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Alok Kumar', type: 'VACATION', time: '10 mins ago' },
                  { name: 'Sameer Sen', type: 'OUTPASS', time: 'Just now' }
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[9px] font-bold text-white">{item.name}</p>
                      <p className="text-[7px] text-[#7C3AED] font-extrabold uppercase">{item.type} | {item.time}</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white cursor-pointer transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-5 h-5 rounded-md bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white cursor-pointer transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Card 3: Security SOC Scanner Logs */}
            <motion.div 
              animate={{ x: [0, 8, 0] }}
              whileHover={{ scale: 1.05, zIndex: 50, borderColor: 'rgba(0, 255, 178, 0.4)', boxShadow: '0 0 25px rgba(0, 255, 178, 0.2)' }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/4 right-0 w-60 glass-panel p-4 rounded-[1.8rem] border-white/5 shadow-2xl z-30 cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                <Activity className="w-3.5 h-3.5 text-[#00FFB2]" />
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-300">Live SOC Scan Logs</span>
              </div>
              <div className="space-y-2.5 font-mono text-[7px]">
                <div className="flex items-center justify-between text-emerald-400 font-extrabold">
                  <span>● SCAN ENTRY - OK</span>
                  <span>09:41 AM</span>
                </div>
                <div className="text-slate-400 truncate">Resident: Alok Kumar [PULAHA-203]</div>
                <div className="border-t border-white/5 my-1" />
                <div className="flex items-center justify-between text-yellow-400 font-extrabold">
                  <span>● COURIER RECEIVED</span>
                  <span>09:42 AM</span>
                </div>
                <div className="text-slate-400 truncate">Vendor: Amazon | Tracking: AZ-829</div>
              </div>
            </motion.div>

            {/* Card 4: Parent Live Alerts */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              whileHover={{ scale: 1.05, zIndex: 50, borderColor: 'rgba(239, 68, 68, 0.4)', boxShadow: '0 0 25px rgba(239, 68, 68, 0.2)' }}
              transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="absolute bottom-0 left-10 w-56 glass-panel p-4 rounded-[1.8rem] border-[#7C3AED]/20 shadow-2xl z-20 cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-200">Parent Security Sync</span>
              </div>
              <p className="text-[8px] text-slate-400 leading-normal mb-2">
                Outpass exit scan recorded: <strong>Alok Kumar</strong> departed Pulaha Gate. Parent notified via WhatsApp/SMS.
              </p>
              <div className="flex items-center justify-between text-[7px] font-extrabold text-emerald-400 uppercase">
                <span>WhatsApp Sync: OK</span>
                <span>100% Delivery</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. BRAND TRUST TICKER */}
      <section className="relative z-10 w-full py-10 bg-black/40 border-y border-white/[0.04] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Empowering Smart Operations At Leading Campuses</p>
          <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-20 opacity-40">
            {['VSSUT UNIVERSITY', 'CAMPUS AUTOMATION', 'IIT SECURE BLOCK', 'NIT GATE SYSTEM', 'QUANTUM CAMPUS'].map((brand) => (
              <span key={brand} className="text-xs sm:text-sm font-black italic tracking-tighter uppercase text-slate-300 select-none">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURES BENTO GRID */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-28 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-[8px] font-black uppercase tracking-wider">
            Operational Blueprint
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            Designed for University Scale
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            DORM-X integrates hardware scanning, database triggers, real-time message ciphers, and warden dashboards into a unified security network.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Smart Leave System',
              desc: 'Seamless outpass filing and automation rules. Custom leave policy engines handle curfew extensions, approvals, and escalations automatically.',
              icon: FileText,
              color: 'from-[#00E5FF]/10 to-[#7C3AED]/5',
              borderColor: 'hover:border-[#00E5FF]/40',
              glow: 'shadow-[#00E5FF]/5'
            },
            {
              title: 'QR Access Control',
              desc: 'High-speed encrypted QR keys generated dynamically on the client. Fully synchronized with security gate readers for instantaneous logging.',
              icon: QrCode,
              color: 'from-[#00FFB2]/10 to-[#00E5FF]/5',
              borderColor: 'hover:border-[#00FFB2]/40',
              glow: 'shadow-[#00FFB2]/5'
            },
            {
              title: 'Emergency SOS Protocol',
              desc: 'Instant warden alarm trigger that records user GPS location, logs audits, and alerts security staff immediately upon physical SOS clicks.',
              icon: ShieldAlert,
              color: 'from-red-500/10 to-[#7C3AED]/5',
              borderColor: 'hover:border-red-500/40',
              glow: 'shadow-red-500/5'
            },
            {
              title: 'Parent Monitoring',
              desc: 'Automated sms notification synchronization. Parents receive verified exit/entry timestamps directly to their device to close communication loops.',
              icon: Users,
              color: 'from-[#00FFB2]/10 to-[#7C3AED]/5',
              borderColor: 'hover:border-[#00FFB2]/30',
              glow: 'shadow-[#00FFB2]/5'
            },
            {
              title: 'Security Operations',
              desc: 'Live telemetry logs dashboard for guard houses. Integrates courier deliveries logging, visitor gate passes, and hardware RFID scanners.',
              icon: ShieldCheck,
              color: 'from-[#00E5FF]/10 to-[#7C3AED]/5',
              borderColor: 'hover:border-[#00E5FF]/30',
              glow: 'shadow-[#00E5FF]/5'
            },
            {
              title: 'Sentinel AI Assistant',
              desc: 'An AI security agent explaining outpass policies, drafting daily occupancy reports, and offering automated recommendations to wardens.',
              icon: Bot,
              color: 'from-[#7C3AED]/10 to-[#00E5FF]/5',
              borderColor: 'hover:border-[#7C3AED]/40',
              glow: 'shadow-[#7C3AED]/5'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div 
                key={idx}
                whileHover={{ 
                  y: -6, 
                  borderColor: 'rgba(0, 229, 255, 0.3)',
                  boxShadow: '0 10px 30px rgba(0, 229, 255, 0.08)'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`glass-panel p-8 rounded-[2rem] border border-white/[0.06] transition-all duration-300 text-left bg-gradient-to-br ${item.color} shadow-lg group cursor-pointer relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform" />
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#00E5FF]/10 group-hover:border-[#00E5FF]/30 transition-all">
                  <Icon className="w-6 h-6 text-[#00E5FF] group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-3 flex items-center gap-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 6. PRODUCT MODULES INTERACTIVE TAB SHOWCASE */}
      <section id="modules" className="relative z-10 max-w-7xl mx-auto px-6 py-24 space-y-16 border-t border-white/[0.04]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] text-[8px] font-black uppercase tracking-wider">
              Control Hub Panels
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              Interactive Workspace Modules
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg">
              Explore the four tailored dashboards connecting students, wardens, security officers, and parents in real time.
            </p>
          </div>

          {/* Selector Tabs */}
          <div className="flex flex-wrap gap-2 bg-white/[0.02] border border-white/[0.06] p-1.5 rounded-2xl self-start md:self-end">
            {(['student', 'warden', 'security', 'parent'] as const).map((mod) => (
              <button
                key={mod}
                onClick={() => setActiveModule(mod)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                  activeModule === mod 
                    ? 'bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-white shadow-lg border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {mod} Module
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Mockup Display */}
        <div className="glass-panel p-2.5 sm:p-5 rounded-[2.5rem] border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="absolute top-0 left-0 right-0 h-11 bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-6">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
            </div>
            <div className="px-4 py-1 rounded-md bg-black/40 text-[8px] font-mono text-slate-500 border border-white/5 select-none uppercase tracking-widest">
              https://dormx.alokkumarsahu.in/{activeModule}
            </div>
            <div className="w-10" />
          </div>

          <div className="pt-16 p-4 sm:p-8 min-h-[380px] flex flex-col justify-between text-left">
            <AnimatePresence mode="wait">
              {activeModule === 'student' && (
                <motion.div 
                  key="student"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h4 className="text-base font-black uppercase text-white">Student Dashboard Mockup</h4>
                      <p className="text-[10px] text-[#00E5FF] font-black uppercase tracking-wider">Entity block: PULAHA | Room: 203</p>
                    </div>
                    <button 
                      onClick={() => {
                        setMockSos(!mockSos);
                        if(!mockSos) {
                          showToast('SOS Protocol Activated! In production, this instantly alerts warden & guards.', 'error');
                        }
                      }}
                      className={`px-4 py-2 border rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-colors ${
                        mockSos 
                          ? 'bg-red-600 border-red-500 text-white animate-pulse' 
                          : 'bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      {mockSos ? 'SOS PROTOCOL ACTIVE' : 'SOS Alert Standby'}
                    </button>
                  </div>

                  {showMockForm ? (
                    <form onSubmit={handleMockSubmit} className="glass-card p-5 rounded-2xl border-white/10 bg-black/40 space-y-4">
                      <h5 className="text-[10px] font-black uppercase text-cyan-400">File Mock Outpass</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-500">Outpass Type</label>
                          <select 
                            value={mockType} 
                            onChange={(e) => setMockType(e.target.value)}
                            className="w-full p-2.5 rounded bg-slate-900 border border-white/10 text-[10px]"
                          >
                            <option>Short Exit (30m)</option>
                            <option>Standard Outpass</option>
                            <option>Night Leave</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-500">Outpass Purpose</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Reason for exit" 
                            value={mockReason}
                            onChange={(e) => setMockReason(e.target.value)}
                            className="w-full p-2 rounded bg-slate-900 border border-white/10 text-[10px]" 
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button 
                          type="button" 
                          onClick={() => setShowMockForm(false)}
                          className="px-3 py-1.5 border border-white/10 text-white rounded text-[8px] font-black uppercase"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-3 py-1.5 bg-[#00E5FF] text-black rounded text-[8px] font-black uppercase"
                        >
                          Submit Mock Request
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="glass-card p-5 rounded-2xl border-white/5 flex flex-col justify-between">
                        <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">Gate Pass Wallet</p>
                          <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                            <QrCode className="w-10 h-10 text-[#00E5FF]" />
                            <div>
                              <p className="text-[10px] font-bold text-white">Active Pass</p>
                              {mockLeaves.some(l => l.status === 'Approved') ? (
                                <p className="text-[8px] text-emerald-400 font-extrabold uppercase">APPROVED - READY</p>
                              ) : mockLeaves.some(l => l.status === 'Pending') ? (
                                <p className="text-[8px] text-yellow-400 font-extrabold uppercase">PENDING APPROVAL</p>
                              ) : (
                                <p className="text-[8px] text-slate-500 font-extrabold uppercase">NO ACTIVE TOKEN</p>
                              )}
                            </div>
                          </div>
                        </div>
                        {mockLeaves.some(l => l.status === 'Approved') && (
                          <p className="text-[7px] text-[#00E5FF] font-bold mt-2 uppercase tracking-wide">Approved: Go to Security tab to scan QR</p>
                        )}
                      </div>
                      <div className="glass-card p-5 rounded-2xl border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">Attendance Rate</p>
                        <p className="text-2xl font-black text-white">96.8%</p>
                        <p className="text-[8px] text-[#00FFB2] font-extrabold uppercase mt-1">Status: Optimal Presence</p>
                      </div>
                      <div className="glass-card p-5 rounded-2xl border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">New Applications</p>
                        <button 
                          onClick={() => setShowMockForm(true)}
                          className="w-full py-2.5 bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] hover:brightness-110 text-white rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-colors border border-white/5"
                        >
                          File Outpass Pass
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeModule === 'warden' && (
                <motion.div 
                  key="warden"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h4 className="text-base font-black uppercase text-white">Warden Admin Control Desk</h4>
                      <p className="text-[10px] text-[#7C3AED] font-black uppercase tracking-wider">Managing block: PULAHA | ROHINI</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full text-[8px] font-black uppercase">
                      {mockLeaves.filter(l => l.status === 'Pending').length} Pending Outpasses
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8 glass-card p-5 rounded-2xl border-white/5 space-y-3">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Leave Requests Pending</p>
                      <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 log-scroll">
                        {mockLeaves.filter(l => l.status === 'Pending').length === 0 ? (
                          <p className="text-[9px] text-slate-500 py-6 uppercase font-bold text-center">No pending leaves to approve</p>
                        ) : (
                          mockLeaves.filter(l => l.status === 'Pending').map((req) => (
                            <div key={req.id} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                              <div>
                                <p className="text-[10px] font-bold text-white">{req.name}</p>
                                <p className="text-[8px] text-slate-400">Reason: {req.reason}</p>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleMockApprove(req.id)}
                                  className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-md text-[8px] font-black uppercase cursor-pointer transition-colors"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleMockReject(req.id)}
                                  className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-md text-[8px] font-black uppercase cursor-pointer transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-4 glass-card p-5 rounded-2xl border-white/5 flex flex-col justify-between">
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">Block Occupancy</p>
                        <p className="text-3xl font-black text-white">91.4%</p>
                        <p className="text-[8px] text-slate-400 mt-1">456 Residents Currently In Block</p>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] rounded-full" style={{ width: '91.4%' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeModule === 'security' && (
                <motion.div 
                  key="security"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h4 className="text-base font-black uppercase text-white">Security Gatekeeper Console</h4>
                      <p className="text-[10px] text-[#00FFB2] font-black uppercase tracking-wider">Gate Status: SECURED & ON-LINE</p>
                    </div>
                    <button 
                      onClick={triggerScan}
                      disabled={scanLoading}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-colors"
                    >
                      {scanLoading ? 'Simulating Scanner...' : 'Scan QR Pass'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-5 rounded-2xl border-white/5 space-y-3">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Dynamic QR Access Verification</p>
                      {scanLoading ? (
                        <div className="relative h-20 bg-black/40 rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                          <div className="laser-line"></div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-[#00E5FF] animate-pulse">Engaging lens...</span>
                        </div>
                      ) : scanSuccess ? (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-4">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                          <div>
                            <p className="text-[10px] font-black text-white uppercase tracking-wide">VERIFIED - GRANTED EXIT</p>
                            <p className="text-[8px] text-slate-400 font-mono mt-0.5">{scannedStudent}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-black/40 border border-dashed border-white/10 rounded-xl text-center py-6 text-slate-500 text-[8.5px] uppercase font-bold">
                          Ready for scanning simulation
                        </div>
                      )}
                    </div>
                    <div className="glass-card p-5 rounded-2xl border-white/5 space-y-3">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Recent Logs</p>
                      <div className="space-y-2 font-mono text-[9px]">
                        {scanSuccess && (
                          <div className="flex justify-between text-slate-300">
                            <span>[10:09] EXIT Scan {scannedStudent.split(' ')[0]}</span>
                            <span className="text-emerald-400">GRANTED</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-300">
                          <span>[09:41] EXIT Scan Alok Kumar</span>
                          <span className="text-emerald-400">GRANTED</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>[09:30] COURIER Amazon (Received)</span>
                          <span className="text-[#00E5FF]">LOGGED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeModule === 'parent' && (
                <motion.div 
                  key="parent"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h4 className="text-base font-black uppercase text-white">Parent Security Watch Panel</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Student linked: ALOK KUMAR</p>
                    </div>
                    <span className="px-3 py-1 bg-[#00FFB2]/10 border border-[#00FFB2]/30 text-[#00FFB2] rounded-full text-[8px] font-black uppercase">Live Updates Synced</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-5 rounded-2xl border-white/5">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">Student Status</p>
                      {scanSuccess ? (
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-md text-[8px] font-black uppercase tracking-wider">
                          Currently Out
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md text-[8px] font-black uppercase tracking-wider">
                          Inside Hostel
                        </span>
                      )}
                      <p className="text-[8px] text-slate-400 mt-3">{scanSuccess ? 'Exited Main Gate: 10:09 AM' : 'No movements logged today'}</p>
                    </div>
                    <div className="glass-card p-5 rounded-2xl border-white/5">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">Leave Duration</p>
                      <p className="text-lg font-black text-white">
                        {mockLeaves.some(l => l.status === 'Approved') ? 'Short Outpass' : 'No Active Pass'}
                      </p>
                      <p className="text-[8px] text-slate-400 mt-1">Expected Return: 05:00 PM</p>
                    </div>
                    <div className="glass-card p-5 rounded-2xl border-white/5 space-y-2">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Parent Notifications Logs</p>
                      <div className="text-[8px] text-slate-300 font-mono space-y-1">
                        {scanSuccess && (
                          <>
                            <p className="text-[#00FFB2]">[10:09 AM] Mock Scan: Exit Verified</p>
                            <p className="text-slate-500">[10:09 AM] WhatsApp Sync Delivered</p>
                          </>
                        )}
                        {mockLeaves.some(l => l.status === 'Approved') && (
                          <p className="text-[#00E5FF]">[10:00 AM] Mock Approval: Warden Authorized Outpass</p>
                        )}
                        <p className="text-slate-500">[09:41 AM] SMS Alert Delivered</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 7. LIVE TELEMETRY & ANALYTICS SECTION */}
      <section id="analytics" className="relative z-10 max-w-7xl mx-auto px-6 py-28 space-y-20 border-t border-white/[0.04]">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 text-[#00FFB2] text-[8px] font-black uppercase tracking-wider">
            Live Telemetry
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            System Telemetry & Scale
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-medium">
            Monitor real-time system performance, student data access flows, and security check compliance accuracy.
          </p>
        </div>

        {/* Counter grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Students Managed', value: 20000, suffix: '+', desc: 'Active student profiles across blocks' },
            { label: 'Approval Accuracy', value: 98, suffix: '%', desc: 'Compliant Warden leaves decisions' },
            { label: 'Security Events Logged', value: 50000, suffix: '+', desc: 'Encrypted audit scanner checks' },
            { label: 'System Uptime', value: 99.9, suffix: '%', desc: 'Redundant global Cloudflare CDN' }
          ].map((item, idx) => (
            <div key={idx} className="glass-card p-8 rounded-[2rem] border-white/5 text-left flex flex-col justify-between h-48 bg-gradient-to-b from-white/[0.01] to-transparent">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{item.label}</p>
              <div>
                <p className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  <AnimatedCounter value={item.value === 99.9 ? 99 : item.value} suffix={item.suffix} delay={idx * 0.2} />
                  {item.value === 99.9 && '.9%'}
                </p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-2">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Visual SVG Telemetry Chart & NOC Scanner Terminal */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Telemetry Graph Column */}
          <div className="lg:col-span-8 glass-panel p-6 sm:p-10 rounded-[2.5rem] border-white/10 bg-gradient-to-r from-white/[0.01] via-transparent to-transparent text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-[#00E5FF]/5 rounded-full filter blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-1">
                  Access Verification Peak Telemetry
                </h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase">Weekly logs for exit/entry scans aggregated across security nodes</p>
              </div>
              <div className="flex gap-4 font-mono text-[9px] text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#00E5FF]" /> Exit Gates</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#7C3AED]" /> Entry Gates</span>
              </div>
            </div>

            <div className="h-60 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 1000 240" fill="none" preserveAspectRatio="none">
                {/* Grids */}
                {[40, 80, 120, 160, 200].map((yVal) => (
                  <line key={yVal} x1="0" y1={yVal} x2="1000" y2={yVal} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                ))}
                
                {/* Telemetry Path 1 (Exits) */}
                <motion.path
                  d="M 0 180 Q 150 140 300 100 T 600 60 T 900 120 L 1000 160"
                  stroke="#00E5FF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  initial="hidden"
                  animate="visible"
                  variants={pathVariants}
                />
                {/* Telemetry Path 2 (Entries) */}
                <motion.path
                  d="M 0 210 Q 150 160 300 130 T 600 110 T 900 70 L 1000 110"
                  stroke="#7C3AED"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  initial="hidden"
                  animate="visible"
                  variants={pathVariants}
                />
                
                {/* Glowing circles on line peaks */}
                <circle cx="300" cy="100" r="5" fill="#00E5FF" className="animate-ping" />
                <circle cx="600" cy="60" r="5" fill="#00E5FF" />
                <circle cx="900" cy="70" r="5" fill="#7C3AED" className="animate-ping" />
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between font-mono text-[8px] text-slate-500 pt-3 border-t border-white/5">
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
                <span>SUN</span>
              </div>
            </div>
          </div>

          {/* Live NOC Scanner Terminal */}
          <div className="lg:col-span-4 glass-panel p-6 sm:p-8 rounded-[2.5rem] border-white/10 bg-black/40 flex flex-col justify-between h-auto min-h-[340px]">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FFB2] animate-ping" /> Live NOC Scanner
              </h4>
              <span className="text-[7px] font-mono text-cyan-400 font-extrabold uppercase">DAEMON v2.7</span>
            </div>
            
            <div className="flex-grow font-mono text-[9px] space-y-2.5 overflow-y-auto log-scroll pr-1 h-64">
              {liveScans.map((scan, idx) => (
                <div key={idx} className="flex gap-2 items-start leading-relaxed text-left">
                  <span className="text-slate-600 shrink-0 font-bold">[{scan.time}]</span>
                  <span className={
                    scan.status === 'SYS' 
                      ? 'text-slate-500 font-bold' 
                      : scan.status === 'SUCCESS' 
                      ? 'text-emerald-400 font-black' 
                      : 'text-cyan-400 font-black'
                  }>
                    {scan.text}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[7.5px] font-mono text-slate-500">
              <span>ACTIVE SCANNER NODES: 4</span>
              <span>100% ONLINE</span>
            </div>
          </div>

        </div>
      </section>

      {/* 8. FUTURISTIC AI CORE PLAYGROUND SECTION */}
      <section id="ai-core" className="relative z-10 max-w-7xl mx-auto px-6 py-28 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center border-t border-white/[0.04]">
        
        {/* Left info column */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-[8px] font-black uppercase tracking-wider">
            Sentinel AI Model
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            Meet DORM-X AI Core
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
            DORM-X integrates a hosted Gemini intelligence core that acts as a real-time concierge and warden support helper.
          </p>

          <div className="space-y-4">
            {[
              { title: 'Student Support', desc: 'Explain leave timelines, curfew rules, and outpass regulations directly via natural language dialog.' },
              { title: 'Security Insights', desc: 'Predictive occupancy rates, scanning delays logging, and gate congestion statistics alerts.' },
              { title: 'Smart Recommendations', desc: 'Warden approval cues flagging repeated late returns, risk patterns, or emergency history.' },
              { title: 'Automated Reports', desc: 'One-click text compiler exporting system occupancy logs, logistics reports, and incident ciphers.' }
            ].map((feat, idx) => (
              <div key={idx} className="flex gap-4 items-start bg-white/[0.01] p-4 rounded-2xl border border-white/[0.04]">
                <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[#00E5FF]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wide">{feat.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right chatbot interactive sandbox */}
        <div className="lg:col-span-7 w-full h-[520px] glass-panel rounded-[2.5rem] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-between text-left">
          {/* Header */}
          <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#00E5FF]" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-white">DORM-X Sentinel Playground</h4>
                <p className="text-[7px] text-[#00FFB2] font-extrabold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#00FFB2] rounded-full animate-ping" /> Live AI Engine Online
                </p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-slate-500" />
          </div>

          {/* Messages sandbox body */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-black/15 log-scroll">
            {sandboxMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[10px] leading-relaxed font-medium ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-tr from-[#00E5FF] to-[#7C3AED] text-white rounded-br-none shadow-md shadow-[#00E5FF]/10'
                    : 'bg-white/[0.03] border border-white/5 text-slate-300 rounded-bl-none'
                }`}>
                  {msg.role === 'assistant' ? (
                    // Simple text line output
                    msg.content.split('\n').map((line, lIdx) => {
                      if (line.startsWith('### ')) {
                        return <h5 key={lIdx} className="font-extrabold text-[#00E5FF] uppercase mb-2 mt-2">{line.substring(4)}</h5>;
                      }
                      if (line.startsWith('- ')) {
                        return <li key={lIdx} className="ml-3 list-disc text-slate-300 mb-1 font-bold">{line.substring(2)}</li>;
                      }
                      return <p key={lIdx} className="mb-1">{line}</p>;
                    })
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {sandboxLoading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={sandboxEndRef} />
          </div>

          {/* Quick select prompt chips */}
          <div className="px-6 py-3 bg-black/5 border-t border-white/5 flex flex-wrap gap-2">
            {[
              { label: 'Curfew rules?', query: 'What is the outpass curfew rule?' },
              { label: 'System status?', query: 'Generate system status statistics' },
              { label: 'Warden approvals?', query: 'Explain warden leave approvals flow' }
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setSandboxQuery(chip.query);
                  handleSandboxSend(chip.query);
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] border border-white/10 hover:border-[#00E5FF]/30 rounded-xl text-[8.5px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 text-slate-400"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSandboxSend(sandboxQuery);
            }}
            className="p-4 bg-white/[0.01] border-t border-white/5 flex gap-2.5"
          >
            <input 
              type="text"
              value={sandboxQuery}
              onChange={(e) => setSandboxQuery(e.target.value)}
              placeholder="Ask Sentinel AI e.g. 'Outpass rule'..."
              className="flex-grow bg-white/5 border border-white/10 outline-none text-[10px] font-bold py-3.5 px-4 rounded-xl text-white placeholder-slate-500"
            />
            <button 
              type="submit"
              disabled={!sandboxQuery.trim() || sandboxLoading}
              className="w-11 h-11 bg-white text-black hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl flex items-center justify-center cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* 9. SECURITY & AUDITING SECTION */}
      <section id="security" className="relative z-10 max-w-7xl mx-auto px-6 py-28 border-t border-white/[0.04]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Side: Cyber Shield Scanner */}
          <div className="lg:col-span-6 relative h-[420px] w-full flex items-center justify-center">
            {/* Concentric rotating scanning shields */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute w-80 h-80 rounded-full border border-dashed border-white/10 flex items-center justify-center"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-64 h-64 rounded-full border border-dashed border-[#00E5FF]/20 flex items-center justify-center"
            />
            <div className="absolute w-44 h-44 bg-[#030712] border border-white/10 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[#00E5FF]/5 blur-xl rounded-[3rem]" />
              <div className="laser-line rounded-[3rem]" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00E5FF] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#00E5FF]/20 mb-2 relative z-10">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <span className="text-[8px] font-black text-[#00E5FF] tracking-[0.25em] uppercase relative z-10">SHIELD ENGAGED</span>
            </div>
            
            {/* Floating visual nodes */}
            <div className="absolute top-10 left-10 p-3.5 glass-panel rounded-xl flex items-center gap-2 border-white/5 shadow-lg">
              <Lock className="w-4 h-4 text-[#7C3AED]" />
              <span className="text-[8px] font-black uppercase text-slate-300">End-to-End Encryption</span>
            </div>
            <div className="absolute bottom-10 right-10 p-3.5 glass-panel rounded-xl flex items-center gap-2 border-white/5 shadow-lg">
              <Database className="w-4 h-4 text-[#00FFB2]" />
              <span className="text-[8px] font-black uppercase text-slate-300">Supabase Audit Logs</span>
            </div>
          </div>

          {/* Right Side: Description */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 text-[#00FFB2] text-[8px] font-black uppercase tracking-wider">
              Shield Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              Enterprise-Grade Security
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
              We understand campus integrity. DORM-X utilizes advanced encryption keys and immutable logs to prevent database manipulation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Role Based Access Control', desc: 'Isolated dashboards and APIs protecting student data and security logs.' },
                { title: 'Immutable Audit Trail', desc: 'Every outpass generation, exit scan, and warden decision logs IP ciphers.' },
                { title: 'End-to-End Encryption', desc: 'Secure database pools and TLS 1.3 socket connections across nodes.' },
                { title: 'Unified Identity Verification', desc: 'Cross-checks face/RFID inputs at gatehouses to prevent outpass sharing.' }
              ].map((spec, idx) => (
                <div key={idx} className="p-5 glass-card rounded-2xl border-white/5 text-left space-y-2">
                  <h4 className="text-xs font-black uppercase text-white tracking-wide">{spec.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{spec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. PREMIUM TESTIMONIALS SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-28 border-t border-white/[0.04]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] text-[8px] font-black uppercase tracking-wider">
            Client Success
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            Trusted By Campus Leaders
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Read how wardens, registrars, and chief security officers optimized their hostels with DORM-X.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto h-[260px] sm:h-72">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 glass-panel p-8 sm:p-12 rounded-[2.5rem] border-white/10 text-left flex flex-col justify-between bg-gradient-to-br from-white/[0.02] to-transparent shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex gap-1.5">
                  {[...Array(testimonials[activeTestimonial].stars)].map((_, sIdx) => (
                    <Star key={sIdx} className="w-4 h-4 fill-[#00FFB2] text-[#00FFB2]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-semibold italic">
                  "{testimonials[activeTestimonial].quote}"
                </p>
              </div>
              
              <div className="border-t border-white/5 pt-4 flex justify-between items-end">
                <div>
                  <p className="text-xs sm:text-sm font-black uppercase text-white tracking-widest">
                    {testimonials[activeTestimonial].author}
                  </p>
                  <p className="text-[9px] text-slate-500 font-extrabold uppercase mt-1">
                    {testimonials[activeTestimonial].role}
                  </p>
                </div>
                
                {/* Carousel Controls */}
                <div className="flex gap-2">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestimonial(idx)}
                      className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                        activeTestimonial === idx 
                          ? 'bg-[#00E5FF] w-6' 
                          : 'bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 11. AURORA CTA BANNER */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="glass-panel p-10 sm:p-16 rounded-[3rem] border-[#00E5FF]/20 relative overflow-hidden text-center bg-gradient-to-r from-[#030712] via-[#00E5FF]/5 to-[#7C3AED]/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-[#00E5FF]/10 to-[#7C3AED]/10 rounded-full filter blur-[100px] pointer-events-none animate-pulse" />
          
          <div className="space-y-6 relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              Transform Your Campus Operations Today.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
              Join leading universities digitizing student movements, securing gate access, and synchronizing warden controls.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button 
                onClick={handleCTA}
                className="px-8 py-4 bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] hover:brightness-110 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg border border-white/10 active:scale-95"
              >
                Start Free Trial
              </button>
              <button 
                onClick={handleCTA}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 text-white"
              >
                Book Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 12. MULTI-COLUMN PREMIUM FOOTER */}
      <footer className="relative z-10 w-full py-16 bg-[#030712] border-t border-white/[0.04] text-left">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-10">
          
          {/* Logo Brand Info */}
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-[#00E5FF] to-[#7C3AED] rounded-lg flex items-center justify-center border border-[#00E5FF]/20">
                <Zap className="text-white w-4.5 h-4.5" />
              </div>
              <span className="text-base font-black italic tracking-tighter uppercase text-white">
                DORM-X
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The Intelligent Hostel Management Platform for Modern Campuses. Automating operations, securing campuses, and syncing communications.
            </p>
            <p className="text-[10px] text-slate-600 font-extrabold uppercase">
              © {new Date().getFullYear()} DORM-X INC. ALL RIGHTS RESERVED.
            </p>
          </div>

          {/* Links Col 1: Product */}
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase text-white tracking-widest">Product</h5>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#modules" className="hover:text-white transition-colors">Dashboard Modules</a>
              <a href="#analytics" className="hover:text-white transition-colors">Telemetry Analytics</a>
              <a href="#ai-core" className="hover:text-white transition-colors">Sentinel AI Assistant</a>
            </div>
          </div>

          {/* Links Col 2: Resources */}
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase text-white tracking-widest">Resources</h5>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400">
              <a href="/login" className="hover:text-white transition-colors">Student Log-in</a>
              <a href="/login" className="hover:text-white transition-colors">Warden Control</a>
              <a href="/login" className="hover:text-white transition-colors">Security Gate Desk</a>
              <a href="/login" className="hover:text-white transition-colors">Parent Live Watch</a>
            </div>
          </div>

          {/* Links Col 3: Legal & Social */}
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase text-white tracking-widest">Legal</h5>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400">
              <span className="hover:text-white transition-colors cursor-pointer">Security Protocol SOP</span>
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Matrix</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms of Use</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
