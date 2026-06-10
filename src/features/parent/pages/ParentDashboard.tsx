import React, { useState, useEffect } from 'react';
import { useAppState } from '../../../context/AppContext';
import { SYSTEM_STUDENTS } from '../../../constants';
import { 
  PhoneCall, 
  ShieldCheck, 
  MapPin, 
  Bell, 
  Volume2, 
  History, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { user, leaves, notifs, users, parentLogCall } = useAppState();

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


  if (!user) return null;

  const allStudents = [...SYSTEM_STUDENTS, ...users];
  const child = allStudents.find((s) => s.parentId === user.id);

  if (!child) {
    return (
      <div className="text-center py-20 text-white font-black uppercase text-xl italic tracking-wider">
        No Registered Child Presence Link Found
      </div>
    );
  }

  // Find if child is currently checked out
  const activeLeave = leaves.find((l) => l.stId === child.id && l.exitTime && !l.entryTime);
  const isOutside = !!activeLeave;

  // Filter and sort parent notifications
  const parentNotifs = notifs
    .filter((n) => n.parentId === user.id)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // Check if child is late
  const isLate =
    activeLeave &&
    activeLeave.dateRange.includes(' to ') &&
    new Date(activeLeave.dateRange.split(' to ')[1]).getTime() < Date.now();

  // Child's outpass history
  const childHistory = leaves.filter((l) => l.stId === child.id);

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-white font-sans">
      
      {/* 1. STUDENT LIVE STATUS CARD */}
      <div className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldCheck className="w-48 h-48" />
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-2xl font-black italic uppercase">
              {child.name.slice(0, 2)}
            </span>
          </div>
          <div>
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Linked Student Presence</span>
            <h2 className="text-3xl font-black uppercase text-white tracking-tight mt-1">{child.name}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              Room: {child.room} | Hostel Node: {child.hostel} Block
            </p>
          </div>
        </div>

        {/* Live location badge */}
        <div className="flex flex-col items-center md:items-end gap-2 relative z-10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Location Status</p>
          <div className={`px-8 py-4 rounded-2xl flex items-center gap-3 border shadow-md font-black uppercase text-sm ${
            isLate
              ? 'bg-red-600/10 text-red-500 border-red-500/30 animate-pulse'
              : isOutside
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            {isLate ? (
              <>
                <AlertTriangle className="w-4 h-4" /> Overdue: Out of Dorm
              </>
            ) : isOutside ? (
              <>
                <Clock className="w-4 h-4 text-amber-500" /> Outside Campus
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Inside Hostel Facility
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. TWO-COLUMN LAYOUT */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: HISTORY TABLE & SAFETY TIMELINE */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* TIMELINE SECURITY EVENTS */}
          <div className="glass-panel p-8 rounded-[2.5rem]">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" /> Live Safety Notification Feed
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 log-scroll">
              {parentNotifs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  No notifications recorded
                </div>
              ) : (
                parentNotifs.map((n, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-4 hover:border-cyan-500/20 transition-all"
                  >
                    <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full mt-1.5 shadow-[0_0_8px_#22d3ee]" />
                    <div className="flex-grow">
                      <p className="font-bold text-sm text-slate-200">{n.msg}</p>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        {new Date(n.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* LEAVE HISTORY TABLE */}
          <div className="glass-panel rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" /> Historic Outpass Registry
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/40 text-[9px] font-black uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-8 py-5">Type / Reason</th>
                    <th className="px-8 py-5">Validity Period</th>
                    <th className="px-8 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px] font-bold">
                  {childHistory.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-10 text-center opacity-30 uppercase font-bold text-white">
                        No historical outpass records found
                      </td>
                    </tr>
                  ) : (
                    [...childHistory].reverse().map((h) => (
                      <tr key={h.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-8 py-5 text-white">
                          <p>{h.type}</p>
                          <p className="text-[9px] text-slate-500 font-normal italic mt-0.5">{h.reason}</p>
                        </td>
                        <td className="px-8 py-5 text-slate-400">
                          {h.dateRange}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            h.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : h.status === 'Pending'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTACT HELP & CAMPUS UPDATES */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* DIAL SIMULATION / QUICK CONTACT OPTIONS */}
          <div className="glass-panel p-6 rounded-[2.5rem]">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-cyan-400" /> Immediate Contact Desk
            </h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-4">
              Simulate call link verification synchronizer
            </p>
            <div className="space-y-3">
              <button
                onClick={parentLogCall}
                className="w-full p-4 bg-slate-900 border border-white/10 hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-widest text-cyan-400 rounded-xl cursor-pointer flex items-center justify-between"
              >
                <span>Notify Child Node</span>
                <PhoneCall className="w-4 h-4" />
              </button>
              <button
                onClick={() => startCall('Hostel Warden (Dr. Giri)', '+91 94372 82811')}
                className="w-full p-4 bg-slate-900 border border-white/10 hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-widest text-slate-300 rounded-xl cursor-pointer flex items-center justify-between"
              >
                <span>Call Hostel Warden Office</span>
                <PhoneCall className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={() => startCall('Gate Sentinel (Front Desk)', '+91 63702 11929')}
                className="w-full p-4 bg-slate-900 border border-white/10 hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-widest text-slate-300 rounded-xl cursor-pointer flex items-center justify-between"
              >
                <span>Call Gate Security Sentinel</span>
                <PhoneCall className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* CAMPUS UPDATES / HOSTEL BULLETINS */}
          <div className="glass-panel p-6 rounded-[2.5rem]">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-500" /> Campus Safety Bulletins
            </h3>
            <div className="space-y-4">
              <div className="pb-4 border-b border-white/5 last:border-none">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">June 9, 2026</span>
                <h4 className="text-[11px] font-black text-white uppercase mt-0.5">Vaccination Verification Drive</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-1 leading-relaxed">
                  Annual health record sync will occur next week. Students are required to submit booster updates to their block office.
                </p>
              </div>
              <div className="pb-4 border-b border-white/5 last:border-none">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">June 5, 2026</span>
                <h4 className="text-[11px] font-black text-white uppercase mt-0.5">Security Shield Audit Complete</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-1 leading-relaxed">
                  Gate scanner hardware and backup generators tested successfully. 100% network uptime reported.
                </p>
              </div>
            </div>
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
              <PhoneCall className="w-12 h-12 text-cyan-400" />
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
export default ParentDashboard;
