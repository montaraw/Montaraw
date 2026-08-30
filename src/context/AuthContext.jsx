import { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customerUser, setCustomerUser] = useLocalStorage('montaraw_customer_user', null);

  const customerLogin = async (email, password) => {
    try {
      const res = await api.loginCustomer(email, password);
      if (res.token && res.user) {
        localStorage.setItem('montaraw_customer_token', res.token);
        setCustomerUser(res.user);
        return { success: true, user: res.user };
      }
    } catch (err) {
      console.warn('[AuthContext] Backend login attempt failed:', err.message);
      return { success: false, message: err.message || 'Invalid email or password' };
    }
  };

  const customerRegister = async ({ fullName, email, phone, password, address, city, state, pincode }) => {
    try {
      const res = await api.registerCustomer({
        fullName,
        email,
        phone,
        password,
        address,
        city,
        state,
        pincode,
      });

      if (res.token && res.user) {
        localStorage.setItem('montaraw_customer_token', res.token);
        setCustomerUser(res.user);
        return { success: true, user: res.user };
      }
    } catch (err) {
      console.warn('[AuthContext] Backend registration failed:', err.message);
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const customerLogout = () => {
    localStorage.removeItem('montaraw_customer_token');
    setCustomerUser(null);
  };

  const updateCustomerProfile = async (updatedData) => {
    if (!customerUser) return;
    const updated = { ...customerUser, ...updatedData };
    setCustomerUser(updated);

    try {
      await api.updateProfile(updatedData);
    } catch (err) {
      console.warn('[AuthContext] Profile update API failed:', err.message);
    }
  };

  const value = useMemo(
    () => ({
      customerUser,
      isCustomerLoggedIn: !!customerUser,
      customerLogin,
      customerRegister,
      customerLogout,
      updateCustomerProfile,
    }),
    [customerUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
