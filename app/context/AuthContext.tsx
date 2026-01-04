'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/api';
import { User, RegisterData, UserRole, Permission, rolePermissions } from '@/types/auth';
import { AuthContextType } from '@/app/types';
import { 
  setAuthToken, 
  getAuthToken, 
  setUserData, 
  getUserData, 
  removeAuthToken, 
  removeUserData,
  getAuthErrorMessage,
  migrateTokenToCookie
} from '@/app/lib/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    // Migrate any existing localStorage token to cookies
    migrateTokenToCookie();
    
    const storedToken = getAuthToken();
    const storedUser = getUserData();
    
    // Validate that user has required fields
    console.log('AuthContext - storedUser:', storedUser);
    console.log('AuthContext - storedToken:', storedToken);
    if (storedToken && storedUser && storedUser._id && storedUser.email) {
      setToken(storedToken);
      setUser(storedUser);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    } else {
      // Clear invalid data
      removeAuthToken();
      removeUserData();
    }
    setLoading(false);
  }, [isClient]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;
      const { user, accessToken: token } = data;
      
      console.log('Login response:', { token, user });
      
      // Store token in cookies, user data in localStorage
      setAuthToken(token);
      setUserData(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Token stored in cookie:', getAuthToken());
      
      setToken(token);
      setUser(user);
      toast.success('Login successful!');
      
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          router.push('/dashboard');
          break;
        case 'host':
          router.push('/dashboard');
          break;
        case 'user':
          router.push('/dashboard');
          break;
        default:
          router.push('/events');
      }
    } catch (error: any) {
      toast.error(getAuthErrorMessage(error));
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data);
      const { data: responseData } = response.data;
      const { user, accessToken: token } = responseData;
      
      console.log('Register response:', { token, user });
      
      // Store token in cookies, user data in localStorage
      setAuthToken(token);
      setUserData(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Token stored in cookie after registration:', getAuthToken());
      
      setToken(token);
      setUser(user);
      toast.success('Registration successful!');
      
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          router.push('/dashboard');
          break;
        case 'host':
          router.push('/dashboard');
          break;
        case 'user':
          router.push('/dashboard');
          break;
        default:
          router.push('/events');
      }
    } catch (error: any) {
      toast.error(getAuthErrorMessage(error));
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear all authentication data
      removeAuthToken();
      removeUserData();
      
      // Clear API headers
      delete api.defaults.headers.common['Authorization'];
      
      // Reset state
      setToken(null);
      setUser(null);
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Force redirect to login page
      router.push('/auth/login');
      
      // Optional: Clear any other app-specific data
      if (typeof window !== 'undefined') {
        // Clear any other localStorage items if needed
        // sessionStorage.clear();
        
        // Force a refresh to ensure all state is cleared
        // setTimeout(() => {
        //   window.location.reload();
        // }, 100);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to redirect to login
      router.push('/auth/login');
    }
  };

  // Role-based helper methods
  const checkPermission: (permission: string) => boolean = (permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[user.role]?.can[permission as keyof Permission['can']] || false;
  };

  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isAdmin = user?.role === 'admin';
  const isHost = user?.role === 'host';
  const isUser = user?.role === 'user';

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      loading,
      hasPermission: checkPermission,
      isRole,
      isAdmin,
      isHost,
      isUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};