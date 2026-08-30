import prisma from '../config/prisma.js';

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      coupons,
    });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.query;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.active) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const orderSubtotal = parseFloat(subtotal) || 0;
    if (orderSubtotal < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrder.toLocaleString()} required for this coupon.`,
      });
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (orderSubtotal * coupon.discount) / 100;
    } else {
      discountAmount = coupon.discount;
    }

    res.json({
      success: true,
      message: `Coupon ${coupon.code} applied successfully!`,
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        type: coupon.type,
        discountAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const { code, discount, type, minOrder } = req.body;

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        discount: parseFloat(discount),
        type: type || 'percentage',
        minOrder: minOrder ? parseFloat(minOrder) : 0,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Coupon deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
