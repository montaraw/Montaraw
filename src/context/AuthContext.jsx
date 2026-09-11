import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('montaraw_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (customerUser) {
      localStorage.setItem('montaraw_customer_user', JSON.stringify(customerUser));
    } else {
      localStorage.removeItem('montaraw_customer_user');
    }
  }, [customerUser]);

  const customerLogin = useCallback(async (email, password) => {
    const res = await api.loginCustomer(email, password);
    if (res?.token) {
      localStorage.setItem('montaraw_customer_token', res.token);
      setCustomerUser(res.user);
      return res.user;
    }
    throw new Error(res?.message || 'Login failed.');
  }, []);

  const customerRegister = useCallback(async (formData) => {
    const res = await api.registerCustomer(formData);
    if (res?.token) {
      localStorage.setItem('montaraw_customer_token', res.token);
      setCustomerUser(res.user);
      return res.user;
    }
    throw new Error(res?.message || 'Registration failed.');
  }, []);

  const customerLogout = useCallback(() => {
    localStorage.removeItem('montaraw_customer_token');
    localStorage.removeItem('montaraw_customer_user');
    setCustomerUser(null);
  }, []);

  const updateCustomerProfile = useCallback(async (updatedData) => {
    if (!customerUser) return;
    const updated = { ...customerUser, ...updatedData };
    setCustomerUser(updated);

    try {
      await api.updateProfile(updatedData);
    } catch (err) {
      console.warn('[AuthContext] Profile update notice:', err.message);
    }
  }, [customerUser]);

  const value = useMemo(
    () => ({
      customerUser,
      isCustomerLoggedIn: !!customerUser,
      customerLogin,
      customerRegister,
      customerLogout,
      updateCustomerProfile,
    }),
    [
      customerUser,
      customerLogin,
      customerRegister,
      customerLogout,
      updateCustomerProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
