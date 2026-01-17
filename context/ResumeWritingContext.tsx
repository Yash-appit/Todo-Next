// contexts/ResumeWritingContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { experinceList, PackList } from '../services/resume-writing/Index';
import { useTimeZone } from './TimeZoneContext';
import ToastMessage from '@/Layout/ToastMessage';

interface ResumeWritingContextType {
  expList: any[];
  packList: any[];
  isLoading: boolean;
  selectedExpIndex: number;
  selectedPackage: any | null;
  setSelectedExpIndex: (index: number) => void;
  fetchPackList: (id: string) => Promise<void>;
  setSelectedPackage: (pack: any) => void;
}

const ResumeWritingContext = createContext<ResumeWritingContextType | undefined>(undefined);

export const ResumeWritingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expList, setExpList] = useState<any[]>([]);
  const [packList, setPackList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpIndex, setSelectedExpIndex] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const { timeZone } = useTimeZone();

//   console.log(selectedPackage);
  

  const fetchExperienceList = async () => {
    try {
      const response = await experinceList();
      setExpList(response?.data || []);
      if (response?.data?.length > 0) {
        await fetchPackList(response.data[0].id);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      let errorMessage = (error as Error).message;
      ToastMessage({
        type: "error",
        message: errorMessage,
      });
    }
  };

  const fetchPackList = async (id: string) => {
    try {
      const response = await PackList(id);
      setPackList(response?.data || []);
      // console.log(response?.data);
      
      setIsLoading(false);
    } catch (error) {
      let errorMessage = (error as Error).message;
      ToastMessage({
        type: "error",
        message: errorMessage,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperienceList();
  }, []);

  return (
    <ResumeWritingContext.Provider
      value={{
        expList,
        packList,
        isLoading,
        selectedExpIndex,
        selectedPackage,
        setSelectedExpIndex,
        fetchPackList,
        setSelectedPackage
      }}
    >
      {children}
    </ResumeWritingContext.Provider>
  );
};

export const useResumeWriting = () => {
  const context = useContext(ResumeWritingContext);
  if (context === undefined) {
    throw new Error('useResumeWriting must be used within a ResumeWritingProvider');
  }
  return context;
};