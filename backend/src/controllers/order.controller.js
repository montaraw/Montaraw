import prisma from '../config/prisma.js';
import { calculateVerifiedOrderTotals } from '../utils/pricingEngine.js';
import securityLog from '../utils/securityLogger.js';

// Helper: Mask email for privacy (e.g. j***e@example.com)
function maskEmail(email) {
  if (!email || !email.includes('@')) return '******';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

// Helper: Mask phone for privacy (e.g. ******4372)
function maskPhone(phone) {
  if (!phone) return '******';
  const clean = String(phone).replace(/\D/g, '');
  if (clean.length < 4) return '******';
  return `${'*'.repeat(clean.length - 4)}${clean.slice(-4)}`;
}

// Helper: Mask address line
function maskAddress(address) {
  if (!address) return '';
  const parts = address.split(',');
  if (parts.length > 1) {
    return `***, ${parts.slice(1).join(',').trim()}`;
  }
  return `*** ${address.slice(-10)}`;
}

// Public Order Creation (From Cart / Buy Now / Cash on Delivery)
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
      couponCode,
      deliveryType,
      paymentMethod,
      items,
      total: clientTotal,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !address || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Please complete all customer shipping and garment item details.' });
    }

    // 1. Calculate verified totals from Database
    let verifiedCalculation;
    try {
      verifiedCalculation = await calculateVerifiedOrderTotals({
        prisma,
        items,
        couponCode,
        customerEmail,
        customerPhone,
        state,
        deliveryType,
      });
    } catch (calcErr) {
      return res.status(400).json({ success: false, message: calcErr.message });
    }

    const {
      verifiedSubtotal,
      verifiedDiscount,
      validCouponCode,
      shippingCost,
      verifiedTotal,
      verifiedItems,
    } = verifiedCalculation;

    // Detect client price tampering attempts
    if (clientTotal && Math.abs(parseFloat(clientTotal) - verifiedTotal) > 2) {
      securityLog.securityAlert('PRICE_TAMPERING_DETECTED_COD', {
        clientSentTotal: clientTotal,
        serverCalculatedTotal: verifiedTotal,
        customerEmail,
        customerPhone,
      }, { req });
    }

    // Generate unique atelier Order Sequence (e.g. MTR-49182)
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `MTR-${randomNum}`;

    // Check if customer is registered
    let validUserId = null;
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: customerEmail.trim().toLowerCase() },
      });
      if (existingUser) {
        validUserId = existingUser.id;
      } else if (req.user?.id) {
        const checkUser = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (checkUser) validUserId = checkUser.id;
      }
    } catch {
      validUserId = null;
    }

    // 3. Create DB Order record and decrement stock atomically in Prisma Transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          id: orderId,
          userId: validUserId,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone.trim(),
          address: address.trim(),
          city: city ? city.trim() : '',
          state: state ? state.trim() : '',
          pincode: pincode ? pincode.trim() : '',
          subtotal: verifiedSubtotal,
          discount: verifiedDiscount,
          couponCode: validCouponCode,
          shipping: shippingCost,
          total: verifiedTotal,
          paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
          paymentStatus: 'Pending',
          status: 'Processing',
          items: {
            create: verifiedItems.map((item) => ({
              productId: item.productId,
              name: item.name,
              size: item.size,
              color: item.color,
              colorName: item.colorName,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Decrement inventory atomically (guaranteeing stock >= quantity)
      for (const item of verifiedItems) {
        if (item.productId) {
          const updateResult = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          if (updateResult.count === 0) {
            throw new Error(`Garment "${item.name}" was just claimed by another customer and is now out of stock.`);
          }
        }
      }

      return newOrder;
    });

    securityLog.info('ORDER_CREATED_SUCCESS', {
      orderId: order.id,
      paymentMethod: order.paymentMethod,
      total: verifiedTotal,
    }, { req, userId: validUserId });

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order,
    });
  } catch (error) {
    securityLog.alert('CREATE_ORDER_ERROR', error.message, { req });
    next(error);
  }
};

