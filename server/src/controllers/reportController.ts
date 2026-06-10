import { Request, Response } from 'express';
import prisma from '../prisma';
import { logAuditEvent } from '../middlewares/audit';

export const exportLeaveReport = async (req: Request, res: Response) => {
  try {
    const { hostelId, status, type, startDate, endDate } = req.query;

    let whereClause: any = {};
    if (hostelId) {
      whereClause.student = { hostelId: hostelId as string };
    }
    if (status) {
      whereClause.status = status as any;
    }
    if (type) {
      whereClause.type = type as any;
    }
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate as string);
      }
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        student: {
          include: { hostel: true }
        },
        warden: true
      },
      orderBy: { createdAt: 'desc' }
    });

    let csv = 'Leave ID,Student Name,Student Email,Hostel,Room,Type,Status,Start Date,End Date,Reason,Warden,Comments,Exit Time,Entry Time\n';

    leaves.forEach(l => {
      const studentName = `"${l.student.name.replace(/"/g, '""')}"`;
      const reason = `"${l.reason.replace(/"/g, '""')}"`;
      const comments = l.comments ? `"${l.comments.replace(/"/g, '""')}"` : '';
      const hostelName = l.student.hostel ? `"${l.student.hostel.name.replace(/"/g, '""')}"` : 'N/A';
      const room = l.student.room || 'N/A';
      const wardenName = l.warden ? `"${l.warden.name.replace(/"/g, '""')}"` : 'N/A';

      csv += `${l.id},${studentName},${l.student.email},${hostelName},${room},${l.type},${l.status},${l.startDate.toISOString()},${l.endDate.toISOString()},${reason},${wardenName},${comments},${l.exitTime ? l.exitTime.toISOString() : ''},${l.entryTime ? l.entryTime.toISOString() : ''}\n`;
    });

    await logAuditEvent(req, 'EXPORT_LEAVES_REPORT', { count: leaves.length });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leaves-report.csv"');
    return res.send(csv);
  } catch (error) {
    console.error('Export leave report error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const exportVisitorReport = async (req: Request, res: Response) => {
  try {
    const { hostelId, startDate, endDate } = req.query;

    let whereClause: any = {};
    if (hostelId) {
      whereClause.hostelId = hostelId as string;
    }
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate as string);
      }
    }

    const visitors = await prisma.visitorRecord.findMany({
      where: whereClause,
      include: {
        hostel: true,
        student: true,
        security: true
      },
      orderBy: { createdAt: 'desc' }
    });

    let csv = 'Visitor ID,Visitor Name,Hostel,Room,Purpose,Student Host,Entry Time,Exit Time,Guard Name\n';

    visitors.forEach(v => {
      const visitorName = `"${v.visitorName.replace(/"/g, '""')}"`;
      const hostelName = `"${v.hostel.name.replace(/"/g, '""')}"`;
      const purpose = `"${v.purpose.replace(/"/g, '""')}"`;
      const studentHost = v.student ? `"${v.student.name.replace(/"/g, '""')}"` : 'N/A';
      const guardName = `"${v.security.name.replace(/"/g, '""')}"`;

      csv += `${v.id},${visitorName},${hostelName},${v.room},${purpose},${studentHost},${v.entryTime.toISOString()},${v.exitTime ? v.exitTime.toISOString() : ''},${guardName}\n`;
    });

    await logAuditEvent(req, 'EXPORT_VISITORS_REPORT', { count: visitors.length });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="visitors-report.csv"');
    return res.send(csv);
  } catch (error) {
    console.error('Export visitor report error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
