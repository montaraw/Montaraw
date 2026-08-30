import { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { api } from '../api/client';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useLocalStorage('montaraw_admin_auth', false);

  const adminLogin = async (email, password) => {
    try {
      const res = await api.loginAdmin(email, password);
      if (res.token) {
        localStorage.setItem('montaraw_admin_token', res.token);
        setIsAdminLoggedIn(true);
        return true;
      }
    } catch (err) {
      console.warn('[AdminContext] Admin API login failed:', err.message);
    }
    return false;
  };

  const adminLogout = () => {
    localStorage.removeItem('montaraw_admin_token');
    setIsAdminLoggedIn(false);
  };

  const value = useMemo(
    () => ({ isAdminLoggedIn, adminLogin, adminLogout }),
    [isAdminLoggedIn]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}
