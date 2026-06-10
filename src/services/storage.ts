import type { User, LeaveRequest, Notification, LogisticsRecord, SystemSettings } from '../types';

export interface StorageState {
  users: User[];
  leaves: LeaveRequest[];
  notifs: Notification[];
  logistics: LogisticsRecord[];
  sys: SystemSettings;
}

export const loadState = (): StorageState => {
  if (typeof window === 'undefined') {
    return {
      users: [],
      leaves: [],
      notifs: [],
      logistics: [],
      sys: { lockdown: false, crowd: false, notes: '' },
    };
  }
  try {
    const users = JSON.parse(localStorage.getItem('dx_v27_users') || '[]');
    const leaves = JSON.parse(localStorage.getItem('dx_v27_leaves') || '[]');
    const notifs = JSON.parse(localStorage.getItem('dx_v27_notifs') || '[]');
    const logistics = JSON.parse(localStorage.getItem('dx_v27_logis') || '[]');
    const sys = JSON.parse(
      localStorage.getItem('dx_v27_sys') || '{"lockdown":false,"crowd":false,"notes":""}'
    );
    return { users, leaves, notifs, logistics, sys };
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return {
      users: [],
      leaves: [],
      notifs: [],
      logistics: [],
      sys: { lockdown: false, crowd: false, notes: '' },
    };
  }
};

export const saveState = (state: StorageState): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('dx_v27_users', JSON.stringify(state.users));
    localStorage.setItem('dx_v27_leaves', JSON.stringify(state.leaves));
    localStorage.setItem('dx_v27_notifs', JSON.stringify(state.notifs));
    localStorage.setItem('dx_v27_logis', JSON.stringify(state.logistics));
    localStorage.setItem('dx_v27_sys', JSON.stringify(state.sys));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};
