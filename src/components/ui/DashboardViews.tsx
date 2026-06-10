'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/context/AppContext';
import { 
  Search, QrCode, FileText, Check, X, Shield, Users, 
  Bot, BarChart2, Bell, FileSpreadsheet, Settings, Terminal, 
  AlertTriangle, Lock, ShieldCheck, Play, Phone, ArrowRight,
  TrendingUp, Calendar, Clock, LockKeyhole, Cpu, RefreshCw,
  LogOut, LogIn, Plus, Send, HelpCircle, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getQrCodeUrl, downloadQrCode } from '@/utils/qr';

// Mock charts data
const ANALYTICS_TRENDS = [
  { name: 'Mon', passes: 24, emergencies: 0 },
  { name: 'Tue', passes: 35, emergencies: 1 },
  { name: 'Wed', passes: 18, emergencies: 0 },
  { name: 'Thu', passes: 45, emergencies: 2 },
  { name: 'Fri', passes: 68, emergencies: 0 },
  { name: 'Sat', passes: 92, emergencies: 1 },
  { name: 'Sun', passes: 75, emergencies: 0 }
];

// Helper to format date
const formatDateString = (isoString: string) => {
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/* ==========================================
   1. STUDENT QR WALLET VIEW
   ========================================== */
export const StudentQRWalletView: React.FC = () => {
  const { users, leaves } = useAppState();
  const [searchVal, setSearchVal] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('alok@2023btech001');

  const studentsList = [
    { id: 'alok@2023btech001', name: 'Alok Kumar', reg: '2023BTECH001', hostel: 'Pulaha', room: '302' },
    { id: 'neha@2023btech054', name: 'Neha Pani', reg: '2023BTECH054', hostel: 'Rohini', room: '102' }
  ];

  const filtered = studentsList.filter(s => 
    s.name.toLowerCase().includes(searchVal.toLowerCase()) || 
    s.reg.toLowerCase().includes(searchVal.toLowerCase())
  );

  const selectedStudent = studentsList.find(s => s.id === selectedStudentId) || studentsList[0];

  return (
    <div className="grid lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-5 glass-panel p-6 rounded-[2rem] space-y-4">
        <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Student Registry</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search students..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs text-white outline-none"
          />
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 log-scroll">
          {filtered.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStudentId(s.id)}
              className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${
                selectedStudent.id === s.id 
                  ? 'bg-[#00E5FF]/10 border-[#00E5FF]/20 text-white shadow-md' 
                  : 'bg-white/[0.01] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <div>
                <h4 className="text-xs font-black uppercase">{s.name}</h4>
                <p className="text-[9px] font-bold mt-1 text-slate-500 uppercase">{s.reg} | Room {s.room}</p>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col justify-center items-center">
        {selectedStudent && (
          <div className="w-[320px] glass-panel p-8 rounded-[2.5rem] border-white/10 relative overflow-hidden bg-gradient-to-b from-slate-900/50 to-transparent text-center space-y-6 shadow-2xl">
            {/* Header branding */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Dorm-X Security Card</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[#00FFB2] text-[7px] font-black uppercase">Active Link</span>
            </div>
            
            {/* Photo Avatar */}
            <div className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#00E5FF]/20 to-[#7C3AED]/20 border border-white/10 flex items-center justify-center text-3xl font-black text-white shadow-lg relative">
              {selectedStudent.name.slice(0, 2).toUpperCase()}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00FFB2] rounded-full border-4 border-[#030712] flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-[#030712] rounded-full" />
              </div>
            </div>

            {/* Details */}
            <div>
              <h3 className="text-lg font-black uppercase text-white tracking-tight">{selectedStudent.name}</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                REG: {selectedStudent.reg} | {selectedStudent.hostel} HOSTEL
              </p>
            </div>

            {/* Real QR Code */}
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-inner inline-block relative group">
                <img
                  src={getQrCodeUrl(selectedStudent.id)}
                  alt="Student QR Code"
                  className="w-32 h-32 rounded-lg"
                />
                <div className="absolute inset-0 bg-slate-950/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-[8px] text-white font-bold uppercase tracking-widest leading-relaxed">
                  Scan Pass Node at Gate Prime
                </div>
              </div>
              <button
                onClick={() => downloadQrCode(selectedStudent.id, selectedStudent.name)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[#00E5FF] border border-[#00E5FF]/20 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Download QR Code
              </button>
            </div>

            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
              Secured under Sentinel Core Protocol v2.7
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ==========================================
   2. LEAVE MANAGEMENT VIEW
   ========================================== */
export const LeaveManagementView: React.FC = () => {
  const { leaves, approve } = useAppState();

  const pending = leaves.filter(l => l.status === 'Pending');
  const processed = leaves.filter(l => l.status !== 'Pending');

  return (
    <div className="space-y-8 text-left">
      <div className="glass-panel p-6 rounded-[2rem] space-y-4">
        <h3 className="text-sm font-black uppercase text-[#00E5FF] tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4" /> Pending Outpass Approvals ({pending.length})
        </h3>
        
        {pending.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
            No pending outpass authorizations
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {pending.map(l => (
              <div key={l.id} className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black uppercase text-white">{l.stName}</h4>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">{l.stReg} | Room {l.stRoom}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase">
                    {l.type}
                  </span>
                </div>
                
                <div className="text-xs font-semibold text-slate-300">
                  <span className="text-[9px] font-black uppercase text-slate-500 block">Reason</span>
                  {l.reason}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-[8px] text-slate-500 font-bold uppercase">Validity: {l.dateRange}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => approve(l.id, 'Rejected')}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 rounded-lg text-[8px] font-black uppercase tracking-widest cursor-pointer transition-all"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => approve(l.id, 'Approved')}
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/25 border border-[#00FFB2]/20 text-[#00FFB2] rounded-lg text-[8px] font-black uppercase tracking-widest cursor-pointer transition-all"
                    >
                      Authorize
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel p-6 rounded-[2rem] space-y-4">
        <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" /> Historic Outpass Logs ({processed.length})
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Pass Type</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Validity Period</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {processed.map(l => (
                <tr key={l.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors font-semibold text-slate-300">
                  <td className="py-4 px-4">
                    <p className="text-white font-extrabold uppercase">{l.stName}</p>
                    <p className="text-[8px] text-slate-500 uppercase">{l.stReg}</p>
                  </td>
                  <td className="py-4 px-4 uppercase text-slate-400 font-bold">{l.type}</td>
                  <td className="py-4 px-4 text-slate-300 max-w-xs truncate">{l.reason}</td>
                  <td className="py-4 px-4 text-slate-400">{l.dateRange}</td>
                  <td className="py-4 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      l.status === 'Approved' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   3. WARDEN COMMAND VIEW
   ========================================== */
export const WardenCommandView: React.FC = () => {
  const { sys, toggleLockdown, toggleCrowd } = useAppState();
  const [curfew, setCurfew] = useState('9:00 PM');

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-12 gap-8 text-left">
        <div className="lg:col-span-5 glass-panel p-6 rounded-[2rem] space-y-6">
          <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">System Control Nodes</h3>
          
          <div className="space-y-4">
            <div className={`p-5 rounded-2xl border transition-all ${
              sys.lockdown 
                ? 'bg-red-950/20 border-red-500/30' 
                : 'bg-white/[0.01] border-white/5'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black uppercase text-white">Curfew Lockdown Mode</h4>
                  <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase">Instant Gate Locking Cipher Activation</p>
                </div>
                <button 
                  onClick={toggleLockdown}
                  className={`w-12 h-6 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
                    sys.lockdown ? 'bg-red-500' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all transform ${
                    sys.lockdown ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              {sys.lockdown && (
                <p className="text-[8px] text-red-400 font-extrabold uppercase mt-3 animate-pulse">
                  🚨 System Lockdown Active: All NFC/QR reader nodes offline.
                </p>
              )}
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${
              sys.crowd 
                ? 'bg-amber-950/20 border-amber-500/30' 
                : 'bg-white/[0.01] border-white/5'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black uppercase text-white">Gate Crowding Standby</h4>
                  <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase">Curfew Curate Scan Throttling</p>
                </div>
                <button 
                  onClick={toggleCrowd}
                  className={`w-12 h-6 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
                    sys.crowd ? 'bg-amber-500' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all transform ${
                    sys.crowd ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              {sys.crowd && (
                <p className="text-[8px] text-amber-400 font-extrabold uppercase mt-3 animate-pulse">
                  ⚠️ Throttling Enabled: Scan spacing limits set to 15s.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Default Curfew Cutoff</label>
            <select 
              value={curfew}
              onChange={(e) => setCurfew(e.target.value)}
              className="w-full p-4 rounded-xl outline-none font-bold text-xs bg-white/5 border border-white/10 text-white"
            >
              <option value="8:00 PM" className="bg-slate-950">8:00 PM curfew</option>
              <option value="9:00 PM" className="bg-slate-950">9:00 PM curfew (standard)</option>
              <option value="10:00 PM" className="bg-slate-950">10:00 PM curfew</option>
            </select>
          </div>
        </div>

        <div className="lg:col-span-7 glass-panel p-6 rounded-[2rem] space-y-4">
          <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Campus Occupancy Detail</h3>
          <div className="space-y-4">
            {[
              { block: 'Block A (Boys)', cap: 350, occ: 343, percent: 98, color: 'bg-red-500' },
              { block: 'Block B (Girls)', cap: 280, occ: 257, percent: 92, color: 'bg-emerald-400' },
              { block: 'Block G (Girls)', cap: 420, occ: 386, percent: 92, color: 'bg-emerald-400' }
            ].map((b, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-black uppercase">
                  <span className="text-white">{b.block}</span>
                  <span className="text-slate-400">{b.occ} / {b.cap} ({b.percent}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div className={`h-full ${b.color} rounded-full`} style={{ width: `${b.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Overdue Curfew Violators & Dining stats */}
      <div className="grid lg:grid-cols-12 gap-8 text-left">
        {/* Overdue Curfew Violators */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-[2rem] space-y-4">
          <h3 className="text-sm font-black uppercase text-red-400 tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" /> Curfew Violators (Overdue)
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Rohan Dev', reg: '2023BTECH003', room: '201', exitTime: '7:15 PM', expected: '9:00 PM', timeDiff: 'Overdue by 15 mins' },
              { name: 'Sameer Sen', reg: '2023BTECH014', room: '104', exitTime: '6:50 PM', expected: '9:00 PM', timeDiff: 'Overdue by 40 mins' }
            ].map((v, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-red-950/5 border border-red-500/20 flex justify-between items-center text-xs font-semibold">
                <div>
                  <p className="text-white font-extrabold uppercase">{v.name}</p>
                  <p className="text-[8px] text-slate-500 uppercase mt-0.5">{v.reg} | Room {v.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-red-400 font-black uppercase">{v.timeDiff}</p>
                  <p className="text-[7.5px] text-slate-500 font-bold uppercase mt-0.5">Exited: {v.exitTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dining Stats */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-[2rem] space-y-4">
          <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00E5FF]" /> Mess Dining Scan Analytics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Dinner Claims Today</p>
              <p className="text-xl font-black text-white mt-1">412 / 650</p>
              <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden mt-2">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '63%' }} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Average Scan Latency</p>
              <p className="text-xl font-black text-white mt-1">2.8 sec</p>
              <p className="text-[7px] text-[#00E5FF] font-black uppercase mt-2">NFC scanner active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   4. SECURITY CENTER VIEW
   ========================================== */
export const SecurityCenterView: React.FC = () => {
  const { logistics, addDelivery, exitLogis, showToast } = useAppState();
  const [vendor, setVendor] = useState('');
  const [agent, setAgent] = useState('');

  // CCTV Interactive controls state
  const [selectedCam, setSelectedCam] = useState<string | null>(null);
  const [nightVision, setNightVision] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [targetLock, setTargetLock] = useState(true);

  // New Security facility integrations
  const [vehicles, setVehicles] = useState<Array<{ id: string; plate: string; driver: string; time: string }>>([
    { id: '1', plate: 'OD-02-X-9988', driver: 'Rahul Sahu (Mess Staff)', time: new Date().toISOString() }
  ]);
  const [vehNo, setVehNo] = useState('');
  const [driver, setDriver] = useState('');
  const [scanningFace, setScanningFace] = useState(false);
  const [scanResult, setScanResult] = useState(false);

  const handleCourierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor.trim() || !agent.trim()) return;
    addDelivery(vendor, agent);
    setVendor('');
    setAgent('');
  };

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehNo.trim() || !driver.trim()) return;
    setVehicles([...vehicles, {
      id: Date.now().toString(),
      plate: vehNo.toUpperCase().trim(),
      driver: driver.trim(),
      time: new Date().toISOString()
    }]);
    setVehNo('');
    setDriver('');
    showToast('Vehicle Entry Logged', 'success');
  };

  const exitVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    showToast('Vehicle Exit Checked', 'warning');
  };

  const simulateFaceScan = () => {
    setScanningFace(true);
    setScanResult(false);
    setTimeout(() => {
      setScanningFace(false);
      setScanResult(true);
      showToast('Visitor Biometrics Match: 98.4%', 'success');
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-12 gap-8 text-left">
      {/* CCTV Mock Grid */}
      <div className="lg:col-span-8 space-y-4">
        <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" /> Active Video Sentinel Feeds (Click to expand)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {['Gate A Main Entrance', 'Gate B Secondary Exit', 'Hostel A Quadrangle', 'Main Gate Vehicle Loop'].map((cam, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedCam(cam)}
              className="relative h-40 bg-[#050b18] rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center group cursor-pointer hover:border-cyan-500/40 transition-all duration-300"
            >
              <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 px-2 py-0.5 rounded bg-black/60 text-[7.5px] font-black uppercase text-white tracking-widest border border-white/5">
                <span className="w-1.5 h-1.5 bg-[#00FFB2] rounded-full animate-ping" />
                <span>CAM-0{i+1}: {cam}</span>
              </div>
              {/* Scan Line effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00E5FF]/5 to-transparent h-1/2 w-full animate-pulse" />
              {/* Camera Icon placeholder */}
              <Terminal className="w-8 h-8 text-slate-800 group-hover:text-cyan-500/20 transition-all animate-pulse" />
              <div className="absolute bottom-3 right-3 text-[7px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                LIVE OVERLAY
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logistics and deliveries */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-panel p-5 rounded-[2rem] space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Courier Registry</h3>
          <form onSubmit={handleCourierSubmit} className="space-y-3">
            <input 
              type="text" 
              placeholder="Vendor (e.g. Amazon, Bluedart)" 
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full p-3 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none"
            />
            <input 
              type="text" 
              placeholder="Delivery Agent Name / ID" 
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
              className="w-full p-3 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none"
            />
            <button 
              type="submit"
              className="w-full py-3 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black font-black rounded-xl text-[9px] uppercase tracking-widest cursor-pointer transition-all"
            >
              Log Entry
            </button>
          </form>
        </div>

        <div className="glass-panel p-5 rounded-[2rem] space-y-3">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Active Courier Nodes</h4>
          {logistics.filter(l => !l.exitTime).length === 0 ? (
            <p className="text-[9.5px] text-slate-500 font-bold uppercase py-6 text-center">No active package deliveries</p>
          ) : (
            <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1 log-scroll">
              {logistics.filter(l => !l.exitTime).map(l => (
                <div key={l.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center">
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-white">{l.vendor}</h5>
                    <p className="text-[7.5px] text-slate-500 font-bold mt-0.5">Agent: {l.agent}</p>
                  </div>
                  <button 
                    onClick={() => exitLogis(l.id)}
                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[7px] font-black uppercase rounded-lg cursor-pointer"
                  >
                    Logged Exit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CCTV Live overlay feed modal */}
      {selectedCam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl p-6 rounded-[2.5rem] border-white/10 relative overflow-hidden bg-[#030712]/90 flex flex-col justify-between shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shrink-0" />
                <h4 className="text-xs font-black uppercase text-white tracking-wider">SECURE LINK FEED: {selectedCam}</h4>
              </div>
              <button 
                onClick={() => setSelectedCam(null)}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className={`relative aspect-video rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between p-4 transition-all duration-300 ${
              nightVision 
                ? 'bg-[radial-gradient(circle,rgba(16,185,129,0.15)_0%,rgba(0,0,0,1)_100%)] text-emerald-400 border-emerald-500/20' 
                : 'bg-[radial-gradient(circle,rgba(0,229,255,0.06)_0%,rgba(0,0,0,1)_100%)] text-white'
            }`}>
              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none" />
              
              {/* Top status */}
              <div className="flex justify-between items-start relative z-10 text-[8px] font-mono font-bold tracking-widest uppercase">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" /> 
                  LIVE RECORDING
                </span>
                <span>TELEMETRY LINK: STABLE</span>
              </div>

              {/* Middle UI graphic / zoom level */}
              <div className="flex flex-col items-center justify-center relative z-10 flex-grow pointer-events-none">
                <div className="border border-white/10 w-24 h-24 rounded-full flex items-center justify-center animate-spin-slow">
                  <div className="border border-dashed border-white/20 w-16 h-16 rounded-full" />
                </div>
                {targetLock && (
                  <div className="absolute p-2 border border-red-500/30 bg-red-950/20 rounded-lg text-[7px] font-black uppercase tracking-widest text-red-400 flex items-center gap-1 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> Target Locked: Residents verified
                  </div>
                )}
              </div>

              {/* Bottom status */}
              <div className="flex justify-between items-end relative z-10 text-[8px] font-mono font-bold tracking-widest uppercase">
                <span>FPS: 30.00 // LATENCY: 12ms</span>
                <span>ZOOM: {zoom}X</span>
              </div>
            </div>

            {/* Camera Control panel */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">LENS ZOOM LEVEL</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setZoom(z => Math.max(1, z - 1))}
                    disabled={zoom === 1}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-white rounded-lg text-[9px] font-black uppercase cursor-pointer"
                  >
                    Zoom -
                  </button>
                  <button 
                    onClick={() => setZoom(z => Math.min(8, z + 1))}
                    disabled={zoom === 8}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-white rounded-lg text-[9px] font-black uppercase cursor-pointer"
                  >
                    Zoom +
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">NIGHT VISION SPECTRAL</span>
                <button 
                  onClick={() => setNightVision(!nightVision)}
                  className={`py-2 border rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                    nightVision 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {nightVision ? 'Disable NVG' : 'Enable NVG'}
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">SENTINEL LOCKING CUES</span>
                <button 
                  onClick={() => setTargetLock(!targetLock)}
                  className={`py-2 border rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                    targetLock 
                      ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {targetLock ? 'Disable Lock' : 'Enable Lock'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      </div>

      {/* Row 2: Vehicle entry registry & Visitor face match */}
      <div className="grid lg:grid-cols-12 gap-8 text-left font-sans mt-8">
        {/* Vehicle Entry Logs */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-[2rem] space-y-4">
          <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00E5FF]" /> Vehicle Gate Sentinel Logs
          </h3>
          
          {/* Form */}
          <form onSubmit={handleVehicleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Plate Number (e.g. OD-02-Y-9988)"
              value={vehNo}
              onChange={(e) => setVehNo(e.target.value)}
              required
              className="p-3 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none"
            />
            <input
              type="text"
              placeholder="Driver Name & Purpose"
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              required
              className="p-3 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none"
            />
            <button
              type="submit"
              className="py-3 bg-[#00E5FF] hover:bg-[#00E5FF]/85 text-black font-black rounded-xl text-[10px] uppercase tracking-widest cursor-pointer transition-all"
            >
              Log Vehicle
            </button>
          </form>

          {/* List */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-3">Vehicle No</th>
                  <th className="py-2.5 px-3">Driver / Purpose</th>
                  <th className="py-2.5 px-3">Entry Time</th>
                  <th className="py-2.5 px-3 text-right">Gate Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors font-semibold text-slate-300">
                    <td className="py-3 px-3 text-white font-extrabold uppercase">{v.plate}</td>
                    <td className="py-3 px-3">{v.driver}</td>
                    <td className="py-3 px-3 text-slate-400">{formatDateString(v.time)}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => exitVehicle(v.id)}
                        className="px-2 py-0.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[7px] font-black uppercase rounded cursor-pointer"
                      >
                        Log Exit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visitor Face Match Scanner Simulator */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-[2rem] space-y-4">
          <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Face Biometrics Sync
          </h3>
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4 text-center">
            <div className="relative w-28 h-28 mx-auto rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
              {scanningFace ? (
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,229,255,0.2)_0%,transparent_100%)] flex items-center justify-center">
                  <div className="w-20 h-20 border-2 border-dashed border-[#00E5FF] rounded-full animate-spin" />
                  <span className="absolute text-[8px] font-black text-[#00E5FF] uppercase tracking-widest">SCANNING</span>
                </div>
              ) : scanResult ? (
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(16,185,129,0.2)_0%,transparent_100%)] flex flex-col items-center justify-center p-2 text-emerald-400">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 animate-bounce" />
                  <span className="text-[7.5px] font-black uppercase tracking-widest mt-1">MATCH VERIFIED</span>
                  <span className="text-[6.5px] text-slate-500 mt-0.5">Confidence: 98.4%</span>
                </div>
              ) : (
                <Users className="w-10 h-10 text-slate-700 animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-[9.5px] font-black text-white uppercase">Visitor Biometric Verification</p>
              <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Align visitor to primary camera frame node</p>
            </div>
            <button
              onClick={simulateFaceScan}
              disabled={scanningFace}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-black font-black rounded-xl text-[9px] uppercase tracking-widest transition-all cursor-pointer"
            >
              Scan & Verify Biometrics
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

/* ==========================================
   5. PARENT PORTAL VIEW
   ========================================== */
export const ParentPortalView: React.FC = () => {
  const { parentLogCall } = useAppState();

  const [activeCall, setActiveCall] = useState<{ name: string; number: string } | null>(null);
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [callTimer, setCallTimer] = useState(0);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [muteOn, setMuteOn] = useState(false);

  useEffect(() => {
    if (!activeCall) return;
    let timer: NodeJS.Timeout;
    let interval: NodeJS.Timeout;
    
    if (callStatus === 'connecting') {
      timer = setTimeout(() => setCallStatus('ringing'), 1500);
    } else if (callStatus === 'ringing') {
      timer = setTimeout(() => setCallStatus('connected'), 2000);
    } else if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [activeCall, callStatus]);

  const startCall = (name: string, number: string) => {
    setActiveCall({ name, number });
    setCallStatus('connecting');
    setCallTimer(0);
    setSpeakerOn(false);
    setMuteOn(false);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-5 glass-panel p-6 rounded-[2rem] space-y-6">
        <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Parent Communications</h3>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
          Simulated Parent-Child secure notification dispatch
        </p>
        <div className="space-y-3">
          <button 
            onClick={parentLogCall}
            className="w-full p-4 bg-slate-900 border border-white/10 hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-widest text-[#00E5FF] rounded-xl cursor-pointer flex items-center justify-between"
          >
            <span>Notify Child Node</span>
            <Phone className="w-4 h-4" />
          </button>
          <button 
            onClick={() => startCall('Hostel Warden (Dr. Giri)', '+91 94372 82811')}
            className="w-full p-4 bg-slate-900 border border-white/10 hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-widest text-slate-300 rounded-xl cursor-pointer flex items-center justify-between"
          >
            <span>Call Warden Office</span>
            <Phone className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 glass-panel p-6 rounded-[2rem] space-y-4">
        <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Campus Bulletins</h3>
        <div className="space-y-4">
          <div className="pb-4 border-b border-white/5 last:border-none">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">June 9, 2026</span>
            <h4 className="text-xs font-black text-white uppercase mt-0.5">Vaccination Drive Sync</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">
              Booster update records must be synchronized with the block office within next week.
            </p>
          </div>
          <div className="pb-4 border-b border-white/5 last:border-none">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">June 5, 2026</span>
            <h4 className="text-xs font-black text-white uppercase mt-0.5">Security Hardware Tested</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">
              Curfew NFC Readers calibrated successfully. All gates reporting 100% telemetry status.
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Call Screen Overlay */}
      {activeCall && (
        <div className="fixed inset-0 bg-[#030712]/95 backdrop-blur-xl z-50 flex flex-col justify-between p-12 text-center text-white">
          <div className="absolute top-8 left-8 text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> Secure Trunk Connected
          </div>

          {/* Call Header */}
          <div className="mt-20 space-y-4">
            <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center shadow-2xl">
              {callStatus === 'ringing' && (
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30 animate-ping" />
              )}
              <Phone className="w-12 h-12 text-cyan-400" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-3xl font-black uppercase tracking-tight text-white mt-4">{activeCall.name}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{activeCall.number}</p>
            </div>

            <div className="text-sm font-extrabold text-cyan-400 uppercase tracking-widest pt-2">
              {callStatus === 'connecting' && 'Connecting secure trunk...'}
              {callStatus === 'ringing' && 'Ringing...'}
              {callStatus === 'connected' && (
                <span>
                  CONNECTED • {Math.floor(callTimer / 60)}:{(callTimer % 60).toString().padStart(2, '0')}
                </span>
              )}
              {callStatus === 'ended' && 'Call ended'}
            </div>
          </div>

          {/* Control Options */}
          <div className="max-w-xs mx-auto w-full grid grid-cols-2 gap-4">
            <button 
              onClick={() => setMuteOn(!muteOn)}
              className={`py-4 border rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                muteOn 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              {muteOn ? 'Unmute' : 'Mute'}
            </button>
            <button 
              onClick={() => setSpeakerOn(!speakerOn)}
              className={`py-4 border rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                speakerOn 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              {speakerOn ? 'Speaker Off' : 'Speaker'}
            </button>
          </div>

          {/* End Call Button */}
          <div className="mb-20">
            <button 
              onClick={() => {
                setCallStatus('ended');
                setTimeout(() => setActiveCall(null), 1000);
              }}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20 active:scale-95 transition-all cursor-pointer mx-auto"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================
   6. AI ASSISTANT VIEW
   ========================================== */
export const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    {
      role: 'assistant',
      content: `### 🤖 Sentinel AI Main Core
Welcome to the DORM-X AI Assistant panel. You can query campus outpass statistics, check policy updates, or simulate gate telemetry logs.

Try asking me:
- **"What is the outpass curfew rule?"**
- **"Generate system status statistics"**`
    }
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user' as const, content: text };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    setTimeout(() => {
      let reply = '';
      const q = text.toLowerCase();
      if (q.includes('curfew') || q.includes('rule') || q.includes('outpass')) {
        reply = `### ⏰ Curfew Policy Updates
- **Standard Curfew**: 9:00 PM daily.
- **Short Exit**: Requires warden token with 30-minute default duration.
- **Late Return**: Triggers automatic escalations to Parent & Warden consoles.`;
      } else if (q.includes('status') || q.includes('stat') || q.includes('generate')) {
        reply = `### 📊 Real-Time Operations Telemetry
- **Total Residents**: 1,248
- **Active Outpasses**: 32 (Approved)
- **Active Emergencies**: 0
- **NFC Reader Standby**: 100% Online`;
      } else {
        reply = `I am DORM-X Sentinel AI. I supervise digital outpass workflows, check parent communication ciphers, and deliver live telemetry logs.`;
      }
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="glass-panel rounded-[2rem] border-white/10 overflow-hidden flex flex-col h-[520px] text-left max-w-4xl mx-auto shadow-2xl">
      {/* Header */}
      <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-[#00E5FF]" />
          <div>
            <h4 className="text-xs font-black uppercase text-white">Sentinel AI Chat Console</h4>
            <p className="text-[8px] text-[#00FFB2] font-black uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#00FFB2] rounded-full animate-ping" /> Online Core
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-black/10 log-scroll">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-[10px] leading-relaxed font-semibold ${
              m.role === 'user' 
                ? 'bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-white rounded-br-none' 
                : 'bg-white/[0.02] border border-white/5 text-slate-300 rounded-bl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <span className="text-[9px] uppercase tracking-widest text-[#00E5FF] animate-pulse font-black">
              AI Thinks...
            </span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white/[0.01] border-t border-white/5 flex gap-2">
        <input 
          type="text" 
          placeholder="Ask Sentinel AI policies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(query)}
          className="flex-grow bg-white/5 border border-white/10 outline-none text-[10px] font-bold py-3 px-4 rounded-xl text-white" 
        />
        <button 
          onClick={() => handleSend(query)}
          className="w-11 h-11 bg-white hover:bg-slate-100 text-black rounded-xl flex items-center justify-center cursor-pointer transition-all shrink-0"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ==========================================
   7. ANALYTICS VIEW
   ========================================== */
export const AnalyticsView: React.FC = () => {
  return (
    <div className="space-y-8 text-left">
      <div className="glass-panel p-6 rounded-[2rem] space-y-4">
        <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Weekly Outpass Trends</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ANALYTICS_TRENDS}>
              <defs>
                <linearGradient id="colorPasses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="passes" stroke="#00E5FF" strokeWidth={2} fillOpacity={1} fill="url(#colorPasses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-[2rem] space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Emergency Triggers History</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_TRENDS}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                <Bar dataKey="emergencies" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[2rem] space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Key Indicators</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Average Outpass Duration</span>
              <p className="text-xl font-black text-white mt-1">2h 45m</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Peak Exit Day</span>
              <p className="text-xl font-black text-white mt-1">Saturday</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Warden Response Latency</span>
              <p className="text-xl font-black text-white mt-1">4.2 mins</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">NFC Hardware Uptime</span>
              <p className="text-xl font-black text-white mt-1">100.0%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   8. NOTIFICATIONS VIEW
   ========================================== */
export const NotificationsView: React.FC = () => {
  const { notifs } = useAppState();

  return (
    <div className="glass-panel p-6 rounded-[2rem] space-y-4 text-left max-w-4xl mx-auto">
      <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">System Notifications Feed</h3>
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 log-scroll">
        {notifs.length === 0 ? (
          <p className="text-[10px] text-slate-500 font-bold uppercase text-center py-12">No notifications recorded</p>
        ) : (
          notifs.slice().reverse().map((n, idx) => (
            <div key={idx} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shadow-[0_0_8px_#22d3ee] shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-200">{n.msg}</p>
                <p className="text-[7.5px] text-slate-500 font-bold mt-1 uppercase">{formatDateString(n.time)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ==========================================
   9. REPORTS VIEW
   ========================================== */
export const ReportsView: React.FC = () => {
  const { showToast } = useAppState();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      showToast('CSV Report Exported Successfully!', 'success');
    }, 1200);
  };

  return (
    <div className="glass-panel p-6 rounded-[2rem] space-y-6 text-left max-w-3xl mx-auto">
      <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Outpass Report Auditor</h3>
      <p className="text-xs text-slate-300 font-medium leading-relaxed">
        Export full student registry, historical outpass data logs, courier/visitor checkpoints, and telemetry status logs as standardized spreadsheet formats.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
          <h4 className="text-xs font-black uppercase text-white">Student Outpass List</h4>
          <p className="text-[8px] text-slate-500 font-bold uppercase">Includes dates, outpass reasons, and gate authorization tokens.</p>
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="mt-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-[#00E5FF] cursor-pointer"
          >
            {downloading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
          <h4 className="text-xs font-black uppercase text-white">Gate Scan Telemetry Logs</h4>
          <p className="text-[8px] text-slate-500 font-bold uppercase">Includes NFC reader raw responses and scan latency statistics.</p>
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="mt-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-[#00E5FF] cursor-pointer"
          >
            {downloading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   10. SETTINGS VIEW
   ========================================== */
export const SettingsView: React.FC = () => {
  const [notifToggle, setNotifToggle] = useState(true);
  const [autoSms, setAutoSms] = useState(true);

  return (
    <div className="glass-panel p-6 rounded-[2rem] space-y-6 text-left max-w-3xl mx-auto">
      <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">System Settings</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.01] border border-white/5">
          <div>
            <h4 className="text-xs font-black uppercase text-white">Curfew Push Broadcasts</h4>
            <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">Send alerts 15m prior to standard gate cutoff</p>
          </div>
          <button 
            onClick={() => setNotifToggle(!notifToggle)}
            className={`w-10 h-5 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
              notifToggle ? 'bg-[#00E5FF]' : 'bg-slate-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
              notifToggle ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.01] border border-white/5">
          <div>
            <h4 className="text-xs font-black uppercase text-white">Parent WhatsApp Sync</h4>
            <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">Send real-time outpass status ciphers automatically</p>
          </div>
          <button 
            onClick={() => setAutoSms(!autoSms)}
            className={`w-10 h-5 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
              autoSms ? 'bg-[#00E5FF]' : 'bg-slate-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
              autoSms ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   11. SYSTEM LOGS VIEW
   ========================================== */
export const SystemLogsView: React.FC = () => {
  return (
    <div className="glass-panel p-6 rounded-[2rem] space-y-4 text-left max-w-4xl mx-auto">
      <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Developer Console Shell</h3>
      <div className="bg-black/90 p-5 rounded-xl border border-white/5 font-mono text-[9px] text-[#00FFB2] space-y-1.5 h-64 overflow-y-auto log-scroll">
        <p className="text-slate-500">// DORM-X Sentinel Core Security Shield Daemon v2.7.0</p>
        <p>[09:40:02] INITIALIZING security shell auth cipher keys...</p>
        <p>[09:40:03] NFC reader modules gate_A and gate_B responding: STANDBY</p>
        <p>[09:40:03] WhatsApp/SMS notifier link established: status=SUCCESS</p>
        <p>[09:42:50] NFC SCAN trigger recorded: student_id=alok@2023btech001 gate=gate_A</p>
        <p>[09:42:51] AUTHORIZING departure: validity=VERIFIED status=EXIT_OK</p>
        <p className="text-amber-400">[09:51:10] WARNING: Curfew timer running (T-minus 12h 9m)</p>
        <p>[10:09:00] Live activities synchronization broadcast active: logs=OK</p>
        <p className="text-cyan-400 animate-pulse">[10:11:30] LISTEN: listening for incoming outpass request tokens...</p>
      </div>
    </div>
  );
};
