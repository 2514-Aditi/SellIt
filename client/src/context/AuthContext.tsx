import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface User {
  id: string;
  role: 'seller' | 'admin' | 'customer';
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (storedToken && storedRole) {
      setToken(storedToken);
      setUser({ id: '', role: storedRole as 'seller' | 'admin' | 'customer' });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, role } = response.data;
    setToken(newToken);
    setUser({ id: '', role });
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', role);
  };

  const register = async (data: any) => {
    // Check if it's customer registration (simple JSON) or seller registration (FormData)
    if (data.role === 'customer') {
      const response = await api.post('/auth/register/customer', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      const { token: newToken, role } = response.data;
      setToken(newToken);
      setUser({ id: '', role });
      localStorage.setItem('token', newToken);
      localStorage.setItem('role', role);
    } else {
      // Seller registration with file uploads
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'pan' || key === 'gst' || key === 'bank') {
          if (data[key]) formData.append(key, data[key]);
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await api.post('/auth/register/seller', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { token: newToken, role } = response.data;
      setToken(newToken);
      setUser({ id: '', role });
      localStorage.setItem('token', newToken);
      localStorage.setItem('role', role);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};


