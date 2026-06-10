import { Router } from 'express';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { Role } from '@prisma/client';
import * as authController from '../controllers/authController';
import * as leaveController from '../controllers/leaveController';
import * as securityController from '../controllers/securityController';
import * as userController from '../controllers/userController';
import * as reportController from '../controllers/reportController';
import * as syncController from '../controllers/syncController';
import * as aiController from '../controllers/aiController';

const router = Router();

// --- Auth Routes ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', authController.logout);

// --- Leave Routes (Authenticated) ---
router.post('/leaves/apply', authenticateJWT, requireRole([Role.STUDENT]), leaveController.applyLeave);
router.post('/leaves/cancel/:id', authenticateJWT, requireRole([Role.STUDENT, Role.WARDEN]), leaveController.cancelLeave);
router.get('/leaves/history', authenticateJWT, requireRole([Role.STUDENT, Role.PARENT, Role.WARDEN, Role.SECURITY]), leaveController.getLeaveHistory);
router.patch('/leaves/approve/:id', authenticateJWT, requireRole([Role.WARDEN]), leaveController.approveOrRejectLeave);
router.post('/leaves/scan', authenticateJWT, requireRole([Role.SECURITY]), leaveController.scanPass);

// --- Security Routes (Authenticated) ---
router.post('/security/courier', authenticateJWT, requireRole([Role.SECURITY]), securityController.logCourier);
router.patch('/security/courier/collect/:id', authenticateJWT, requireRole([Role.SECURITY]), securityController.collectCourier);
router.get('/security/couriers', authenticateJWT, requireRole([Role.SECURITY, Role.STUDENT]), securityController.getCourierLogs);
router.post('/security/visitor', authenticateJWT, requireRole([Role.SECURITY]), securityController.logVisitor);
router.patch('/security/visitor/checkout/:id', authenticateJWT, requireRole([Role.SECURITY]), securityController.checkoutVisitor);
router.get('/security/visitors', authenticateJWT, requireRole([Role.SECURITY]), securityController.getVisitorLogs);
router.get('/security/settings', authenticateJWT, requireRole([Role.STUDENT, Role.PARENT, Role.WARDEN, Role.SECURITY]), securityController.getSystemSettings);
router.post('/security/lockdown', authenticateJWT, requireRole([Role.SECURITY, Role.WARDEN]), securityController.toggleLockdown);
router.post('/security/crowd-alert', authenticateJWT, requireRole([Role.SECURITY, Role.WARDEN]), securityController.toggleCrowdAlert);

// --- User & Notification Routes (Authenticated) ---
router.get('/users/profile', authenticateJWT, userController.getProfile);
router.get('/users/dashboard/student', authenticateJWT, requireRole([Role.STUDENT]), userController.getStudentDashboard);
router.get('/users/dashboard/parent', authenticateJWT, requireRole([Role.PARENT]), userController.getParentDashboard);
router.get('/users/dashboard/warden', authenticateJWT, requireRole([Role.WARDEN]), userController.getWardenDashboard);
router.get('/users/notifications', authenticateJWT, userController.getNotifications);
router.patch('/users/notifications/:id/read', authenticateJWT, userController.markNotificationRead);
router.post('/users/notifications/read-all', authenticateJWT, userController.markAllNotificationsRead);
// --- Reports & Sync Routes (Authenticated) ---
router.get('/reports/leaves', authenticateJWT, requireRole([Role.WARDEN, Role.SECURITY]), reportController.exportLeaveReport);
router.get('/reports/visitors', authenticateJWT, requireRole([Role.SECURITY]), reportController.exportVisitorReport);
router.post('/sync/offline', authenticateJWT, requireRole([Role.SECURITY]), syncController.offlineSync);
router.post('/ai/chat', aiController.chatWithAI);
export default router;
