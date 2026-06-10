'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppState } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { 
  Home, QrCode, FileText, Shield, Users, Bot, BarChart2, 
  Bell, FileSpreadsheet, Settings, Terminal, ShieldCheck, 
  ChevronDown, Search, Moon, Sun, Lock, AlertTriangle, 
  Check, ArrowRight, X, Sparkles, Clipboard, ShieldAlert,
  HelpCircle, LogOut
} from 'lucide-react';
import AIAssistant from '../ui/AIAssistant';

// Import sub-views
import { 
  StudentQRWalletView, LeaveManagementView, WardenCommandView, 
  SecurityCenterView, ParentPortalView, AIAssistantView, 
  AnalyticsView, NotificationsView, ReportsView, 
  SettingsView, SystemLogsView 
} from '../ui/DashboardViews';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, theme, toggleTheme, activeTab, setActiveTab, logout } = useAppState();
  const pathname = usePathname();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');
  
  // Custom states to trigger AI dialog modal from the Quick Promo card
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Initials calculation
  const getInitials = (name: string) => {
    if (name === 'Alok Kumar Sahu' || name === 'Alok Kumar') return 'AS';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const allowedTabs = {
    warden: ['Dashboard', 'Leave Management', 'Warden Command', 'AI Assistant', 'Analytics', 'Reports', 'Notifications', 'Settings'],
    security: ['Dashboard', 'Security Center', 'System Logs', 'AI Assistant', 'Notifications', 'Settings'],
    student: ['Dashboard', 'Student QR Wallet', 'AI Assistant', 'Notifications', 'Settings'],
    parent: ['Dashboard', 'Parent Portal', 'AI Assistant', 'Notifications', 'Settings'],
  };

  const currentRole = user?.roleType || 'student';
  const roleAllowedTabs = allowedTabs[currentRole as keyof typeof allowedTabs] || allowedTabs.student;

  const navigationItems = [
    { name: 'Dashboard', path: '/warden', icon: Home },
    { name: 'Student QR Wallet', path: '/student', icon: QrCode },
    { name: 'Leave Management', path: '/warden', icon: FileText },
    { name: 'Warden Command', path: '/warden', icon: Sparkles },
    { name: 'Security Center', path: '/security', icon: Shield },
    { name: 'Parent Portal', path: '/parent', icon: Users },
    { name: 'AI Assistant', path: '/warden', icon: Bot },
    { name: 'Analytics', path: '/warden', icon: BarChart2 },
    { name: 'Notifications', path: '/student', icon: Bell, badge: 12 },
    { name: 'Reports', path: '/warden', icon: FileSpreadsheet },
    { name: 'Settings', path: '/student', icon: Settings },
    { name: 'System Logs', path: '/security', icon: Terminal },
  ];

  const liveActivities = [
    { title: 'QR Entry - Block A Gate', desc: 'PX-8290 • 7:42 PM', icon: QrCode, color: 'text-[#00FFB2] bg-[#00FFB2]/5 border-[#00FFB2]/10' },
    { title: 'Leave Approved', desc: 'Rahul Sharma • 7:40 PM', icon: Check, color: 'text-[#00FFB2] bg-[#00FFB2]/5 border-[#00FFB2]/10' },
    { title: 'SOS Alert - Resolved', desc: 'Block C • 7:35 PM', icon: AlertTriangle, color: 'text-red-400 bg-red-500/5 border-red-500/10' },
    { title: 'Visitor Check-in', desc: 'Mr. Suresh Kumar • 7:30 PM', icon: Users, color: 'text-[#00E5FF] bg-[#00E5FF]/5 border-[#00E5FF]/10' },
    { title: 'Outpass Generated', desc: 'Sneha Patil • 7:28 PM', icon: FileText, color: 'text-[#00E5FF] bg-[#00E5FF]/5 border-[#00E5FF]/10' },
    { title: 'Gate Locked Down', desc: 'Main Gate • 7:20 PM', icon: Lock, color: 'text-red-400 bg-red-500/5 border-red-500/10' },
  ];

  const quickActions = [
    { label: 'Generate Outpass', icon: Clipboard, color: 'bg-[#00FFB2]/5 border-[#00FFB2]/10 hover:border-[#00FFB2]/30 text-[#00FFB2]', iconColor: 'text-[#00FFB2]' },
    { label: 'Scan QR Code', icon: QrCode, color: 'bg-[#00E5FF]/5 border-[#00E5FF]/10 hover:border-[#00E5FF]/30 text-[#00E5FF]', iconColor: 'text-[#00E5FF]' },
    { label: 'Send Notification', icon: Bell, color: 'bg-[#7C3AED]/5 border-[#7C3AED]/10 hover:border-[#7C3AED]/30 text-[#7C3AED]', iconColor: 'text-[#7C3AED]' },
    { label: 'Emergency Alert', icon: ShieldAlert, color: 'bg-red-500/5 border-red-500/10 hover:border-red-500/30 text-red-400', iconColor: 'text-red-400' },
  ];

  const handleNavClick = (name: string) => {
    setActiveTab(name);
  };

  return (
    <div className="min-h-screen flex bg-[#030712] text-white overflow-hidden font-sans">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 bg-[#030712] border-r border-white/[0.04] flex flex-col justify-between shrink-0 h-screen sticky top-0">
        
        {/* Branding Title */}
        <div className="p-6 border-b border-white/[0.04] text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#00E5FF] to-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg shadow-[#00E5FF]/20 border border-[#00E5FF]/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tighter uppercase text-white leading-none">DORM-X</h1>
              <p className="text-[7px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">SMART CAMPUS MANAGEMENT</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-grow overflow-y-auto py-4 px-3 space-y-1 log-scroll text-left">
          {navigationItems
            .filter(item => roleAllowedTabs.includes(item.name))
            .map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;

            return (
              <button
                key={idx}
                onClick={() => handleNavClick(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#00E5FF]/10 to-[#7C3AED]/5 text-white border border-[#00E5FF]/20 shadow-md shadow-[#00E5FF]/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                    isActive 
                      ? 'bg-black/40 border-[#00E5FF]/30 text-[#00E5FF] shadow-inner shadow-[#00E5FF]/10' 
                      : 'bg-transparent border-transparent text-slate-400'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[8px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom System Status & User Profile */}
        <div className="p-4 border-t border-white/[0.04] space-y-4">
          {/* Status card */}
          <div className="p-4 rounded-2xl bg-black/40 border border-[#00FFB2]/20 flex items-start gap-3 text-left relative overflow-hidden shadow-lg shadow-black/50">
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#00FFB2] animate-pulse" />
            <ShieldCheck className="w-5 h-5 text-[#00FFB2] shrink-0 mt-0.5" />
            <div>
              <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wide">System Status</h5>
              <p className="text-[9px] text-[#00FFB2] font-black uppercase mt-0.5">All Systems Operational</p>
              <p className="text-[7px] text-slate-500 mt-1 font-semibold">Last updated: Just now</p>
            </div>
          </div>

          {/* User profile details (Log Out Action) */}
          <div 
            onClick={logout}
            className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white/[0.02] hover:text-red-400 transition-all cursor-pointer text-left group"
            title="Click to Log Out"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00E5FF]/20 to-[#7C3AED]/20 border border-white/10 flex items-center justify-center text-xs font-black text-white shadow-inner">
                  {user ? getInitials(user.name) : 'AS'}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00FFB2] border-2 border-[#030712]" />
              </div>
              <div>
                <h5 className="text-[10px] font-black uppercase text-white group-hover:text-red-400 transition-colors truncate max-w-[100px]">
                  {user ? user.name : 'Alok Kumar Sahu'}
                </h5>
                <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5 truncate max-w-[100px]">
                  {user ? (user.roleType === 'warden' ? 'Super Administrator' : user.roleType) : 'Super Administrator'}
                </p>
              </div>
            </div>
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors" />
          </div>
        </div>

      </aside>

      {/* 2. MAIN CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-20 border-b border-white/[0.04] bg-[#030712] px-8 flex items-center justify-between shrink-0">
          {/* Left spacer to align search bar to center */}
          <div className="w-80 hidden lg:block" />
          
          {/* Search bar (Center) */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search anything..." 
              className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-[#00E5FF]/50 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/10 text-slate-500 text-[8px] font-mono font-bold select-none border border-white/5 uppercase">
              ⌘ K
            </span>
          </div>

          {/* Action Tools (Right) */}
          <div className="flex items-center gap-4 w-80 justify-end">
            {/* Notifications Alert Bell */}
            <div className="relative cursor-pointer" onClick={() => setActiveTab('Notifications')}>
              <div className="w-10 h-10 rounded-xl border border-white/[0.08] hover:border-white/20 flex items-center justify-center transition-colors">
                <Bell className="w-4 h-4 text-slate-300 hover:text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-[#030712] flex items-center justify-center text-[8px] font-black text-white">
                12
              </span>
            </div>

            {/* Theme Toggle / Moon Option Icon always visible/contrasted */}
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl border border-white/[0.08] hover:border-white/20 flex items-center justify-center cursor-pointer transition-colors"
              title="Toggle Theme Mode"
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-[#00E5FF] filter drop-shadow-[0_0_4px_rgba(0,229,255,0.4)]" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {/* Profile Avatar indicator */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00E5FF]/10 to-[#7C3AED]/10 border border-white/10 flex items-center justify-center text-xs font-black text-white shadow-inner select-none cursor-pointer">
                {user ? getInitials(user.name) : 'AS'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00FFB2] border-2 border-[#030712]" />
            </div>
          </div>
        </header>

        {/* Content body split into Middle Workspace & Right Sidebar panel */}
        <div className="flex-grow flex min-h-0">
          
          {/* MIDDLE WORKSPACE (SCROLLABLE AREA) */}
          <main className="flex-grow overflow-y-auto p-8 log-scroll min-w-0">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {activeTab === 'Dashboard' && children}
              {activeTab === 'Student QR Wallet' && roleAllowedTabs.includes('Student QR Wallet') && <StudentQRWalletView />}
              {activeTab === 'Leave Management' && roleAllowedTabs.includes('Leave Management') && <LeaveManagementView />}
              {activeTab === 'Warden Command' && roleAllowedTabs.includes('Warden Command') && <WardenCommandView />}
              {activeTab === 'Security Center' && roleAllowedTabs.includes('Security Center') && <SecurityCenterView />}
              {activeTab === 'Parent Portal' && roleAllowedTabs.includes('Parent Portal') && <ParentPortalView />}
              {activeTab === 'AI Assistant' && roleAllowedTabs.includes('AI Assistant') && <AIAssistantView />}
              {activeTab === 'Analytics' && roleAllowedTabs.includes('Analytics') && <AnalyticsView />}
              {activeTab === 'Notifications' && roleAllowedTabs.includes('Notifications') && <NotificationsView />}
              {activeTab === 'Reports' && roleAllowedTabs.includes('Reports') && <ReportsView />}
              {activeTab === 'Settings' && roleAllowedTabs.includes('Settings') && <SettingsView />}
              {activeTab === 'System Logs' && roleAllowedTabs.includes('System Logs') && <SystemLogsView />}
            </motion.div>
          </main>

          {/* RIGHT SIDEBAR PANEL (FIXED UTILITIES) */}
          <aside className="w-80 border-l border-white/[0.04] bg-[#030712] p-6 flex flex-col justify-between shrink-0 h-full overflow-y-auto log-scroll text-left">
            <div className="space-y-6">
              
              {/* 1. Live Activity */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-300">Live Activity</h4>
                  <button 
                    onClick={() => setActiveTab('System Logs')}
                    className="text-[8px] font-black text-[#00E5FF] uppercase tracking-widest cursor-pointer hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2.5">
                  {liveActivities.map((act, aIdx) => {
                    const Icon = act.icon;
                    return (
                      <div key={aIdx} className="flex gap-3 items-center bg-white/[0.01] p-3 rounded-xl border border-white/[0.04]">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${act.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-white truncate">{act.title}</p>
                          <p className="text-[7px] text-slate-500 font-extrabold uppercase mt-0.5">{act.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. DORM-X AI Assistant Promo Card */}
              <div className="p-5 rounded-2xl border border-white/5 relative overflow-hidden bg-gradient-to-br from-indigo-950/20 via-[#00E5FF]/5 to-transparent text-left flex items-center justify-between gap-4">
                {/* Background glow decorator */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF]/5 to-[#7C3AED]/5 pointer-events-none" />
                
                <div className="space-y-2.5 max-w-[150px] relative z-10">
                  <h4 className="text-[10px] font-black uppercase text-white tracking-wide leading-tight">DORM-X AI Assistant</h4>
                  <p className="text-[8px] text-slate-400 font-semibold leading-normal">Your intelligent campus companion</p>
                  <button 
                    onClick={() => setActiveTab('AI Assistant')}
                    className="px-4 py-2 bg-transparent hover:bg-cyan-500/10 text-[#00E5FF] border border-[#00E5FF]/30 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Start Chat &gt;
                  </button>
                </div>
                {/* Robot Avatar Image */}
                <div className="relative shrink-0 w-16 h-16 z-10">
                  <img 
                    src="/sentinel_robot_avatar.png" 
                    alt="AI Avatar" 
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,229,255,0.2)]"
                  />
                </div>
              </div>

              {/* 3. Quick Actions Grid */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-300">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((qa, qIdx) => {
                    const Icon = qa.icon;
                    return (
                      <button
                        key={qIdx}
                        onClick={() => {
                          if (qa.label === 'Generate Outpass') setActiveTab('Leave Management');
                          else if (qa.label === 'Scan QR Code') setActiveTab('Student QR Wallet');
                          else if (qa.label === 'Send Notification') setActiveTab('Notifications');
                          else if (qa.label === 'Emergency Alert') setActiveTab('Warden Command');
                        }}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 text-left cursor-pointer transition-all duration-200 ${qa.color}`}
                      >
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-white/5">
                          <Icon className={`w-3.5 h-3.5 ${qa.iconColor}`} />
                        </div>
                        <span className="text-[7.5px] font-bold text-white uppercase tracking-wider leading-tight">
                          {qa.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </aside>

        </div>

      </div>

      {/* Floating global chatbot component */}
      <AIAssistant />

    </div>
  );
};

export default DashboardLayout;
