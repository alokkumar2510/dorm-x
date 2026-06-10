import { Request } from 'express';
import prisma from '../prisma';

export const logAuditEvent = async (
  req: Request | null,
  action: string,
  details: any = null,
  actorOverride: { id?: string; email?: string } | null = null
) => {
  try {
    const actorId = actorOverride?.id || req?.user?.userId || null;
    const actorEmail = actorOverride?.email || req?.user?.email || null;
    const ipAddress = req?.ip || (req?.headers['x-forwarded-for'] as string) || null;
    const detailsStr = details ? JSON.stringify(details) : null;

    await prisma.auditLog.create({
      data: {
        action,
        actorId,
        actorEmail,
        ipAddress,
        details: detailsStr,
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};
