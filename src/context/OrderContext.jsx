import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { api } from '../api/client';

const OrderContext = createContext(null);

// Normalize order structure so both flat fields & nested customer object exist
export function normalizeOrder(o) {
  if (!o) return null;
  const fullName = o.customer?.fullName || o.customerName || 'Atelier Customer';
  const email = o.customer?.email || o.customerEmail || '';
  const phone = o.customer?.phone || o.customerPhone || '';
  const address = o.customer?.address || o.address || '';
  const city = o.customer?.city || o.city || 'Mumbai';
  const state = o.customer?.state || o.state || 'Maharashtra';
  const pincode = o.customer?.pincode || o.pincode || '400001';

  return {
    ...o,
    id: o.id || `MTR-${Math.floor(10000 + Math.random() * 90000)}`,
    status: o.status || 'Processing',
    createdAt: o.createdAt || new Date().toISOString(),
    updatedAt: o.updatedAt || new Date().toISOString(),
    customerName: fullName,
    customerEmail: email,
    customerPhone: phone,
    address,
    city,
    state,
    pincode,
    customer: {
      fullName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
    },
    items: Array.isArray(o.items) ? o.items : [],
    subtotal: Number(o.subtotal) || 0,
    discount: Number(o.discount) || 0,
    couponCode: o.couponCode || null,
    shipping: Number(o.shipping) || 0,
    total: Number(o.total) || 0,
    paymentMethod: o.paymentMethod || 'UPI / Online',
  };
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('montaraw_local_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeOrder);
        }
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [loading, setLoading] = useState(false);

  // Keep local storage synced with orders
  const saveLocalOrders = useCallback((newOrders) => {
    try {
      localStorage.setItem('montaraw_local_orders', JSON.stringify(newOrders));
    } catch {
      // ignore
    }
  }, []);

  // Sync orders with backend
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      let backendOrders = [];

      if (localStorage.getItem('montaraw_admin_token')) {
        const res = await api.getAdminOrders();
        if (res.orders && Array.isArray(res.orders)) {
          backendOrders = res.orders.map(normalizeOrder);
        }
      } else if (localStorage.getItem('montaraw_customer_token')) {
        const res = await api.getMyOrders();
        if (res.orders && Array.isArray(res.orders)) {
          backendOrders = res.orders.map(normalizeOrder);
        }
      }

      if (backendOrders.length > 0) {
        setOrders((prev) => {
          // Merge backend orders with local orders without duplicates
          const orderMap = new Map();
          backendOrders.forEach((o) => orderMap.set(o.id, o));
          prev.forEach((o) => {
            if (!orderMap.has(o.id)) {
              orderMap.set(o.id, o);
            }
          });
          const merged = Array.from(orderMap.values()).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          saveLocalOrders(merged);
          return merged;
        });
      }
    } catch (err) {
      console.warn('[OrderContext] Backend fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  }, [saveLocalOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Place a new order (Supports Online / COD / Offline fallback)
  const createOrder = useCallback(
    async (orderData) => {
      const fullName = orderData.customer?.fullName || orderData.customerName || 'Customer';
      const email = orderData.customer?.email || orderData.customerEmail || '';
      const phone = orderData.customer?.phone || orderData.customerPhone || '';
      const address = orderData.customer?.address || orderData.address || '';
      const city = orderData.customer?.city || orderData.city || 'Mumbai';
      const state = orderData.customer?.state || orderData.state || 'Maharashtra';
      const pincode = orderData.customer?.pincode || orderData.pincode || '400001';

      const payload = {
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        address,
        city,
        state,
        pincode,
        subtotal: orderData.subtotal,
        discount: orderData.discount || 0,
        couponCode: orderData.couponCode || null,
        shipping: orderData.shipping || 0,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod || 'UPI / Online',
        items: orderData.items || [],
      };

      let finalOrder = null;

      try {
        const res = await api.createOrder(payload);
        if (res && res.order) {
          finalOrder = normalizeOrder(res.order);
        }
      } catch (e) {
        console.warn('[OrderContext] API order creation fallback to local storage:', e.message);
      }

      // If backend is unavailable or not returning an order, create reliable local order
      if (!finalOrder) {
        finalOrder = normalizeOrder({
          ...payload,
          id: `MTR-${Math.floor(10000 + Math.random() * 90000)}`,
          status: 'Processing',
          createdAt: new Date().toISOString(),
        });
      }

      setOrders((prev) => {
        const updated = [finalOrder, ...prev.filter((o) => o.id !== finalOrder.id)];
        saveLocalOrders(updated);
        return updated;
      });

      return finalOrder;
    },
    [saveLocalOrders]
  );

  // Update order status (for admin)
  const updateOrderStatus = useCallback(
    async (orderId, status, trackingNumber) => {
      try {
        await api.updateOrderStatus(orderId, status, trackingNumber);
      } catch (e) {
        console.warn('[OrderContext] API updateOrderStatus notice:', e.message);
      }

      setOrders((prev) => {
        const updated = prev.map((o) =>
          o.id === orderId
            ? normalizeOrder({
                ...o,
                status,
                trackingNumber: trackingNumber !== undefined ? trackingNumber : o.trackingNumber,
                updatedAt: new Date().toISOString(),
              })
            : o
        );
        saveLocalOrders(updated);
        return updated;
      });
    },
    [saveLocalOrders]
  );

  // Find order by ID or live track
  const getOrderById = useCallback(
    (orderId) => {
      if (!orderId) return null;
      const cleanId = orderId.trim().toUpperCase();
      return (
        orders.find(
          (o) =>
            o.id?.toUpperCase() === cleanId ||
            o.trackingNumber?.toUpperCase() === cleanId
        ) || null
      );
    },
    [orders]
  );

  // Find orders by email or phone
  const getOrdersByContact = useCallback(
    (contact) => {
      if (!contact) return [];
      const cleanContact = contact.trim().toLowerCase();
      const cleanDigits = contact.replace(/\D/g, '');

      return orders.filter((o) => {
        const emailMatch =
          (o.customerEmail && o.customerEmail.toLowerCase() === cleanContact) ||
          (o.customer?.email && o.customer.email.toLowerCase() === cleanContact);

        const phoneDigits = (o.customerPhone || o.customer?.phone || '').replace(/\D/g, '');
        const phoneMatch =
          cleanDigits.length >= 7 &&
          phoneDigits.length >= 7 &&
          (phoneDigits.includes(cleanDigits) || cleanDigits.includes(phoneDigits));

        return emailMatch || phoneMatch;
      });
    },
    [orders]
  );

  const value = useMemo(
    () => ({
      orders,
      loading,
      refreshOrders: fetchOrders,
      createOrder,
      updateOrderStatus,
      getOrderById,
      getOrdersByContact,
    }),
    [orders, loading, fetchOrders, createOrder, updateOrderStatus, getOrderById, getOrdersByContact]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
}
