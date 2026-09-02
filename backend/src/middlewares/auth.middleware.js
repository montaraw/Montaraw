import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'montaraw_luxury_secret_jwt_key_2025_atelier');

    // Fast-path for dedicated administrator
    if (decoded.role === 'ADMIN' || decoded.userId === 'admin-root' || decoded.email === 'adminmontaraw@gmail.com') {
      req.user = {
        id: decoded.userId || 'admin-root',
        email: decoded.email || 'adminmontaraw@gmail.com',
        fullName: 'Montaraw Administrator',
        role: 'ADMIN',
      };
      return next();
    }

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
        },
      });
    } catch {
      // If DB is offline, fall back to decoded token payload
      user = {
        id: decoded.userId,
        email: decoded.email,
        fullName: decoded.fullName || 'Customer',
        role: decoded.role || 'CUSTOMER',
      };
    }

    if (!user) {
      user = {
        id: decoded.userId,
        email: decoded.email,
        fullName: decoded.fullName || 'Customer',
        role: decoded.role || 'CUSTOMER',
      };
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token.', error: error.message });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator rights required.' });
  }
  next();
};
