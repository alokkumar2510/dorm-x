import { Request, Response } from 'express';
import prisma from '../prisma';
import { LeaveStatus, Role } from '@prisma/client';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hostelId: true,
        hostel: { select: { id: true, name: true, code: true } },
        room: true,
        phone: true,
        parentId: true,
        parent: { select: { id: true, name: true, email: true } },
        students: { select: { id: true, name: true, email: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId!;

    const settings = await prisma.systemSettings.findFirst();
    const isLockdown = settings?.lockdownActive || false;

    const leaves = await prisma.leaveRequest.findMany({
      where: { studentId: userId },
      orderBy: { createdAt: 'desc' }
    });

    let liveStatus = 'IN_HOSTEL';
    if (isLockdown) {
      liveStatus = 'LOCKDOWN';
    } else {
      const activeExit = leaves.find(l => l.exitTime && !l.entryTime);
      if (activeExit) {
        liveStatus = 'OUT_OF_HOSTEL';
      }
    }

    const totalOutpasses = leaves.length;
    const pendingCount = leaves.filter(l => l.status === LeaveStatus.PENDING).length;
    const approvedCount = leaves.filter(l => l.status === LeaveStatus.APPROVED).length;
    const rejectedCount = leaves.filter(l => l.status === LeaveStatus.REJECTED).length;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return res.json({
      liveStatus,
      stats: {
        totalOutpasses,
        pendingCount,
        approvedCount,
        rejectedCount
      },
      recentLeaves: leaves.slice(0, 5),
      recentNotifications: notifications
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getParentDashboard = async (req: Request, res: Response) => {
  try {
    const parentId = req.user?.userId!;

    const settings = await prisma.systemSettings.findFirst();
    const isLockdown = settings?.lockdownActive || false;

    const parent = await prisma.user.findUnique({
      where: { id: parentId },
      include: {
        students: {
          include: {
            hostel: true,
            leaveRequests: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    if (!parent) {
      return res.status(404).json({ error: 'Parent record not found' });
    }

    const studentsDashboard = parent.students.map(student => {
      let liveStatus = 'IN_HOSTEL';
      if (isLockdown) {
        liveStatus = 'LOCKDOWN';
      } else {
        const activeExit = student.leaveRequests.find(l => l.exitTime && !l.entryTime);
        if (activeExit) {
          liveStatus = 'OUT_OF_HOSTEL';
        }
      }

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        hostel: student.hostel ? student.hostel.name : null,
        room: student.room,
        phone: student.phone,
        liveStatus,
        recentLeaves: student.leaveRequests.slice(0, 5)
      };
    });

    const notifications = await prisma.notification.findMany({
      where: { userId: parentId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return res.json({
      students: studentsDashboard,
      recentNotifications: notifications
    });
  } catch (error) {
    console.error('Get parent dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWardenDashboard = async (req: Request, res: Response) => {
  try {
    const wardenId = req.user?.userId!;
    const warden = await prisma.user.findUnique({
      where: { id: wardenId },
      include: { hostel: true }
    });
    const hostelFilter = warden?.hostelId;

    const userQuery: any = { role: Role.STUDENT };
    if (hostelFilter) {
      userQuery.hostelId = hostelFilter;
    }

    const students = await prisma.user.findMany({
      where: userQuery,
      include: {
        leaveRequests: {
          where: {
            status: LeaveStatus.APPROVED
          }
        }
      }
    });

    let insideCount = 0;
    let outsideCount = 0;

    students.forEach(student => {
      const activeExit = student.leaveRequests.find(l => l.exitTime && !l.entryTime);
      if (activeExit) {
        outsideCount++;
      } else {
        insideCount++;
      }
    });

    const leaveQuery: any = { status: LeaveStatus.PENDING };
    if (hostelFilter) {
      leaveQuery.student = { hostelId: hostelFilter };
    }

    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: leaveQuery,
      include: {
        student: {
          select: {
            name: true,
            email: true,
            hostelId: true,
            hostel: { select: { name: true } },
            room: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const settings = await prisma.systemSettings.findFirst();

    return res.json({
      hostel: warden?.hostel?.name || 'All Hostels',
      stats: {
        totalStudents: students.length,
        insideCount,
        outsideCount,
        pendingApprovals: pendingLeaves.length,
        lockdownActive: settings?.lockdownActive || false,
        crowdAlertActive: settings?.crowdAlertActive || false
      },
      pendingLeaves
    });
  } catch (error) {
    console.error('Get warden dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const { limit, read } = req.query;

    let whereClause: any = { userId };
    if (read !== undefined) {
      whereClause.read = read === 'true';
    }

    const takeCount = limit ? parseInt(limit as string) : 50;

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: takeCount
    });

    return res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId!;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to mark this notification as read' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    return res.json({ message: 'Notification marked as read', notification: updated });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId!;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });

    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
