import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
      
      // Get the API URL from environment variables or use a default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/getADUsers`, {
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
      
      // Fallback to mock user data in development
      if (process.env.NODE_ENV === 'development') {
        setUser({
          samAccountName: 'user123',
          description: 'Kumar, Praveen: IT Department (New York)',
          displayName: 'Kumar, Praveen : Senior Developer (New York)',
          distinguishedName: 'CN=Kumar\\, Praveen: IT Department (New York),OU=Users,OU=NYC,OU=AMERICAS,OU=COMPANY,DC=DOMAIN,DC=COMPANY,DC=com',
          emailAddress: 'praveen.kumar@company.com',
          employeeId: '1234567',
          name: 'Kumar, Praveen: IT Department (New York)',
          givenName: 'Praveen',
          middleName: null,
          surname: 'Kumar',
          domain: null,
          userName: 'user123'
        });
      }
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