import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'montaraw_luxury_secret_jwt_key_2025_atelier',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Customer Register
export const registerCustomer = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, address, city, state, pincode } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide full name, email, and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null,
        city: city ? city.trim() : null,
        state: state ? state.trim() : 'Maharashtra',
        pincode: pincode ? pincode.trim() : null,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        role: true,
      },
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Customer Login
export const loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. No customer found with this email.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken(user.id, user.role);

    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      role: user.role,
    };

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// Dedicated Admin Login
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Admin email and password required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ success: false, message: 'Access denied. Invalid administrator credentials.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid administrator password.' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Admin authenticated successfully.',
      token,
      admin: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Current User Profile (from Token)
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

// Update Customer Profile & Shipping Details
export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, address, city, state, pincode } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName: fullName !== undefined ? fullName : req.user.fullName,
        phone: phone !== undefined ? phone : req.user.phone,
        address: address !== undefined ? address : req.user.address,
        city: city !== undefined ? city : req.user.city,
        state: state !== undefined ? state : req.user.state,
        pincode: pincode !== undefined ? pincode : req.user.pincode,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        role: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};
