import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { calculateClothingGst, calculateDeliveryFee } from '../utils/taxAndShippingHelper';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useLocalStorage('montaraw_cart', []);
  const [appliedCoupon, setAppliedCoupon] = useLocalStorage('montaraw_coupon', null);
  const [shippingState, setShippingState] = useLocalStorage('montaraw_shipping_state', 'Uttar Pradesh');
  const [deliveryType, setDeliveryType] = useState('standard'); // 'standard' | 'express'

  const addToCart = useCallback((product, size, color, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.size === size && item.color === color
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { ...product, size, color, quantity, cartItemId: `cart-${Date.now()}` }];
    });
  }, [setCart]);

  const removeFromCart = useCallback((cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, [setCart]);

  const updateQuantity = useCallback((cartItemId, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  }, [setCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
  }, [setCart, setAppliedCoupon]);

  const applyCoupon = useCallback((coupon) => {
    setAppliedCoupon(coupon);
  }, [setAppliedCoupon]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, [setAppliedCoupon]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
    [cart]
  );

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    let disc = 0;
    if (appliedCoupon.type === 'percentage') {
      disc = (cartSubtotal * appliedCoupon.discount) / 100;
      if (appliedCoupon.maxDiscount && appliedCoupon.maxDiscount > 0 && disc > appliedCoupon.maxDiscount) {
        disc = appliedCoupon.maxDiscount;
      }
    } else {
      disc = Math.min(appliedCoupon.discount, cartSubtotal);
    }
    return Math.round(disc);
  }, [appliedCoupon, cartSubtotal]);

  const taxableAmount = useMemo(
    () => Math.max(0, cartSubtotal - cartDiscount),
    [cartSubtotal, cartDiscount]
  );

  // Clothing GST calculations (5% / 12% with CGST/SGST/IGST breakdown)
  const gstInfo = useMemo(
    () => calculateClothingGst(cart, taxableAmount, shippingState),
    [cart, taxableAmount, shippingState]
  );

  // Zone/distance-wise delivery fee calculation
  const deliveryInfo = useMemo(
    () => calculateDeliveryFee(shippingState, deliveryType),
    [shippingState, deliveryType]
  );

  const shippingCost = useMemo(
    () => (cart.length > 0 ? deliveryInfo.deliveryFee : 0),
    [cart.length, deliveryInfo]
  );

  const cartTotal = useMemo(() => {
    if (cart.length === 0) return 0;
    return taxableAmount + gstInfo.totalGst + shippingCost;
  }, [cart.length, taxableAmount, gstInfo.totalGst, shippingCost]);

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      cartSubtotal,
      cartDiscount,
      taxableAmount,
      gstInfo,
      clothingGst: gstInfo.totalGst,
      shippingState,
      setShippingState,
      deliveryType,
      setDeliveryType,
      deliveryInfo,
      shippingCost,
      cartTotal,
      appliedCoupon,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
    }),
    [
      cart,
      cartCount,
      cartSubtotal,
      cartDiscount,
      taxableAmount,
      gstInfo,
      shippingState,
      setShippingState,
      deliveryType,
      setDeliveryType,
      deliveryInfo,
      shippingCost,
      cartTotal,
      appliedCoupon,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

