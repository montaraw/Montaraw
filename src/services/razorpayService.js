/**
 * Montaraw Luxury Atelier Razorpay Checkout Client Service
 * Dynamically loads official Razorpay SDK and opens secure payment modal.
 */

let sdkPromise = null;

export const loadRazorpaySdk = () => {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve(true);
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.warn('⚠️ [Razorpay SDK] Failed to load official Razorpay checkout script from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return sdkPromise;
};

/**
 * Open Razorpay Standard Checkout Modal
 */
export const openRazorpayModal = async ({
  orderId, // Internal Order ID e.g. MTR-49182
  razorpayOrderId,
  amountInPaise,
  currency = 'INR',
  keyId,
  customer = {},
  orderDescription = 'Montaraw Atelier Haute Couture Order',
  onSuccess,
  onFailure,
  onDismiss,
}) => {
  const isLoaded = await loadRazorpaySdk();

  if (!isLoaded || !window.Razorpay) {
    // If SDK cannot be loaded from CDN (e.g. offline or adblocker), simulate/fallback gracefully
    console.warn('[Razorpay] SDK not accessible from network. Checking mock/fallback...');
    if (razorpayOrderId && razorpayOrderId.startsWith('order_mock_')) {
      // Offline / Test mock auto-verification
      if (onSuccess) {
        onSuccess({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature_verified',
        });
      }
      return;
    }
    if (onFailure) {
      onFailure(new Error('Unable to connect to Razorpay payment gateway. Please check your internet connection or use Cash on Delivery.'));
    }
    return;
  }

  const options = {
    key: keyId || 'rzp_test_placeholder',
    amount: amountInPaise,
    currency: currency || 'INR',
    name: 'MONTARAW ATELIER',
    description: orderDescription,
    image: '/favicon.svg',
    order_id: razorpayOrderId,
    prefill: {
      name: customer.fullName || customer.name || '',
      email: customer.email || '',
      contact: (customer.phone || '').replace(/\D/g, '').slice(-10),
    },
    notes: {
      orderId: orderId || '',
      customerEmail: customer.email || '',
    },
    theme: {
      color: '#E50914', // Brand Luxury Red
      backdrop_color: 'rgba(0, 0, 0, 0.85)',
      hide_topbar: false,
    },
    modal: {
      confirm_close: true,
      escape: true,
      ondismiss: () => {
        if (onDismiss) onDismiss();
      },
    },
    handler: (response) => {
      // response: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      if (onSuccess) {
        onSuccess(response);
      }
    },
  };

  try {
    const rzpInstance = new window.Razorpay(options);

    rzpInstance.on('payment.failed', (response) => {
      console.warn('[Razorpay Payment Failed]:', response.error);
      if (onFailure) {
        onFailure(response.error);
      }
    });

    rzpInstance.open();
  } catch (err) {
    console.error('[Razorpay Instance Open Error]:', err);
    if (onFailure) {
      onFailure(err);
    }
  }
};
