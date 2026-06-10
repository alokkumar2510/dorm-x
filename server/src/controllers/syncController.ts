import { Request, Response } from 'express';
import prisma from '../prisma';
import { logAuditEvent } from '../middlewares/audit';
import { emitToUser, emitToRole } from '../socket';
import { Role } from '@prisma/client';

interface OfflineScan {
  leaveRequestId: string;
  action: 'EXIT' | 'ENTRY';
  scannedAt: string;
  securityId: string;
}

export const offlineSync = async (req: Request, res: Response) => {
  try {
    const { scans } = req.body as { scans: OfflineScan[] };

    if (!scans || !Array.isArray(scans)) {
      return res.status(400).json({ error: 'scans array is required' });
    }

    const successIds: string[] = [];
    const failedScans: Array<{ id: string; reason: string }> = [];

    for (const scan of scans) {
      try {
        const { leaveRequestId, action, scannedAt, securityId } = scan;
        const scanDate = new Date(scannedAt);

        await prisma.$transaction(async (tx) => {
          const leave = await tx.leaveRequest.findUnique({
            where: { id: leaveRequestId },
            include: { student: true }
          });

          if (!leave) {
            throw new Error('Leave request not found');
          }

          if (action === 'EXIT') {
            if (leave.exitTime) {
              throw new Error('Exit time already logged');
            }
            const updated = await tx.leaveRequest.update({
              where: { id: leaveRequestId },
              data: {
                exitTime: scanDate,
                securityIdExit: securityId
              }
            });

            const studentNotif = await tx.notification.create({
              data: {
                userId: leave.studentId,
                title: 'Offline Exit Synced',
                message: `Your hostel checkout scanned offline at ${scanDate.toLocaleTimeString()} has been synchronized.`,
                type: 'SECURITY_SCAN'
              }
            });

            emitToUser(leave.studentId, 'notification', studentNotif);
            emitToUser(leave.studentId, 'leave:scanned', { leave: updated, action: 'EXIT' });

            if (leave.student.parentId) {
              const parentNotif = await tx.notification.create({
                data: {
                  userId: leave.student.parentId,
                  title: 'Student Checked Out (Offline Sync)',
                  message: `${leave.student.name} checked out of the hostel gates at ${scanDate.toLocaleTimeString()} (Offline Sync).`,
                  type: 'SECURITY_SCAN'
                }
              });
              emitToUser(leave.student.parentId, 'notification', parentNotif);
            }

            emitToRole(Role.WARDEN, 'leave:scanned', { leave: updated, action: 'EXIT' });
            emitToRole(Role.SECURITY, 'leave:scanned', { leave: updated, action: 'EXIT' });

          } else if (action === 'ENTRY') {
            if (leave.entryTime) {
              throw new Error('Entry time already logged');
            }
            const updated = await tx.leaveRequest.update({
              where: { id: leaveRequestId },
              data: {
                entryTime: scanDate,
                securityIdEntry: securityId
              }
            });

            const studentNotif = await tx.notification.create({
              data: {
                userId: leave.studentId,
                title: 'Offline Entry Synced',
                message: `Your hostel checkin scanned offline at ${scanDate.toLocaleTimeString()} has been synchronized.`,
                type: 'SECURITY_SCAN'
              }
            });

            emitToUser(leave.studentId, 'notification', studentNotif);
            emitToUser(leave.studentId, 'leave:scanned', { leave: updated, action: 'ENTRY' });

            if (leave.student.parentId) {
              const parentNotif = await tx.notification.create({
                data: {
                  userId: leave.student.parentId,
                  title: 'Student Checked In (Offline Sync)',
                  message: `${leave.student.name} checked back into the hostel gates at ${scanDate.toLocaleTimeString()} (Offline Sync).`,
                  type: 'SECURITY_SCAN'
                }
              });
              emitToUser(leave.student.parentId, 'notification', parentNotif);
            }

            emitToRole(Role.WARDEN, 'leave:scanned', { leave: updated, action: 'ENTRY' });
            emitToRole(Role.SECURITY, 'leave:scanned', { leave: updated, action: 'ENTRY' });
          }
        });

        successIds.push(leaveRequestId);
      } catch (err: any) {
        failedScans.push({ id: scan.leaveRequestId, reason: err.message });
      }
    }

    await logAuditEvent(req, 'OFFLINE_SYNC_RECONCILIATION', {
      totalScans: scans.length,
      successCount: successIds.length,
      failedCount: failedScans.length
    });

    return res.json({
      message: 'Offline sync complete',
      syncedCount: successIds.length,
      syncedIds: successIds,
      failures: failedScans
    });
  } catch (error) {
    console.error('Offline sync error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
