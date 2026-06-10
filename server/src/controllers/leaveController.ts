import { Request, Response } from 'express';
import prisma from '../prisma';
import { LeaveStatus, LeaveType, Role } from '@prisma/client';
import { emitToUser, emitToRole } from '../socket';
import { verifyDynamicQRToken } from '../services/qrService';

export const applyLeave = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const { startDate, endDate, reason, type } = req.body;

    if (!startDate || !endDate || !reason || !type) {
      return res.status(400).json({ error: 'Missing required fields: startDate, endDate, reason, type' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid start or end date format' });
    }

    if (start >= end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    const uppercaseType = type.toUpperCase() as LeaveType;
    if (!Object.values(LeaveType).includes(uppercaseType)) {
      return res.status(400).json({ error: `Invalid leave type: ${type}. Must be OUTPASS, VACATION, or EMERGENCY` });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        studentId: studentId!,
        startDate: start,
        endDate: end,
        reason,
        type: uppercaseType,
        status: LeaveStatus.PENDING,
      },
      include: {
        student: {
          select: {
            name: true,
            email: true,
            hostel: true,
            parentId: true,
            parent: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    // Create notification for student
    const studentNotification = await prisma.notification.create({
      data: {
        userId: studentId!,
        title: 'Leave Application Submitted',
        message: `Your request for ${type} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()} is pending approval.`,
        type: 'LEAVE_STATUS',
      }
    });
    emitToUser(studentId!, 'notification', studentNotification);

    // Create notification for parent (if linked)
    if (leave.student.parentId) {
      const parentNotification = await prisma.notification.create({
        data: {
          userId: leave.student.parentId,
          title: 'Student Leave Applied',
          message: `${leave.student.name} has requested ${type} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.`,
          type: 'LEAVE_STATUS',
        }
      });
      emitToUser(leave.student.parentId, 'notification', parentNotification);
    }

    // Emit to WARDENs for real-time dashboard update
    emitToRole(Role.WARDEN, 'leave:applied', {
      leave,
      hostel: leave.student.hostel
    });

    return res.status(201).json({ message: 'Leave request submitted successfully', leave });
  } catch (error) {
    console.error('Apply leave error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelLeave = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const { id } = req.params;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Students can only cancel their own leaves
    if (role === Role.STUDENT && leave.studentId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to cancel this leave request' });
    }

    if (leave.status !== LeaveStatus.PENDING && leave.status !== LeaveStatus.APPROVED) {
      return res.status(400).json({ error: `Cannot cancel a leave request in status ${leave.status}` });
    }

    if (leave.exitTime) {
      return res.status(400).json({ error: 'Cannot cancel a leave request after exit scan has occurred' });
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveStatus.CANCELLED }
    });

    // Notify student
    const studentNotification = await prisma.notification.create({
      data: {
        userId: leave.studentId,
        title: 'Leave Request Cancelled',
        message: `Your leave request starting ${leave.startDate.toLocaleDateString()} has been cancelled.`,
        type: 'LEAVE_STATUS',
      }
    });
    emitToUser(leave.studentId, 'notification', studentNotification);

    // Notify parent if linked
    if (leave.student.parentId) {
      const parentNotification = await prisma.notification.create({
        data: {
          userId: leave.student.parentId,
          title: 'Student Leave Cancelled',
          message: `${leave.student.name}'s leave request starting ${leave.startDate.toLocaleDateString()} has been cancelled.`,
          type: 'LEAVE_STATUS',
        }
      });
      emitToUser(leave.student.parentId, 'notification', parentNotification);
    }

    emitToRole(Role.WARDEN, 'leave:cancelled', { id });

    return res.json({ message: 'Leave request cancelled successfully', leave: updatedLeave });
  } catch (error) {
    console.error('Cancel leave error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLeaveHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const role = req.user?.role!;
    const { status, hostel, type } = req.query;

    let whereClause: any = {};

    if (role === Role.STUDENT) {
      whereClause.studentId = userId;
    } else if (role === Role.PARENT) {
      const parentWithStudents = await prisma.user.findUnique({
        where: { id: userId },
        select: { students: { select: { id: true } } }
      });
      const studentIds = parentWithStudents?.students.map(s => s.id) || [];
      whereClause.studentId = { in: studentIds };
    } else if (role === Role.WARDEN) {
      if (hostel) {
        whereClause.student = { hostel: hostel as string };
      }
    }

    if (status) {
      whereClause.status = (status as string).toUpperCase() as LeaveStatus;
    }
    if (type) {
      whereClause.type = (type as string).toUpperCase() as LeaveType;
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            hostel: true,
            room: true,
            phone: true
          }
        },
        warden: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ leaves });
  } catch (error) {
    console.error('Get leave history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveOrRejectLeave = async (req: Request, res: Response) => {
  try {
    const wardenId = req.user?.userId!;
    const { id } = req.params;
    const { status, comments } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required (APPROVED or REJECTED)' });
    }

    const uppercaseStatus = status.toUpperCase() as LeaveStatus;
    if (uppercaseStatus !== LeaveStatus.APPROVED && uppercaseStatus !== LeaveStatus.REJECTED) {
      return res.status(400).json({ error: 'Status must be either APPROVED or REJECTED' });
    }

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leave.status !== LeaveStatus.PENDING) {
      return res.status(400).json({ error: `Cannot update leave request in status ${leave.status}` });
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: uppercaseStatus,
        wardenId,
        comments: comments || null,
      },
      include: {
        warden: {
          select: { name: true }
        }
      }
    });

    // Notify student
    const studentNotification = await prisma.notification.create({
      data: {
        userId: leave.studentId,
        title: `Leave Request ${uppercaseStatus}`,
        message: `Your leave request for ${leave.type} starting ${leave.startDate.toLocaleDateString()} has been ${uppercaseStatus.toLowerCase()} by warden.`,
        type: 'LEAVE_STATUS',
      }
    });
    emitToUser(leave.studentId, 'notification', studentNotification);
    emitToUser(leave.studentId, 'leave:updated', updatedLeave);

    // Notify parent if linked
    if (leave.student.parentId) {
      const parentNotification = await prisma.notification.create({
        data: {
          userId: leave.student.parentId,
          title: `Student Leave Request ${uppercaseStatus}`,
          message: `${leave.student.name}'s leave request starting ${leave.startDate.toLocaleDateString()} has been ${uppercaseStatus.toLowerCase()}.`,
          type: 'LEAVE_STATUS',
        }
      });
      emitToUser(leave.student.parentId, 'notification', parentNotification);
      emitToUser(leave.student.parentId, 'leave:updated', updatedLeave);
    }

    // Emit dashboard updates to Warden and Security
    emitToRole(Role.WARDEN, 'leave:updated', updatedLeave);
    emitToRole(Role.SECURITY, 'leave:updated', updatedLeave);

    return res.json({ message: `Leave request ${uppercaseStatus.toLowerCase()} successfully`, leave: updatedLeave });
  } catch (error) {
    console.error('Approve/Reject leave error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const scanPass = async (req: Request, res: Response) => {
  try {
    const securityId = req.user?.userId!;
    const { id, qrToken, rfidTag, faceDescriptor } = req.body;

    let targetLeaveRequestId = id;

    if (qrToken) {
      try {
        const decoded = verifyDynamicQRToken(qrToken);
        targetLeaveRequestId = decoded.leaveRequestId;
      } catch (err: any) {
        return res.status(400).json({ error: err.message });
      }
    } else if (rfidTag) {
      const student = await prisma.user.findFirst({
        where: { rfidTag, role: Role.STUDENT }
      });
      if (!student) {
        return res.status(404).json({ error: 'RFID Tag not registered to any student' });
      }

      const activeLeave = await prisma.leaveRequest.findFirst({
        where: {
          studentId: student.id,
          status: LeaveStatus.APPROVED,
          OR: [
            { exitTime: null },
            { exitTime: { not: null }, entryTime: null }
          ]
        }
      });

      if (!activeLeave) {
        return res.status(400).json({ error: 'No active approved leave request found for this student RFID' });
      }
      targetLeaveRequestId = activeLeave.id;
    } else if (faceDescriptor) {
      const students = await prisma.user.findMany({
        where: { role: Role.STUDENT, faceEmbedding: { not: null } }
      });

      let matchedStudent = null;
      for (const s of students) {
        if (s.faceEmbedding === faceDescriptor) {
          matchedStudent = s;
          break;
        }
      }

      if (!matchedStudent) {
        return res.status(404).json({ error: 'Face not recognized. Verification failed.' });
      }

      const activeLeave = await prisma.leaveRequest.findFirst({
        where: {
          studentId: matchedStudent.id,
          status: LeaveStatus.APPROVED,
          OR: [
            { exitTime: null },
            { exitTime: { not: null }, entryTime: null }
          ]
        }
      });

      if (!activeLeave) {
        return res.status(400).json({ error: 'No active approved leave request found for this recognized face' });
      }
      targetLeaveRequestId = activeLeave.id;
    }

    if (!targetLeaveRequestId) {
      return res.status(400).json({ error: 'Leave request verification parameters missing (id, qrToken, rfidTag, or faceDescriptor required)' });
    }

    const leave = await prisma.leaveRequest.findUnique({
      where: { id: targetLeaveRequestId },
      include: { student: true }
    });

    if (!leave) {
      return res.status(404).json({ error: 'Invalid Pass: leave request not found' });
    }

    if (leave.status !== LeaveStatus.APPROVED) {
      return res.status(400).json({ error: `Scanning failed: pass status is ${leave.status}` });
    }

    // Process Exit
    if (!leave.exitTime) {
      const updatedLeave = await prisma.leaveRequest.update({
        where: { id: targetLeaveRequestId },
        data: {
          exitTime: new Date(),
          securityIdExit: securityId
        }
      });

      const studentNotification = await prisma.notification.create({
        data: {
          userId: leave.studentId,
          title: 'Exit Scanned Successfully',
          message: `Your hostel exit was logged at ${updatedLeave.exitTime?.toLocaleTimeString()}. Have a safe trip!`,
          type: 'SECURITY_SCAN',
        }
      });
      emitToUser(leave.studentId, 'notification', studentNotification);
      emitToUser(leave.studentId, 'leave:scanned', { leave: updatedLeave, action: 'EXIT' });

      if (leave.student.parentId) {
        const parentNotification = await prisma.notification.create({
          data: {
            userId: leave.student.parentId,
            title: 'Student Checked Out of Hostel',
            message: `${leave.student.name} checked out of the hostel gates at ${updatedLeave.exitTime?.toLocaleTimeString()}.`,
            type: 'SECURITY_SCAN',
          }
        });
        emitToUser(leave.student.parentId, 'notification', parentNotification);
        emitToUser(leave.student.parentId, 'leave:scanned', { leave: updatedLeave, action: 'EXIT' });
      }

      emitToRole(Role.WARDEN, 'leave:scanned', { leave: updatedLeave, action: 'EXIT' });
      emitToRole(Role.SECURITY, 'leave:scanned', { leave: updatedLeave, action: 'EXIT' });

      return res.json({
        message: 'Exit scanned successfully. Student checked out.',
        action: 'EXIT',
        leave: updatedLeave
      });
    }

    // Process Entry
    if (leave.exitTime && !leave.entryTime) {
      const updatedLeave = await prisma.leaveRequest.update({
        where: { id: targetLeaveRequestId },
        data: {
          entryTime: new Date(),
          securityIdEntry: securityId
        }
      });

      const studentNotification = await prisma.notification.create({
        data: {
          userId: leave.studentId,
          title: 'Entry Scanned Successfully',
          message: `Your hostel entry was logged at ${updatedLeave.entryTime?.toLocaleTimeString()}. Welcome back!`,
          type: 'SECURITY_SCAN',
        }
      });
      emitToUser(leave.studentId, 'notification', studentNotification);
      emitToUser(leave.studentId, 'leave:scanned', { leave: updatedLeave, action: 'ENTRY' });

      if (leave.student.parentId) {
        const parentNotification = await prisma.notification.create({
          data: {
            userId: leave.student.parentId,
            title: 'Student Checked Into Hostel',
            message: `${leave.student.name} checked back into the hostel gates at ${updatedLeave.entryTime?.toLocaleTimeString()}.`,
            type: 'SECURITY_SCAN',
          }
        });
        emitToUser(leave.student.parentId, 'notification', parentNotification);
        emitToUser(leave.student.parentId, 'leave:scanned', { leave: updatedLeave, action: 'ENTRY' });
      }

      emitToRole(Role.WARDEN, 'leave:scanned', { leave: updatedLeave, action: 'ENTRY' });
      emitToRole(Role.SECURITY, 'leave:scanned', { leave: updatedLeave, action: 'ENTRY' });

      return res.json({
        message: 'Entry scanned successfully. Student checked back in.',
        action: 'ENTRY',
        leave: updatedLeave
      });
    }

    return res.status(400).json({ error: 'This leave pass has already been used and closed.' });
  } catch (error) {
    console.error('Scan pass error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
