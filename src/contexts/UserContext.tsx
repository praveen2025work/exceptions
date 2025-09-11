import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import mockUsers from '@/data/mock-users.json';

export interface ADUser {
  samAccountName: string;
  description: string;
  displayName: string;
  distinguishedName: string;
  emailAddress: string;
  employeeId: string;
  name: string;
  givenName: string;
  middleName: string | null;
  surname: string;
  domain: string | null;
  userName: string;
}

interface UserContextType {
  user: ADUser | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ADUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the User Info API URL from environment variables
      const userInfoApiUrl = process.env.NEXT_PUBLIC_USER_INFO_API_URL;
      
      // If no user info API URL is provided, or if it contains 'mock', use mock data
      if (!userInfoApiUrl || userInfoApiUrl.toLowerCase().includes('mock') || process.env.NEXT_PUBLIC_CO_DEV_ENV === 'mock') {
        // Use random mock user data in mock environment
        const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        setUser(randomUser);
        return;
      }
      
      // Make actual API call to get user info
      const response = await fetch(`${userInfoApiUrl}/api/getADUsers`, {
        method: 'GET',
        credentials: 'include', // Include credentials for Windows authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
      }

      const userData: ADUser = await response.json();
      setUser(userData);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      
      // Fallback to random mock user data on error
      const fallbackUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      setUser(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};