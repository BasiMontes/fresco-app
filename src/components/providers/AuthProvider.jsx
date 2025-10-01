import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getCurrentUser, onAuthStateChanged } from '@/api/user';

const AuthContext = createContext({
  user: null,
  isLoggedIn: false,
  loading: true,
  refetchUser: () => Promise.resolve(),
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
      console.log("User not logged in or session expired.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback((newUserData) => {
    setUser(newUserData);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = {
    user,
    isLoggedIn: !!user,
    loading,
    refetchUser: fetchUser,
    updateUser, // Exponer la función de actualización
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};