import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;
  withLoading: <T>(promise: Promise<T>, message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const setLoading = useCallback((loading: boolean, message: string = 'Loading...') => {
    setIsLoading(loading);
    if (loading) {
      setLoadingMessage(message);
    }
  }, []);

  const withLoading = useCallback(async <T,>(promise: Promise<T>, message: string = 'Loading...'): Promise<T> => {
    try {
      setLoading(true, message);
      const result = await promise;
      return result;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const contextValue = useMemo(() => ({
    isLoading,
    loadingMessage,
    setLoading,
    withLoading
  }), [isLoading, loadingMessage, setLoading, withLoading]);

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};