import React, { useState, createContext, useContext, useEffect, ReactNode } from 'react';

// Define the context type
interface TimeZoneContextType {
  timeZone: string;
  setTimeZone: React.Dispatch<React.SetStateAction<string>>;
}

// Create a context with an initial value of undefined
export const TimeZoneContext = createContext<TimeZoneContextType | undefined>(undefined);

// Define the provider's props type
interface TimeZoneProviderProps {
  children: ReactNode;
}


const setToLocalStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  };

  const setToSessionStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  };
  const getFromSessionStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  };
  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };
// Create a provider component
export function TimeZoneProvider({ children }: TimeZoneProviderProps) {
  const [timeZone, setTimeZone] = useState<string>('');

  useEffect(() => {
    // Initialize from localStorage on client side
    const storedTimeZone = getFromLocalStorage('timeZone');
    if (storedTimeZone) {
      setTimeZone(storedTimeZone);
    }
  }, []);

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setTimeZone(getFromLocalStorage('timeZone') || '');
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update localStorage whenever timeZone changes
  useEffect(() => {
    setToLocalStorage('timeZone', timeZone);
  }, [timeZone]);

  // Provide the timeZone state and updater function to children
  return (
    <TimeZoneContext.Provider value={{ timeZone, setTimeZone }}>
      {children}
    </TimeZoneContext.Provider>
  );
}

// Create a custom hook for accessing the timeZone state
export function useTimeZone() {
  const context = useContext(TimeZoneContext);

  if (context === undefined) {
    throw new Error('useTimeZone must be used within a TimeZoneProvider');
  }

  return context;
}
