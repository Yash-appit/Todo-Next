import React, { useState } from 'react';
// import home2 from "../../../assets/Images/Home/build-your-resume-online.webp";
import home2 from "@/assets/Images/Home/build-your-resume-online.webp" 
import h1 from "@/assets/Images/Home/h1.png";
import h2 from "@/assets/Images/Home/h2.png";
import h3 from "@/assets/Images/Home/h3.png";
import h4 from "@/assets/Images/Home/h4.png";
import { addResume } from '@/services/resume/Index';
import { FaArrowRight } from "react-icons/fa6";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
// import ToastMessage from '../Layout/ToastMessage';
import TiltedCard from '@/components/Animation/TiltedCard';
import RotatingText from '@/components/Animation/RotatingText';
import ShinyText from '@/components/Animation/ShinyText';
import { trackEvent } from '@/config/AnalyticsTracker';
import SafeAds from '@/common/SafeAds';
import Image from 'next/image';
import Link from 'next/link';

  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

const CreateResume: React.FC = () => {

    const [token, setToken] = useState(getFromLocalStorage('token'));

    // const handleCreateResume = () => {
    //     const CheckGuest = localStorage.getItem('GuestData');
    //     if (CheckGuest === "true") {
    //    localStorage.removeItem('resumeId');
    //    localStorage.removeItem('GuestData');
    //    localStorage.removeItem('resumeData');
    //       localStorage.removeItem('templateId');
    //  sessionStorage.removeItem('selectedTemplateId');
    //     }
    //     sessionStorage.removeItem('templateId');
    //     localStorage.removeItem("resumeName");
    //     if (token) {
    //         sessionStorage.removeItem('GuestId');
    //     }
    //     const resume_id = localStorage.getItem('resumeId');
    //     const resumeData = localStorage.getItem('resumeData');


    //     if (resumeData) {
    //         // const parsedResumeData = JSON.parse(resumeData);

    //         const parsedData = JSON.parse(resumeData);


    //         const sanitizeResumeData = (resumeData: any) => {
    //             const isEmptyObject = (obj: any) =>
    //                 Object.values(obj).every((value) => value === null || value === "");

    //             const sanitizedData = Object.fromEntries(
    //                 Object.entries(resumeData).map(([key, value]) => {
    //                     if (Array.isArray(value)) {
    //                         const filteredArray = value.filter((item) => !isEmptyObject(item));
    //                         return [key, filteredArray];
    //                     }
    //                     return [key, value];
    //                 })
    //             );

    //             return sanitizedData;
    //         };

    //         const cleanedData = sanitizeResumeData(parsedData.resume_data);

    //         // console.log("Cleaned Resume Data:", cleanedData);

    //         const filteredResumeData = Object.fromEntries(
    //             Object.entries(cleanedData).filter(([key, value]) => {
    //                 if (Array.isArray(value)) {
    //                     return value.length > 0; // Keep arrays with at least one element
    //                 }
    //                 return true; // Keep non-array values
    //             })
    //         );

    //         // Store the filtered data in a variable named `resume_data`
    //         const resume_data = { resume_data: { ...filteredResumeData } };
                

    //         // Send API call based on whether resumeId exists
            
    //         if (resume_id) {
    //             addResume({ resume_id, resume_name: 'Resume', ...resume_data })
    //                 .then((response) => {
    //                     console.log('Resume updated successfully:');
    //                 })
    //                 .catch((error) => {
    //                     console.error('Error updating resume:', error);
    //                     let errorMessage = (error);
    //                     ToastMessage({
    //                         type: 'error',
    //                         message: errorMessage,
    //                     });
    //                 });
    //         } 

    //         // Remove items from localStorage
    //         localStorage.removeItem('resumeId');
    //         localStorage.removeItem('resumeData');
    //         localStorage.removeItem('resumeName');
    //         localStorage.removeItem('customHeading');
    //         localStorage.removeItem('settings');
    //         sessionStorage.removeItem('ResumeId');

    //     }
    // };


    const handleCreateResume = () => {
        const CheckGuest = getFromLocalStorage('GuestData');
        if (CheckGuest === "true") {
          localStorage.removeItem('resumeId');
          localStorage.removeItem('GuestData');
          localStorage.removeItem('resumeData');
        }
        sessionStorage.removeItem('templateId');
        localStorage.removeItem('templateId');
         sessionStorage.removeItem('selectedTemplateId');
        sessionStorage.removeItem('ResumeId');
        localStorage.removeItem("resumeName");
        sessionStorage.removeItem('GuestId');
        
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
    
          const isResumeDataEmpty = (resumeData: any): boolean => {
            if (typeof resumeData !== 'object' || resumeData === null) {
              return resumeData === null || resumeData === '' || resumeData === undefined;
            }
    
            if (Array.isArray(resumeData)) {
              if (resumeData.length === 0) {
                return true;
              }
              return resumeData.every((item) => isResumeDataEmpty(item));
            }
    
            return Object.values(resumeData).every((value) => isResumeDataEmpty(value));
          };
    
          const isEmpty = isResumeDataEmpty(resume_data);
    
          if (!isEmpty) {
            if (resume_id) {
              addResume({ resume_id, resume_name: 'Untitled', ...resume_data })
                .then((response) => {
                  console.log('Resume updated successfully:');
                  sessionStorage.setItem('ResumeId', response?.data?.data?.id);
                })
                .catch((error) => {
                  console.error('Error updating resume:', error);
                });
            } 
          }
    
          localStorage.removeItem('resumeId');
          localStorage.removeItem('resumeData');
          localStorage.removeItem('resumeName');
          localStorage.removeItem('resumeImage');
          localStorage.removeItem('customHeading');
          localStorage.removeItem('settings');
        }
      };

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        arrows: false,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1000,
        centerMode: true,
        centerPadding: '20px',
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                    centerMode: true,
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    centerMode: true,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    centerMode: true,
                }
            },
            {
                breakpoint: 450,
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                }
            }
        ]
    };

    return (
        <div className="rev-res home-res">

            <div className="row logo mx-0 my-element mb-3" data-aos="zoom">
                <div className="col-lg-3 align-items-center justify-content-center d-flex web-res">
                    <p>Resume Shortlisted By</p>
                </div>


                <div className="col-lg-9 pt-3 web-res">
                    <Slider {...settings} className='mt-4'>
                    <Image src={h1} alt="" loading="lazy" />
                    <Image src={h2} alt="" loading="lazy" />
                    <Image src={h3} alt="" loading="lazy" />
                    <Image src={h4} alt="" loading="lazy" />
                        {/* <img src={h1} alt="" loading="lazy" /> */}
                    </Slider>
                </div>


                <div>
                    <div className='resp py-3 mx-3 me-0'>
                        <h2 className='mb-3 short'>Resume Shortlisted By</h2>
                        <hr />
                        <Slider {...settings} className='mt-4'>
                        <Image src={h1} alt="" loading="lazy" />
                    <Image src={h2} alt="" loading="lazy" />
                    <Image src={h3} alt="" loading="lazy" />
                    <Image src={h4} alt="" loading="lazy" />
                            {/* <img src={h1} alt="" loading="lazy" /> */}
                        </Slider>
                    </div>
                </div>

              
      <SafeAds />
 
            </div>

         
            <div className="row pb-4 pb-3 m-0">
                <div className="col-lg-6 text-start px-4 pt-0">
                    <div className="rev-res-bg">
                        <div className="m-auto d-table pt-5">
                            {/* <h6>The <strong className='prim-col'>#1</strong> Resume Builder</h6> */}
                            <h2 className='my-element d-flex' data-aos="fade-up" data-aos-delay="100">Build Your

                                <RotatingText
                                    texts={['Career', 'Resume']}
                                    mainClassName="px-3 sm:px-3 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center"
                                    staggerFrom={"last"}
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "-120%" }}
                                    staggerDuration={0.025}
                                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                                    rotationInterval={3000}
                                />

                            </h2>

                            <h2 className='my-element d-flex mt-0 pt-0' data-aos="fade-up" data-aos-delay="100"> Build <div className='italic px-2 pr-0'>Your</div> <div className='italic'><RotatingText
                                texts={['Resume', 'Career']}
                                mainClassName="px-1 sm:px-1 md:px-1 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center second"
                                staggerFrom={"last"}
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "-120%" }}
                                staggerDuration={0.025}
                                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                                rotationInterval={3000}
                            /></div></h2>


                            <p className='my-4 py-2 my-element' data-aos="fade-up" data-aos-delay="150">Craft a standout resume with ease. Build, customize, and showcase<br /> your professional story in minutes. Choose from ATS Approved templates.</p>
                           
                            <div className='d-flex align-items-center pb-5'>
                                

                                <ShinyText text={
                                    <Link href="/create-resume" type="button" onClick={() => {
                                        trackEvent({
                                          category: 'Resume',
                                          action: 'Create Resume Click',
                                          label: 'Home Page'
                                        });
                                        handleCreateResume();
                                      }} className='prim-but mt-3 my-element' data-aos="fade-up" data-aos-delay="300">Create My Resume <FaArrowRight /></Link>
                                } disabled={false} speed={3} className='custom-class' />
                                

                            </div>
                        </div>

                        {/* <ShinyText text="Just some shiny text!" disabled={false} speed={3} className='custom-class' /> */}
                    </div>


                </div>

                <div className="col-lg-6 text-start" >
                    <div className="rev-res-bg new mt-0">
                        <TiltedCard
                            imageSrc={home2.src}
                            title="Build Your Resume Online | Create a Professional Resume"
                            altText="Smiling professional beside a computer showing a digital resume builder template with profile and skills sections."
                            captionText="Build your resume effortlessly with TodoResume’s ATS-approved templates and land your dream job faster."
                            containerHeight="100%"
                            containerWidth="100%"
                            imageHeight="100%"
                            imageWidth="100%"
                            rotateAmplitude={12}
                            scaleOnHover={1.02}
                            showMobileWarning={false}
                            showTooltip={false}
                            displayOverlayContent={true}

                        />
                        
                    </div>
                </div>

                {/* <div className="bg-image">
                        <img src={bg} alt="" />
                    </div> */}


            </div>
            
        </div>
    )
}

export default CreateResume;
