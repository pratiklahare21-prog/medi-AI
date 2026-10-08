import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { api, ApiError } from '../services/api';
import { UserAccount } from '../types';

export type AuthMode = 'login' | 'register';

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  title: string;
  licenseNumber?: string;
  tenantId: string;
  tenantName: string;
  department?: string;
  phone?: string;
}

export interface AuthContextValue {
  currentUser: UserAccount | null;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string> | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasRole: (allowedRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TENANT_ID = 'TN-4092';
const TENANT_NAME = 'Apollo Health Network';

const titleForRole = (role: string): string => {
  switch (role) {
    case 'Lead Ops Admin':
      return 'Operations Lead';
    case 'Clinical Pharmacist':
      return 'Licensed Clinical Pharmacist';
    case 'Prescribing Physician':
      return 'Medical Officer';
    case 'Formulary Director':
      return 'Pharmacy Director';
    case 'Patient / Consumer':
      return 'Patient / Beneficiary';
    default:
      return 'Healthcare Practitioner';
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setFieldErrors(null);
  }, []);

  const hasRole = useCallback(
    (allowedRoles: string[]) => {
      if (!currentUser) return false;
      return allowedRoles.includes(currentUser.role);
    },
    [currentUser]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.logout();
    } finally {
      setCurrentUser(null);
      clearError();
      setLoading(false);
    }
  }, [clearError]);

  useEffect(() => {
    const handler = () => {
      setCurrentUser(null);
      setError('Your session has expired. Please sign in again.');
      setFieldErrors(null);
    };
    window.addEventListener('auth:logged-out', handler);
    return () => window.removeEventListener('auth:logged-out', handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const token = api.getAuthToken();
      if (!token) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }
      try {
        const user = await api.getMe();
        if (!cancelled) {
          setCurrentUser(user);
        }
      } catch {
        api.setAuthToken(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    clearError();
    setLoading(true);
    try {
      const { user } = await api.login(email, password);
      setCurrentUser(user);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.errors) {
          setFieldErrors(err.errors);
        }
      } else {
        setError(err instanceof Error ? err.message : 'Sign in failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const register = useCallback(async (data: RegisterFormData) => {
    clearError();
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role,
        title: data.title || titleForRole(data.role),
        licenseNumber: data.licenseNumber || undefined,
        tenantId: data.tenantId || TENANT_ID,
        tenantName: data.tenantName || TENANT_NAME,
        department: data.department || undefined,
        phone: data.phone || undefined
      };
      const { user } = await api.register(payload);
      setCurrentUser(user);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.errors) {
          setFieldErrors(err.errors);
        }
      } else {
        setError(err instanceof Error ? err.message : 'Registration failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const value: AuthContextValue = {
    currentUser,
    loading,
    error,
    fieldErrors,
    login,
    register,
    logout,
    clearError,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
