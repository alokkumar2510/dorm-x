import type { User } from '../types';

export const SYSTEM_STUDENTS: Omit<User, 'roleType'>[] = [
  { id: 'alok@2023btech001', name: 'Alok Kumar', reg: '2023BTECH001', hostel: 'Pulaha', room: '302', parentId: 'parent_2023btech001' },
  { id: 'sneha@2023btech054', name: 'Sneha Rao', reg: '2023BTECH054', hostel: 'Rohini', room: '102', parentId: 'parent_2023btech054' }
];

export const ROLES = {
  warden: { id: 'warden@pulaha', pass: 'WARDEN@VSSUT', name: 'Alok Kumar Sahu', role: 'SUPER ADMINISTRATOR' },
  security: { id: 'security1@pulaha', pass: 'SECURITY@PULAHA', name: 'Officer Singh', role: 'SENTINEL PRIME' }
};
