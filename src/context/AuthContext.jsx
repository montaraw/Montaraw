import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('montaraw_customer_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && !Array.isArray(parsed.addresses)) {
        if (parsed.address) {
          parsed.addresses = [
            {
              id: 'addr_default_1',
              fullName: parsed.fullName || '',
              phone: parsed.phone || '',
              address: parsed.address || '',
              city: parsed.city || '',
              state: parsed.state || '',
              pincode: parsed.pincode || '',
              tag: 'Home',
              isDefault: true,
            },
          ];
        } else {
          parsed.addresses = [];
        }
      }
      return parsed;
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
    try {
      const res = await api.loginCustomer(email, password);
      if (res?.token) {
        localStorage.setItem('montaraw_customer_token', res.token);
        const user = res.user || {};
        if (!Array.isArray(user.addresses)) {
          if (user.address) {
            user.addresses = [
              {
                id: 'addr_default_1',
                fullName: user.fullName || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                pincode: user.pincode || '',
                tag: 'Home',
                isDefault: true,
              },
            ];
          } else {
            user.addresses = [];
          }
        }
        setCustomerUser(user);
        return { success: true, user };
      }
      return { success: false, message: res?.message || 'Login failed.' };
    } catch (err) {
      return { success: false, message: err?.message || 'Login failed.' };
    }
  }, []);

  const customerRegister = useCallback(async (formData) => {
    try {
      const res = await api.registerCustomer(formData);
      if (res?.token) {
        localStorage.setItem('montaraw_customer_token', res.token);
        const user = res.user || {};
        if (formData.address) {
          user.addresses = [
            {
              id: 'addr_default_1',
              fullName: formData.fullName || '',
              phone: formData.phone || '',
              address: formData.address || '',
              city: formData.city || '',
              state: formData.state || '',
              pincode: formData.pincode || '',
              tag: 'Home',
              isDefault: true,
            },
          ];
        } else {
          user.addresses = [];
        }
        setCustomerUser(user);
        return { success: true, user };
      }
      return { success: false, message: res?.message || 'Registration failed.' };
    } catch (err) {
      return { success: false, message: err?.message || 'Registration failed.' };
    }
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

  // Add a new shipping address
  const addAddress = useCallback(
    (newAddr) => {
      if (!customerUser) return;
      const currentAddresses = Array.isArray(customerUser.addresses) ? [...customerUser.addresses] : [];
      const shouldBeDefault = newAddr.isDefault || currentAddresses.length === 0;

      const created = {
        ...newAddr,
        id: `addr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        isDefault: shouldBeDefault,
      };

      const nextAddresses = shouldBeDefault
        ? [created, ...currentAddresses.map((a) => ({ ...a, isDefault: false }))]
        : [created, ...currentAddresses];

      const nextProfile = {
        ...customerUser,
        addresses: nextAddresses,
        ...(shouldBeDefault
          ? {
              fullName: created.fullName || customerUser.fullName,
              phone: created.phone || customerUser.phone,
              address: created.address,
              city: created.city,
              state: created.state,
              pincode: created.pincode,
            }
          : {}),
      };

      setCustomerUser(nextProfile);
      updateCustomerProfile(nextProfile);
      return created;
    },
    [customerUser, updateCustomerProfile]
  );

  // Edit / Update an existing shipping address
  const updateAddress = useCallback(
    (addrId, updatedFields) => {
      if (!customerUser || !addrId) return;
      const currentAddresses = Array.isArray(customerUser.addresses) ? [...customerUser.addresses] : [];
      const isDefault = !!updatedFields.isDefault;

      const nextAddresses = currentAddresses.map((a) => {
        if (a.id === addrId) {
          return { ...a, ...updatedFields, isDefault };
        }
        return isDefault ? { ...a, isDefault: false } : a;
      });

      const target = nextAddresses.find((a) => a.id === addrId);

      const nextProfile = {
        ...customerUser,
        addresses: nextAddresses,
        ...(isDefault && target
          ? {
              fullName: target.fullName || customerUser.fullName,
              phone: target.phone || customerUser.phone,
              address: target.address,
              city: target.city,
              state: target.state,
              pincode: target.pincode,
            }
          : {}),
      };

      setCustomerUser(nextProfile);
      updateCustomerProfile(nextProfile);
    },
    [customerUser, updateCustomerProfile]
  );

  // Delete an address
  const deleteAddress = useCallback(
    (addrId) => {
      if (!customerUser || !addrId) return;
      const currentAddresses = Array.isArray(customerUser.addresses) ? [...customerUser.addresses] : [];
      const target = currentAddresses.find((a) => a.id === addrId);
      let nextAddresses = currentAddresses.filter((a) => a.id !== addrId);

      let newDefault = null;
      if (target?.isDefault && nextAddresses.length > 0) {
        nextAddresses[0] = { ...nextAddresses[0], isDefault: true };
        newDefault = nextAddresses[0];
      }

      const nextProfile = {
        ...customerUser,
        addresses: nextAddresses,
        ...(newDefault
          ? {
              fullName: newDefault.fullName || customerUser.fullName,
              phone: newDefault.phone || customerUser.phone,
              address: newDefault.address,
              city: newDefault.city,
              state: newDefault.state,
              pincode: newDefault.pincode,
            }
          : nextAddresses.length === 0
          ? { address: '', city: '', state: '', pincode: '' }
          : {}),
      };

      setCustomerUser(nextProfile);
      updateCustomerProfile(nextProfile);
    },
    [customerUser, updateCustomerProfile]
  );

  // Set an address as default
  const setDefaultAddress = useCallback(
    (addrId) => {
      if (!customerUser || !addrId) return;
      const currentAddresses = Array.isArray(customerUser.addresses) ? [...customerUser.addresses] : [];
      const nextAddresses = currentAddresses.map((a) => ({
        ...a,
        isDefault: a.id === addrId,
      }));

      const target = nextAddresses.find((a) => a.id === addrId);

      const nextProfile = {
        ...customerUser,
        addresses: nextAddresses,
        ...(target
          ? {
              fullName: target.fullName || customerUser.fullName,
              phone: target.phone || customerUser.phone,
              address: target.address,
              city: target.city,
              state: target.state,
              pincode: target.pincode,
            }
          : {}),
      };

      setCustomerUser(nextProfile);
      updateCustomerProfile(nextProfile);
    },
    [customerUser, updateCustomerProfile]
  );

  const value = useMemo(
    () => ({
      customerUser,
      isCustomerLoggedIn: !!customerUser,
      customerLogin,
      customerRegister,
      customerLogout,
      updateCustomerProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
    }),
    [
      customerUser,
      customerLogin,
      customerRegister,
      customerLogout,
      updateCustomerProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

