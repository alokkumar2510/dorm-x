'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useAppState } from '@/context/AppContext';
import { 
  Zap, Bot, Sparkles, Send, Shield, Activity, Users, FileText, 
  Bell, Check, X, ShieldAlert, ArrowRight, ShieldCheck, ChevronRight, 
  User, Key, Database, Mail, Phone, Calendar, Clock, MapPin, Eye, Lock,
  Smartphone, Monitor, RefreshCw, BarChart2, QrCode
} from 'lucide-react';

// Animated Counter Component using framer-motion hooks
const AnimatedCounter: React.FC<{ value: number; suffix?: string; duration?: number }> = ({ value, suffix = '', duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px 0px' });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      if (start === end) return;

      const totalMiliseconds = duration * 1000;
      const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 20);
      
      const timer = setInterval(() => {
        start += Math.ceil(end / (totalMiliseconds / incrementTime));
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        } else {
          setCount(start);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

export default function LandingPage() {
  const { user } = useAppState();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'student' | 'warden' | 'security' | 'parent'>('student');
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    {
      role: 'assistant',
      content: 'Hello! Ask me anything about DORM-X policies, leave systems, or security rules.'
    }
  ]);
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [flowStep, setFlowStep] = useState(0);

  // Auto transition the solution flow diagram steps
  useEffect(() => {
    const interval = setInterval(() => {
      setFlowStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAiAsk = (text: string) => {
    if (!text.trim() || aiIsTyping) return;
    
    const newMsgs = [...aiMessages, { role: 'user', content: text } as const];
    setAiMessages(newMsgs);
    setAiQuery('');
    setAiIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const q = text.toLowerCase();
      if (q.includes('policy') || q.includes('curfew')) {
        reply = 'Hostel curfew is strictly 9:00 PM. Leave requests must be filed 2 hours in advance. Late returns trigger warden alarms.';
      } else if (q.includes('apply') || q.includes('outpass')) {
        reply = 'Go to your Student Portal, select Outpass request, set dates/reason, and submit. Warden receives it instantly.';
      } else if (q.includes('report') || q.includes('stat')) {
        reply = 'Generating system metrics... Total Managed: 12,450 Residents. Active Leaves: 312. SOS triggers: 0. System Security: Optimal.';
      } else {
        reply = 'I am Sentinel AI. I can explain outpass rules, verify parent notification syncs, or run real-time occupancy reports.';
      }

      setAiMessages([...newMsgs, { role: 'assistant', content: reply }]);
      setAiIsTyping(false);
    }, 1200);
  };

  const handleCTA = () => {
    if (user) {
      router.push(`/${user.roleType}`);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* BACKGROUND GRADIENT MESH */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -60, 40, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[120px]" 
        />
        <motion.div 
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/10 blur-[130px]" 
        />
        <motion.div 
          animate={{
            x: [0, 30, -30, 0],
            y: [0, 30, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[40vw] rounded-full bg-emerald-500/5 blur-[150px]" 
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        
        {/* Particle/Grid Lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-[100] w-full border-b border-white/5 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black italic tracking-tighter uppercase text-white">
              DORM-X
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-semibold tracking-wider uppercase text-slate-400 hover:text-cyan-400 transition-colors">Features</a>
            <a href="#modules" className="text-xs font-semibold tracking-wider uppercase text-slate-400 hover:text-cyan-400 transition-colors">Modules</a>
            <a href="#flow" className="text-xs font-semibold tracking-wider uppercase text-slate-400 hover:text-cyan-400 transition-colors">Platform flow</a>
            <a href="#analytics" className="text-xs font-semibold tracking-wider uppercase text-slate-400 hover:text-cyan-400 transition-colors">Analytics</a>
            <a href="#ai" className="text-xs font-semibold tracking-wider uppercase text-slate-400 hover:text-cyan-400 transition-colors">AI Core</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              id="nav-get-started-btn"
              aria-label={user ? 'Go to your DORM-X dashboard' : 'Get started with DORM-X'}
              onClick={handleCTA}
              className="px-5 py-2.5 bg-white text-black hover:bg-slate-100 rounded-xl text-xs font-extrabold uppercase tracking-widest cursor-pointer transition-all shadow-md hover:shadow-lg shadow-white/5 active:scale-95"
            >
              {user ? 'Go To Dashboard' : 'Get Started'}
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pt-28 lg:pb-36 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-6 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Next-Gen Campus Telemetry</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Reinventing Hostel Management <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-cyan-400 bg-300% animate-shimmer">
              for the AI Era.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
            DORM-X unifies student leave management, campus security, QR access control, emergency response, and parent communication into one intelligent platform.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              id="hero-get-started-btn"
              aria-label="Get started free with DORM-X"
              onClick={handleCTA}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 active:scale-95"
            >
              Get Started Free <ArrowRight className="inline w-4 h-4 ml-1.5" />
            </button>
            <a 
              id="hero-watch-demo-lnk"
              aria-label="Watch DORM-X platform interactive demo"
              href="#flow"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 text-white flex items-center justify-center"
            >
              Watch Demo
            </a>
          </div>
        </div>

        {/* Floating 3D Dashboard Mockups */}
        <div className="lg:col-span-6 relative h-[450px] sm:h-[520px] w-full flex items-center justify-center">
          {/* Main dashboard glow wrapper */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 rounded-full filter blur-3xl" />

          {/* Card 1: Student QR Pass */}
          <motion.div 
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-4 left-4 sm:left-12 w-64 glass-panel p-5 rounded-[2rem] border-cyan-400/20 shadow-2xl z-20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-white">Student QR Wallet</h4>
                  <p className="text-[8px] text-slate-500">Active Leave Ticket</p>
                </div>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5 mb-3">
              <QrCode className="w-20 h-20 text-cyan-400 opacity-80" />
              <p className="text-[9px] font-mono text-cyan-400 mt-2 tracking-widest uppercase">PX-8290-SECURE</p>
            </div>
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
              <span>Gate Status: APPROVED</span>
              <span className="text-cyan-400">Night Leave</span>
            </div>
          </motion.div>

          {/* Card 2: Warden Occupancy Analytics */}
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-28 right-4 sm:right-12 w-64 glass-panel p-5 rounded-[2rem] border-white/5 shadow-2xl z-10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-white">Warden Command</h4>
                  <p className="text-[8px] text-slate-500">Block BH-1 Telemetry</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[7px] text-emerald-400 font-extrabold uppercase">Safe</span>
            </div>
            <div className="space-y-2 mb-2">
              <div>
                <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                  <span>Dorm Occupancy</span>
                  <span className="text-indigo-400">82%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                  <span>Outpass Checked Out</span>
                  <span className="text-cyan-400">18%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '18%' }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Security Scan Log */}
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-6 left-8 sm:left-24 w-60 glass-panel p-4 rounded-3xl border-white/5 shadow-2xl z-30"
          >
            <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" /> Security Logs
            </h4>
            <div className="space-y-1.5 text-[8px] font-mono">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-emerald-400">✓ PASS VALID</span>
                <span className="text-slate-500">20:41</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">EXIT: PRATIK SEN</span>
                <span className="text-slate-500">20:39</span>
              </div>
              <div className="flex justify-between pb-0.5">
                <span className="text-cyan-400">INBOUND COURIER</span>
                <span className="text-slate-500">20:35</span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Parent Emergency Warning */}
          <motion.div 
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-12 right-2 sm:right-16 w-56 glass-panel p-4 rounded-3xl border-red-500/20 shadow-2xl z-20"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              </div>
              <h4 className="text-[9px] font-black uppercase text-red-500">Guardian Guard</h4>
            </div>
            <p className="text-[8px] text-slate-300 leading-normal font-bold">
              Parent Broadcast: Student has safely returned to hostel premises before 9:00 PM cutoff.
            </p>
          </motion.div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="relative z-10 border-t border-b border-white/5 bg-slate-900/30 py-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Trusted Framework Built For:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
            {['Universities', 'Engineering Colleges', 'Medical Colleges', 'Residential Campuses'].map((name, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white transition-colors">{name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32 text-center">
        <div className="max-w-3xl mx-auto space-y-4 mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
            <span className="text-[10px] font-black uppercase tracking-widest">Legacy Loophole Diagnostic</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Traditional Hostel Management is Broken.
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Outdated paperwork, manual record-keeping, and disconnected systems endanger student security and burden campus administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {[
            {
              title: 'Manual Paper Registers',
              desc: 'Logbooks are easily forged, loss-prone, and impossible to search or analyze during security audits.',
              glow: 'hover:shadow-red-500/5 hover:border-red-500/20'
            },
            {
              title: 'Unauthorized Campus Exits',
              desc: 'Students slipping past security checkpoints undetected due to insufficient verification steps.',
              glow: 'hover:shadow-red-500/5 hover:border-red-500/20'
            },
            {
              title: 'Warden-Security Loopholes',
              desc: 'Security guards unable to cross-check outpass approval status in real-time at the gates.',
              glow: 'hover:shadow-red-500/5 hover:border-red-500/20'
            },
            {
              title: 'Delayed SOS Response',
              desc: 'No direct alert mechanism during emergencies, leading to critical delays in securing residents.',
              glow: 'hover:shadow-red-500/5 hover:border-red-500/20'
            },
            {
              title: 'No Parent Transparency',
              desc: 'Parents left in the dark about their children check-ins, exits, or delayed curfew entries.',
              glow: 'hover:shadow-red-500/5 hover:border-red-500/20'
            },
            {
              title: 'Clunky Leave Approvals',
              desc: 'Physical paper routing, signatures, and phone call verification wastes administrative hours.',
              glow: 'hover:shadow-red-500/5 hover:border-red-500/20'
            }
          ].map((prob, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -6 }}
              className={`p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 transition-all shadow-xl ${prob.glow} group`}
            >
              <div className="w-10 h-10 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center justify-center mb-6 group-hover:bg-red-500/10 transition-colors">
                <span className="text-[10px] font-black text-red-500">0{idx+1}</span>
              </div>
              <h3 className="text-sm font-black uppercase text-white tracking-wider mb-3">{prob.title}</h3>
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed">{prob.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section id="flow" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5 bg-black/10 text-center">
        <div className="max-w-3xl mx-auto space-y-4 mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <span className="text-[10px] font-black uppercase tracking-widest">Unified Network Orchestration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            One Platform. Complete Control.
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Connect students, wardens, security, and parents in real time through DORM-X AI for absolute visibility.
          </p>
        </div>

        {/* Interactive Solution Flow Diagram */}
        <div className="max-w-4xl mx-auto glass-panel p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden border-white/5 bg-slate-900/20">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-20">
            {[
              {
                role: 'Student',
                action: 'Submits Outpass',
                icon: <User className="w-5 h-5 text-cyan-400" />,
                detail: 'Files leave details & timings via mobile.'
              },
              {
                role: 'Warden',
                action: 'Reviews & Approves',
                icon: <Activity className="w-5 h-5 text-indigo-400" />,
                detail: 'Authorizes outpass on command desk.'
              },
              {
                role: 'Security',
                action: 'Scans QR at Gate',
                icon: <Shield className="w-5 h-5 text-emerald-400" />,
                detail: 'Sweeps QR code, tapping RFID tag.'
              },
              {
                role: 'Parent',
                action: 'Receives Alert',
                icon: <Bell className="w-5 h-5 text-purple-400" />,
                detail: 'Gets instant SMS/push notification.'
              }
            ].map((node, idx) => {
              const isActive = flowStep === idx;
              return (
                <div key={idx} className="relative flex flex-col items-center">
                  {/* Glowing Connection Line (Desktop) */}
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 z-0">
                      {isActive && (
                        <motion.div 
                          initial={{ left: '0%' }}
                          animate={{ left: '100%' }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute top-0 w-8 h-full bg-cyan-400 filter blur-xs shadow-glow"
                        />
                      )}
                    </div>
                  )}

                  <motion.div 
                    animate={isActive ? { scale: 1.05, y: -4 } : { scale: 1, y: 0 }}
                    className={`w-20 h-20 rounded-[1.5rem] flex flex-col items-center justify-center border transition-all z-10 ${
                      isActive 
                        ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/10' 
                        : 'bg-white/[0.02] border-white/5'
                    }`}
                  >
                    {node.icon}
                  </motion.div>

                  <h3 className="text-xs font-black uppercase mt-4 text-white tracking-widest">{node.role}</h3>
                  <p className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider mt-1">{node.action}</p>
                  <p className="text-[9px] text-slate-500 max-w-[150px] mt-2 font-bold leading-normal">{node.detail}</p>
                </div>
              );
            })}
          </div>

          {/* DORM-X AI core overlay */}
          <div className="mt-12 p-5 rounded-2xl bg-white/[0.02] border border-white/5 inline-flex items-center gap-3 relative z-20">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase text-white tracking-widest">Autonomous Sync Core</p>
              <p className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider">Sync Latency: &lt; 80ms</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION (Bento Grid) */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <span className="text-[10px] font-black uppercase tracking-widest">Architectural Grid Showroom</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Campus Intelligence in Every Module.
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Engineered for military-grade reliability, absolute response speeds, and beautiful user experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          
          {/* 1. Smart Leave Management (Wide) */}
          <div className="md:col-span-4 glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col justify-between overflow-hidden relative min-h-[300px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full filter blur-2xl pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center mb-6">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-sm font-black uppercase text-white tracking-wider mb-2">Smart Leave Management</h3>
              <p className="text-[11px] font-bold text-slate-400 max-w-md leading-relaxed">
                Replace parent calls and paper slips. Students request leaves on the app, routing instantly to the warden command queue. Approved passes appear automatically as digital tokens.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-6 overflow-hidden">
              <div className="flex gap-2">
                {['Night Out', 'Day Exit', 'Home Leave'].map((t, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 2. QR Access Control */}
          <div className="md:col-span-2 glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col justify-between relative min-h-[300px]">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center mb-6">
                <QrCode className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-sm font-black uppercase text-white tracking-wider mb-2">QR Access Control</h3>
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                Automated QR passes refresh every 60s to prevent screenshot swapping. Taps directly into RFID hardware networks.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-center">
              <div className="relative w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-400/20">
                <QrCode className="w-10 h-10 text-indigo-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* 3. Emergency SOS */}
          <div className="md:col-span-2 glass-panel p-8 rounded-[2rem] border-red-500/10 flex flex-col justify-between relative min-h-[300px]">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center justify-center mb-6">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-sm font-black uppercase text-white tracking-wider mb-2">Emergency SOS Protocol</h3>
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                One-tap emergency broadcast that bypasses normal router queues to ping wardens and activate sirens across gate posts.
              </p>
            </div>
            <div className="mt-8">
              <span className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-400 flex items-center justify-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Emergency System Active
              </span>
            </div>
          </div>

          {/* 4. Parent Portal */}
          <div className="md:col-span-4 glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col justify-between overflow-hidden relative min-h-[300px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mb-6">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-sm font-black uppercase text-white tracking-wider mb-2">Parent Portal Telemetry</h3>
              <p className="text-[11px] font-bold text-slate-400 max-w-md leading-relaxed">
                Guardians receive automated gate signals. If a student checks out, parents receive an instant message. Security sync is automated.
              </p>
            </div>
            <div className="mt-8 flex gap-4 text-[10px]">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 font-extrabold uppercase">
                <Check className="w-3.5 h-3.5" /> SMS Channel Online
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 font-extrabold uppercase">
                <Check className="w-3.5 h-3.5" /> Call Synced
              </div>
            </div>
          </div>

          {/* 5. Security Command Center */}
          <div className="md:col-span-3 glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-sm font-black uppercase text-white tracking-wider mb-2">Security SOC Desk</h3>
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                Log couriers, visitors, and guest checks. Maintain clean ledger audits that compile into historical CSV files for compliance reports.
              </p>
            </div>
            <div className="mt-8 text-[9px] font-mono text-slate-400 space-y-1">
              <p>&gt; GUEST LOGGED: INBOUND RM-402</p>
              <p>&gt; COURIER: REGISTERED VENDOR-AMZN</p>
            </div>
          </div>

          {/* 6. AI Assistant */}
          <div className="md:col-span-3 glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-center mb-6">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-black uppercase text-white tracking-wider mb-2">Sentinel AI Companion</h3>
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                Decoupled conversational responder. Inspects active Prisma counts to compile system reports and outline policies instantly.
              </p>
            </div>
            <div className="mt-8">
              <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Powered by DORM-X AI Core
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* PRODUCT MODULES (Dashboards Showcase) */}
      <section id="modules" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <span className="text-[10px] font-black uppercase tracking-widest">Interface Telemetry Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Custom Portals for Every Stakeholder.
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Experience dedicated dashboard panels tailored to students, wardens, gatekeepers, and parents.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { id: 'student', label: 'Student App', icon: <Smartphone className="w-4 h-4" /> },
            { id: 'warden', label: 'Warden Portal', icon: <Monitor className="w-4 h-4" /> },
            { id: 'security', label: 'Security Desk', icon: <Shield className="w-4 h-4" /> },
            { id: 'parent', label: 'Parent Link', icon: <Users className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-trigger-${tab.id}`}
              aria-label={`Switch to ${tab.label} preview`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer flex items-center gap-2 border transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/15'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Interactive Showcase Window */}
        <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl relative min-h-[400px]">
          <div className="bg-white/[0.02] border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/40" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/40" />
              <span className="w-3 h-3 rounded-full bg-green-500/40" />
            </div>
            <div className="px-6 py-1 bg-white/5 rounded-full text-[9px] font-mono text-slate-500 select-none uppercase tracking-widest">
              system-console://{activeTab}-hub
            </div>
            <RefreshCw className="w-3.5 h-3.5 text-slate-500 hover:text-cyan-400 cursor-pointer" />
          </div>

          <div className="p-8 sm:p-12">
            <AnimatePresence mode="wait">
              {activeTab === 'student' && (
                <motion.div 
                  key="student"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-center"
                >
                  <div className="lg:col-span-5 space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-wider text-white">Student Command App</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-bold">
                      Keep your gate keys directly on your device. File requests, monitor live approval workflows, tap gates, and trigger SOS support in one tap.
                    </p>
                    <ul className="space-y-2.5 text-[10px] font-black uppercase text-slate-300">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Dynamic QR Pass Wallet</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Tap-to-Exit RFID Integration</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> One-Touch SOS Security Siren</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Instant Push Alerts & Notices</li>
                    </ul>
                  </div>
                  <div className="lg:col-span-7 bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                    <div className="border border-cyan-400/20 bg-cyan-500/5 p-5 rounded-2xl flex flex-col items-center">
                      <span className="px-2 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/30 text-[7px] font-black uppercase text-cyan-400 tracking-widest mb-3 animate-pulse">Scanning Enabled</span>
                      <QrCode className="w-24 h-24 text-cyan-400 mb-2" />
                      <p className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">PX-8290-ACTIVE</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'warden' && (
                <motion.div 
                  key="warden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-center"
                >
                  <div className="lg:col-span-5 space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-wider text-white">Warden Approval Desk</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-bold">
                      Approve or deny student leave applications in real time. Track occupancy percentages, curfew return statuses, and receive notifications when students trigger alerts.
                    </p>
                    <ul className="space-y-2.5 text-[10px] font-black uppercase text-slate-300">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Digital Signatures Approval</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Occupancy Telemetry Dashboard</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Late Return & Curfew Warning Queue</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Dynamic Student Database Filters</li>
                    </ul>
                  </div>
                  <div className="lg:col-span-7 bg-slate-900/50 border border-white/5 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h4 className="text-[10px] font-black uppercase text-white">Pending Approvals (1)</h4>
                      <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-[7px] text-yellow-400 font-extrabold uppercase">Pending</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-xl border border-white/5">
                      <div>
                        <p className="text-[10px] font-black text-white">A. Sahu (Reg: 220204)</p>
                        <p className="text-[8px] text-slate-500 font-extrabold uppercase mt-0.5">Night Outpass - Health Issue</p>
                      </div>
                      <div className="flex gap-2">
                        <button id="mock-approve-btn" aria-label="Mock approve outpass request" className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg transition-colors cursor-pointer"><Check className="w-4 h-4" /></button>
                        <button id="mock-reject-btn" aria-label="Mock reject outpass request" className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-lg transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div 
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-center"
                >
                  <div className="lg:col-span-5 space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-wider text-white">Security Command SOC</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-bold">
                      Scan incoming/outgoing QR passes, tap student RFID cards, verify live photo parameters, log visitors/deliveries, and launch building lockdowns.
                    </p>
                    <ul className="space-y-2.5 text-[10px] font-black uppercase text-slate-300">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Real-time Gate QR Scanning</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> RFID & Face Verification Integration</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Dynamic Courier & Guest Ledgers</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> One-Click Total Building Lockdown</li>
                    </ul>
                  </div>
                  <div className="lg:col-span-7 bg-slate-900/50 border border-white/5 p-6 rounded-3xl space-y-4">
                    <div className="border border-emerald-500/20 bg-emerald-500/5 p-5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white">MATCH VERIFIED</p>
                          <p className="text-[8px] text-emerald-400 font-extrabold uppercase mt-0.5">Student Leave Approved</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-slate-500 uppercase font-black">Gate 01</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'parent' && (
                <motion.div 
                  key="parent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-center"
                >
                  <div className="lg:col-span-5 space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-wider text-white">Parent Portal Access</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-bold">
                      Stay connected with your child outpass schedules. Monitor real-time statuses (In-Hostel, Off-Campus, Night Leave) and receive push alerts for safety.
                    </p>
                    <ul className="space-y-2.5 text-[10px] font-black uppercase text-slate-300">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Student Gate Move Notifications</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Real-time Location/Status Metrics</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Emergency Alerts Escalations</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Integrated Warden Dial Simulator</li>
                    </ul>
                  </div>
                  <div className="lg:col-span-7 bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Student Location Status</p>
                      <span className="w-20 h-20 rounded-full border-4 border-cyan-400 flex items-center justify-center font-black text-xs text-white shadow-lg shadow-cyan-500/10">IN-HOSTEL</span>
                      <p className="text-[8px] text-slate-500 uppercase mt-3 tracking-widest font-black">Gate Verified at 18:42 PM</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* LIVE ANALYTICS SECTION */}
      <section id="analytics" className="relative z-10 max-w-7xl mx-auto px-6 py-24 bg-slate-900/30 border-t border-b border-white/5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { value: 12450, suffix: '+', label: 'Students Managed' },
            { value: 85290, suffix: '+', label: 'Leaves Processed' },
            { value: 1200000, suffix: '+', label: 'Security Events Logged' },
            { value: 100, suffix: '%', label: 'Emergency Alerts Resolved' }
          ].map((stat, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </h3>
              <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS TIMELINE */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <span className="text-[10px] font-black uppercase tracking-widest">Workflow Timeline Roadmap</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Simple. Automated. Instant.
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            From leave application to gate logging, DORM-X secures every touchpoint of student movement.
          </p>
        </div>

        <div className="max-w-3xl mx-auto relative pl-8 sm:pl-12 border-l border-white/5 space-y-12">
          {[
            {
              step: 'Step 1',
              title: 'Student Submits Outpass',
              desc: 'Student files night out, day exit, or home leave requests on the app, setting times, destination, and details.'
            },
            {
              step: 'Step 2',
              title: 'Warden Approves Digitally',
              desc: 'Warden receives instant pings, reviews requests, and authorizes leaves with single-click command controls.'
            },
            {
              step: 'Step 3',
              title: 'Security Scans QR at Gate',
              desc: 'During checkout, security sweeps the student’s dynamic QR pass. System logs exit timestamp instantly.'
            },
            {
              step: 'Step 4',
              title: 'Parent Receives Notification',
              desc: 'System triggers automatic notifications to parent phones, reporting check-out and checkout safety timestamps.'
            },
            {
              step: 'Step 5',
              title: 'System Maintained Audit Trail',
              desc: 'Administrator records historical audit logs, compiling user checkins, checkouts, and late curfew telemetry.'
            }
          ].map((item, idx) => (
            <div key={idx} className="relative">
              {/* Dot indicator */}
              <div className="absolute top-1 -left-[38px] sm:-left-[54px] w-[14px] h-[14px] rounded-full bg-cyan-500 border-4 border-slate-950 shadow-md shadow-cyan-500/40 z-10" />
              
              <div className="glass-panel p-6 sm:p-8 rounded-[2rem] border-white/5 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all text-left">
                <span className="text-[8px] font-black uppercase text-cyan-400 tracking-[0.2em]">{item.step}</span>
                <h3 className="text-xs sm:text-sm font-black uppercase text-white tracking-widest mt-1 mb-2">{item.title}</h3>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MEET DORM-X AI SECTION */}
      <section id="ai" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bot className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Autonomous Agent Core</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Meet DORM-X Sentinel AI.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-bold">
              An intelligent, database-aware campus assistant integrated directly inside the hostel platform. Capable of explaining curfew rules, answering outpass FAQs, helping wardens with approvals instructions, and fetching real-time database stats.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Outpass Rules', 'Warden Guide', 'System Metrics'].map((preset) => (
                <button
                  key={preset}
                  id={`ai-preset-${preset.replace(/\s+/g, '-').toLowerCase()}`}
                  aria-label={`Ask AI agent about ${preset.toLowerCase()}`}
                  onClick={() => handleAiAsk(`Tell me about ${preset.toLowerCase()}`)}
                  className="px-3 py-2 bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 cursor-pointer transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            {/* Mock Chat Window */}
            <div className="glass-panel rounded-[2.5rem] border-cyan-500/10 shadow-2xl relative overflow-hidden text-left max-w-xl mx-auto bg-slate-900/10">
              {/* Header */}
              <div className="bg-white/[0.02] border-b border-white/5 px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-white">Sentinel AI Agent</h4>
                  <p className="text-[7px] text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Online Core
                  </p>
                </div>
              </div>

              {/* Chat messages */}
              <div className="p-6 h-[250px] overflow-y-auto space-y-4 log-scroll">
                {aiMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-[10px] font-bold ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-cyan-400/20 text-white rounded-br-none'
                        : 'bg-white/[0.03] border border-white/5 text-slate-300 rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {aiIsTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.03] border border-white/5 p-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                      <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAiAsk(aiQuery);
                }}
                className="p-3.5 bg-white/[0.01] border-t border-white/5 flex gap-2"
              >
                <input
                  id="ai-chat-input"
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask Sentinel AI about policies, rules..."
                  disabled={aiIsTyping}
                  className="flex-grow bg-white/5 border border-white/10 outline-none text-[9px] font-bold py-3 px-4 rounded-xl text-white placeholder-slate-500 disabled:opacity-50"
                />
                <button
                  id="ai-chat-submit-btn"
                  aria-label="Submit query to Sentinel AI agent"
                  type="submit"
                  disabled={aiIsTyping || !aiQuery.trim()}
                  className="w-10 h-10 bg-white text-black hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl flex items-center justify-center cursor-pointer transition-all disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <span className="text-[10px] font-black uppercase tracking-widest">Platform Feedback & Trust</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Validated by Campus Administrators.
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            See how registrars, wardens, and safety coordinators describe their transition to DORM-X.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            {
              quote: "DORM-X eliminated hours of outpass log queues. The parent notification channel provides immediate safety confirmation, restoring absolute accountability.",
              author: "Dr. K. Sharma",
              role: "Chief Registrar, Campus Administration"
            },
            {
              quote: "Lockdown control triggers and automated dynamic QR pass checkers have fully secured our hostels. Gate operations are unified, reliable, and fast.",
              author: "Prof. P. Senapati",
              role: "Warden, Block B-3 Dorms"
            },
            {
              quote: "Manual checkins are gone. The dynamic pass refresh blocks pass sharing completely. The batch offline mode continues scanning even during internet cuts.",
              author: "Commander R. Patnaik",
              role: "Director of Campus Security & SOC"
            }
          ].map((testi, idx) => (
            <div key={idx} className="glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col justify-between shadow-xl">
              <p className="text-xs text-slate-300 leading-relaxed font-bold italic mb-8">
                "{testi.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center font-black text-[10px] text-cyan-400 uppercase">
                  {testi.author[4]}
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-white">{testi.author}</h4>
                  <p className="text-[8px] text-slate-500 font-extrabold uppercase mt-0.5">{testi.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Cryptography Guard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Enterprise Grade Security.
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            DORM-X is engineered on data isolation models, strict encryption, and regulatory protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-left">
          {[
            { title: 'AES-256 Encryption', icon: <Lock className="w-5 h-5 text-cyan-400" />, desc: 'All student parameters, parent contacts, and gate sweeps are encrypted at rest and transit.' },
            { title: 'Strict RBAC Controls', icon: <Shield className="w-5 h-5 text-cyan-400" />, desc: 'Strict role-based tokens prevent cross-domain parameter injections.' },
            { title: 'Immutable Audit Logs', icon: <Database className="w-5 h-5 text-cyan-400" />, desc: 'Administrative operations register a secure audit log for security telemetry.' },
            { title: 'Secure Session Auth', icon: <Key className="w-5 h-5 text-cyan-400" />, desc: 'JWT refresh token rotation protocols secure student sessions.' },
            { title: 'GDPR / Privacy Compliant', icon: <ShieldCheck className="w-5 h-5 text-cyan-400" />, desc: 'Absolute student data privacy with strict isolation models.' }
          ].map((sec, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-3xl border-white/5 flex flex-col justify-between shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-4">
                {sec.icon}
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase text-white tracking-wider mb-2">{sec.title}</h4>
                <p className="text-[8px] font-bold text-slate-400 leading-normal">{sec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32">
        <div className="glass-panel rounded-[3rem] border-cyan-500/10 shadow-2xl relative overflow-hidden text-center py-20 px-6 sm:px-12 bg-slate-900/10">
          
          {/* Animated Aurora Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
            <motion.div 
              animate={{
                rotate: 360,
              }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute top-[-50%] left-[-20%] w-[140vw] h-[140vw] rounded-full bg-gradient-to-tr from-cyan-500/10 via-indigo-500/5 to-cyan-500/10 blur-[120px]" 
            />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Transform Your Campus <br /> Operations Today.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-bold">
              Unify leave requests, automate gate logs, secure student dormitories, and inform parents instantly. Join universities leading the digital telemetry transition.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button 
                id="cta-book-demo-btn"
                aria-label="Book a product demonstration for DORM-X"
                onClick={handleCTA}
                className="px-8 py-4 bg-white text-black hover:bg-slate-100 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 shadow-lg shadow-white/5"
              >
                Book Demo Now
              </button>
              <a 
                id="cta-contact-sales-lnk"
                aria-label="Email DORM-X sales team"
                href="mailto:sales@dormx.in"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 text-white flex items-center justify-center"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/40 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 text-left">
          
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500 rounded-xl flex items-center justify-center">
                <Zap className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-black italic tracking-tighter uppercase text-white">
                DORM-X
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 max-w-[280px] leading-relaxed">
              Building safer and smarter campus ecosystems. AI-Powered Hostel & Campus Security Management.
            </p>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Product</h4>
            <ul className="space-y-2 text-[10px] font-bold text-slate-500">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
              <li><a href="#modules" className="hover:text-cyan-400 transition-colors">Dashboards</a></li>
              <li><a href="#analytics" className="hover:text-cyan-400 transition-colors">Live Analytics</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Features</h4>
            <ul className="space-y-2 text-[10px] font-bold text-slate-500">
              <li><a href="#flow" className="hover:text-cyan-400 transition-colors">System Flow</a></li>
              <li><a href="#ai" className="hover:text-cyan-400 transition-colors">Sentinel AI</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Emergency SOS</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Documentation</h4>
            <ul className="space-y-2 text-[10px] font-bold text-slate-500">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">User Manuals</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Integrations</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Contact</h4>
            <ul className="space-y-2 text-[10px] font-bold text-slate-500">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Help Desk</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Use</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-black text-slate-500 uppercase tracking-wider">
          <span>DORM-X © 2026. All Rights Reserved.</span>
          <span>Designed with Quantum Engineering</span>
        </div>
      </footer>

    </div>
  );
}
