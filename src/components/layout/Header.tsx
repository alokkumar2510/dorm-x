'use client';

import React from 'react';
import { useAppState } from '../../context/AppContext';
import { Zap, LogOut, Sun, Moon } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, theme, toggleTheme } = useAppState();

  if (!user) return null;

  return (
    <header className="h-24 sticky top-0 z-[60] px-10 glass-panel border-0 border-b border-white/5">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
            <Zap className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl className-test font-black italic tracking-tighter uppercase text-white">
            DORM-X
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-sm text-white">{user.name}</p>
            <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">
              {user.roleType.toUpperCase()}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-3 glass-panel rounded-2xl text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={logout}
            className="p-3 glass-panel rounded-2xl text-slate-400 hover:text-red-500 transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
