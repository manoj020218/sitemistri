import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getGoogleAccessToken, signOutGoogleAuth } from '../utils/googleAuth';

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('swn_token');
    if (token) {
      api.get('/auth/me')
        .then(setUser)
        .catch(() => localStorage.removeItem('swn_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    const credential = await getGoogleAccessToken();
    const r = await api.post('/auth/google', { credential });
    localStorage.setItem('swn_token', r.token);
    setUser(r.user);
    return r; // { token, user, isNew }
  };

  const refreshUser = async () => {
    const r = await api.get('/auth/me');
    setUser(r);
    return r;
  };

  const logout = () => {
    localStorage.removeItem('swn_token');
    localStorage.removeItem('sm_last_dash');
    setUser(null);
    signOutGoogleAuth();
  };

  return (
    <AuthCtx.Provider value={{ user, loading, loginWithGoogle, refreshUser, logout, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
