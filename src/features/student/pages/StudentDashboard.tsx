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
  MapPin
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { getQrCodeUrl } from '../../../utils/qr';
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
  const { user, leaves, triggerSOS, cancelRequest, applyLeave } = useAppState();

  const [leaveType, setLeaveType] = useState('Short Exit (30m)');
  const [reason, setReason] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Modal state
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);

  if (!user) return null;

  const studentLeaves = leaves.filter((l) => l.stId === user.id);
  const pendingLeaves = studentLeaves.filter((l) => l.status === 'Pending');
  const approvedLeaves = studentLeaves.filter((l) => l.status === 'Approved');
  
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
      {/* 1. TOP PROFILE PROFILE SECTION */}
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
          <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
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
          
          {/* SASS OVERVIEW CARDS */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="glass-card p-6 rounded-2xl cursor-pointer"
            >
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Attendance Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-white">94%</span>
                <span className="text-[9px] text-emerald-400 font-extrabold flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +2%</span>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="glass-card p-6 rounded-2xl cursor-pointer"
            >
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Passes</p>
              <span className="text-3xl font-black tracking-tight text-white">
                {activeOutpass ? '1 OUT' : approvedLeaves.length > 0 ? '1 APPR' : 'NONE'}
              </span>
            </motion.div>
            <motion.div 
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="glass-card p-6 rounded-2xl cursor-pointer"
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

        </div>
      </div>

      {/* ACCESS TOKEN QR MODAL */}
      <Modal
        isOpen={selectedLeaveId !== null}
        onClose={() => setSelectedLeaveId(null)}
        title="Access Token"
      >
        {selectedLeaveId && (
          <div className="bg-white p-6 rounded-[3rem] mb-10">
            <img
              src={getQrCodeUrl(selectedLeaveId)}
              alt="QR Code Access Token"
              className="w-52 h-52 rounded-2xl mx-auto"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
export default StudentDashboard;
