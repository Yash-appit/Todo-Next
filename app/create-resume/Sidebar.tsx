import React, { useEffect, useState } from 'react';

import pre from "@/assets/Images/resume-builder/prev.png";
// import ResumeGenerated from "./ResumeGenerated";
import Templates from './ResumeStyle/Templates';
import ResumeContainer from './GenrateAndDownload/ResumeContainer';
import ResumeGenerated from './ResumeGenerated';
import { RefreshProvider } from "@/context/RefreshContext";
import Image from 'next/image';

interface SidebarProps {
    // activeStep: number;
    save: () => void;
    step1: boolean;
    step2: boolean;
    setStep1: (value: boolean) => void;
    setStep2: (value: boolean) => void;
    GeneratedResume: any;
    setShowModal: (value: boolean) => void;
    ResumeLoading?: boolean;
}


const getFromLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setToLocalStorage = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const Sidebar = ({ save, setStep1, setStep2, GeneratedResume, step1, step2, setShowModal, ResumeLoading }: SidebarProps) => {
    const [loading, setLoading] = useState(true);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 1200);
        };
        
        // Set initial value
        handleResize();
        
        // Add event listener
        window.addEventListener('resize', handleResize);
        
        // Clean up
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    useEffect(() => {
        // Check if templateId exists in sessionStorage
        const templateId = getFromLocalStorage('templateId');
        if (templateId) {
            setStep2(true);
            setStep1(false); // Set step2 to true if templateId is found
            // console.log( templateId);
            
        }
    }, []);


    useEffect(() => {
        // Set loading to false when GeneratedResume is ready
        if (GeneratedResume) {
            setLoading(false);
        }
    }, [GeneratedResume]);

    // safe HTML string
const safeHTML = React.useMemo(() => {
    if (!GeneratedResume) return '';
    if (typeof GeneratedResume === 'string') return GeneratedResume;
    return ''; // or JSON.stringify(GeneratedResume) if you really want
  }, [GeneratedResume]);
    // console.log(GeneratedResume);
    // console.log(setStep2);

    const show = () => {
        if (isSmallScreen) {

            return (
                <RefreshProvider>
                    <ResumeGenerated GeneratedResume={safeHTML} ResumeLoading={ResumeLoading} />
                    </RefreshProvider>
            );
        }

        else{
            return(
                  <RefreshProvider>
            <ResumeContainer GeneratedResume={GeneratedResume} ResumeLoading={ResumeLoading} isSmallScreen={isSmallScreen} />
            </RefreshProvider>
            )
        }
    }

    
    
    
    return (
        <div className='resume-sidebar' style={isSmallScreen && step2 ? {background: 'transparent'} : {}}>
            <div className="sidebar-bg" style={isSmallScreen && step2 ? {display: 'none'} : {}}>
                <Image src={pre} alt="" />
            </div>
          
            {step1 && <Templates save={save} setStep1={setStep1} setStep2={setStep2} setShowModal={setShowModal}/>}
            {/* {step2 && <><div dangerouslySetInnerHTML={{ __html: GeneratedResume }} /></>} */}
            {step2 && (loading ? <div className='pt-3'> <div className='shimmer-head m-3 w-auto'></div><div className='shimmer-res pt-3 rounded-2'></div> </div> : show()  )}




        </div>
    );
};

export default Sidebar;
