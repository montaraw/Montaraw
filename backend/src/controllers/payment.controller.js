import crypto from 'crypto';
import prisma from '../config/prisma.js';
import { razorpay, getRazorpayKeyId, isRazorpayConfigured } from '../config/razorpay.js';
import { calculateVerifiedOrderTotals } from '../utils/pricingEngine.js';
import securityLog from '../utils/securityLogger.js';

/**
 * Step 1: Create Razorpay Order
 * POST /api/payments/create-order
 * Fully Server-Calculated Price & Anti-Tampering Protection
 */
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      state,
      pincode,
      items,
      couponCode,
      deliveryType,
      total: clientTotal,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required.' });
    }

    if (!customerName || !customerEmail || !customerPhone || !address) {
      return res.status(400).json({ success: false, message: 'Customer details and shipping address are required.' });
    }

    // 1. Server-Side Price, GST, Shipping, and Coupon Recalculation
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
      amountInPaise,
      verifiedItems,
    } = verifiedCalculation;

    // Detect client price tampering attempts
    if (clientTotal && Math.abs(parseFloat(clientTotal) - verifiedTotal) > 2) {
      securityLog.securityAlert('PRICE_TAMPERING_DETECTED', {
        clientSentTotal: clientTotal,
        serverCalculatedTotal: verifiedTotal,
        customerEmail,
        customerPhone,
      }, { req });
    }

    // 2. Generate unique internal receipt / order reference
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `MTR-${randomNum}`;

    let razorpayOrderId = null;
    let isMockGateway = false;

    if (isRazorpayConfigured()) {
      try {
        const options = {
          amount: amountInPaise,
          currency: 'INR',
          receipt: orderId,
          notes: {
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim().toLowerCase(),
            customerPhone: customerPhone.trim(),
            ...(notes || {}),
          },
        };
        const rzpOrder = await razorpay.orders.create(options);
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        securityLog.alert('RAZORPAY_API_ERROR', rzpErr.message, { req });
        return res.status(500).json({
          success: false,
          message: rzpErr.error?.description || 'Failed to initialize Razorpay payment gateway order.',
        });
      }
    } else {
      // Mock / Offline fallback when Razorpay keys are not yet provided in .env
      isMockGateway = true;
      razorpayOrderId = `order_mock_${Date.now()}`;
      securityLog.warn('RAZORPAY_MOCK_FALLBACK', 'Operating in test fallback mode without production keys', { req });
    }

    // Check if customer user is registered in DB
    let validUserId = null;
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: customerEmail.trim().toLowerCase() },
      });
      if (existingUser) {
        validUserId = existingUser.id;
      } else if (req.user?.id) {
        validUserId = req.user.id;
      }
    } catch {
      validUserId = null;
    }

    // 3. Create DB Order record with verified financial figures
    const order = await prisma.order.create({
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
        paymentMethod: 'UPI / Online',
        paymentStatus: 'Awaiting_Payment',
        razorpayOrderId,
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

    // Create initial payment log
    try {
      await prisma.paymentLog.create({
        data: {
          orderId: order.id,
          provider: 'RAZORPAY',
          action: 'ORDER_INITIALIZED',
          payload: {
            razorpayOrderId,
            amountInPaise,
            verifiedTotal,
            isMockGateway,
          },
        },
      });
    } catch {
      // ignore
    }

    securityLog.info('PAYMENT_ORDER_CREATED', { orderId: order.id, razorpayOrderId, total: verifiedTotal }, { req, userId: validUserId });

    res.status(201).json({
      success: true,
      order,
      orderId: order.id,
      razorpayOrderId,
      amountInPaise,
      currency: 'INR',
      keyId: getRazorpayKeyId(),
      isMockGateway,
    });
  } catch (error) {
    securityLog.alert('CREATE_ORDER_FAILED', error.message, { req });
    next(error);
  }
};

