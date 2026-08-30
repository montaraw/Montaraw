import { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useLocalStorage('montaraw_cart', []);
  const [appliedCoupon, setAppliedCoupon] = useLocalStorage('montaraw_coupon', null);

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
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') {
      return Math.round((cartSubtotal * appliedCoupon.discount) / 100);
    }
    return appliedCoupon.discount;
  }, [appliedCoupon, cartSubtotal]);

  const cartTotal = useMemo(() => {
    const afterDiscount = cartSubtotal - cartDiscount;
    const shipping = cartSubtotal >= 999 ? 0 : 99;
    return afterDiscount + shipping;
  }, [cartSubtotal, cartDiscount]);

  const shippingCost = useMemo(
    () => (cartSubtotal >= 999 ? 0 : 99),
    [cartSubtotal]
  );

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      cartSubtotal,
      cartDiscount,
      cartTotal,
      shippingCost,
      appliedCoupon,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
    }),
    [cart, cartCount, cartSubtotal, cartDiscount, cartTotal, shippingCost, appliedCoupon, addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
