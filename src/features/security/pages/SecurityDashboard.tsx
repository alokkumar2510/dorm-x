import React, { useState, useEffect } from 'react';
import { useAppState } from '../../../context/AppContext';
import { 
  Lock, 
  Zap, 
  Aperture, 
  AlertTriangle, 
  Users, 
  Truck, 
  Shield, 
  Clock, 
  Search,
  Plus
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface VisitorRecord {
  id: string;
  name: string;
  purpose: string;
  phone: string;
  entryTime: string;
  exitTime?: string | null;
}

export const SecurityDashboard: React.FC = () => {
  const {
    leaves,
    logistics,
    sys,
    move,
    handleManualMove,
    addDelivery,
    exitLogis,
    toggleLockdown,
    toggleCrowd,
  } = useAppState();

  // Manual movement inputs
  const [manReg, setManReg] = useState('');
  const [manPurpose, setManPurpose] = useState('');

  // Courier inputs
  const [vendor, setVendor] = useState('');
  const [agent, setAgent] = useState('');

  // Visitor registry inputs (adding a functional local-storage synced visitor log)
  const [visitorName, setVisitorName] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitors, setVisitors] = useState<VisitorRecord[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('dx_v27_visitors') || '[]');
    }
    return [];
  });

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [auditQuery, setAuditQuery] = useState('');

  // Sync visitors to localStorage
  const saveVisitors = (updated: VisitorRecord[]) => {
    setVisitors(updated);
    localStorage.setItem('dx_v27_visitors', JSON.stringify(updated));
  };

  const handleAddVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;
    const newVisitor: VisitorRecord = {
      id: 'VIS-' + Date.now(),
      name: visitorName,
      purpose: visitorPurpose,
      phone: visitorPhone,
      entryTime: new Date().toISOString(),
      exitTime: null
    };
    saveVisitors([...visitors, newVisitor]);
    setVisitorName('');
    setVisitorPurpose('');
    setVisitorPhone('');
  };

  const handleExitVisitor = (id: string) => {
    const updated = visitors.map((v) => {
      if (v.id === id) {
        return { ...v, exitTime: new Date().toISOString() };
      }
      return v;
    });
    saveVisitors(updated);
  };

  // Clean scanner on unmount
  useEffect(() => {
    return () => {
      const scanner = (window as any).html5QrScanner;
      if (scanner) {
        try {
          scanner.clear();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startCamera = () => {
    setCameraActive(true);
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner('reader', { fps: 20, qrbox: 250 }, false);
        scanner.render(
          (decodedText) => {
            const pid = decodedText.split('_').pop();
            if (pid) {
              const leave = leaves.find((l) => l.id === pid);
              if (leave) {
                move(pid, !leave.exitTime ? 'exit' : 'entry');
                scanner.clear();
                setCameraActive(false);
              } else {
                alert('Invalid Security Token');
              }
            }
          },
          () => {
            // Scanner verbosity ignore
          }
        );
        (window as any).html5QrScanner = scanner;
      } catch (e) {
        console.error('Failed to initialize camera lens:', e);
      }
    }, 100);
  };

  const handleManualSubmit = (e: React.FormEvent, type: 'entry' | 'exit') => {
    e.preventDefault();
    if (!manReg.trim()) return alert('Student Reg No required');
    handleManualMove(manReg, manPurpose, type);
    setManReg('');
    setManPurpose('');
  };

  const handleCourierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor.trim() || !agent.trim()) return;
    addDelivery(vendor, agent);
    setVendor('');
    setAgent('');
  };

  // Filter out critical alerts
  const activeEmergencies = leaves.filter((l) => l.isEmergency && !l.entryTime);

  // Filter approved leaves pending departure
  const approvedExitsPending = leaves.filter((l) => l.status === 'Approved' && !l.exitTime);

  // Filter checked-out students
  const studentsOutside = leaves.filter((l) => l.exitTime && !l.entryTime);

  // Filter active delivery agents
  const activeDeliveries = logistics.filter((l) => !l.exitTime);

  // Filter active visitors
  const activeVisitors = visitors.filter((v) => !v.exitTime);

  // Combine and sort audit logs
  const rawLogs = [
    ...leaves.filter((l) => l.exitTime).map(l => ({ ...l, typeName: l.stName, logType: l.entryTime ? 'Entry' : 'Exit' })),
    ...logistics.filter((l) => l.exitTime).map(l => ({ ...l, typeName: l.vendor, logType: 'Delivery Exit' })),
    ...visitors.filter((v) => v.exitTime).map(v => ({ ...v, typeName: v.name, logType: 'Visitor Exit' }))
  ];

  const auditLogs = rawLogs
    .filter(log => log.typeName.toLowerCase().includes(auditQuery.toLowerCase()))
    .sort((a, b) => {
      const timeA = new Date((a as any).exitTime).getTime();
      const timeB = new Date((b as any).exitTime).getTime();
      return timeB - timeA;
    })
    .slice(0, 15);

  return (
    <div id="security-wrap" className={`grid lg:grid-cols-12 gap-8 ${sys.lockdown ? 'lockdown-active' : ''}`}>
      
      {/* LEFT COLUMN: LOCKDOWN, EMERGENCY CENTER, GATE VISION SCANNER */}
      <div className="lg:col-span-4 space-y-6 text-white">
        
        {/* LOCKDOWN CONTROLS */}
        <div className="flex gap-4">
          <button
            onClick={toggleLockdown}
            className={`flex-1 py-5 font-black rounded-2xl text-[10px] uppercase flex items-center justify-center gap-3 shadow-2xl cursor-pointer transition-all ${
              sys.lockdown 
                ? 'bg-red-600 text-white shadow-red-500/20' 
                : 'bg-slate-900 border border-white/10 text-white hover:bg-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" /> Lockdown
          </button>
          <button
            onClick={toggleCrowd}
            className={`flex-1 py-5 font-black rounded-2xl text-[10px] uppercase flex items-center justify-center gap-3 cursor-pointer transition-all ${
              sys.crowd 
                ? 'bg-cyan-500 text-matte-black shadow-cyan-500/20' 
                : 'glass-panel border-white/10 text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-4 h-4" /> Crowd Control
          </button>
        </div>

        {/* EMERGENCY CENTER (SOS ALERTS) */}
        {activeEmergencies.length > 0 && (
          <div className="space-y-4">
            {activeEmergencies.map((l) => (
              <div
                key={l.id}
                className="p-8 bg-red-600 text-white rounded-[2.5rem] animate-pulse shadow-xl border-4 border-red-500/50"
              >
                <h4 className="font-black uppercase text-[10px] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> EMERGENCY BROADCAST ACTIVE
                </h4>
                <p className="font-black text-3xl italic tracking-tighter uppercase">{l.stName}</p>
                <p className="text-[10px] opacity-75 uppercase mb-6 font-black">
                  Dorm Room {l.stRoom || 'N/A'} | {l.stHostel || 'N/A'} Block
                </p>
                <button
                  onClick={() => move(l.id, 'entry')}
                  className="w-full bg-white text-red-600 font-black py-4 rounded-xl text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all"
                >
                  Confirm Dispatch Resolution
                </button>
              </div>
            ))}
          </div>
        )}

        {/* FUTURISTIC GATE SCANNER VIEW */}
        <div className="glass-panel p-10 rounded-[3rem] flex flex-col items-center border-cyan-500/20 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 p-6 opacity-5"><Shield className="w-20 h-20" /></div>
          <h2 className="text-white font-black text-xl mb-8 uppercase italic tracking-tighter leading-none flex items-center gap-2">
            <Aperture className="w-5 h-5 text-cyan-400" /> Gate Vision Lens
          </h2>
          <div className="relative w-full aspect-square bg-black/60 rounded-3xl border border-white/10 overflow-hidden mb-6">
            {cameraActive && <div className="laser-line"></div>}
            {cameraActive ? (
              <div id="reader" className="w-full h-full"></div>
            ) : (
              <div id="camera-placeholder" className="h-full flex flex-col items-center justify-center p-10 text-center opacity-25">
                <Aperture className="w-12 h-12 mb-4 animate-spin-slow text-cyan-400" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em]">Sentinel Link Standby</p>
              </div>
            )}
          </div>
          <div className="w-full flex items-center gap-4 bg-white/5 p-4 rounded-xl mb-6 border border-white/5">
            <input type="checkbox" id="bag-check" className="w-5 h-5 rounded border-white/10 accent-cyan-500 cursor-pointer" />
            <label htmlFor="bag-check" className="text-slate-400 text-[10px] font-black uppercase tracking-widest select-none cursor-pointer">
              Inventory Clearance Checked
            </label>
          </div>
          {!cameraActive && (
            <button
              onClick={startCamera}
              className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-98 transition-all cursor-pointer"
            >
              Engage Scanner Lens
            </button>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: SEARCH, ENTRY/EXIT FEEDS, LOGISTICS, VISITORS */}
      <div className="lg:col-span-8 grid md:grid-cols-2 gap-8 text-white">
        
        {/* LEDGER OVERRIDES & MANAGEMENT */}
        <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" /> Ledger & Visitor Desk
          </h3>
          
          {/* MANUAL OVERRIDE */}
          <form className="space-y-3 mb-8">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Manual Gate Override</p>
            <input
              type="text"
              value={manReg}
              onChange={(e) => setManReg(e.target.value)}
              placeholder="Resident Reg Cipher (Reg No)"
              required
              className="w-full p-4 rounded-xl outline-none text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-white placeholder-slate-500"
            />
            <input
              type="text"
              value={manPurpose}
              onChange={(e) => setManPurpose(e.target.value)}
              placeholder="Override Justification"
              required
              className="w-full p-4 rounded-xl outline-none text-[10px] font-bold bg-white/5 border border-white/10 text-white placeholder-slate-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={(e) => handleManualSubmit(e, 'exit')}
                className="bg-slate-800 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 cursor-pointer hover:bg-slate-700 transition-all text-center"
              >
                Force Exit
              </button>
              <button
                type="button"
                onClick={(e) => handleManualSubmit(e, 'entry')}
                className="bg-cyan-950 text-cyan-400 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border border-cyan-500/20 cursor-pointer hover:bg-cyan-900 transition-all text-center"
              >
                Force Entry
              </button>
            </div>
          </form>

          {/* VISITOR MANAGEMENT */}
          <form onSubmit={handleAddVisitor} className="space-y-3 mb-8 border-t border-white/5 pt-6">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> Visitor Registry Desk
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Visitor Name"
                required
                className="w-full p-3.5 rounded-xl outline-none text-[9px] bg-white/5 border border-white/10 text-white placeholder-slate-500"
              />
              <input
                type="text"
                value={visitorPhone}
                onChange={(e) => setVisitorPhone(e.target.value)}
                placeholder="Visitor Contact Phone"
                required
                className="w-full p-3.5 rounded-xl outline-none text-[9px] bg-white/5 border border-white/10 text-white placeholder-slate-500"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={visitorPurpose}
                onChange={(e) => setVisitorPurpose(e.target.value)}
                placeholder="Meeting Purpose / Person"
                required
                className="flex-grow p-3.5 rounded-xl outline-none text-[9px] bg-white/5 border border-white/10 text-white placeholder-slate-500"
              />
              <button
                type="submit"
                className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Log
              </button>
            </div>
          </form>

          {/* COURIER LOGISTICS */}
          <form onSubmit={handleCourierSubmit} className="space-y-3 border-t border-white/5 pt-6">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-teal-400" /> Courier Logistics Desk
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Courier Company / Vendor"
                required
                className="w-1/3 p-3.5 rounded-xl outline-none text-[9px] bg-white/5 border border-white/10 text-white placeholder-slate-500"
              />
              <input
                type="text"
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
                placeholder="Delivery Agent Name"
                required
                className="w-1/3 p-3.5 rounded-xl outline-none text-[9px] bg-white/5 border border-white/10 text-white placeholder-slate-500"
              />
              <button
                type="submit"
                className="w-1/3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer"
              >
                Log Entry
              </button>
            </div>
          </form>

          {/* ACTIVE LOGISTICS AND VISITORS LIST */}
          <div className="mt-8 space-y-4 max-h-[180px] overflow-y-auto pr-2 log-scroll">
            {/* Active Visitors */}
            {activeVisitors.map((v) => (
              <div key={v.id} className="p-3 bg-indigo-950/10 border border-indigo-500/20 rounded-xl flex justify-between items-center">
                <div className="text-[9px] font-bold">
                  <p className="text-indigo-400 uppercase">Visitor: {v.name}</p>
                  <p className="opacity-50 uppercase tracking-widest font-normal">{v.purpose} | {v.phone}</p>
                </div>
                <button
                  onClick={() => handleExitVisitor(v.id)}
                  className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase cursor-pointer hover:bg-white/20"
                >
                  Log Exit
                </button>
              </div>
            ))}

            {/* Active Courier Logistics */}
            {activeDeliveries.map((l) => (
              <div key={l.id} className="p-3 bg-teal-950/10 border border-teal-500/20 rounded-xl flex justify-between items-center">
                <div className="text-[9px] font-bold">
                  <p className="text-teal-400 uppercase">Vendor: {l.vendor}</p>
                  <p className="opacity-50 uppercase tracking-widest font-normal">Agent: {l.agent}</p>
                </div>
                <button
                  onClick={() => exitLogis(l.id)}
                  className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase cursor-pointer hover:bg-white/20"
                >
                  Log Exit
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* SECURITY AUDIT ARCHIVES */}
        <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col overflow-hidden">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" /> Operational Audit Logs
          </h3>
          
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={auditQuery}
              onChange={(e) => setAuditQuery(e.target.value)}
              placeholder="Search Archives by Identity Name"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-[10px] bg-white/5 border border-white/10 text-white placeholder-slate-500"
            />
          </div>

          <div id="sc-log-mount" className="log-scroll flex-grow pr-2 space-y-3 overflow-y-auto max-h-[500px]">
            {auditLogs.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-xs font-bold uppercase tracking-wider">
                Archives Empty
              </div>
            ) : (
              auditLogs.map((l) => (
                <div
                  key={l.id}
                  className="p-4 rounded-xl mb-2 text-[9px] flex justify-between items-center bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 transition-all"
                >
                  <div className="uppercase font-black">
                    <p className="text-slate-300 font-bold">{l.typeName}</p>
                    <p className="text-[7px] text-slate-500 font-normal mt-0.5">
                      {new Date((l as any).exitTime).toLocaleDateString()} {new Date((l as any).exitTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[7px] font-black uppercase ${
                    l.logType.includes('Entry') || l.logType.includes('In') 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {l.logType}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default SecurityDashboard;
