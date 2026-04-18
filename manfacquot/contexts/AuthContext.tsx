import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, getTokens, setTokens, clearTokens } from '../utils/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  authLoading: boolean;
  pendingUploadData: any;
  login: (credentials: any, role: string) => Promise<void>;
  logout: () => void;
  setPendingUploadData: (data: any) => void;
  loginReasonMessage: string;
  setLoginReasonMessage: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pendingUploadData, setPendingUploadDataState] = useState<any>(null);
  const [loginReasonMessage, setLoginReasonMessage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { access } = getTokens();
      if (access) {
        try {
          const fetchedUser = await api.getMe();
          setUser(fetchedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth verification failed:', error);
          clearTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: any, role: string) => {
    try {
      const response = await api.login(credentials);
      setTokens(response.access, response.refresh);
      const fetchedUser = await api.getMe();

      if (fetchedUser.role !== role && role !== 'admin') {
          clearTokens();
          throw new Error(`Please use the ${fetchedUser.role} login portal.`);
      }

      setUser(fetchedUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    clearTokens();
    setIsAuthenticated(false);
    setUser(null);
  };

  const setPendingUploadData = (data: any) => {
    setPendingUploadDataState(data);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, authLoading, pendingUploadData, login, logout, setPendingUploadData, loginReasonMessage, setLoginReasonMessage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
