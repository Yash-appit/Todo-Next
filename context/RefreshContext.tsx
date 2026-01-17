"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type RefreshContextType = {
  refresh: () => void;
};

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

type RefreshProviderProps = {
  children: ReactNode;
};

export const RefreshProvider = ({ children }: RefreshProviderProps) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <RefreshContext.Provider value={{ refresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = (): RefreshContextType => {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};