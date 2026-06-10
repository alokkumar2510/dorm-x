import { Request, Response } from 'express';
import prisma from '../prisma';
import { LogisticsStatus, Role } from '@prisma/client';
import { emitToUser, emitToRole, broadcast } from '../socket';

export const logCourier = async (req: Request, res: Response) => {
  try {
    const securityId = req.user?.userId!;
    const { recipientEmail, vendor, trackingNumber } = req.body;

    if (!recipientEmail || !vendor) {
      return res.status(400).json({ error: 'Recipient email and vendor are required' });
    }

    const student = await prisma.user.findFirst({
      where: { email: recipientEmail, role: Role.STUDENT }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student with this email not found' });
    }

    const logistics = await prisma.logisticsRecord.create({
      data: {
        recipientId: student.id,
        vendor,
        trackingNumber: trackingNumber || null,
        securityId,
        status: LogisticsStatus.RECEIVED_AT_GATE
      }
    });

    const studentNotification = await prisma.notification.create({
      data: {
        userId: student.id,
        title: 'New Courier Received',
        message: `A package from ${vendor} has been received at the security gate (Tracking: ${trackingNumber || 'N/A'}).`,
        type: 'COURIER',
      }
    });
    emitToUser(student.id, 'notification', studentNotification);
    emitToUser(student.id, 'courier:new', logistics);
    emitToRole(Role.SECURITY, 'courier:updated', logistics);

    return res.status(201).json({ message: 'Courier logged successfully', logistics });
  } catch (error) {
    console.error('Log courier error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const collectCourier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const courier = await prisma.logisticsRecord.findUnique({ where: { id } });
    if (!courier) {
      return res.status(404).json({ error: 'Courier record not found' });
    }

    const updatedCourier = await prisma.logisticsRecord.update({
      where: { id },
      data: {
        status: LogisticsStatus.COLLECTED,
        collectedAt: new Date()
      }
    });

    const studentNotification = await prisma.notification.create({
      data: {
        userId: courier.recipientId,
        title: 'Courier Collected',
        message: `Your package from ${courier.vendor} was collected from the security desk.`,
        type: 'COURIER',
      }
    });
    emitToUser(courier.recipientId, 'notification', studentNotification);
    emitToUser(courier.recipientId, 'courier:collected', updatedCourier);
    emitToRole(Role.SECURITY, 'courier:updated', updatedCourier);

    return res.json({ message: 'Courier status updated to collected', logistics: updatedCourier });
  } catch (error) {
    console.error('Collect courier error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCourierLogs = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const role = req.user?.role!;
    const { status } = req.query;

    let whereClause: any = {};
    if (role === Role.STUDENT) {
      whereClause.recipientId = userId;
    }

    if (status) {
      whereClause.status = (status as string).toUpperCase() as LogisticsStatus;
    }

    const logs = await prisma.logisticsRecord.findMany({
      where: whereClause,
      include: {
        recipient: {
          select: { name: true, email: true, hostel: true, room: true }
        },
        security: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ logs });
  } catch (error) {
    console.error('Get courier logs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const logVisitor = async (req: Request, res: Response) => {
  try {
    const securityId = req.user?.userId!;
    const { visitorName, hostel, room, purpose, studentEmail } = req.body;

    if (!visitorName || !hostel || !room || !purpose) {
      return res.status(400).json({ error: 'Visitor name, hostel, room, and purpose are required' });
    }

    let studentId: string | null = null;
    if (studentEmail) {
      const student = await prisma.user.findFirst({
        where: { email: studentEmail, role: Role.STUDENT }
      });
      if (student) {
        studentId = student.id;
      }
    }

    let resolvedHostelId: string | null = null;
    if (hostel) {
      const dbHostel = await prisma.hostel.findFirst({
        where: {
          OR: [
            { id: hostel },
            { code: hostel.toUpperCase() },
            { name: { equals: hostel, mode: 'insensitive' } }
          ]
        }
      });
      if (dbHostel) {
        resolvedHostelId = dbHostel.id;
      }
    }

    if (!resolvedHostelId) {
      return res.status(400).json({ error: 'Valid Hostel ID, Code, or Name is required' });
    }

    const visitor = await prisma.visitorRecord.create({
      data: {
        visitorName,
        hostelId: resolvedHostelId,
        room,
        purpose,
        studentId,
        securityId,
        entryTime: new Date()
      }
    });

    if (studentId) {
      const studentNotification = await prisma.notification.create({
        data: {
          userId: studentId,
          title: 'Visitor Logged',
          message: `${visitorName} has been logged as a visitor for you and checked in at the security gate.`,
          type: 'ANNOUNCEMENT',
        }
      });
      emitToUser(studentId, 'notification', studentNotification);
      emitToUser(studentId, 'visitor:checkin', visitor);
    }
    emitToRole(Role.SECURITY, 'visitor:updated', visitor);

    return res.status(201).json({ message: 'Visitor checked in successfully', visitor });
  } catch (error) {
    console.error('Log visitor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkoutVisitor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const visitor = await prisma.visitorRecord.findUnique({ where: { id } });
    if (!visitor) {
      return res.status(404).json({ error: 'Visitor record not found' });
    }

    const updatedVisitor = await prisma.visitorRecord.update({
      where: { id },
      data: { exitTime: new Date() }
    });

    if (updatedVisitor.studentId) {
      emitToUser(updatedVisitor.studentId, 'visitor:checkout', updatedVisitor);
    }
    emitToRole(Role.SECURITY, 'visitor:updated', updatedVisitor);

    return res.json({ message: 'Visitor checked out successfully', visitor: updatedVisitor });
  } catch (error) {
    console.error('Checkout visitor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVisitorLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.visitorRecord.findMany({
      include: {
        student: {
          select: { name: true, email: true }
        },
        security: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ logs });
  } catch (error) {
    console.error('Get visitor logs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSystemSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          lockdownActive: false,
          crowdAlertActive: false
        }
      });
    }
    return res.json({ settings });
  } catch (error) {
    console.error('Get system settings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleLockdown = async (req: Request, res: Response) => {
  try {
    const securityId = req.user?.userId!;
    const { active } = req.body;

    if (active === undefined) {
      return res.status(400).json({ error: 'active parameter is required (true or false)' });
    }

    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          lockdownActive: active,
          updatedById: securityId
        }
      });
    } else {
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          lockdownActive: active,
          updatedById: securityId
        }
      });
    }

    const allUsers = await prisma.user.findMany({ select: { id: true } });
    const notificationData = allUsers.map(user => ({
      userId: user.id,
      title: active ? 'EMERGENCY: HOSTEL LOCKDOWN ENABLED' : 'ALERT: HOSTEL LOCKDOWN LIFTED',
      message: active 
        ? 'A building lockdown has been activated. Please remain in your rooms and await further instructions.' 
        : 'The building lockdown has been lifted. Normal activities may resume.',
      type: 'EMERGENCY'
    }));

    await prisma.notification.createMany({ data: notificationData });

    broadcast('emergency:lockdown', {
      active,
      title: active ? 'EMERGENCY: HOSTEL LOCKDOWN ENABLED' : 'ALERT: HOSTEL LOCKDOWN LIFTED',
      message: active 
        ? 'A building lockdown has been activated. Please remain in your rooms and await further instructions.' 
        : 'The building lockdown has been lifted. Normal activities may resume.'
    });

    return res.json({ message: `Lockdown state toggled to ${active}`, settings });
  } catch (error) {
    console.error('Toggle lockdown error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleCrowdAlert = async (req: Request, res: Response) => {
  try {
    const securityId = req.user?.userId!;
    const { active } = req.body;

    if (active === undefined) {
      return res.status(400).json({ error: 'active parameter is required (true or false)' });
    }

    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          crowdAlertActive: active,
          updatedById: securityId
        }
      });
    } else {
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          crowdAlertActive: active,
          updatedById: securityId
        }
      });
    }

    if (active) {
      const usersToNotify = await prisma.user.findMany({
        where: { role: { in: [Role.STUDENT, Role.WARDEN, Role.SECURITY] } },
        select: { id: true }
      });
      const notificationData = usersToNotify.map(user => ({
        userId: user.id,
        title: 'CROWD DENSITY WARNING',
        message: 'High density crowd detected near common areas. Please maintain safe distance and disperse.',
        type: 'EMERGENCY'
      }));

      await prisma.notification.createMany({ data: notificationData });
    }

    broadcast('emergency:crowd-alert', {
      active,
      title: 'CROWD DENSITY WARNING',
      message: active 
        ? 'High density crowd detected near common areas. Please maintain safe distance and disperse.' 
        : 'Crowd alert cleared.'
    });

    return res.json({ message: `Crowd alert state toggled to ${active}`, settings });
  } catch (error) {
    console.error('Toggle crowd alert error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
