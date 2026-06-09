import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('swn_token');
    if (token) {
      api.get('/auth/me')
        .then(r => setUser(r.data))
        .catch(() => localStorage.removeItem('swn_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Called with Google access_token (from useGoogleLogin custom button)
  const loginWithGoogle = async (credential) => {
    const r = await api.post('/auth/google', { credential });
    localStorage.setItem('swn_token', r.data.token);
    setUser(r.data.user);
    return r.data; // { token, user, isNew }
  };

  const refreshUser = async () => {
    const r = await api.get('/auth/me');
    setUser(r.data);
    return r.data;
  };

  const logout = () => {
    localStorage.removeItem('swn_token');
    localStorage.removeItem('sm_last_dash');
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, loginWithGoogle, refreshUser, logout, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
