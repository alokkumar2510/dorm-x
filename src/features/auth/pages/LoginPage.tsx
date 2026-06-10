import React, { useState, useEffect } from 'react';
import { useAppState } from '../../../context/AppContext';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Chrome, 
  Github, 
  Apple, 
  Sparkles, 
  Cpu, 
  Layers, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const { login, signup } = useAppState();

  const [isSignup, setIsSignup] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState(false);

  // Signup inputs
  const [regName, setRegName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [regHostel, setRegHostel] = useState('');
  const [regRoom, setRegRoom] = useState('');

  // Remember me effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('dx_v27_remembered_id');
      if (savedId) {
        setLoginId(savedId);
        setRememberMe(true);
      }
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(false);
    
    if (rememberMe) {
      localStorage.setItem('dx_v27_remembered_id', loginId);
    } else {
      localStorage.removeItem('dx_v27_remembered_id');
    }

    const success = login(loginId, loginPass);
    if (!success) {
      setAuthError(true);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent = signup(regName, regNo, regHostel, regRoom);
    setIsSignup(false);
    setLoginId(newStudent.id);
    
    // Auto-generate password as in original: FIRSTNAME@REGNO
    const pass = regName.split(' ')[0].toUpperCase() + '@' + regNo.toUpperCase();
    setLoginPass(pass);
    setAuthError(false);
  };

  const handleQuickFill = (id: string, pass: string) => {
    setLoginId(id);
    setLoginPass(pass);
    setAuthError(false);
  };

  const handleForgotPassword = () => {
    setRecoveryMessage(true);
    setTimeout(() => {
      setRecoveryMessage(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 overflow-hidden bg-[#030712] font-sans">
      
      {/* LEFT SIDE: AUTH FORM COLUMN */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 md:p-12 relative z-10 bg-[#030712]/80 backdrop-blur-xl border-r border-white/[0.04]">
        
        {/* Header branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-[#00E5FF] to-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg shadow-[#00E5FF]/20 border border-[#00E5FF]/25">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold italic text-lg tracking-tighter text-white uppercase">DORM-X</span>
        </div>

        {/* Auth form card */}
        <div className="max-w-md w-full mx-auto my-12 relative">
          <AnimatePresence mode="wait">
            {!isSignup ? (
              <motion.div
                key="login-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="glass-panel p-8 md:p-10 rounded-[2.5rem] border-white/[0.08] shadow-2xl relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent"
              >
                {/* Background glow decoration */}
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#00E5FF]/5 blur-3xl pointer-events-none" />

                <div className="mb-8 relative text-left">
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Establish Link</h2>
                  <p className="text-[10px] text-[#00E5FF] font-black uppercase tracking-widest mt-1">Connect to Quantum Shield</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4 relative">
                  <div>
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl outline-none text-xs font-bold bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all focus:border-[#00E5FF]/50"
                      placeholder="Entity ID / Reg No"
                      required
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className="w-full px-5 py-4 pr-12 rounded-xl outline-none text-xs font-bold bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all focus:border-[#00E5FF]/50"
                      placeholder="Passphrase"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>

                  {/* Remember me & Forgot passphrase */}
                  <div className="flex items-center justify-between text-[10px] py-1 font-bold">
                    <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-white/10 accent-[#00E5FF] cursor-pointer"
                      />
                      Remember Cipher
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[#00E5FF] hover:underline cursor-pointer"
                    >
                      Reset Key?
                    </button>
                  </div>

                  {authError && (
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="text-red-400 text-[9px] font-black text-center uppercase tracking-widest py-1"
                    >
                      Link Failure: Credentials Invalid
                    </motion.div>
                  )}

                  {recoveryMessage && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-[#00FFB2] text-[9px] font-black text-center uppercase tracking-wider py-1"
                    >
                      Cipher recovery protocol sent to registered Node.
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] hover:brightness-110 text-white font-black py-4 rounded-xl shadow-lg shadow-[#00E5FF]/10 active:scale-98 transition-all uppercase tracking-widest text-xs cursor-pointer flex items-center justify-center gap-2 border border-white/5"
                  >
                    Establish Link <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Social logins */}
                <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                  <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    Or link with security providers
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {['Google', 'GitHub', 'Apple'].map((prov, pIdx) => {
                      const Icon = prov === 'Google' ? Chrome : prov === 'GitHub' ? Github : Apple;
                      return (
                        <button
                          key={prov}
                          type="button"
                          className="py-3 glass-panel rounded-xl text-slate-400 hover:text-white cursor-pointer hover:bg-white/5 transition-all flex items-center justify-center border-white/5"
                          title={`Link with ${prov}`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-center mt-8 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  New Presence?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignup(true)}
                    className="text-[#00E5FF] underline cursor-pointer font-extrabold"
                  >
                    Register Entity
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-panel p-8 md:p-10 rounded-[2.5rem] border-white/[0.08] shadow-2xl relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent"
              >
                {/* Background glow decoration */}
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#00E5FF]/5 blur-3xl pointer-events-none" />

                <div className="mb-8 text-left">
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Initialize</h2>
                  <p className="text-[10px] text-[#00E5FF] font-black uppercase tracking-widest mt-1">Register new resident link</p>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Full Identity Name"
                    required
                    className="w-full px-5 py-4 rounded-xl outline-none text-xs font-bold bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all focus:border-[#00E5FF]/50"
                  />
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="Registration Cipher"
                    required
                    className="w-full px-5 py-4 rounded-xl outline-none text-xs font-bold uppercase bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all focus:border-[#00E5FF]/50"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={regHostel}
                      onChange={(e) => setRegHostel(e.target.value)}
                      placeholder="Node/Hostel"
                      required
                      className="w-full px-5 py-4 rounded-xl outline-none text-xs font-bold bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all focus:border-[#00E5FF]/50"
                    />
                    <input
                      type="text"
                      value={regRoom}
                      onChange={(e) => setRegRoom(e.target.value)}
                      placeholder="Port/Room"
                      required
                      className="w-full px-5 py-4 rounded-xl outline-none text-xs font-bold bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all focus:border-[#00E5FF]/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-slate-100 font-black py-4 rounded-xl uppercase text-xs tracking-widest cursor-pointer shadow-lg transition-all border border-white/10"
                  >
                    Initialize Connection
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignup(false)}
                    className="w-full text-[9px] font-black text-slate-500 uppercase mt-2 cursor-pointer bg-transparent border-none outline-none"
                  >
                    Cancel
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick fill controls */}
        <div className="pt-6 border-t border-white/5 text-left">
          <p className="text-left text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-3">
            Quick Fill Auth Node
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Student', id: 'alok@2023btech001', pass: 'ALOK@2023BTECH001' },
              { label: 'Security', id: 'security1@pulaha', pass: 'SECURITY@PULAHA' },
              { label: 'Parent', id: 'parent_2023btech001', pass: 'PARENT_2023BTECH001' },
              { label: 'Warden', id: 'warden@pulaha', pass: 'WARDEN@VSSUT' }
            ].map((node) => (
              <button
                key={node.label}
                onClick={() => handleQuickFill(node.id, node.pass)}
                className="py-2.5 glass-panel rounded-xl text-[8px] font-black text-slate-400 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 cursor-pointer uppercase transition-all border-white/5"
              >
                {node.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: ANIMATED SENTINEL GRAPHICS */}
      <div className="hidden lg:col-span-7 lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#080f25] to-[#030712] relative overflow-hidden">
        
        {/* Animated background nebulas */}
        <motion.div 
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 40, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-[#00E5FF]/5 blur-[120px]"
        />
        <motion.div 
          animate={{
            scale: [1, 1.25, 1],
            x: [0, -40, 0],
            y: [0, 50, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] rounded-full bg-[#7C3AED]/5 blur-[150px]"
        />

        {/* Top visual decoration */}
        <div className="flex justify-between items-center relative z-10 text-[9px] text-slate-500 font-black uppercase tracking-widest">
          <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#00E5FF]" /> Sentinel Node Active</span>
          <span>Sys: v13.4.01</span>
        </div>

        {/* Core Shield graphic with floating nodes */}
        <div className="relative flex items-center justify-center flex-grow py-12">
          
          {/* Animated concentric rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute w-80 h-80 rounded-full border border-dashed border-white/10 flex items-center justify-center"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute w-60 h-60 rounded-full border border-dashed border-[#00E5FF]/20 flex items-center justify-center"
          />
          
          {/* Central Shield Glowing Graphic */}
          <div className="relative w-40 h-40 bg-[#030712] border border-white/10 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center z-10">
            <div className="absolute inset-0 bg-[#00E5FF]/5 blur-xl rounded-[3rem] animate-pulse" />
            <div className="laser-line rounded-[3rem]"></div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00E5FF] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#00E5FF]/20 mb-3 relative z-10">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <span className="text-[9px] font-black text-[#00E5FF] tracking-[0.25em] relative z-10 uppercase">SHIELD CONNECT</span>
          </div>

          {/* Floating metrics nodes */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 p-4 glass-panel rounded-2xl flex items-center gap-3 border-white/5 z-20 shadow-xl"
          >
            <Cpu className="w-4 h-4 text-[#00E5FF]" />
            <div className="text-[9px] font-black uppercase text-left">
              <p className="text-slate-500">Sentinel Core</p>
              <p className="text-white">Active Status 100%</p>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 p-4 glass-panel rounded-2xl flex items-center gap-3 border-white/5 z-20 shadow-xl"
          >
            <Layers className="w-4 h-4 text-[#00FFB2]" />
            <div className="text-[9px] font-black uppercase text-left">
              <p className="text-slate-500">Node Sync</p>
              <p className="text-white">Secure Encrypted Link</p>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 right-1/4 p-4 glass-panel rounded-2xl flex items-center gap-3 border-white/5 z-20 shadow-xl"
          >
            <Lock className="w-4 h-4 text-red-400" />
            <div className="text-[9px] font-black uppercase text-left">
              <p className="text-slate-500">Lockdown Status</p>
              <p className="text-white">Idle Standby</p>
            </div>
          </motion.div>
        </div>

        {/* Footer branding notes */}
        <div className="relative z-10 text-[9px] text-slate-500 font-black uppercase tracking-widest text-left">
          <p className="text-slate-400 mb-1">Quantum Campus Security Protocol</p>
          <p>Sentinel prime encryption fully engaged. Unauthorized entry attempts logged.</p>
        </div>

      </div>
    </div>
  );
};
export default LoginPage;
