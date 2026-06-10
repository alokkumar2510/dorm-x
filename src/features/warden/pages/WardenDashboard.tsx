import React, { useState } from 'react';
import { useAppState } from '../../../context/AppContext';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertTriangle, 
  Users, 
  Layers, 
  Info,
  Clock
} from 'lucide-react';
import { SYSTEM_STUDENTS } from '../../../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Mock occupancy analytics data
const OCCUPANCY_DATA = [
  { name: 'Pulaha Block', value: 86, color: '#22d3ee' },
  { name: 'Rohini Block', value: 92, color: '#10b981' },
  { name: 'Vashistha Block', value: 78, color: '#818cf8' }
];

export const WardenDashboard: React.FC = () => {
  const { users, leaves, approve } = useAppState();

  const allStudents = [...SYSTEM_STUDENTS, ...users];
  const today = new Date().toISOString().split('T')[0];

  // Search & Filter state for command queue
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Search state for student management directory
  const [dirQuery, setDirQuery] = useState('');

  // Statistics calculations
  const exitsToday = leaves.filter(
    (l) => l.exitTime && l.exitTime.includes(today)
  ).length;

  const residentsOut = leaves.filter(
    (l) => l.exitTime && !l.entryTime
  ).length;

  const activeSOS = leaves.filter(
    (l) => l.isEmergency && !l.entryTime
  ).length;

  const pendingApprovals = leaves.filter(
    (l) => l.status === 'Pending'
  ).length;

  // Filter pending requests for students
  const pendingLeaves = leaves.filter(
    (l) => l.status === 'Pending' && !l.isEmergency
  );

  // Apply search query & type filters
  const filteredLeaves = pendingLeaves.filter((l) => {
    const matchesSearch = 
      l.stName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.stReg && l.stReg.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = 
      filterType === 'All' || 
      (filterType === 'Short Exit' && l.type.includes('Short')) ||
      (filterType === 'Standard Outpass' && l.type.includes('Standard')) ||
      (filterType === 'Night Leave' && l.type.includes('Night'));

    return matchesSearch && matchesFilter;
  });

  // Calculate overdue students (checked out but deadline exceeded)
  const overdueStudents = leaves.filter((l) => {
    if (!l.exitTime || l.entryTime) return false;
    // Extract end date from dateRange
    if (l.dateRange.includes(' to ')) {
      const parts = l.dateRange.split(' to ');
      const returnTime = new Date(parts[1]).getTime();
      return returnTime < Date.now();
    }
    return false;
  });

  // Filter students in directory
  const filteredDirectory = allStudents.filter((s) => {
    return (
      s.name.toLowerCase().includes(dirQuery.toLowerCase()) ||
      (s.room && s.room.toLowerCase().includes(dirQuery.toLowerCase())) ||
      (s.reg && s.reg.toLowerCase().includes(dirQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-8 text-white">
      {/* 1. STATE CARDS */}
      <div id="warden-summary" className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="glass-panel p-6 rounded-[2rem] border-cyan-500/10 cursor-pointer"
        >
          <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Exits Today</p>
          <p className="text-4xl font-black text-white italic">{exitsToday}</p>
        </motion.div>
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="glass-panel p-6 rounded-[2rem] border-emerald-500/10 cursor-pointer"
        >
          <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Residents Out</p>
          <p className="text-4xl font-black text-emerald-500 italic">{residentsOut}</p>
        </motion.div>
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`glass-panel p-6 rounded-[2rem] border-red-500/10 cursor-pointer ${activeSOS > 0 ? 'animate-pulse border-red-500/50 bg-red-950/10' : ''}`}
        >
          <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Active SOS Warnings</p>
          <div className="flex items-center gap-2">
            <p className={`text-4xl font-black italic ${activeSOS > 0 ? 'text-red-500' : 'text-slate-500'}`}>
              {activeSOS}
            </p>
            {activeSOS > 0 && <AlertTriangle className="w-5 h-5 text-red-500" />}
          </div>
        </motion.div>
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="glass-panel p-6 rounded-[2rem] border-white/5 cursor-pointer"
        >
          <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Pending Proposals</p>
          <p className="text-4xl font-black text-white italic">{pendingApprovals}</p>
        </motion.div>
      </div>

      {/* 2. CORE LAYOUT */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: OCCUPANCY & APPROVAL QUEUE */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* HOSTEL OCCUPANCY ANALYTICS */}
          <div className="glass-panel p-8 rounded-[2.5rem]">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Hostel Occupancy Analytics
            </h3>
            <div className="grid md:grid-cols-12 items-center gap-6">
              <div className="md:col-span-5 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={OCCUPANCY_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {OCCUPANCY_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="md:col-span-7 space-y-3">
                {OCCUPANCY_DATA.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-black text-white">{item.value}% Capacity</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LEAVE APPROVAL CENTER */}
          <div className="glass-panel rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <h3 className="font-black text-2xl uppercase tracking-tighter italic text-white mb-6">
                Command Approval Queue
              </h3>
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Resident / Cipher"
                    className="w-full pl-10 pr-4 py-3 rounded-xl outline-none text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500"
                  />
                </div>
                
                {/* Type Filter Buttons */}
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5 w-full sm:w-auto overflow-x-auto">
                  {['All', 'Short Exit', 'Standard Outpass', 'Night Leave'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${
                        filterType === t 
                          ? 'bg-cyan-500 text-matte-black' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {t.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/40 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-8 py-6">Resident</th>
                    <th className="px-8 py-6">Cipher Intel</th>
                    <th className="px-8 py-6 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody id="wd-mount" className="divide-y divide-white/5">
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-16 text-center opacity-20 font-black uppercase text-white">
                        NO PROTOCOLS MATCH FILTERS
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((l) => (
                      <tr key={l.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-8 py-6 font-black text-white italic">
                          {l.stName}
                          <br />
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest">
                            {l.stReg}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-xs text-cyan-400 font-bold">
                          {l.type}
                          <br />
                          <span className="text-slate-500 font-normal italic">{l.reason}</span>
                          <p className="text-[9px] text-slate-500 font-normal mt-1">{l.dateRange}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => approve(l.id, 'Rejected')}
                              className="bg-red-500/10 text-red-500 border border-red-500/30 p-2.5 rounded-xl hover:bg-red-500/20 transition-all cursor-pointer"
                              title="Decline"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => approve(l.id, 'Approved')}
                              className="bg-cyan-500 text-white p-2.5 rounded-xl hover:brightness-110 transition-all cursor-pointer"
                              title="Authorize"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RISKS & STUDENT DIRECTORY */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* OVERDUE RISKS / WARNING INDICATORS */}
          <div className="glass-panel p-6 rounded-[2.5rem]">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Overdue Alerts (High Risk)
            </h3>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 log-scroll">
              {overdueStudents.length === 0 ? (
                <div className="p-4 bg-white/5 rounded-xl text-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  No Overdue Violations
                </div>
              ) : (
                overdueStudents.map((l) => (
                  <div key={l.id} className="p-4 bg-red-950/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <Clock className="w-4 h-4 text-red-500 mt-0.5" />
                    <div className="text-[10px] uppercase font-black">
                      <p className="text-white">{l.stName}</p>
                      <p className="text-slate-500 mt-0.5">Room {l.stRoom || 'N/A'} | {l.type}</p>
                      <p className="text-red-500 font-extrabold mt-1">Deadline Exceeded</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* STUDENT MANAGEMENT DIRECTORY */}
          <div className="glass-panel p-6 rounded-[2.5rem]">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Resident Index Directory
            </h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={dirQuery}
                onChange={(e) => setDirQuery(e.target.value)}
                placeholder="Search Room / Name"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-[10px] bg-white/5 border border-white/10 text-white placeholder-slate-500"
              />
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 log-scroll">
              {filteredDirectory.map((s) => {
                const isOut = leaves.some(
                  (l) => l.stId === s.id && l.exitTime && !l.entryTime
                );
                return (
                  <div key={s.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-white uppercase">{s.name}</p>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        Room {s.room || 'N/A'} | ID: {s.reg || 'N/A'}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[7px] font-black uppercase ${
                      isOut 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {isOut ? 'OFF-CAMPUS' : 'IN-DORM'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default WardenDashboard;