/**
 * Step 2: Cryptographic Signature Verification
 * POST /api/payments/verify
 */
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      orderId, // Internal Order ID e.g. MTR-49182
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing mandatory payment verification fields.',
      });
    }

    let isSignatureValid = false;

    if (isRazorpayConfigured()) {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      try {
        isSignatureValid = crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'utf-8'),
          Buffer.from(razorpay_signature || '', 'utf-8')
        );
      } catch {
        isSignatureValid = false;
      }
    } else {
      // If running without live keys in test mode, allow verification pass
      isSignatureValid = true;
    }

    if (!isSignatureValid) {
      securityLog.securityAlert('INVALID_RAZORPAY_SIGNATURE', {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
      }, { req });

      // Update Order payment status to Failed
      if (orderId || razorpay_order_id) {
        await prisma.order.updateMany({
          where: {
            OR: [
              { id: orderId || '' },
              { razorpayOrderId: razorpay_order_id },
            ],
          },
          data: {
            paymentStatus: 'Failed',
          },
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Digital signature mismatch or invalid response.',
      });
    }

    // Atomic Execution: Order Status Update + Inventory Stock Decrement + Payment Log inside a Transaction
    const result = await prisma.$transaction(async (tx) => {
      const targetOrder = await tx.order.findFirst({
        where: {
          OR: [
            { id: orderId || '' },
            { razorpayOrderId: razorpay_order_id },
          ],
        },
        include: {
          items: true,
        },
      });

      if (!targetOrder) {
        throw new Error('Order record not found for verification.');
      }

      // Check if already marked as Paid (prevent duplicate processing)
      if (targetOrder.paymentStatus === 'Paid') {
        return { alreadyPaid: true, order: targetOrder };
      }

      // 2. Decrement inventory atomically (Guarantees stock >= quantity)
      let outOfStockItemName = null;
      for (const item of targetOrder.items) {
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
            outOfStockItemName = item.name;
            break;
          }
        }
      }

      // If item was claimed by another user just before payment completed:
      if (outOfStockItemName) {
        // Mark as Refunded / Cancelled in DB
        const refundedOrder = await tx.order.update({
          where: { id: targetOrder.id },
          data: {
            paymentStatus: 'Refunded',
            paymentMethod: 'Razorpay (Online)',
            razorpayPaymentId,
            razorpaySignature: razorpay_signature || null,
            status: 'Cancelled',
          },
          include: { items: true },
        });

        await tx.paymentLog.create({
          data: {
            orderId: refundedOrder.id,
            provider: 'RAZORPAY_OVERSOLD_AUTO_REFUND',
            action: 'STOCK_DEPLETED_REFUND_INITIATED',
            payload: {
              outOfStockItemName,
              razorpay_payment_id,
              amount: refundedOrder.total,
              reason: 'Race condition: Item sold out during checkout',
            },
          },
        });

        return {
          alreadyPaid: false,
          oversold: true,
          outOfStockItemName,
          order: refundedOrder,
        };
      }

      // 1. Mark Order as Paid and Processing
      const finalizedOrder = await tx.order.update({
        where: { id: targetOrder.id },
        data: {
          paymentStatus: 'Paid',
          paymentMethod: 'Razorpay (Online)',
          razorpayPaymentId,
          razorpaySignature: razorpay_signature || null,
          status: 'Processing',
        },
        include: {
          items: true,
        },
      });

      // 3. Log Payment Transaction
      await tx.paymentLog.create({
        data: {
          orderId: finalizedOrder.id,
          provider: 'RAZORPAY',
          action: 'PAYMENT_VERIFIED_SUCCESS',
          payload: {
            razorpay_order_id,
            razorpay_payment_id,
            amount: finalizedOrder.total,
          },
        },
      });

      return { alreadyPaid: false, oversold: false, order: finalizedOrder };
    });

    // Handle Oversold Race Condition: Trigger Live Razorpay Refund
    if (result.oversold) {
      if (isRazorpayConfigured()) {
        try {
          await razorpay.payments.refund(razorpay_payment_id, {
            amount: Math.round(result.order.total * 100),
            notes: {
              orderId: result.order.id,
              reason: `Item ${result.outOfStockItemName} sold out during concurrent checkout`,
            },
          });
        } catch (rfErr) {
          securityLog.alert('RACE_CONDITION_REFUND_API_ERROR', rfErr.message, { req });
        }
      }

      securityLog.securityAlert('OVERSOLD_RACE_CONDITION_HANDLED', {
        orderId: result.order.id,
        outOfStockItem: result.outOfStockItemName,
        total: result.order.total,
      }, { req });

      return res.status(409).json({
        success: false,
        oversold: true,
        message: `Garment "${result.outOfStockItemName}" was claimed by another customer just prior to payment confirmation. A 100% full refund of ₹${result.order.total.toLocaleString()} has been automatically initiated to your original payment method.`,
        order: result.order,
      });
    }

    securityLog.info('PAYMENT_VERIFIED_SUCCESS', {
      orderId: result.order.id,
      razorpay_payment_id,
      total: result.order.total,
    }, { req });

    res.json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
      order: result.order,
    });
  } catch (error) {
    securityLog.alert('PAYMENT_VERIFY_ERROR', error.message, { req });
    next(error);
  }
};

/**
 * Step 3: Webhook Handler
 * POST /api/payments/webhook
 */
