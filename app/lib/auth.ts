import { User } from '@/types/auth';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthError {
  message: string;
  code?: string;
}

// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    };
  }
  
  return { isValid: true };
};

export const validateName = (name: string): { isValid: boolean; message?: string } => {
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return { isValid: false, message: 'Name can only contain letters and spaces' };
  }
  
  return { isValid: true };
};

// Form validation functions
export const validateLoginForm = (data: LoginData): { isValid: boolean; errors: Partial<LoginData> } => {
  const errors: Partial<LoginData> = {};
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRegisterForm = (data: RegisterData): { isValid: boolean; errors: Partial<RegisterData> } => {
  const errors: Partial<RegisterData> = {};
  
  // Name validation
  if (!data.fullName) {
    errors.fullName = 'Full name is required';
  } else {
    const nameValidation = validateName(data.fullName);
    if (!nameValidation.isValid) {
      errors.fullName = nameValidation.message;
    }
  }
  
  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }
  }
  
  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // Location validation
  if (!data.location || data.location.trim().length === 0) {
    errors.location = 'Location is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Cookie utilities
export const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    const sameSite = '; SameSite=Strict';
    const cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/${secure}${sameSite}`;
    console.log('Setting cookie:', cookieString);
    document.cookie = cookieString;
    console.log('Cookie set. Current cookies:', document.cookie);
  }
};

export const getCookie = (name: string): string | null => {
  if (typeof window !== 'undefined') {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};

export const removeCookie = (name: string): void => {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

// Token management (using cookies)
export const setAuthToken = (token: string): void => {
  setCookie('token', token, 7); // Store for 7 days
};

export const getAuthToken = (): string | null => {
  return getCookie('token');
};

export const removeAuthToken = (): void => {
  removeCookie('token');
};

// User data management
export const setUserData = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const getUserData = (): User | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Invalid user data in localStorage:', error);
      // Remove corrupted data
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

export const removeUserData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

// Migration utility to move token from localStorage to cookies
export const migrateTokenToCookie = (): void => {
  if (typeof window !== 'undefined') {
    const localStorageToken = localStorage.getItem('token');
    if (localStorageToken && !getCookie('token')) {
      // Move token from localStorage to cookie
      setAuthToken(localStorageToken);
      localStorage.removeItem('token'); // Clean up localStorage
    }
  }
};

// Authentication utilities
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const user = getUserData();
  return !!(token && user);
};

export const logout = (): void => {
  removeAuthToken();
  removeUserData();
};

// Token validation (basic check)
export const isTokenValid = (token: string): boolean => {
  try {
    // Basic JWT structure check (header.payload.signature)
    const parts = token.split('.');
    return parts.length === 3;
  } catch {
    return false;
  }
};

// Password strength indicator
export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;
  
  const strengthLevels = [
    { score: 0, label: 'Very Weak', color: 'red' },
    { score: 1, label: 'Weak', color: 'orange' },
    { score: 2, label: 'Fair', color: 'yellow' },
    { score: 3, label: 'Good', color: 'blue' },
    { score: 4, label: 'Strong', color: 'green' },
    { score: 5, label: 'Very Strong', color: 'green' },
    { score: 6, label: 'Excellent', color: 'green' },
  ];
  
  return strengthLevels[score] || strengthLevels[0];
};

// API request helpers
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Error handling
export const getAuthErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  // Common error messages
  if (error?.status === 401) {
    return 'Invalid credentials. Please check your email and password.';
  }
  
  if (error?.status === 409) {
    return 'An account with this email already exists.';
  }
  
  if (error?.status === 429) {
    return 'Too many attempts. Please try again later.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};