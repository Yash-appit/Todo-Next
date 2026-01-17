import { useState, useEffect } from 'react';
import { GetCredits } from '../services/resume/Index';
import ToastMessage from '../Layout/ToastMessage';

interface CreditsData {
  // Define the structure based on your API response
  // Example:
  availableCredits?: number;
  totalCredits?: number;
  usedCredits?: number;
  // Add other properties as per your API response
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

export const useCredits = () => {
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [totalCredits, setTotalCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(getFromLocalStorage('token'));




  const fetchCredits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (token) {
        const response = await GetCredits();
      setCredits(response?.data?.used_credits);
      setTotalCredits(response?.data?.total_credits);
      setToLocalStorage('credits', JSON.stringify(response?.data?.used_credits));
      setToLocalStorage('total_credits', JSON.stringify(response?.data?.total_credits));
    }
      // return response?.data;
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to fetch credits';
      setError(errorMessage);
      ToastMessage({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: Auto-fetch credits when hook is used
  // useEffect(() => {
  //   // You can remove this if you only want to fetch manually
  //   // fetchCredits();
  // }, []);

  return {
    credits,
    totalCredits,
    isLoading,
    error,
    fetchCredits,
    setCredits // In case you need to update credits locally
  };
};