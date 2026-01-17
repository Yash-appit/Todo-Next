import React, { useEffect, useState } from 'react';
import pack1 from "@/assets/Images/Home/package/pack1.png";
import pack2 from "@/assets/Images/Home/package/pack2.png";
import pack3 from "@/assets/Images/Home/package/pack3.png";
import ScrollFloat from '@/components/Animation/ScrollFloat';
import ScrollReveal from '@/components/Animation/ScrollReveal';
import { addResume } from '@/services/resume/Index';
import ToastMessage from '@/Layout/ToastMessage';
import { trackEvent } from '@/config/AnalyticsTracker';
import SafeAds from '@/common/SafeAds';
import Image from 'next/image';
import Link from 'next/link';


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


const ViewPackage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(getFromLocalStorage('token'));
  }, []);

  const handleCreateResume = () => {
    sessionStorage.removeItem('templateId');
    localStorage.removeItem("resumeName");
    const resume_id = getFromLocalStorage('resumeId');
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

      if (resume_id) {
        addResume({ resume_id, resume_name: 'Resume', ...resume_data })
          .then((response) => {
            console.log('Resume updated successfully:');
          })
          .catch((error) => {
            console.error('Error updating resume:', error);
            let errorMessage = (error);
            ToastMessage({
              type: 'error',
              message: errorMessage,
            });
          });
      } else {
        addResume({ resume_name: 'Resume', ...resume_data })
          .then((response) => {
            console.log('Resume created successfully:');
          })
          .catch((error) => {
            console.error('Error creating resume:', error);
            let errorMessage = (error);
            ToastMessage({
              type: 'error',
              message: errorMessage,
            });
          });
      }

      localStorage.removeItem('resumeId');
      localStorage.removeItem('resumeData');
      localStorage.removeItem('resumeName');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getScrollStyle = (offset: number) => {
    const isMobile = window.innerWidth <= 1200;
    return {
      transform: isMobile ? 'translateY(0px)' : `translateY(${scrollY * 0.1 - offset}px)`,
      transition: 'transform 0.2s ease-out'
    };
  };

  return (
    <div className='container-fluid py-3 pt-4 ats-opt'>
      <div className="view-pack pt-2">
        <div className="row pb-2 pt-5 text-center m-0">

          <h2 className='my-element' data-aos="fade-down" data-aos-delay="100">
            ATS-<span className='sec-col'>Optimized Resumes for Job</span>
          </h2>

          <h2 className='my-element' data-aos="fade-down" data-aos-delay="100">
            Applications
          </h2>

          <p className='pt-4 pb-4 mb-0'>
            At Todo Resume, we rigorously test our résumés and cover letters with top <br />ATS systems to boost your chances of passing initial screenings.
          </p>

          <div className='gridlay'>
            <div className="col my-element" data-aos="fade-down" data-aos-delay="100">
              <div className='mt-3 bord'>
                <div style={getScrollStyle(100)}>
                  <Image
                    src={pack1}
                    alt="Minimalist illustration of a person in an orange shirt pointing upwards toward glowing lightbulbs, set against a dark background with abstract light blue shapes and a speech bubble."
                    width={400}
                    height={300}
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                    loading="lazy"
                  />
                </div>
                <h3>Modify Contact Info</h3>
              </div>
            </div>

            <div className="col my-element" data-aos="fade-down" data-aos-delay="200">
              <div className='mt-3 bord'>
                <div style={getScrollStyle(100)}>
                  <Image
                    src={pack2}
                    alt="Stylized illustration of a person holding a digital board displaying sticky notes, representing task management or project planning."
                    width={400}
                    height={300}
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                    loading="lazy"
                  />
                </div>
                <h3>Complete Parsing Experience</h3>
              </div>
            </div>

            <div className="col my-element" data-aos="fade-down" data-aos-delay="300">
              <div className='mt-3 bord'>
                <div style={getScrollStyle(100)}>
                  <Image
                    src={pack3}
                    alt="Minimalist illustration of a person pointing at a screen displaying bar graphs and multiple circular pie and donut charts for data analysis."
                    width={400}
                    height={300}
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                    loading="lazy"
                  />
                </div>
                <h3>Streamlined Skills Section</h3>
              </div>
            </div>
          </div>

          <div className='text-center my-5'>
            {token ?
              <Link
                href="/create-resume"
                type="button"
                onClick={() => {
                  trackEvent({
                    category: 'Resume',
                    action: 'Create Resume Click',
                    label: 'Home Page'
                  });
                  handleCreateResume();
                }}
                className='prim-but'
              >
                Build an ATS-Friendly Resume
              </Link>
              :
              <Link href="/login" type="button" className='prim-but'>
                Build an ATS-Friendly Resume
              </Link>
            }
          </div>
        </div>
      </div>

      <SafeAds />
    </div>
  )
}

export default ViewPackage;