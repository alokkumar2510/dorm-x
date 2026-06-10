'use client';

import React, { useState } from 'react';
import { useAppState } from '../../../context/AppContext';
import { 
  Flame, 
  FileText, 
  XCircle, 
  QrCode, 
  User, 
  Calendar, 
  Bell, 
  Volume2, 
  Clock, 
  TrendingUp,
  MapPin,
  Settings,
  Plus,
  Utensils,
  ChevronRight,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { downloadQrCode } from '../../../utils/qr';
import { QRCodeImage } from '../../../components/ui/QRCodeImage';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

// Mock attendance/presence analytics data
const ATTENDANCE_DATA = [
  { name: 'Jan', presence: 90 },
  { name: 'Feb', presence: 95 },
  { name: 'Mar', presence: 88 },
  { name: 'Apr', presence: 92 },
  { name: 'May', presence: 96 },
  { name: 'Jun', presence: 94 }
];

export const StudentDashboard: React.FC = () => {
  const { 
    user, leaves, triggerSOS, cancelRequest, applyLeave, 
    setActiveTab, showToast, complaints, feedbacks, 
    addComplaint, submitFeedback 
  } = useAppState();

  const [leaveType, setLeaveType] = useState('Short Exit (30m)');
  const [reason, setReason] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Complaint states
  const [compCategory, setCompCategory] = useState<'Electrical' | 'Plumbing' | 'Wi-Fi' | 'Mess' | 'Other'>('Electrical');
  const [compDesc, setCompDesc] = useState('');

  // Feedback states
  const [feedMeal, setFeedMeal] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');
  const [feedRating, setFeedRating] = useState(5);
  const [feedComment, setFeedComment] = useState('');
  
  // Modal state
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);

  // New Student Facility states
  const [macList, setMacList] = useState<string[]>(['00:1A:2B:3C:4D:5E']);
  const [newMac, setNewMac] = useState('');
  const [messMeal, setMessMeal] = useState('Dinner');
  const [messQrId, setMessQrId] = useState<string | null>(null);

  // Meal Reservation states
  const [reservedMeals, setReservedMeals] = useState<Record<string, 'Veg' | 'Non-Veg' | 'Sick Diet'>>({});
  const [bookingMealType, setBookingMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');
  const [bookingDiet, setBookingDiet] = useState<'Veg' | 'Non-Veg' | 'Sick Diet'>('Veg');

  const weeklyMenu = [
    { day: 'Monday', breakfast: 'Idli & Sambar Vada', lunch: 'Rice, Dal, Mix Veg, Curd', dinner: 'Tandoori Roti, Paneer Masala, Gulab Jamun' },
    { day: 'Tuesday', breakfast: 'Puri & Aloo Kasa', lunch: 'Rice, Fish Curry / Egg Curry', dinner: 'Roti, Dal Fry, Chicken Curry / Veg Kofta' },
    { day: 'Wednesday', breakfast: 'Upma & Ghuguni', lunch: 'Rice, Dalma, Bhindi Bhaja', dinner: 'Jeera Rice, Mushroom Curry, Salad' },
    { day: 'Thursday', breakfast: 'Masala Dosa & Sambar', lunch: 'Rice, Dal, Paneer Gravy, Papad', dinner: 'Roti, Dal Fry, Mix Veg Curry' },
    { day: 'Friday', breakfast: 'Aloo Paratha & Curd', lunch: 'Rice, Egg Masala / Veg Do Pyaza', dinner: 'Roti, Chicken Kadai / Mushroom Butter Masala' },
    { day: 'Saturday', breakfast: 'Puri & Chana Masala', lunch: 'Rice, Dal, Soya Chunk Curry', dinner: 'Fried Rice, Chilli Chicken / Veg Manchurian' },
    { day: 'Sunday', breakfast: 'Uttapam & Coconut Chutney', lunch: 'Special Rice, Chicken Curry / Paneer Jhal', dinner: 'Roti, Dal Tadka, Aloo Fry' },
  ];

  const handleMealReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const key = `${bookingMealType}-${today}`;
    setReservedMeals(prev => ({ ...prev, [key]: bookingDiet }));
    showToast(`Successfully Reserved ${bookingDiet} for ${bookingMealType} (${today})!`, 'success');
  };

  const addMac = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMac.trim() || macList.length >= 3) return;
    setMacList([...macList, newMac.toUpperCase().trim()]);
    setNewMac('');
    showToast('MAC Address Whitelisted', 'success');
  };

  const generateMessCoupon = () => {
    const couponId = `MESS-${Date.now()}`;
    setMessQrId(couponId);
    showToast('Mess Coupon QR Generated', 'success');
  };

  if (!user) return null;

  const studentLeaves = leaves.filter((l) => l.stId === user.id);
  const pendingLeaves = studentLeaves.filter((l) => l.status === 'Pending');
  const approvedLeaves = studentLeaves.filter((l) => l.status === 'Approved');
  const studentComplaints = (complaints || []).filter((c) => c.studentId === user.id);
  
  // Find active outpass (student has exited but not yet returned)
  const activeOutpass = studentLeaves.find((l) => l.exitTime && !l.entryTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyLeave(leaveType, reason, fromDate, toDate);
    setReason('');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="space-y-8 text-white">
      {/* 1. TOP PROFILE SECTION */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <User className="w-40 h-40" />
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/10">
            <span className="text-2xl font-black italic uppercase">
              {user.name.slice(0, 2)}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">{user.name}</h2>
            <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mt-1">
              ID: {user.reg || 'SYSTEM ADMIN'} | Node Room: {user.room || 'N/A'}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2 uppercase font-black">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Hostel Block: {user.hostel || 'N/A'}
            </div>
          </div>
        </div>

        {/* SOS button */}
        <div className="flex items-center relative z-10">
          <button
            onClick={triggerSOS}
            className="sos-ripple flex items-center gap-3 bg-red-600/90 hover:bg-red-600 text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <Flame className="w-4 h-4 animate-bounce" /> Trigger SOS Protocol
          </button>
        </div>
      </motion.div>

      {/* 2. THREE-PANEL CORE GRID */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: STATS AND LEAVE REQUEST */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* STATS OVERVIEW CARDS (SECURED: Warden redirection removed) */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="glass-card p-6 rounded-2xl border-white/5 transition-all duration-200"
            >
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Attendance Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-white">94%</span>
                <span className="text-[9px] text-emerald-400 font-extrabold flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +2%</span>
              </div>
            </motion.div>
            <motion.div 
              onClick={() => setActiveTab('Student QR Wallet')}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="glass-card p-6 rounded-2xl cursor-pointer border-white/5 hover:border-cyan-500/30 transition-all duration-200"
            >
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Passes</p>
              <span className="text-3xl font-black tracking-tight text-white">
                {activeOutpass ? '1 OUT' : approvedLeaves.length > 0 ? '1 APPR' : 'NONE'}
              </span>
            </motion.div>
            <motion.div 
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="glass-card p-6 rounded-2xl border-white/5 transition-all duration-200"
            >
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Requests</p>
              <span className="text-3xl font-black tracking-tight text-white">{studentLeaves.length}</span>
            </motion.div>
          </div>

          {/* ATTENDANCE ANALYTICS CHART */}
          <div className="glass-panel p-8 rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">
                Attendance & Presence Analytics
              </h3>
              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-bold text-slate-400">
                6-Month Trend
              </span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ATTENDANCE_DATA}>
                  <defs>
                    <linearGradient id="colorPresence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis domain={[80, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="presence" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorPresence)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* REQUEST FORM */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden"
          >
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-white mb-6">
              Request Outpass Access
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Outpass Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full p-4 rounded-xl outline-none font-bold text-xs bg-white/5 border border-white/10 text-white"
                  >
                    <option className="bg-slate-900 text-white">Short Exit (30m)</option>
                    <option className="bg-slate-900 text-white">Standard Outpass</option>
                    <option className="bg-slate-900 text-white">Night Leave</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Event Descriptor</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for leaving campus"
                    required
                    className="w-full p-4 rounded-xl outline-none text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Departure Date-Time</label>
                  <input
                    type="datetime-local"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                    className="w-full p-4 rounded-xl outline-none text-xs bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Estimated Return Date-Time</label>
                  <input
                    type="datetime-local"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                    className="w-full p-4 rounded-xl outline-none text-xs bg-white/5 border border-white/10 text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-white text-black font-black rounded-xl text-xs uppercase tracking-widest shadow-lg hover:bg-slate-100 transition-all cursor-pointer mt-2"
              >
                Transmit Protocol Request
              </button>
            </form>
          </motion.div>

          {/* OUTPASS REQUEST HISTORY TRACKER */}
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-4">
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00E5FF]" /> Outpass Tracker & Travel Ledger
            </h3>
            {studentLeaves.length === 0 ? (
              <p className="text-[10px] text-slate-500 py-6 uppercase font-bold text-center">No travel passes filed</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 log-scroll">
                {[...studentLeaves].reverse().map(l => (
                  <div key={l.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-white">{l.type}</span>
                        <span className="text-[8px] text-slate-500 font-mono">#{l.id}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Reason: {l.reason}</p>
                      <p className="text-[9px] text-slate-500">Validity: {l.dateRange}</p>
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase self-start md:self-auto ${
                        l.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        l.status === 'Pending' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        l.status === 'EMERGENCY' ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {l.status}
                      </span>
                      {l.exitTime && (
                        <p className="text-[8px] text-amber-500 font-bold uppercase">Exit: {new Date(l.exitTime).toLocaleString()}</p>
                      )}
                      {l.entryTime && (
                        <p className="text-[8px] text-emerald-400 font-bold uppercase">Entry: {new Date(l.entryTime).toLocaleString()}</p>
                      )}
                      {!l.exitTime && l.status === 'Pending' && (
                        <button
                          onClick={() => cancelRequest(l.id)}
                          className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[7px] font-black uppercase rounded cursor-pointer transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MESS MENU & MEAL RESERVATION PANEL */}
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#00FFB2]" /> Weekly Dining Menu & Reservation
              </h3>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[8px] font-black uppercase">
                Hostel Mess A
              </span>
            </div>

            {/* Menu List */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Day</th>
                    <th className="py-2.5 px-3">Breakfast</th>
                    <th className="py-2.5 px-3">Lunch</th>
                    <th className="py-2.5 px-3">Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyMenu.map((m, idx) => {
                    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const isToday = m.day === todayName;
                    return (
                      <tr 
                        key={idx} 
                        className={`border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors font-semibold text-slate-300 ${
                          isToday ? 'bg-indigo-950/20 border-indigo-500/20 text-white font-extrabold' : ''
                        }`}
                      >
                        <td className="py-3 px-3 uppercase text-[10px]">
                          {m.day} {isToday && <span className="ml-1 px-1 py-0.5 rounded bg-indigo-500 text-white text-[7px] font-black">Today</span>}
                        </td>
                        <td className="py-3 px-3 text-[10px] text-slate-400">{m.breakfast}</td>
                        <td className="py-3 px-3 text-[10px] text-slate-400">{m.lunch}</td>
                        <td className="py-3 px-3 text-[10px] text-slate-400">{m.dinner}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Reservation Form */}
            <form onSubmit={handleMealReservation} className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <p className="text-[10px] font-black uppercase text-slate-400">Meal Reservation & Sick Diet Requests</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500">Select Meal</label>
                  <select
                    value={bookingMealType}
                    onChange={(e) => setBookingMealType(e.target.value as any)}
                    className="w-full p-3.5 rounded-xl outline-none font-bold text-xs bg-[#030712] border border-white/10 text-white"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500">Diet Preference</label>
                  <select
                    value={bookingDiet}
                    onChange={(e) => setBookingDiet(e.target.value as any)}
                    className="w-full p-3.5 rounded-xl outline-none font-bold text-xs bg-[#030712] border border-white/10 text-white"
                  >
                    <option value="Veg">Veg (Standard)</option>
                    <option value="Non-Veg">Non-Veg (If Scheduled)</option>
                    <option value="Sick Diet">Sick Diet (Khichdi & Curd)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#00FFB2] hover:bg-[#00FFB2]/85 text-black font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Book Meal
                  </button>
                </div>
              </div>

              {/* Reserved meals list */}
              {Object.keys(reservedMeals).length > 0 && (
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Booked Meals & Reservations</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(reservedMeals).map(([mealKey, pref]) => (
                      <span key={mealKey} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-slate-300 uppercase">
                        {mealKey.split('-')[0]}: <strong className="text-[#00FFB2]">{pref}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* MAINTENANCE COMPLAINTS PANEL */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden text-left"
          >
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" /> Lodge Maintenance Complaint
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              addComplaint(compCategory, compDesc);
              setCompDesc('');
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Category</label>
                  <select
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value as any)}
                    className="w-full p-4 rounded-xl outline-none font-bold text-xs bg-[#030712] border border-white/10 text-white"
                  >
                    <option value="Electrical" className="bg-slate-900">Electrical</option>
                    <option value="Plumbing" className="bg-slate-900">Plumbing</option>
                    <option value="Wi-Fi" className="bg-slate-900">Wi-Fi</option>
                    <option value="Mess" className="bg-slate-900">Mess</option>
                    <option value="Other" className="bg-slate-900">Other</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Issue Description</label>
                  <input
                    type="text"
                    value={compDesc}
                    onChange={(e) => setCompDesc(e.target.value)}
                    placeholder="Describe the maintenance issue..."
                    required
                    className="w-full p-4 rounded-xl outline-none text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg transition-all cursor-pointer"
              >
                Submit Maintenance Complaint
              </button>
            </form>

            {/* Complaints list */}
            {studentComplaints.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Your Complaints</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 log-scroll">
                  {studentComplaints.map(c => (
                    <div key={c.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white uppercase">{c.category}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{c.description}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        c.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        c.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* MESS FEEDBACK PANEL */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden text-left"
          >
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-white mb-6 flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#00FFB2]" /> Dining Meal Feedback
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              submitFeedback(feedMeal, feedRating, feedComment);
              setFeedComment('');
              setFeedRating(5);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Meal</label>
                  <select
                    value={feedMeal}
                    onChange={(e) => setFeedMeal(e.target.value as any)}
                    className="w-full p-4 rounded-xl outline-none font-bold text-xs bg-[#030712] border border-white/10 text-white"
                  >
                    <option value="Breakfast" className="bg-slate-900">Breakfast</option>
                    <option value="Lunch" className="bg-slate-900">Lunch</option>
                    <option value="Dinner" className="bg-slate-900">Dinner</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Rating</label>
                  <div className="flex gap-1 pt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedRating(star)}
                        className={`text-xl cursor-pointer ${
                          star <= feedRating ? 'text-amber-400' : 'text-slate-600'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Comments</label>
                  <input
                    type="text"
                    value={feedComment}
                    onChange={(e) => setFeedComment(e.target.value)}
                    placeholder="E.g., food was good"
                    className="w-full p-4 rounded-xl outline-none text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full py-4 bg-[#00FFB2] hover:bg-[#00FFB2]/85 text-black font-black rounded-xl text-xs uppercase tracking-widest shadow-lg transition-all cursor-pointer"
              >
                Submit Dining Feedback
              </button>
            </form>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: WALLET, NOTIFICATIONS, TIMELINE */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* QR PASS WALLET CARD */}
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="glass-panel p-6 rounded-[2.5rem] relative overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950/20 border-cyan-500/20 shadow-xl"
          >
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-cyan-400" /> Active Pass Wallet
            </h3>
            {approvedLeaves.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-wider text-[10px] border border-dashed border-white/5 rounded-2xl bg-black/20">
                No active approved tokens
              </div>
            ) : (
              <div className="p-6 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden">
                <div className="laser-line"></div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-extrabold text-white text-lg uppercase leading-none mb-1">
                      {approvedLeaves[0].type}
                    </h4>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                      Pass ID: {approvedLeaves[0].id}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase">
                    Authorized
                  </span>
                </div>
                
                <div className="text-[10px] font-bold text-slate-400 uppercase space-y-2 mb-6">
                  <p><span className="text-slate-600">Period:</span> {approvedLeaves[0].dateRange}</p>
                  <p><span className="text-slate-600">Reason:</span> {approvedLeaves[0].reason}</p>
                </div>

                {!approvedLeaves[0].exitTime ? (
                  <button
                    onClick={() => setSelectedLeaveId(approvedLeaves[0].id)}
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" /> Expand QR token
                  </button>
                ) : (
                  <div className="text-center p-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase text-amber-400 tracking-wider">
                    Exit Logged: Outside Facility
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* ANNOUNCEMENT BOARD */}
          <div className="glass-panel p-6 rounded-[2.5rem]">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-500" /> Announcements
            </h3>
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.08 } }
              }}
              className="space-y-3"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                }}
                className="p-4 bg-white/5 rounded-xl border border-white/5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[7px] font-black uppercase">Admin</span>
                  <p className="text-[10px] font-black text-white">Water Line Maintenance</p>
                </div>
                <p className="text-[9px] text-slate-400 leading-relaxed font-bold">
                  Water supply will be suspended in Pulaha block from 11 PM to 2 AM tonight for repairs.
                </p>
              </motion.div>
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                }}
                className="p-4 bg-white/5 rounded-xl border border-white/5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[7px] font-black uppercase">Warden</span>
                  <p className="text-[10px] font-black text-white">Late Return Regulations</p>
                </div>
                <p className="text-[9px] text-slate-400 leading-relaxed font-bold">
                  Ensure all outpasses are scanned at the gates before 9:00 PM to avoid automatic system lockout alerts.
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* PERSONAL TIMELINE ACTIVITY */}
          <div className="glass-panel p-6 rounded-[2.5rem]">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Activity Timeline
            </h3>
            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 log-scroll">
              {studentLeaves.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                  Timeline Empty
                </div>
              ) : (
                studentLeaves.map((l) => (
                  <div key={l.id} className="flex gap-4 items-start relative pl-1">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#22d3ee]" />
                    <div className="text-[10px]">
                      <p className="font-black text-white uppercase">{l.type} - {l.status}</p>
                      <p className="text-slate-500 font-bold mt-0.5">{new Date(l.createdAt).toLocaleDateString()} {new Date(l.createdAt).toLocaleTimeString()}</p>
                      {l.exitTime && (
                        <p className="text-amber-500 font-bold mt-1">Exit Logged: {new Date(l.exitTime).toLocaleTimeString()}</p>
                      )}
                      {l.entryTime && (
                        <p className="text-emerald-500 font-bold mt-0.5">Entry Logged: {new Date(l.entryTime).toLocaleTimeString()}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MESS/DINING QR PASSES */}
          <div className="glass-panel p-6 rounded-[2.5rem] space-y-4">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#00FFB2]" /> Mess Meal Tokens
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={messMeal}
                  onChange={(e) => setMessMeal(e.target.value)}
                  className="flex-grow p-3 rounded-xl outline-none font-bold text-xs bg-white/5 border border-white/10 text-white"
                >
                  <option className="bg-slate-900">Breakfast</option>
                  <option className="bg-slate-900">Lunch</option>
                  <option className="bg-slate-900">Dinner</option>
                </select>
                <button
                  onClick={generateMessCoupon}
                  className="px-4 py-3 bg-[#00FFB2] hover:bg-[#00FFB2]/85 text-black font-black rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                >
                  Generate
                </button>
              </div>
              
              {messQrId && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3">
                  <div className="bg-white p-3 rounded-2xl">
                    <QRCodeImage
                      text={`DORMX_AUTH_${messQrId}`}
                      className="w-28 h-28"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-white uppercase">{messMeal} Token Active</p>
                    <p className="text-[7px] text-slate-500 font-mono mt-0.5">{messQrId}</p>
                  </div>
                  <button
                    onClick={() => downloadQrCode(messQrId, `${user.name}_MESS_${messMeal}`)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-[8px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Download Token
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* WI-FI MAC WHITELISTING */}
          <div className="glass-panel p-6 rounded-[2.5rem] space-y-4">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-400" /> Device MAC Whitelist ({macList.length}/3)
            </h3>
            <form onSubmit={addMac} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 00:1A:2B:3C:4D:5E"
                  value={newMac}
                  onChange={(e) => setNewMac(e.target.value)}
                  pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                  title="Please enter a valid MAC address (e.g. 00:1A:2B:3C:4D:5E)"
                  required
                  className="flex-grow p-3 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={macList.length >= 3}
                  className="px-4 py-3 bg-[#00E5FF] hover:bg-[#00E5FF]/85 disabled:bg-slate-800 disabled:text-slate-500 text-black font-black rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                >
                  Whitelist
                </button>
              </div>
              <div className="space-y-2">
                {macList.map((mac, mIdx) => (
                  <div key={mIdx} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center text-[10px] font-bold text-slate-300">
                    <span>{mac}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMacList(macList.filter((_, idx) => idx !== mIdx));
                        showToast('MAC Address Removed', 'warning');
                      }}
                      className="text-red-400 hover:text-red-500 text-[8px] font-black uppercase"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* ACCESS TOKEN QR MODAL */}
      <Modal
        isOpen={selectedLeaveId !== null}
        onClose={() => setSelectedLeaveId(null)}
        title="Access Token"
      >
        {selectedLeaveId && (
          <div className="flex flex-col items-center gap-6 pb-6">
            <div className="bg-white p-6 rounded-[3rem]">
              <QRCodeImage
                text={`DORMX_AUTH_${selectedLeaveId}`}
                className="w-52 h-52 rounded-2xl mx-auto"
              />
            </div>
            <button
              onClick={() => downloadQrCode(selectedLeaveId, user.name)}
              className="px-6 py-3 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black font-black rounded-xl text-xs uppercase tracking-widest cursor-pointer transition-all flex items-center gap-2"
            >
              Download Pass Image
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default StudentDashboard;
