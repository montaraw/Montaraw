import prisma from '../config/prisma.js';

// Get All Coupons (Admin)
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

// Validate Coupon (Checkout / Cart)
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal, customer } = req.query;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.active) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const orderSubtotal = parseFloat(subtotal) || 0;
    if (orderSubtotal < (coupon.minOrder || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrder.toLocaleString()} required for this coupon.`,
      });
    }

    // Customer Audience Targeting Check
    const targetCustomers = (coupon.targetCustomers || 'all').trim();
    if (targetCustomers && targetCustomers.toLowerCase() !== 'all') {
      const allowedList = targetCustomers
        .split(',')
        .map((c) => c.trim().toLowerCase().replace(/\s+/g, ''))
        .filter(Boolean);

      const customerIdentity = (customer || '').trim().toLowerCase().replace(/\s+/g, '');
      const isAllowed = customerIdentity && allowedList.some((allowed) => {
        return customerIdentity === allowed || customerIdentity.includes(allowed) || allowed.includes(customerIdentity);
      });

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'This coupon is exclusively reserved for selected VIP customer accounts. Please log in with your registered email/phone to apply.',
        });
      }
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (orderSubtotal * coupon.discount) / 100;
      if (coupon.maxDiscount && coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discount, orderSubtotal);
    }

    discountAmount = Math.round(discountAmount);

    res.json({
      success: true,
      message: `Coupon ${coupon.code} applied successfully! You saved ₹${discountAmount.toLocaleString()}`,
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        type: coupon.type,
        discountAmount,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
        targetCustomers: coupon.targetCustomers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create Coupon (Admin)
export const createCoupon = async (req, res, next) => {
  try {
    const { code, discount, type, minOrder, maxDiscount, targetCustomers, description, active } = req.body;

    if (!code || discount === undefined) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required.' });
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: `Coupon with code "${cleanCode}" already exists.` });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discount: parseFloat(discount),
        type: type || 'percentage',
        minOrder: minOrder ? parseFloat(minOrder) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        targetCustomers: targetCustomers ? targetCustomers.trim() : 'all',
        description: description || '',
        active: active !== undefined ? Boolean(active) : true,
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

// Update Coupon (Admin)
export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const cleanData = {};
    if (body.code !== undefined) cleanData.code = body.code.trim().toUpperCase();
    if (body.discount !== undefined) cleanData.discount = parseFloat(body.discount);
    if (body.type !== undefined) cleanData.type = body.type;
    if (body.minOrder !== undefined) cleanData.minOrder = parseFloat(body.minOrder) || 0;
    if (body.maxDiscount !== undefined) cleanData.maxDiscount = body.maxDiscount ? parseFloat(body.maxDiscount) : null;
    if (body.targetCustomers !== undefined) cleanData.targetCustomers = body.targetCustomers.trim() || 'all';
    if (body.description !== undefined) cleanData.description = body.description;
    if (body.active !== undefined) cleanData.active = Boolean(body.active);

    const coupon = await prisma.coupon.update({
      where: { id },
      data: cleanData,
    });

    res.json({
      success: true,
      message: 'Coupon updated successfully.',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Coupon (Admin)
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