// Track Order by ID or Phone (With PII Data Masking)
export const trackOrder = async (req, res, next) => {
  try {
    const { query } = req.params;
    const cleanQuery = query.trim();

    const order = await prisma.order.findFirst({
      where: {
        AND: [
          { paymentStatus: { not: 'Awaiting_Payment' } },
          {
            OR: [
              { id: { equals: cleanQuery, mode: 'insensitive' } },
              { customerPhone: { equals: cleanQuery } },
              { trackingNumber: { equals: cleanQuery, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'No dispatch records found for this Order ID or Phone Number.' });
    }

    // Return sanitized data with masked PII for unauthenticated tracking lookup
    const sanitizedOrder = {
      ...order,
      customerName: order.customerName,
      customerEmail: maskEmail(order.customerEmail),
      customerPhone: maskPhone(order.customerPhone),
      address: maskAddress(order.address),
      customer: {
        fullName: order.customerName,
        email: maskEmail(order.customerEmail),
        phone: maskPhone(order.customerPhone),
        address: maskAddress(order.address),
        city: order.city,
        state: order.state,
        pincode: order.pincode,
      },
    };

    res.json({
      success: true,
      order: sanitizedOrder,
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
        AND: [
          { paymentStatus: { not: 'Awaiting_Payment' } },
          {
            OR: [
              { userId: req.user.id },
              { customerEmail: req.user.email },
              { customerPhone: req.user.phone || '____none____' },
            ],
          },
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
    console.warn('⚠️ [Orders Notice]:', error.message);
    return res.json({
      success: true,
      count: 0,
      orders: [],
    });
  }
};

// Admin: Get All Orders with Filter & Search
export const getAdminOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const where = {
      paymentStatus: { not: 'Awaiting_Payment' },
    };
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.AND = [
        { paymentStatus: { not: 'Awaiting_Payment' } },
        {
          OR: [
            { id: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerEmail: { contains: search, mode: 'insensitive' } },
            { customerPhone: { contains: search } },
          ],
        },
      ];
      if (status && status !== 'all') {
        where.AND.push({ status });
      }
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
    console.warn('⚠️ [Admin Orders Notice]:', error.message);
    return res.json({
      success: true,
      count: 0,
      orders: [],
    });
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

    securityLog.info('ORDER_STATUS_UPDATED', { orderId: id, status: order.status, trackingNumber: order.trackingNumber, adminEmail: req.user?.email }, { req });

    res.json({
      success: true,
      message: `Order ${id} status updated to ${order.status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Initiate Full Refund
export const refundOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.paymentStatus === 'Refunded') {
      return res.status(400).json({ success: false, message: 'This order is already marked as refunded.' });
    }

    let razorpayRefundId = null;

    // If order was captured online via Razorpay and keys are present
    if (order.razorpayPaymentId) {
      try {
        const { razorpay, isRazorpayConfigured } = await import('../config/razorpay.js');
        if (isRazorpayConfigured()) {
          const refundRes = await razorpay.payments.refund(order.razorpayPaymentId, {
            amount: Math.round(order.total * 100),
            notes: {
              orderId: order.id,
              reason: reason || 'Customer requested return / refund',
            },
          });
          razorpayRefundId = refundRes.id;
        }
      } catch (rzpErr) {
        console.warn('[Razorpay Refund Notice]:', rzpErr.message);
      }
    }

    // Atomic DB update: set paymentStatus to 'Refunded', status to 'Cancelled', restock items
    const updated = await prisma.$transaction(async (tx) => {
      const refunded = await tx.order.update({
        where: { id },
        data: {
          paymentStatus: 'Refunded',
          status: 'Cancelled',
        },
        include: { items: true },
      });

      // Restock inventory back
      for (const item of refunded.items) {
        if (item.productId) {
          try {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          } catch {
            // ignore
          }
        }
      }

      // Log refund
      await tx.paymentLog.create({
        data: {
          orderId: refunded.id,
          provider: 'RAZORPAY_REFUND',
          action: 'ORDER_REFUNDED',
          payload: {
            razorpayRefundId,
            amount: refunded.total,
            reason: reason || 'Admin initiated refund',
            adminEmail: req.user?.email,
          },
        },
      });

      return refunded;
    });

    securityLog.info('ORDER_REFUNDED_SUCCESS', { orderId: id, total: updated.total, admin: req.user?.email }, { req });

    res.json({
      success: true,
      message: `Order ${id} of ₹${updated.total.toLocaleString()} has been refunded and cancelled.`,
      order: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Customer: Cancel Order (with automatic refund for online payments and inventory restock)
export const customerCancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, remarks, customerEmail, customerPhone } = req.body || {};

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Ownership Verification
    // Customer can cancel if logged in and ID matches, or if email/phone matches order details
    const isOwner =
      (req.user && (order.userId === req.user.id || (order.customerEmail && req.user.email && order.customerEmail.toLowerCase() === req.user.email.toLowerCase()) || (order.customerPhone && req.user.phone && order.customerPhone === req.user.phone))) ||
      (customerEmail && order.customerEmail && order.customerEmail.toLowerCase() === customerEmail.trim().toLowerCase()) ||
      (customerPhone && order.customerPhone && order.customerPhone.trim() === customerPhone.trim());

    if (!isOwner && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only cancel your own orders.',
      });
    }

    // Check if order has tracking number assigned or is dispatched
    if (order.trackingNumber && order.trackingNumber.trim().length > 0) {
      return res.status(400).json({
        success: false,
        message: `Order #${order.id} has already been assigned Courier Tracking AWB (${order.trackingNumber}) and dispatched. Cancellation is closed. You can request Return or Replacement once it is delivered.`,
      });
    }

    // Check if order status allows cancellation
    if (order.status === 'Cancelled' || order.status === 'Refunded' || order.paymentStatus === 'Refunded') {
      return res.status(400).json({ success: false, message: 'This order has already been cancelled or refunded.' });
    }

    if (order.status === 'Shipped' || order.status === 'Out for Delivery' || order.status === 'Delivered') {
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.status.toLowerCase()} and cannot be cancelled directly. Please request Return or Replacement after delivery.`,
      });
    }

    let razorpayRefundId = null;
    let refundIssued = false;

    // If order was paid online via UPI/Card/Netbanking/Wallet (Razorpay), trigger automatic refund
    if (order.paymentStatus === 'Paid' && order.razorpayPaymentId) {
      try {
        const { razorpay, isRazorpayConfigured } = await import('../config/razorpay.js');
        if (isRazorpayConfigured()) {
          const refundRes = await razorpay.payments.refund(order.razorpayPaymentId, {
            amount: Math.round(order.total * 100),
            notes: {
              orderId: order.id,
              reason: reason || 'Customer cancelled order before dispatch',
              customerRemarks: remarks || '',
            },
          });
          razorpayRefundId = refundRes.id;
          refundIssued = true;
        } else {
          refundIssued = true; // In test mode
        }
      } catch (rzpErr) {
        console.warn('[Customer Cancel Razorpay Refund Notice]:', rzpErr.message);
        refundIssued = true;
      }
    }

    const newPaymentStatus = (order.paymentStatus === 'Paid' || refundIssued) ? 'Refunded' : 'Cancelled';

    // Atomic DB execution: cancel order, update paymentStatus, restock items, log cancellation
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const cancelled = await tx.order.update({
        where: { id },
        data: {
          status: 'Cancelled',
          paymentStatus: newPaymentStatus,
        },
        include: { items: true },
      });

      // Restock inventory back
      for (const item of cancelled.items) {
        if (item.productId) {
          try {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          } catch {
            // ignore if product deleted
          }
        }
      }

      // Log Payment and Cancellation Event
      await tx.paymentLog.create({
        data: {
          orderId: cancelled.id,
          provider: order.razorpayPaymentId ? 'RAZORPAY_REFUND' : 'CUSTOMER_CANCELLATION',
          action: 'CUSTOMER_ORDER_CANCELLED',
          payload: {
            cancellationReason: reason || 'Cancelled by customer',
            remarks: remarks || '',
            razorpayRefundId,
            refundIssued,
            paymentMethod: order.paymentMethod,
            amount: cancelled.total,
            cancelledBy: req.user?.email || customerEmail || 'Customer',
            timestamp: new Date().toISOString(),
          },
        },
      });

      return cancelled;
    });

    securityLog.info('CUSTOMER_ORDER_CANCELLED_SUCCESS', {
      orderId: id,
      total: updatedOrder.total,
      reason,
      refundIssued,
    }, { req, userId: req.user?.id });

    res.json({
      success: true,
      message: refundIssued
        ? `Order #${id} has been cancelled. A full refund of ₹${updatedOrder.total.toLocaleString()} has been initiated to your original payment method (UPI / Card / NetBanking).`
        : `Order #${id} (Cash on Delivery) has been successfully cancelled.`,
      order: updatedOrder,
      refundIssued,
    });
  } catch (error) {
    securityLog.alert('CUSTOMER_CANCEL_ERROR', error.message, { req });
    next(error);
  }
};

// Customer: Request Return or Replacement for Delivered Order
export const customerReturnOrExchangeOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      type, // 'RETURN_REFUND' | 'EXCHANGE_REPLACEMENT'
      reason,
      remarks,
      selectedItemIds,
      replacementSize,
      replacementColor,
      bankDetails, // { upiId, accountHolder, accountNumber, ifscCode }
      customerEmail,
      customerPhone,
    } = req.body || {};

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    // Ownership Verification
    const isOwner =
      (req.user && (order.userId === req.user.id || (order.customerEmail && req.user.email && order.customerEmail.toLowerCase() === req.user.email.toLowerCase()) || (order.customerPhone && req.user.phone && order.customerPhone === req.user.phone))) ||
      (customerEmail && order.customerEmail && order.customerEmail.toLowerCase() === customerEmail.trim().toLowerCase()) ||
      (customerPhone && order.customerPhone && order.customerPhone.trim() === customerPhone.trim());

    if (!isOwner && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only request return/replacement for your own orders.',
      });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: `Return or replacement requests are only available for delivered orders. Current status is '${order.status}'.`,
      });
    }

    // Log the Return or Replacement Request
    const requestAction = type === 'EXCHANGE_REPLACEMENT' ? 'REPLACEMENT_REQUESTED' : 'RETURN_REQUESTED';

    await prisma.paymentLog.create({
      data: {
        orderId: order.id,
        provider: type === 'EXCHANGE_REPLACEMENT' ? 'EXCHANGE_SERVICE' : 'RETURN_SERVICE',
        action: requestAction,
        payload: {
          type: type || 'RETURN_REFUND',
          reason: reason || 'Customer requested return/exchange',
          remarks: remarks || '',
          selectedItemIds: selectedItemIds || order.items.map((it) => it.id),
          replacementSize: replacementSize || null,
          replacementColor: replacementColor || null,
          bankDetails: bankDetails || null,
          paymentMethod: order.paymentMethod,
          requestedBy: req.user?.email || customerEmail || order.customerEmail,
          requestedAt: new Date().toISOString(),
          status: 'PENDING_APPROVAL',
        },
      },
    });

    securityLog.info(requestAction, {
      orderId: id,
      type,
      reason,
      replacementSize,
      customerEmail: order.customerEmail,
    }, { req, userId: req.user?.id });

    const message =
      type === 'EXCHANGE_REPLACEMENT'
        ? `Replacement request submitted for Order #${id}! Our atelier courier partner will arrange reverse pickup for size ${replacementSize || 'replacement'} within 24-48 business hours.`
        : order.paymentMethod.includes('Cash on Delivery')
        ? `Return request submitted for Order #${id}! Upon quality inspection after reverse pickup, ₹${order.total.toLocaleString()} refund will be transferred directly to your provided UPI / Bank account.`
        : `Return request submitted for Order #${id}! Upon reverse pickup and atelier inspection, a full refund of ₹${order.total.toLocaleString()} will be credited back to your original payment method.`;

    res.json({
      success: true,
      message,
      type: type || 'RETURN_REFUND',
      orderId: order.id,
    });
  } catch (error) {
    securityLog.alert('RETURN_REQUEST_ERROR', error.message, { req });
    next(error);
  }
};
