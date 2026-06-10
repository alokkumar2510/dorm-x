'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LeaveRequest, Notification, LogisticsRecord, SystemSettings } from '../types';
import { loadState, saveState, type StorageState } from '../services/storage';
import { SYSTEM_STUDENTS, ROLES } from '../constants';

interface AppContextType {
  user: User | null;
  users: User[];
  leaves: LeaveRequest[];
  notifs: Notification[];
  logistics: LogisticsRecord[];
  sys: SystemSettings;
  login: (id: string, pass: string) => boolean;
  signup: (name: string, reg: string, hostel: string, room: string) => User;
  logout: () => void;
  triggerSOS: () => void;
  cancelRequest: (id: string) => void;
  applyLeave: (type: string, reason: string, from: string, to: string) => void;
  approve: (id: string, status: 'Approved' | 'Rejected') => void;
  move: (id: string, type: 'entry' | 'exit') => void;
  handleManualMove: (reg: string, purpose: string, type: 'entry' | 'exit') => void;
  addDelivery: (vendor: string, agent: string) => void;
  exitLogis: (id: string) => void;
  toggleLockdown: () => void;
  toggleCrowd: () => void;
  parentLogCall: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [state, setState] = useState<StorageState>({
    users: [],
    leaves: [],
    notifs: [],
    logistics: [],
    sys: { lockdown: false, crowd: false, notes: '' },
  });