export const handleRazorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookEventId = req.headers['x-razorpay-event-id'];

  // Signature must be present for webhook processing
  if (!webhookSignature) {
    securityLog.securityAlert('WEBHOOK_MISSING_SIGNATURE', { ip: req.ip }, { req });
    return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
  }

  if (!webhookSecret) {
    securityLog.warn('WEBHOOK_SECRET_NOT_CONFIGURED', 'RAZORPAY_WEBHOOK_SECRET not set in environment', { req });
    return res.status(200).json({ received: true, warning: 'Webhook secret not configured in backend' });
  }

  try {
    const rawBodyBuffer = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBodyBuffer)
      .digest('hex');

    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(webhookSignature, 'utf-8')
      );
    } catch {
      isValid = false;
    }

    if (!isValid) {
      securityLog.securityAlert('INVALID_WEBHOOK_SIGNATURE', {
        webhookEventId,
        receivedSignature: webhookSignature,
      }, { req });
      return res.status(400).send('Invalid webhook signature');
    }

    const payload = req.body;
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id;
    const razorpayPaymentId = paymentEntity?.id;

    // Idempotency check with WebhookEvent model
    if (webhookEventId) {
      try {
        const existing = await prisma.webhookEvent.findUnique({
          where: { eventId: webhookEventId },
        });
        if (existing && existing.isProcessed) {
          securityLog.info('WEBHOOK_DUPLICATE_IGNORED', { webhookEventId, event }, { req });
          return res.status(200).json({ received: true, duplicate: true });
        }
        await prisma.webhookEvent.upsert({
          where: { eventId: webhookEventId },
          update: {},
          create: {
            eventId: webhookEventId,
            eventType: event || 'unknown',
            payload: payload || {},
          },
        });
      } catch {
        // non-blocking
      }
    }

    // Atomic State & Inventory Processing inside Prisma Transaction
    if (event === 'payment.captured' || event === 'order.paid') {
      if (razorpayOrderId) {
        await prisma.$transaction(async (tx) => {
          const targetOrder = await tx.order.findFirst({
            where: { razorpayOrderId },
            include: { items: true },
          });

          if (targetOrder) {
            const wasAlreadyPaid = targetOrder.paymentStatus === 'Paid';

            await tx.order.update({
              where: { id: targetOrder.id },
              data: {
                paymentStatus: 'Paid',
                razorpayPaymentId: razorpayPaymentId || targetOrder.razorpayPaymentId,
                status: 'Processing',
              },
            });

            // Decrement inventory if webhook is first to capture payment
            if (!wasAlreadyPaid) {
              for (const item of targetOrder.items) {
                if (item.productId) {
                  try {
                    await tx.product.update({
                      where: { id: item.productId },
                      data: { stock: { decrement: Math.max(1, item.quantity) } },
                    });
                  } catch {
                    // ignore
                  }
                }
              }
            }

            await tx.paymentLog.create({
              data: {
                orderId: targetOrder.id,
                provider: 'RAZORPAY_WEBHOOK',
                action: event,
                payload: {
                  webhookEventId,
                  razorpayOrderId,
                  razorpayPaymentId,
                  amount: paymentEntity?.amount,
                },
              },
            });
          }
        });
      }
    } else if (event === 'payment.failed') {
      if (razorpayOrderId) {
        await prisma.order.updateMany({
          where: { razorpayOrderId, paymentStatus: 'Pending' },
          data: {
            paymentStatus: 'Failed',
          },
        });

        await prisma.paymentLog.create({
          data: {
            orderId: razorpayOrderId,
            provider: 'RAZORPAY_WEBHOOK',
            action: 'PAYMENT_FAILED',
            payload: {
              webhookEventId,
              razorpayOrderId,
              errorDescription: paymentEntity?.error_description,
            },
          },
        });
      }
    }

    if (webhookEventId) {
      try {
        await prisma.webhookEvent.update({
          where: { eventId: webhookEventId },
          data: { isProcessed: true, processedAt: new Date() },
        });
      } catch {
        // non-blocking
      }
    }

    securityLog.info('WEBHOOK_PROCESSED_SUCCESS', { event, webhookEventId, razorpayOrderId }, { req });
    res.status(200).json({ received: true, status: 'processed' });
  } catch (err) {
    securityLog.alert('WEBHOOK_PROCESSING_ERROR', err.message, { req });
    res.status(200).json({ received: true, error: err.message });
  }
};

/**
 * Step 4: Get Gateway Public Key
 * GET /api/payments/config
 */
export const getPaymentConfig = (req, res) => {
  res.json({
    success: true,
    keyId: getRazorpayKeyId(),
    isConfigured: isRazorpayConfigured(),
    currency: 'INR',
  });
};
