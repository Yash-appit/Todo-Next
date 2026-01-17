import { useState, useEffect } from 'react';
// import { GetCredits } from '../services/resume/Index';
import ToastMessage from '../Layout/ToastMessage';
import { getDashboard } from '../services/Admin';

export const useDashboard = () => {


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

  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(getFromLocalStorage('token'));
const [dashboard, setDashbaord] = useState<any>(null);


  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      if (token){
      const response = await getDashboard();
      // console.log(response?.data?);
      const packageStatus = response?.data?.packageData?.package_status;
      if (packageStatus === "active") {
        setToLocalStorage('package', 'true');
      } else {
        setToLocalStorage('package', 'false');
      }
      setDashbaord(response?.data);
    }
    } catch (error) {
      let errorMessage = (error as Error).message;
      ToastMessage({
        type: "error",
        message: errorMessage || error,
      });
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
    isLoading,
    fetchDashboard,
    dashboard,
    error,
  };
}; 