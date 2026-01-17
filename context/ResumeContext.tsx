import { createContext, useContext, useEffect, useState } from 'react';
// import { GetCredits, GetFeatures, AiWriter } from '../../services/resume/Index';
import ToastMessage from '@/Layout/ToastMessage';
import { GetCredits, GetFeatures, AiWriter } from '@/services/resume/Index';
import { getDashboard } from '@/services/Admin';
// import ToastMessage from '../Layout/ToastMessage';


interface ResumeContextType {
  credits?: any;
  features: any;
  isLoading: boolean;
  updatedcredits: any;
  fetchCredits: () => Promise<void>;
  fetchFeatures: () => Promise<void>;
  // AI Suggestions related
  fetchAiSuggestions: (section: string, fieldName: string, id?: number, value?: string) => Promise<string[]>;
  isLoadingAiSuggestions: boolean;
  aiSuggestions: string;
  dashboard?: any; // Optional, if you want to include dashboard data // Optional, if you want to include updated credits data
  sectionType: string;
  resetAiSuggestions: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider = ({ children }: { children: React.ReactNode }) => {
  const [credits, setCredits] = useState<any>(null);
  const [updatedcredits, setUpdatedCredits] = useState<any>(null);
  const [features, setFeatures] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashbaord] = useState(null);
  // AI Suggestions state
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string>("");
  const [sectionType, setSectionType] = useState<string>("");
  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };
  const [token, setToken] = useState(getFromLocalStorage('token'));

  const fetchCredits = async () => {
    try {
      setIsLoading(true);
      const response = await GetCredits();
      setCredits(response?.data);
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


  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await getDashboard();
      // console.log(response?.data?);
      
      setDashbaord(response?.data);
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


  const fetchFeatures = async () => {
    try {
      setIsLoading(true);
      const response = await GetFeatures();
      setFeatures(response?.data);
    } catch (error) {
      let errorMessage = (error as Error).message;
      ToastMessage({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const fetchAiSuggestions = async (section: string, fieldName: string, id?: number, value?: string): Promise<string[]> => {
    try {
      setIsLoadingAiSuggestions(true);
      const resumeId = sessionStorage.getItem('ResumeId');
  
      const response = await AiWriter({
        section_type: section,
        resume_id: Number(resumeId) || 0, // Add default value if null
        title: fieldName,
        feature_id: id || 0, // Use default value if undefined
        content: value || "", // Use default value if undefined
      });   
  
      const generatedContent = response?.data?.data?.generatedContent || "";
      setAiSuggestions(generatedContent);
      setSectionType(response?.data?.data?.section_type || "");
      setUpdatedCredits(response?.data?.data?.credit_data);
      
      // Return as array to match Promise<string[]> type
      return generatedContent ? [generatedContent] : [];
      
    } catch (error) {
      let errorMessage = (error as Error).message;
      ToastMessage({
        type: "error",
        message: errorMessage || error,
      });
      return [];
    } finally {
      setIsLoadingAiSuggestions(false);
    }
  };


  const resetAiSuggestions = () => {
    setAiSuggestions("");
  };

  useEffect(() => {

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch dashboard first
        const dashboardResponse = await getDashboard();
        setDashbaord(dashboardResponse?.data);
        // Then fetch credits if package is active
        // if (dashboardResponse?.data?.packageData?.package_status === 'active') {
        //   const creditsResponse = await GetCredits();
        //   setCredits(creditsResponse?.data);
        // }
      } catch (error) {
        // error handling
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token){
    fetchData();
  }
    // fetchFeatures();
  }, []);
  
  // Additional useEffect to handle updates when dashboard changes

  return (
    <ResumeContext.Provider value={{ 
      isLoading, 
      fetchAiSuggestions,
      isLoadingAiSuggestions,
      aiSuggestions,
      features,
      fetchFeatures,
      fetchCredits,
      credits,
      updatedcredits,
      dashboard,
      sectionType,
      resetAiSuggestions
    }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};