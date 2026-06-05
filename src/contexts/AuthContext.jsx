import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

  // Fetch the current user once if we have a token
  // Use a long staleTime so we don't spam the server
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/me');
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: false, // Don't retry on 401s
  });

  // Handle 401 or network errors gracefully
  useEffect(() => {
    if (isError) {
      console.error("Auth fetch failed:", error);
      // Only logout if it's explicitly a 401/403
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        logout();
      }
    }
  }, [isError, error]);

  const login = (token) => {
    localStorage.setItem('access_token', token);
    setIsAuthenticated(true);
    // Invalidate queries so it fetches the new user
    queryClient.invalidateQueries(['authUser']);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    queryClient.setQueryData(['authUser'], null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: isAuthenticated && isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
