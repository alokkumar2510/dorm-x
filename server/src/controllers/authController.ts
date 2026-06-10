import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { Role } from '@prisma/client';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const generateAccessToken = (userId: string, email: string, role: Role): string => {
  const secret = process.env.JWT_ACCESS_SECRET || 'access_secret_fallback';
  return jwt.sign({ userId, email, role }, secret, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, hostel, room, phone, studentEmail } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields: email, password, name, role' });
    }

    const uppercaseRole = role.toUpperCase() as Role;
    if (!Object.values(Role).includes(uppercaseRole)) {
      return res.status(400).json({ error: `Invalid role: ${role}. Must be one of STUDENT, WARDEN, SECURITY, PARENT` });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let parentId: string | undefined;

    // If student is registering and has a parent email, link them
    if (uppercaseRole === Role.STUDENT && studentEmail) {
      const parentUser = await prisma.user.findFirst({
        where: { email: studentEmail, role: Role.PARENT }
      });
      if (parentUser) {
        parentId = parentUser.id;
      }
    }

    let resolvedHostelId: string | null = null;
    if (hostel) {
      const dbHostel = await prisma.hostel.findFirst({
        where: {
          OR: [
            { code: hostel.toUpperCase() },
            { name: { equals: hostel, mode: 'insensitive' } }
          ]
        }
      });
      if (dbHostel) {
        resolvedHostelId = dbHostel.id;
      }
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: uppercaseRole,
        hostelId: resolvedHostelId,
        room: room || null,
        phone: phone || null,
        parentId: parentId || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hostelId: true,
        hostel: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        room: true,
        phone: true,
        parentId: true,
        createdAt: true,
      }
    });

    // If parent registers, link student by passing studentEmail
    if (uppercaseRole === Role.PARENT && studentEmail) {
      const studentUser = await prisma.user.findFirst({
        where: { email: studentEmail, role: Role.STUDENT }
      });
      if (studentUser) {
        await prisma.user.update({
          where: { id: studentUser.id },
          data: { parentId: user.id }
        });
      }
    }

    return res.status(201).json({ message: 'User registered successfully', user });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user.id, user.email, user.role);

    // Generate Refresh Token
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret_fallback';
    const rawRefreshToken = jwt.sign({ userId: user.id }, refreshSecret, { expiresIn: '7d' });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: {
        token: rawRefreshToken,
        userId: user.id,
        expiresAt,
      }
    });

    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return res.json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hostelId: user.hostelId,
        room: user.room,
        phone: user.phone,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!dbToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    if (dbToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: dbToken.id } });
      return res.status(403).json({ error: 'Refresh token expired' });
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({ where: { id: dbToken.id } });

    // Generate new access token and refresh token
    const newAccessToken = generateAccessToken(dbToken.user.id, dbToken.user.email, dbToken.user.role);
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret_fallback';
    const newRawRefreshToken = jwt.sign({ userId: dbToken.user.id }, refreshSecret, { expiresIn: '7d' });
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: {
        token: newRawRefreshToken,
        userId: dbToken.user.id,
        expiresAt,
      }
    });

    res.cookie('refreshToken', newRawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return res.json({
      accessToken: newAccessToken,
      user: {
        id: dbToken.user.id,
        email: dbToken.user.email,
        name: dbToken.user.name,
        role: dbToken.user.role,
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
