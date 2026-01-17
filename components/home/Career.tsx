import React, {useState} from 'react';
import career from "@/assets/Images/Home/career/elevate-your-career-growth.svg";
import TiltedCard from '@/components/Animation/TiltedCard';
import ToastMessage from '@/Layout/ToastMessage';
import { addResume } from '@/services/resume/Index';
import { trackEvent } from '@/config/AnalyticsTracker';
import Link from 'next/link';

  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

const Career: React.FC = () => {
  const [token, setToken] = useState(getFromLocalStorage('token'));

    const handleCreateResume = () => {
        sessionStorage.removeItem('templateId');
        localStorage.removeItem("resumeName");
        const resume_id = getFromLocalStorage('resumeId');
        const resumeData = getFromLocalStorage('resumeData');


        if (resumeData) {
            // const parsedResumeData = JSON.parse(resumeData);

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

            // console.log("Cleaned Resume Data:", cleanedData);

            const filteredResumeData = Object.fromEntries(
                Object.entries(cleanedData).filter(([key, value]) => {
                    if (Array.isArray(value)) {
                        return value.length > 0; // Keep arrays with at least one element
                    }
                    return true; // Keep non-array values
                })
            );

            // Store the filtered data in a variable named `resume_data`
            const resume_data = { resume_data: { ...filteredResumeData } };


            // Send API call based on whether resumeId exists
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

            // Remove items from localStorage
            localStorage.removeItem('resumeId');
            localStorage.removeItem('resumeData');
            localStorage.removeItem('resumeName');
        }
    };


  return (
    <div className='career-sec'>
      <div className="container-fluid py-3 pt-0">
        <div className="row m-0">
          <div className="col-lg-6 p-0">
            <div className="career pb-0">
              {/* <img src={career} alt="" loading="lazy" className='w-100' /> */}
              <TiltedCard
                            imageSrc={career.src}
                            altText='Businesswoman on an upward green arrow with a laptop beside a target, symbolizing success, growth, and career elevation.'
                            title='Elevate Your Career | Resume Builder for Career Growth'
                            captionText='Elevate your career with TodoResume’s AI-powered resume builder designed to highlight your skills and boost job opportunities.'
                            containerHeight="100%"
                            containerWidth="100%"
                            imageHeight="100%"
                            imageWidth="100%"
                            rotateAmplitude={12}
                            scaleOnHover={1.01}
                            showMobileWarning={false}
                            showTooltip={false}
                            displayOverlayContent={true}
                        />
            </div>
          </div>


          <div className="col-lg-6 p-0 car-txt">
            <div className="career pt-5">
              <h2 className='pt-4 mt-5 my-element' data-aos="fade-up" data-aos-delay="100">Elevate <span className='px-2 new'>Your</span> Career</h2>
              <p>Create a standout resume tailored to your unique skills and experiences. Our intuitive resume maker simplifies the process, ensuring you present your best self to potential employers.</p>
              <span>Your Privacy Is Our Top Priority</span>

              <div className='my-4'>
                {token ?
                <Link href="/create-resume" type="button" onClick={() => {
                  trackEvent({
                    category: 'Resume',
                    action: 'Create Resume Click',
                    label: 'Home Page'
                  });
                  handleCreateResume();
                }} className='prim-but'>Get Started Now</Link> :
                <Link href="/login" type="button" className='prim-but'>Get Started Now</Link> 
              }
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Career
