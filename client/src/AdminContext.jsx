import { createContext, useContext, useState, useCallback } from 'react';
import { api } from './api';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  const login = useCallback(async (pin) => {
    setError('');
    try {
      const { valid } = await api.verifyPin(pin);
      if (valid) {
        setIsAdmin(true);
        return true;
      } else {
        setError('Incorrect PIN');
        return false;
      }
    } catch (e) {
      setError(e.message);
      return false;
    }
  }, []);

  const logout = useCallback(() => setIsAdmin(false), []);

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, error, setError }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
