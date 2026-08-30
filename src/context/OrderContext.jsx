import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { api } from '../api/client';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync orders with backend
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      if (localStorage.getItem('montaraw_admin_token')) {
        const res = await api.getAdminOrders();
        if (res.orders) setOrders(res.orders);
      } else if (localStorage.getItem('montaraw_customer_token')) {
        const res = await api.getMyOrders();
        if (res.orders) setOrders(res.orders);
      }
    } catch (err) {
      console.warn('[OrderContext] Could not fetch orders from backend:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Place a new order
  const createOrder = useCallback(async (orderData) => {
    try {
      const res = await api.createOrder({
        customerName: orderData.customer?.fullName || orderData.customerName,
        customerEmail: orderData.customer?.email || orderData.customerEmail,
        customerPhone: orderData.customer?.phone || orderData.customerPhone,
        address: orderData.customer?.address || orderData.address,
        city: orderData.customer?.city || orderData.city,
        state: orderData.customer?.state || orderData.state,
        pincode: orderData.customer?.pincode || orderData.pincode,
        subtotal: orderData.subtotal,
        discount: orderData.discount || 0,
        couponCode: orderData.couponCode || null,
        shipping: orderData.shipping || 0,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        items: orderData.items,
      });

      if (res.order) {
        setOrders((prev) => [res.order, ...prev]);
        return res.order;
      }
    } catch (e) {
      console.error('[OrderContext] API createOrder failed:', e);
      throw e;
    }
  }, []);

  // Update order status (for admin)
  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      const res = await api.updateOrderStatus(orderId, status);
      if (res.order) {
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? res.order : order))
        );
      }
    } catch (e) {
      console.error('[OrderContext] API updateOrderStatus failed:', e);
      throw e;
    }
  }, []);

  // Find order by ID or live track from backend
  const getOrderById = useCallback(
    (orderId) => {
      if (!orderId) return null;
      const cleanId = orderId.trim().toUpperCase();
      return orders.find(
        (o) => o.id?.toUpperCase() === cleanId || o.trackingNumber?.toUpperCase() === cleanId
      ) || null;
    },
    [orders]
  );

  // Find orders by email or phone
  const getOrdersByContact = useCallback(
    (contact) => {
      if (!contact) return [];
      const clean = contact.trim().toLowerCase();
      return orders.filter(
        (o) =>
          o.customerEmail?.toLowerCase() === clean ||
          o.customer?.email?.toLowerCase() === clean ||
          o.customerPhone?.replace(/\s+/g, '') === clean.replace(/\s+/g, '') ||
          o.customer?.phone?.replace(/\s+/g, '') === clean.replace(/\s+/g, '')
      );
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
