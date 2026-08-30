import prisma from '../config/prisma.js';

// Public Order Creation (From Cart / Buy Now)
export const createOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      state,
      pincode,
      subtotal,
      discount,
      couponCode,
      shipping,
      total,
      paymentMethod,
      items,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !address || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Please complete all customer shipping and garment item details.' });
    }

    // Generate unique atelier Order Sequence (e.g. MTR-49182)
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `MTR-${randomNum}`;

    // Check if customer is registered
    const existingUser = await prisma.user.findUnique({
      where: { email: customerEmail.trim().toLowerCase() },
    });

    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId: existingUser ? existingUser.id : (req.user ? req.user.id : null),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        address: address.trim(),
        city: city ? city.trim() : 'Mumbai',
        state: state ? state.trim() : 'Maharashtra',
        pincode: pincode ? pincode.trim() : '400001',
        subtotal: parseFloat(subtotal),
        discount: discount ? parseFloat(discount) : 0,
        couponCode: couponCode || null,
        shipping: shipping ? parseFloat(shipping) : 0,
        total: parseFloat(total),
        paymentMethod: paymentMethod || 'UPI / Online',
        status: 'Processing',
        items: {
          create: items.map((item) => ({
            productId: item.id || item.productId || null,
            name: item.name,
            size: item.size || 'M',
            color: item.color || '#000000',
            colorName: item.colorName || 'Noir Black',
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity) || 1,
            image: item.image,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Track Order by ID or Phone
export const trackOrder = async (req, res, next) => {
  try {
    const { query } = req.params;
    const cleanQuery = query.trim();

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: { equals: cleanQuery, mode: 'insensitive' } },
          { customerPhone: { equals: cleanQuery } },
          { trackingNumber: { equals: cleanQuery, mode: 'insensitive' } },
        ],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'No dispatch records found for this Order ID or Phone Number.' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Customer Get My Orders
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { customerEmail: req.user.email },
          { customerPhone: req.user.phone || '____none____' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get All Orders with Filter & Search
export const getAdminOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Order Status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: status || undefined,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined,
      },
      include: {
        items: true,
      },
    });

    res.json({
      success: true,
      message: `Order ${id} status updated to ${order.status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};
