export type RoleType = 'student' | 'warden' | 'security' | 'parent';

export interface User {
  id: string;
  name: string;
  reg?: string;
  hostel?: string;
  room?: string;
  parentId?: string;
  roleType: RoleType;
}

export interface LeaveRequest {
  id: string;
  stId: string;
  stName: string;
  stReg?: string;
  stHostel?: string;
  stRoom?: string;
  type: string;
  reason?: string;
  dateRange: string; // Used for "from to to" text
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'EMERGENCY';
  createdAt: string;
  exitTime?: string | null;
  entryTime?: string | null;
  guard?: string;
  isEmergency?: boolean;
}

export interface LogisticsRecord {
  id: string;
  vendor: string;
  agent: string;
  entryTime: string;
  exitTime?: string | null;
}

export interface Notification {
  parentId: string;
  msg: string;
  time: string;
}

export interface SystemSettings {
  lockdown: boolean;
  crowd: boolean;
  notes: string;
}
