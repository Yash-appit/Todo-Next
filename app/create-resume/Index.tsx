"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import "@/styles/Resumebuilder.css";
import Sidebar from './Sidebar';
import Personaldetails from './Personaldetails';
import Education from './Education';
import Experience from './Experience';
import Internship from './Internship';
import Projects from './Projects';
import SkillsAndInterests from './SkillsAndInterests';
import AchievementsAndCertificates from './AcihevementsAndCertificates';
import CustomData from './CustomData';
import DeclarationsAndReferences from './DeclarationsAndReferences';
import { addResume, GenerateResume } from '@/services/resume/Index';
import ToastMessage from '@/Layout/ToastMessage';
import { usePathname } from 'next/navigation';
import { Drawer, IconButton, Box } from '@mui/material';
import SelectTemplates from './ResumeStyle/SelectTemplates';
import { IoClose } from "react-icons/io5";
import { TipsList } from '@/services/resume/Index';
import { ResumeProvider } from '@/context/ResumeContext';
import "@/styles/Drawer.css";


const Index = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [previewData, setPreviewData] = useState<any>({});
  const [tempData, setTempData] = useState<any>({});
  const [step1, setStep1] = useState(true);
  const [step2, setStep2] = useState(false);
  const [step3, setStep3] = useState(false);
  const [step4, setStep4] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [ResumeLoading, setResumeLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const pathname = usePathname(); // Replaced useLocation
  const [shouldPassGenerate, setShouldPassGenerate] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);


  const setToLocalStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
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
  const [templateIdPrev, setTemplateIdPrev] = useState<string | null>(getFromSessionStorage('selectedTemplateId') || null);
  const [ResumeName, setResumeName] = useState<string | null>(getFromLocalStorage('resumeName') || "Untitled");
  const [ResumeData, setResumeData] = useState<string | null>(getFromLocalStorage('resumeData'));
  const [Tips, setTips] = useState<any>([]);
  const [pageTransition, setPageTransition] = useState(false);
  const [token, setToken] = useState(getFromLocalStorage('token'));

  useEffect(() => {
    if (isSmallScreen && step1) {
      setShowDrawer(true);
    }
    if (isSmallScreen && step2) {
      setShowDrawer(false);
    }
  }, [isSmallScreen, setShowDrawer]);


  useEffect(() => {
    fetchTips();
    const initialize = async () => {
      const storedData = getFromLocalStorage('resumeData');
      setPreviewData(getFromLocalStorage('resumeData'));
      const parsedData = storedData ? JSON.parse(storedData) : null;
      setTempData(parsedData?.resume_data);
    };

    initialize();

    const checkScreenSize = () => {
      const smallScreen = window.innerWidth < 1200;
      setIsSmallScreen(smallScreen);
      setShowDrawer(!smallScreen);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const fetchTips = async () => {
    try {
      const response = await TipsList();
      setTips(response?.data);
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

  const getTipsForSection = (sectionName: string) => {
    return Tips.filter((tip: any) => tip.section_name === sectionName);
  };

  useEffect(() => {
    // Use pathname instead of location.pathname
    if (pathname === '/create-resume') {
      setShouldPassGenerate(false);
      const timer = setTimeout(() => {
        setShouldPassGenerate(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const Generate = useCallback(async (templateId?: string | null) => {
    setResumeLoading(true);
    setRefreshKey(oldKey => oldKey + 1);
    try {
      const prevID = getFromSessionStorage("ResumeId");
      const newID = getFromLocalStorage("resumeId");
      const prevIDNum = prevID ? parseInt(prevID) : 0;
      const newIDNum = newID ? parseInt(newID) : 0;
      const resID = newIDNum > prevIDNum ? newIDNum : prevIDNum;
      const resumeID = resID || getFromSessionStorage("ResumeId") || getFromLocalStorage("resumeId");
      let resume_data: any;

      if (resumeID) {
        const resumeData = getFromLocalStorage('resumeData');
        const parsedData = JSON.parse(resumeData || ResumeData || resumeData || "");

        const sanitizeResumeData = (resumeData: any) => {
          const isEmptyObject = (obj: any) =>

            Object.values(obj).every((value) => value === null || value === "");

          const sanitizedData = Object.fromEntries(
            Object.entries(resumeData).map(([key, value]) => {
              if (Array.isArray(value)) {
                const filteredArray = value.filter((item) => !isEmptyObject(item));
                return [key, filteredArray];
              }
              return [key, value];
            })
          );

          return sanitizedData;
        };

        const cleanedData = sanitizeResumeData(parsedData.resume_data || {});
        const filteredResumeData = Object.fromEntries(
          Object.entries(cleanedData).filter(([key, value]) => {
            if (Array.isArray(value)) {
              return value.length > 0;
            }
            return true;
          })
        );

        resume_data = { resume_data: { ...filteredResumeData } };
      }

      const TemplateID = Number(templateId || getFromSessionStorage('selectedTemplateId')) || Number(getFromLocalStorage('templateId'));
      const currentResumeName = getFromLocalStorage('resumeName') || "Untitled";
      // console.log("Generating", resume_data);

      const requestData = {
        ...resume_data,
        resume_id: Number(resumeID),
        template_id: TemplateID || 21,
        resume_name: currentResumeName || ResumeName,
      };

      const response = await GenerateResume(requestData);
      setGeneratedResume(response?.data);
      setResumeLoading(false);
    }
    catch (error) {
      setResumeLoading(false);
      // ToastMessage({
      //   type: 'error',
      //   message: error?.message || error, // <-- This is the Error object, not a string
      // });
    }
  }, [ResumeData, ResumeName]);

  const AddResume = async () => {
    try {
      const resumeData = getFromLocalStorage('resumeData');
      if (resumeData) {
        const parsedData = JSON.parse(resumeData);

        const sanitizeResumeData = (resumeData: any) => {
          const isEmptyObject = (obj: any) =>
            Object.values(obj).every((value) => value === null || value === "");

          const sanitizedData = Object.fromEntries(
            Object.entries(resumeData).map(([key, value]) => {
              if (Array.isArray(value)) {
                const filteredArray = value.filter((item) => !isEmptyObject(item));
                return [key, filteredArray];
              }
              return [key, value];
            })
          );

          return sanitizedData;
        };

        const cleanedData = sanitizeResumeData(parsedData.resume_data);
        const filteredResumeData = Object.fromEntries(
          Object.entries(cleanedData).filter(([key, value]) => {
            if (Array.isArray(value)) {
              return value.length > 0;
            }
            return true;
          })
        );

        const resume_data = { resume_data: { ...filteredResumeData } };
        const resumeID = getFromLocalStorage("resumeId");

        const requestData = {
          ...resume_data,
          resume_id: resumeID,
          resume_name: ResumeName,
        };
        const response = await addResume(requestData);
        setToLocalStorage('resumeId', response?.data?.data?.id);
        setIsLoading(false);
      }
    }
    catch (error) {
      setIsLoading(false);
      // console.log("error1", error);
      let errorMessage = (error as Error).message;
      ToastMessage({
        type: 'error',
        message: errorMessage || error,
      });
    }
  }




  const AddResume2 = async () => {
    try {
      const resumeData = getFromLocalStorage('resumeData');

      if (resumeData) {
        const parsedData = JSON.parse(resumeData);


        const sanitizeResumeData = (resumeData: any) => {
          const isEmptyObject = (obj: any) =>
            Object.values(obj).every((value) => value === null || value === "");

          const sanitizedData = Object.fromEntries(
            Object.entries(resumeData).map(([key, value]) => {
              if (Array.isArray(value)) {
                const filteredArray = value.filter((item) => !isEmptyObject(item));
                return [key, filteredArray];
              }
              return [key, value];
            })
          );

          return sanitizedData;
        };

        const cleanedData = sanitizeResumeData(parsedData.resume_data);
        const filteredResumeData = Object.fromEntries(
          Object.entries(cleanedData).filter(([key, value]) => {
            if (Array.isArray(value)) {
              return value.length > 0;
            }
            return true;
          })
        );


        const resume_data = { resume_data: { ...filteredResumeData } };

        const requestData = {
          ...resume_data,
          resume_name: ResumeName,
        };

        const response = await addResume(requestData);
        // console.log(response?.data);
        setToLocalStorage('resumeId', response?.data?.data?.id);
        setToLocalStorage('GuestId', response?.data?.data?.guest_id);
        setToLocalStorage('GuestData', "true");
        setIsLoading(false);
      }
    }
    catch (error) {
      setIsLoading(false);
      // console.log("error2", error);
      // let errorMessage = (error as Error)?.message;
      // ToastMessage({
      //   type: 'error',
      //   message: errorMessage || error,
      // });
    }
  }

  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    const resume_id = Number(getFromSessionStorage('ResumeId')) || Number(getFromLocalStorage("resumeId"));
    const templateId = getFromSessionStorage('selectedTemplateId');

    if (templateIdPrev !== templateId && resume_id) {
      Generate(templateId);
      setHasGenerated(true);
    } else {
      if (resume_id && templateId && resume_id != 0) {
        Generate(templateId);
      }
    }
  }, [getFromSessionStorage('selectedTemplateId')]);

  useEffect(() => {
    if (step4) {
      const timer = setTimeout(() => {
        setShouldPassGenerate(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShouldPassGenerate(false);
    }
  }, [step4]);

  const Save = () => {
    const storedData = getFromLocalStorage('resumeData');
    const resumeData = storedData ? JSON.parse(storedData) : { resume_data: {} };

    resumeData.resume_data = {
      ...resumeData.resume_data,
    };

    setToLocalStorage('resumeData', JSON.stringify(resumeData));
    setResumeData(resumeData);

    const resume_id = getFromLocalStorage('resumeId');
    const GuestId = getFromSessionStorage('GuestId');
    if (token) {
      if (!resume_id) {
        AddResume();
      }
    } else {
      if (!GuestId) {
        AddResume2();
      }
    }
  }

  // jQuery-style page transition function
  const togglePageWithTransition = (show: boolean) => {
    setPageTransition(true);
    setTimeout(() => {
      setShowDrawer(show);
      setTimeout(() => setPageTransition(false), 300);
    }, 150);
  };


  const generateProp = shouldPassGenerate ? Generate : () => { };


  return (
    <>

      <div className='d-flex resume-main'>
        {isSmallScreen && (
          <div
            style={{
              position: 'fixed',
              top: '0',
              zIndex: 2,
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '20px !important',
              backgroundColor: '#fff',
              width: '100%',
              textAlign: 'right',
            }}
          >
            <button
              className="prim-but"
              type='button'
              onClick={() => togglePageWithTransition(true)}>
              {step1 ? "Select Template" : "Finalize"}
            </button>
          </div>
        )}


        <div className={`form-Container ${step1 ? 'disabled' : ''} ${pageTransition ? 'page-transition' : ''} ${!step4 ? 'd-none' : ''}`}>
          <ResumeProvider>
            <Personaldetails setResumeData={setResumeData} Generate={generateProp} step2={step2} step3={step3} step4={step4} setStep3={setStep3} setStep4={setStep4} tips={getTipsForSection('Personaldetails')} />
            <Experience setResumeData={setResumeData} Generate={generateProp} step2={step2} tips={getTipsForSection('Experience')} />
            <Education setResumeData={setResumeData} Generate={generateProp} step2={step2} tips={getTipsForSection('Education')} />
            <Internship setResumeData={setResumeData} Generate={generateProp} step2={step2} tips={getTipsForSection('Internship')} />
            <Projects setResumeData={setResumeData} Generate={generateProp} step2={step2} tips={getTipsForSection('Projects')} />
            <SkillsAndInterests setResumeData={setResumeData} Generate={generateProp} step2={step2} tips={getTipsForSection('SkillsAndInterests')} />
            {/* <AchievementsAndCertificates setResumeData={setResumeData} Generate={generateProp} step2={step2} tips={getTipsForSection('Achievements')} externalTips={getTipsForSection('Certificates')} /> */}
            <DeclarationsAndReferences setResumeData={setResumeData} Generate={generateProp} step2={step2} tips={getTipsForSection('Declaration')} externalTips={getTipsForSection('Reference')} />
            <CustomData setResumeData={setResumeData} Generate={generateProp} step2={step2} tips={getTipsForSection('Language')} externalTips={getTipsForSection('Social-Links')} />
          </ResumeProvider>
        </div>

        {step3 &&
          <div style={{ display: step3 ? 'block' : 'none', flex: 1, height: "100vh", overflowY: "auto" }}>
            <SelectTemplates
              setStep3={setStep3}
              step3={step3}
              setStep4={setStep4}
              step4={step4}
              Generate={Generate}
            />
          </div>
        }

        {/* Drawer for small screens */}
        {isSmallScreen ? (
          <Drawer

            anchor="right"
            open={showDrawer}
            onClose={() => togglePageWithTransition(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: '100%',
                // maxWidth: '400px',
                boxSizing: 'border-box',
              },
              display: isSmallScreen ? 'block' : 'none'
            }}
            // Completely disable backdrop clicks
            ModalProps={{
              disableEscapeKeyDown: true, // Disable ESC key
            }}
            BackdropProps={{
              sx: {
                pointerEvents: 'none' // Disable backdrop clicks
              }
            }}
          >
            <Box sx={{ p: 0, height: '100%', overflow: 'auto' }}>
              {!step1 &&
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <IconButton onClick={() => togglePageWithTransition(false)}>
                    <IoClose />
                  </IconButton>
                </Box>
              }
              <Sidebar
                save={Save}
                setStep1={setStep1}
                setStep2={setStep2}
                GeneratedResume={generatedResume}
                ResumeLoading={ResumeLoading}
                step1={step1}
                step2={step2}
                setShowModal={setShowDrawer}
              />
            </Box>
          </Drawer>
        ) : (
          <div className="sidebar-container">
            <Sidebar
              save={Save}
              setStep1={setStep1}
              setStep2={setStep2}
              GeneratedResume={generatedResume}
              ResumeLoading={ResumeLoading}
              step1={step1}
              step2={step2}
              setShowModal={setShowDrawer}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Index;