  // Load state, user session, and theme on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = sessionStorage.getItem('dx_v27_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      const savedTheme = localStorage.getItem('dx_v27_theme') as 'dark' | 'light';
      if (savedTheme) {
        setTheme(savedTheme);
      }
      setState(loadState());
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('dx_v27_theme', next);
      }
      return next;
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'light') {
        root.classList.add('light');
      } else {
        root.classList.remove('light');
      }
    }
  }, [theme]);

  // Helper to sync local state and storage
  const updateState = (updates: Partial<typeof state>) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      saveState(next);
      return next;
    });
  };

  // Synchronize across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      setState(loadState());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (id: string, pass: string): boolean => {
    const cleanId = id.trim().toLowerCase();
    let loggedUser: User | null = null;

    if (cleanId === ROLES.warden.id && pass === ROLES.warden.pass) {
      loggedUser = {
        id: ROLES.warden.id,
        name: ROLES.warden.name,
        roleType: 'warden',
      };
    } else if (cleanId === ROLES.security.id && pass === ROLES.security.pass) {
      loggedUser = {
        id: ROLES.security.id,
        name: ROLES.security.name,
        roleType: 'security',
      };
    } else {
      const allStudents = [...SYSTEM_STUDENTS, ...state.users];
      const s = allStudents.find((x) => x.id === cleanId);
      
      if (s && pass === s.name.split(' ')[0].toUpperCase() + '@' + s.reg) {
        loggedUser = {
          id: s.id,
          name: s.name,
          reg: s.reg,
          hostel: s.hostel,
          room: s.room,
          parentId: s.parentId,
          roleType: 'student',
        };
      } else if (cleanId.startsWith('parent_')) {
        const ps = allStudents.find((x) => x.parentId === cleanId);
        if (ps && pass === cleanId.toUpperCase()) {
          loggedUser = {
            id: cleanId,
            name: 'Parent of ' + ps.name,
            parentId: cleanId,
            roleType: 'parent',
          };
        }
      }
    }

    if (loggedUser) {
      setUser(loggedUser);
      sessionStorage.setItem('dx_v27_user', JSON.stringify(loggedUser));
      return true;
    }
    return false;
  };

  const signup = (name: string, reg: string, hostel: string, room: string): User => {
    const regUpper = reg.toUpperCase();
    const newStudent: User = {
      id: regUpper.toLowerCase() + '@vssut',
      name,
      reg: regUpper,
      hostel,
      room,
      parentId: 'parent_' + regUpper.toLowerCase(),
      roleType: 'student',
    };

    updateState({
      users: [...state.users, newStudent],
    });

    return newStudent;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('dx_v27_user');
  };

  const triggerSOS = () => {
    if (!user) return;
    if (!window.confirm('ACTIVATE EMERGENCY BROADCAST?')) return;

    const newLeave: LeaveRequest = {
      id: 'SOS-' + Date.now(),
      stId: user.id,
      stName: user.name,
      stReg: user.reg,
      stHostel: user.hostel,
      stRoom: user.room,
      type: '🚨 CRITICAL SOS',
      status: 'EMERGENCY',
      isEmergency: true,
      createdAt: new Date().toISOString(),
      dateRange: 'Emergency Protocol Active',
    };

    const newNotif: Notification = {
      parentId: user.parentId || '',
      msg: `🚨 CRITICAL ALERT: Resident ${user.name} established emergency protocol.`,
      time: new Date().toISOString(),
    };

    updateState({
      leaves: [...state.leaves, newLeave],
      notifs: [...state.notifs, newNotif],
    });
  };

  const cancelRequest = (id: string) => {
    if (!user) return;
    const leave = state.leaves.find((l) => l.id === id);
    if (!leave || leave.status !== 'Pending') return;

    const newNotif: Notification = {
      parentId: user.parentId || '',
      msg: `Retraction: ${user.name} cancelled their outpass request.`,
      time: new Date().toISOString(),
    };

    updateState({
      leaves: state.leaves.filter((l) => l.id !== id),
      notifs: [...state.notifs, newNotif],
    });
  };

  const applyLeave = (type: string, reason: string, from: string, to: string) => {
    if (!user) return;
    
    const formatTime = (isoString: string) => isoString.replace('T', ' ');

    const newLeave: LeaveRequest = {
      id: 'PX' + Date.now().toString().slice(-4),
      stId: user.id,
      stName: user.name,
      stReg: user.reg,
      type,
      reason,
      dateRange: `${formatTime(from)} to ${formatTime(to)}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    const newNotif: Notification = {
      parentId: user.parentId || '',
      msg: `Transmission: ${user.name} applied for Outpass.`,
      time: new Date().toISOString(),
    };

    updateState({
      leaves: [...state.leaves, newLeave],
      notifs: [...state.notifs, newNotif],
    });
  };

  const approve = (id: string, status: 'Approved' | 'Rejected') => {
    const updatedLeaves = state.leaves.map((l) => {
      if (l.id === id) {
        return { ...l, status };
      }
      return l;
    });

    const targetLeave = state.leaves.find((l) => l.id === id);
    let updatedNotifs = state.notifs;

    if (targetLeave) {
      const allStudents = [...SYSTEM_STUDENTS, ...state.users];
      const student = allStudents.find((st) => st.id === targetLeave.stId);
      if (student) {
        updatedNotifs = [
          ...state.notifs,
          {
            parentId: student.parentId || '',
            msg: `Update: Terminal response - Outpass was ${status.toUpperCase()}.`,
            time: new Date().toISOString(),
          },
        ];
      }
    }

    updateState({
      leaves: updatedLeaves,
      notifs: updatedNotifs,
    });
  };

  const move = (id: string, type: 'entry' | 'exit') => {
    if (!user) return;
    const leaveIndex = state.leaves.findIndex((l) => l.id === id);
    if (leaveIndex === -1) return;

    const leave = state.leaves[leaveIndex];
    if (type === 'exit' && leave.exitTime) return alert('Security Block: Double Exit');
    if (type === 'entry' && leave.entryTime) return alert('Security Block: Double Entry');

    const updatedLeaves = [...state.leaves];
    updatedLeaves[leaveIndex] = {
      ...leave,
      [type === 'exit' ? 'exitTime' : 'entryTime']: new Date().toISOString(),
      guard: user.name,
    };

    const allStudents = [...SYSTEM_STUDENTS, ...state.users];
    const s = allStudents.find((st) => st.id === leave.stId);
    let updatedNotifs = state.notifs;

    if (s) {
      updatedNotifs = [
        ...state.notifs,
        {
          parentId: s.parentId || '',
          msg: `Gate Signal: Resident has ${type === 'exit' ? 'LEFT' : 'RE-ENTERED'}.`,
          time: new Date().toISOString(),
        },
      ];
    }

    updateState({
      leaves: updatedLeaves,
      notifs: updatedNotifs,
    });
  };

  const handleManualMove = (reg: string, purpose: string, type: 'entry' | 'exit') => {
    if (!user) return;
    const regUpper = reg.toUpperCase();
    const allStudents = [...SYSTEM_STUDENTS, ...state.users];
    const s = allStudents.find((x) => x.reg === regUpper);
    if (!s) return alert('Cipher Invalid');

    if (type === 'entry') {
      const active = state.leaves.find((l) => l.stId === s.id && l.exitTime && !l.entryTime);
      if (active) {
        move(active.id, 'entry');
        return;
      }
    }

    const newLeave: LeaveRequest = {
      id: 'MAN-' + Date.now(),
      stId: s.id,
      stName: s.name,
      stReg: s.reg,
      type: 'Manual Ledger',
      reason: purpose,
      status: 'Approved',
      exitTime: type === 'exit' ? new Date().toISOString() : new Date().toISOString(),
      entryTime: type === 'entry' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      guard: user.name,
      dateRange: 'Manual Check-in',
    };

    updateState({
      leaves: [...state.leaves, newLeave],
    });
  };

  const addDelivery = (vendor: string, agent: string) => {
    const newLogistics: LogisticsRecord = {
      id: 'DEL' + Date.now(),
      vendor,
      agent,
      entryTime: new Date().toISOString(),
      exitTime: null,
    };

    updateState({
      logistics: [...state.logistics, newLogistics],
    });
  };

  const exitLogis = (id: string) => {
    const updated = state.logistics.map((l) => {
      if (l.id === id) {
        return { ...l, exitTime: new Date().toISOString() };
      }
      return l;
    });

    updateState({
      logistics: updated,
    });
  };

  const toggleLockdown = () => {
    updateState({
      sys: { ...state.sys, lockdown: !state.sys.lockdown },
    });
  };

  const toggleCrowd = () => {
    updateState({
      sys: { ...state.sys, crowd: !state.sys.crowd },
    });
  };

  const parentLogCall = () => {
    if (!user) return;
    const newNotif: Notification = {
      parentId: user.id,
      msg: `📞 Parent established call connection sync.`,
      time: new Date().toISOString(),
    };

    updateState({
      notifs: [...state.notifs, newNotif],
    });
    alert('Child Informed');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        users: state.users,
        leaves: state.leaves,
        notifs: state.notifs,
        logistics: state.logistics,
        sys: state.sys,
        login,
        signup,
        logout,
        triggerSOS,
        cancelRequest,
        applyLeave,
        approve,
        move,
        handleManualMove,
        addDelivery,
        exitLogis,
        toggleLockdown,
        toggleCrowd,
        parentLogCall,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
