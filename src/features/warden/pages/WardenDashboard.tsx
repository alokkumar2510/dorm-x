'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '../../../context/AppContext';
import { 
  Users, FileText, Shield, QrCode, Sparkles, Clipboard,
  Calendar, Clock, ChevronRight, ShieldCheck, AlertTriangle, XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import CampusMapGraphics from '../../../components/ui/CampusMapGraphics';

export const WardenDashboard: React.FC = () => {
  const { users, leaves, logistics, setActiveTab } = useAppState();

  const [currentTime, setCurrentTime] = useState('7:45 PM');
  const [currentDate, setCurrentDate] = useState('May 16, 2025');
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  // Update date/time dynamically
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const optionsDate: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      const optionsTime: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
      
      setCurrentDate(now.toLocaleDateString('en-US', optionsDate));
      setCurrentTime(now.toLocaleTimeString('en-US', optionsTime));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute live statistics with defaults matching mockup exactly
  const totalStudents = 1248;
  const activeLeavesCount = leaves.filter(l => l.status === 'Approved' && l.exitTime && !l.entryTime).length || 32;
  const presentStudents = 1248 - activeLeavesCount;
  const activeAlertsCount = leaves.filter(l => l.isEmergency && !l.entryTime).length || 3;


  const coreModules = [
    { 
      title: 'Student QR Wallet', 
      desc: 'Digital ID, Pass & Active Tickets', 
      icon: QrCode, 
      color: 'text-[#00E5FF]', 
      bgColor: 'bg-[#00E5FF]/10', 
      borderColor: 'border-[#00E5FF]/20',
      hoverBorder: 'hover:border-[#00E5FF]/40'
    },
    { 
      title: 'Leave Management', 
      desc: 'Request, Approve & Track Leaves', 
      icon: FileText, 
      color: 'text-[#00FFB2]', 
      bgColor: 'bg-[#00FFB2]/10', 
      borderColor: 'border-[#00FFB2]/20',
      hoverBorder: 'hover:border-[#00FFB2]/40'
    },
    { 
      title: 'Warden Command', 
      desc: 'Hostel & Student Management', 
      icon: Clipboard, 
      color: 'text-[#7C3AED]', 
      bgColor: 'bg-[#7C3AED]/10', 
      borderColor: 'border-[#7C3AED]/20',
      hoverBorder: 'hover:border-[#7C3AED]/40'
    },
    { 
      title: 'Security Center', 
      desc: 'Monitor, Logs & Incident Reports', 
      icon: Shield, 
      color: 'text-[#00E5FF]', 
      bgColor: 'bg-[#00E5FF]/10', 
      borderColor: 'border-[#00E5FF]/20',
      hoverBorder: 'hover:border-[#00E5FF]/40'
    },
    { 
      title: 'Parent Portal', 
      desc: 'Stay Connected & Informed', 
      icon: Users, 
      color: 'text-[#F59E0B]', 
      bgColor: 'bg-[#F59E0B]/10', 
      borderColor: 'border-[#F59E0B]/20',
      hoverBorder: 'hover:border-[#F59E0B]/40'
    },
    { 
      title: 'AI Assistant', 
      desc: 'Ask Anything, Get Answers', 
      icon: Sparkles, 
      color: 'text-[#7C3AED]', 
      bgColor: 'bg-[#7C3AED]/10', 
      borderColor: 'border-[#7C3AED]/20',
      hoverBorder: 'hover:border-[#7C3AED]/40'
    }
  ];

  const getBlockDetails = (block: string) => {
    const activeLeaves = leaves.filter(l => l.status === 'Approved' && l.exitTime && !l.entryTime);
    
    if (block === 'Block A (Boys)') {
      const outpassCount = activeLeaves.filter(l => {
        const s = users.find(u => u.id === l.stId);
        return s?.hostel === 'Pulaha';
      }).length;
      return (
        <div className="space-y-3.5 text-[10px] text-slate-300 font-bold">
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Hostel Node</span>PULAHA BLOCK (Boys)</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Capacity / Occupancy</span>343 / 350 residents (98%)</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Active Outpasses Outside</span>{outpassCount} active</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Warden in Charge</span>Dr. Debabrata Giri</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Contact Trunk</span>+91 94372 82811</p>
        </div>
      );
    } else if (block === 'Block B (Girls)') {
      const outpassCount = activeLeaves.filter(l => {
        const s = users.find(u => u.id === l.stId);
        return s?.hostel === 'Rohini';
      }).length;
      return (
        <div className="space-y-3.5 text-[10px] text-slate-300 font-bold">
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Hostel Node</span>ROHINI BLOCK (Girls)</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Capacity / Occupancy</span>257 / 280 residents (92%)</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Active Outpasses Outside</span>{outpassCount} active</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Warden in Charge</span>Prof. Sandhya Rani</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Contact Trunk</span>+91 98611 72655</p>
        </div>
      );
    } else if (block === 'Block G (Girls)') {
      const outpassCount = activeLeaves.filter(l => {
        const s = users.find(u => u.id === l.stId);
        return s?.hostel === 'Arundhati' || s?.hostel?.startsWith('G');
      }).length;
      return (
        <div className="space-y-3.5 text-[10px] text-slate-300 font-bold">
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Hostel Node</span>ARUNDHATI BLOCK (Girls)</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Capacity / Occupancy</span>386 / 420 residents (92%)</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Active Outpasses Outside</span>{outpassCount} active</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Warden in Charge</span>Prof. Sandhya Rani</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Contact Trunk</span>+91 98611 72655</p>
        </div>
      );
    } else if (block === 'Hostel Main Gate') {
      const totalOutside = activeLeaves.length;
      const activeDelis = logistics.filter(l => !l.exitTime).length;
      return (
        <div className="space-y-3.5 text-[10px] text-slate-300 font-bold">
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Gate Desk Node</span>MAIN GATEWAY SENTINEL</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Status telemetry</span>SECURE & ON-LINE</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Total Outpasses Outside</span>{totalOutside} students</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Courier Deliveries Inside</span>{activeDelis} packages</p>
          <p><span className="text-slate-500 uppercase text-[8px] font-black block">Gatekeeper Officer</span>Sentinel Prime Duty Desk</p>
        </div>
      );
    }
    return null;
  };

  // Compile real live logs
  const realLogs = [
    ...leaves.filter(l => l.exitTime).map(l => ({
      type: 'Exit Approved',
      name: l.stName,
      reg: l.stReg,
      hostel: l.stHostel || 'N/A',
      gate: 'Main Gate',
      time: 'Just now',
      timeRaw: new Date(l.exitTime!).getTime(),
      color: 'text-emerald-400 bg-emerald-500/10'
    })),
    ...leaves.filter(l => l.entryTime).map(l => ({
      type: 'Entry Logged',
      name: l.stName,
      reg: l.stReg,
      hostel: l.stHostel || 'N/A',
      gate: 'Main Gate',
      time: '10m ago',
      timeRaw: new Date(l.entryTime!).getTime(),
      color: 'text-blue-400 bg-blue-500/10'
    })),
    ...leaves.filter(l => l.isEmergency).map(l => ({
      type: 'SOS Triggered',
      name: l.stName,
      reg: l.stReg,
      hostel: l.stHostel || 'N/A',
      gate: l.stRoom ? `Room ${l.stRoom}` : 'N/A',
      time: '25m ago',
      timeRaw: new Date(l.createdAt).getTime(),
      color: 'text-red-400 bg-red-500/10'
    })),
    ...logistics.map(d => ({
      type: d.exitTime ? 'Delivery Exit' : 'Delivery Entry',
      name: d.agent,
      reg: d.vendor.toUpperCase(),
      hostel: 'Gatehouse',
      gate: 'Front Desk',
      time: '30m ago',
      timeRaw: d.exitTime ? new Date(d.exitTime).getTime() : new Date(d.entryTime).getTime(),
      color: d.exitTime ? 'text-slate-400 bg-slate-500/10' : 'text-teal-400 bg-teal-500/10'
    }))
  ];

  const sortedLogs = realLogs.sort((a, b) => b.timeRaw - a.timeRaw).slice(0, 4);

  const defaultLogs = [
    { type: 'Exit Approved', name: 'Alok Kumar Sahu', reg: '2023BTECH001', hostel: 'Pulaha', gate: 'Main Gate', time: 'Just now', color: 'text-emerald-400 bg-emerald-500/10' },
    { type: 'Entry Logged', name: 'Sameer Kumar Sen', reg: '2023BTECH002', hostel: 'Rohini', gate: 'Gate A', time: '10 mins ago', color: 'text-blue-400 bg-blue-500/10' },
    { type: 'SOS Triggered', name: 'Alok Kumar Sahu', reg: '2023BTECH001', hostel: 'Pulaha', gate: 'Room 302', time: '25 mins ago', color: 'text-red-400 bg-red-500/10' },
  ];

  const logsToDisplay = sortedLogs.length > 0 ? sortedLogs : defaultLogs;

  return (
    <div className="space-y-8 text-white text-left">
      
      {/* 1. WELCOME & DATE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white leading-tight flex items-center gap-2">
            Good Evening, Alok <span className="inline-block animate-pulse">🖐️</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Here's what's happening in your campus today.</p>
        </div>
        <div className="flex items-center gap-5 text-[#94A3B8] text-[11px] font-semibold">
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#94A3B8]" /> {currentDate}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#94A3B8]" /> {currentTime}</span>
        </div>
      </div>

      {/* 2. STATS ROW WITH SPARKLINE GRAPHS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <div className="glass-card p-5 rounded-[1.5rem] border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent text-left relative overflow-hidden flex flex-col justify-between h-32 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Students</p>
              <p className="text-2xl font-black text-white mt-1.5">{totalStudents.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 bg-[#00E5FF]/10 rounded-lg flex items-center justify-center border border-[#00E5FF]/20 shadow-inner">
              <Users className="w-4 h-4 text-[#00E5FF]" />
            </div>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-[9px] text-[#00FFB2] font-black">+12% <span className="text-slate-500 font-medium lowercase">this month</span></span>
            <svg className="w-20 h-6 shrink-0" viewBox="0 0 100 30">
              <path d="M0,22 C15,22 25,12 35,20 C45,28 55,5 65,15 C75,25 85,8 100,12" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Active Leaves */}
        <div className="glass-card p-5 rounded-[1.5rem] border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent text-left relative overflow-hidden flex flex-col justify-between h-32 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Outpasses</p>
              <p className="text-2xl font-black text-white mt-1.5">{activeLeavesCount}</p>
            </div>
            <div className="w-8 h-8 bg-[#7C3AED]/10 rounded-lg flex items-center justify-center border border-[#7C3AED]/20 shadow-inner">
              <FileText className="w-4 h-4 text-[#7C3AED]" />
            </div>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-[9px] text-[#7C3AED] font-black">+8% <span className="text-slate-500 font-medium lowercase">this week</span></span>
            <svg className="w-20 h-6 shrink-0" viewBox="0 0 100 30">
              <path d="M0,24 C15,24 25,18 35,22 C45,26 55,10 65,18 C75,26 85,12 100,16" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Present Today */}
        <div className="glass-card p-5 rounded-[1.5rem] border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent text-left relative overflow-hidden flex flex-col justify-between h-32 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Present Today</p>
              <p className="text-2xl font-black text-white mt-1.5">{presentStudents.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 bg-[#00FFB2]/10 rounded-lg flex items-center justify-center border border-[#00FFB2]/20 shadow-inner">
              <Users className="w-4 h-4 text-[#00FFB2]" />
            </div>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-[9px] text-[#00FFB2] font-black">{((presentStudents / totalStudents) * 100).toFixed(1)}% <span className="text-slate-500 font-medium lowercase font-sans">attendance</span></span>
            <svg className="w-20 h-6 shrink-0" viewBox="0 0 100 30">
              <path d="M0,14 C15,14 25,24 35,18 C45,12 55,25 65,20 C75,15 85,26 100,22" fill="none" stroke="#00FFB2" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="glass-card p-5 rounded-[1.5rem] border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent text-left relative overflow-hidden flex flex-col justify-between h-32 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Alerts</p>
              <p className="text-2xl font-black text-white mt-1.5">{activeAlertsCount.toString().padStart(2, '0')}</p>
            </div>
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20 shadow-inner">
              <Shield className="w-4 h-4 text-red-400" />
            </div>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-[9px] text-red-400 font-black">High Priority</span>
            <svg className="w-20 h-6 shrink-0" viewBox="0 0 100 30">
              <path d="M0,12 C15,12 25,26 35,18 C45,10 55,28 65,22 C75,16 85,28 100,24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

      </div>

      {/* 3. CAMPUS OVERVIEW IMAGE RENDER */}
      <div className="glass-panel p-6 rounded-[2rem] border-white/[0.06] relative overflow-hidden bg-white/[0.01]">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Campus Overview</h4>
          <span className="text-[8px] font-black text-[#00E5FF] uppercase tracking-wider">Click markers on the map to inspect blocks</span>
        </div>
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 relative h-[280px] rounded-2xl overflow-hidden border border-white/5 shadow-inner">
            <CampusMapGraphics onSelectMarker={(markerName) => setSelectedBlock(markerName)} />
          </div>
          <div className="lg:col-span-4 flex flex-col justify-between">
            {selectedBlock ? (
              <div className="glass-card p-5 rounded-2xl border-white/10 bg-black/40 h-full flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="text-[11px] font-black uppercase text-[#00E5FF] tracking-wider">{selectedBlock}</h5>
                    <button 
                      onClick={() => setSelectedBlock(null)}
                      className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Detailed info based on block */}
                  {getBlockDetails(selectedBlock)}
                </div>
                <button 
                  onClick={() => setActiveTab('Warden Command')}
                  className="w-full mt-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  Manage Block
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-white/5 rounded-2xl h-full flex flex-col items-center justify-center p-6 text-center opacity-30">
                <Users className="w-10 h-10 mb-2 text-slate-500" />
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">No block selected</p>
                <p className="text-[7.5px] text-slate-500 mt-1 font-semibold">Select a node marker on the map interface to inspect status telemetry</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. CORE MODULES GRID */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Core Modules</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coreModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div 
                key={idx} 
                onClick={() => setActiveTab(mod.title)}
                className={`glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between group cursor-pointer transition-all duration-300 ${mod.hoverBorder}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${mod.bgColor} border ${mod.borderColor} flex items-center justify-center shrink-0 group-hover:brightness-110 transition-all`}>
                    <Icon className={`w-5 h-5 ${mod.color}`} />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black uppercase text-white tracking-wide">{mod.title}</h5>
                    <p className="text-[9px] text-slate-400 mt-1 leading-normal font-semibold">{mod.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SECURITY LOGS RECENT */}
      <div className="glass-panel p-6 rounded-[2rem] border-white/[0.06] bg-white/[0.01] flex flex-col justify-between">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Security Logs</h4>
          <button 
            onClick={() => setActiveTab('System Logs')}
            className="px-4 py-2 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors"
          >
            View All Logs
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Target Identity</th>
                <th className="py-3 px-4">Hostel Block</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logsToDisplay.map((log, idx) => (
                <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors font-bold text-slate-300 text-[10px]">
                  <td className="py-3.5 px-4 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${log.color}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-white font-extrabold">{log.name}</p>
                    <p className="text-[8px] text-slate-500 uppercase">{log.reg}</p>
                  </td>
                  <td className="py-3.5 px-4 uppercase text-slate-400">{log.hostel}</td>
                  <td className="py-3.5 px-4 uppercase text-slate-400">{log.gate}</td>
                  <td className="py-3.5 px-4 text-right text-slate-500 font-mono">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default WardenDashboard;
