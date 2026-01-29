"use client"

import React, { useState, useEffect } from 'react';
import Preview from './Preview';
import "@/styles/CoverLetter.css";
import CVForm from './CVForm';
import { TiDocumentText } from "react-icons/ti";
import { AiFillEdit } from "react-icons/ai";
import { IoMdSettings } from "react-icons/io";
import { IoMdEye } from "react-icons/io";
import SelectTemplates from './SelectedTemplates';
import { IoIosArrowBack } from "react-icons/io";
import EditableTitle from '@/app/create-resume/EditableTitle';
import { UpdateCV } from '@/services/CVTemplate';
import ColorSettings from './Setting';
import { ResumeProvider } from '@/context/ResumeContext';
// import SafeAds from '@/common/SafeAds';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import SafeAds to avoid SSR issues
const SafeAds = dynamic(() => import('@/common/SafeAds'), {
  ssr: false,
  loading: () => <div>Loading ads...</div>
});

// Helper functions for session storage
const setToSessionStorage = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(key, value);
  }
};

const getFromSessionStorage = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(key);
  }
  return null;
};

const CoverLetter = () => {
  const [data, setData] = useState<any>({
    name: "John Day",
    address: "Address",
    phone: "1234567890",
    email: "ABC@gmail.com",
    date: "01/01/2023",
    recipientName: "John Day",
    recipientAddress: "Address",
    recipientPhone: "1234567890",
    recipientEmail: "ABC@gmail.com",
    content: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
  });
  
  const [activeTab, setActiveTab] = useState('Form');
  const [isLargeScreen, setIsLargeScreen] = useState(false); // Initialize as false
  const [isSmallScreen, setIsSmallScreen] = useState(false); // Initialize as false
  const [Generated, setGenerated] = useState<any>(null);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
    
    // Set initial data from session storage
    const storedData = getFromSessionStorage('cvData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
      } catch (error) {
        console.error('Error parsing session storage data:', error);
      }
    }

    // Set initial screen size
    setIsLargeScreen(window.innerWidth >= 1200);
    setIsSmallScreen(window.innerWidth < 700);

    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1200);
      setIsSmallScreen(window.innerWidth < 700);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate cover letter after component mounts
  useEffect(() => {
    if (isClient) {
      GenerateCoverLetter();
    }
  }, [isClient]);

  const GenerateCoverLetter = () => {
    if (!isClient) return;

    const currentData = JSON.parse(getFromSessionStorage('cvData') || '{}');
    
    // Safe date processing for backend
    const processedData = {
      ...currentData,
      date: currentData.date || formatDate(new Date()) // Ensure there's always a valid date
    };
    
    const templale_id = getFromSessionStorage('CLtemplateId');
    const cover_letter_id = getFromSessionStorage('coverLetterId');
    const name = getFromSessionStorage('CvName');
    
    const dataToSend = {
      user_json: processedData,
      templale_id,
      cover_letter_id,
      title: name || "Untitled",
    };
  
    UpdateCV(dataToSend)
      .then(response => {
        setGenerated(response?.data);
      })
      .catch(error => {
        console.error('Error updating CV:', error);
      });
  };
  
  // Helper function for consistent date formatting
  const formatDateForBackend = (dateStr: string): string => {
    if (!dateStr) return formatDate(new Date());
    
    // If already in dd/MM/yyyy format, return as is
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateStr;
    }
    
    // Otherwise format current date
    return formatDate(new Date());
  };
  
  const formatDate = (date: Date): string => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        date = new Date(); // fallback to current date
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.warn('Error formatting date, using current date:', error);
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  const tabs = [
    { id: 'Form', label: 'Form', icon: <AiFillEdit /> },
    { id: 'Templates', label: 'Templates', icon: <TiDocumentText /> },
    // { id: 'Settings', label: 'Settings', icon: <IoMdSettings /> },
    ...(isLargeScreen ? [] : [{ id: 'Preview', label: 'Preview', icon: <IoMdEye /> }])
  ];

  const renderLeftContent = () => {
    switch (activeTab) {
      case 'Form':
        return (
          <ResumeProvider> 
            <CVForm data={data} setData={setData} Generate={GenerateCoverLetter}/> 
          </ResumeProvider>
        );
      case 'Templates':
        return <SelectTemplates Generate={GenerateCoverLetter}/>;
      case 'Settings':
        return <ColorSettings />;
      case 'Preview':
        return <Preview data={data} Generated={Generated}/>;
      default:
        return (
          <ResumeProvider> 
            <CVForm data={data} setData={setData} Generate={GenerateCoverLetter}/> 
          </ResumeProvider>
        );
    }
  };

  // Show loading state until client-side hydration
  if (!isClient) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <>
      <div className="cover-letter-container">
        {/* Main Content Area */}
        <div className="main-content d-flex">
          {/* Left Side - Tab Content */}
          <div className="left-content flex-grow-1">
            <SafeAds />
            <div>
              <button
                className="prim-but back"
                onClick={() => router.push('/resumes')} 
                style={{
                  minWidth: 'max-content',
                  cursor: 'pointer',
                  borderRadius: '30px',
                  textAlign: 'left',
                  height: 'max-content',
                  lineHeight: "14px",
                  fontSize: '16px',
                  position: 'absolute',
                }}>
                <IoIosArrowBack className='fs-5' />
              </button>
            </div>

            <div className='pb-3 pt-1 text-center bg-white head cv-title'>
              <EditableTitle
                initialTitle={getFromSessionStorage('CvName') || 'Untitled'}
                onTitleChange={(newTitle) => {
                  setToSessionStorage('CvName', newTitle);
                  GenerateCoverLetter();
                }}
              />
            </div>
            
            {renderLeftContent()}
          </div>

          {/* Right Side - Always Preview */}
          {isLargeScreen && (
            <>
              <Preview data={data} Generated={Generated} />
              <SafeAds />
            </>
          )}
        </div>

        {/* Tab Navigation at Bottom */}
        <div className="tab-navigation bg-light p-2 d-flex justify-content-between">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${activeTab === tab.id ? 'sec-but' : 'prim-but'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {isSmallScreen ? tab.icon : tab.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default CoverLetter;