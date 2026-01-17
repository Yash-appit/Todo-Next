"use client"
import React, { useState, useEffect } from 'react';
import res from "@/assets/Images/resume-builder/res.webp";
import { FaArrowRight } from "react-icons/fa6";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import h1 from "@/assets/Images/Home/h1.png";
import h2 from "@/assets/Images/Home/h2.png";
import h3 from "@/assets/Images/Home/h3.png";
import h4 from "@/assets/Images/Home/h4.png";
import { reviewList } from '@/services/review';
import prof from "@/assets/Images/resume-builder/profile.png";
import start from "@/assets/Images/Templates/star.png";
import ScrollReveal from '@/components/Animation/ScrollReveal2';
import ap from "@/assets/Images/AITools/ap.svg";
import Faq from '@/components/home/faq';
import { addResume } from '@/services/resume/Index';
import ToastMessage from '@/Layout/ToastMessage';
import res1 from "@/assets/Images/resume-builder/res1.webp";
import res2 from "@/assets/Images/resume-builder/res2.webp";
import res3 from "@/assets/Images/resume-builder/res3.webp";
import res4 from "@/assets/Images/resume-builder/res4.webp";
import SafeAds from '@/common/SafeAds';
import "@/styles/Home.css";
import "@/styles/AiTools.css";
import "@/styles/Other.css";
import Image from 'next/image';
import Link from 'next/link';


const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

const ResumeBuilder = () => {
    const [reviews, setReviews] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState(getFromLocalStorage('token'));


    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await reviewList("Home");
            setReviews(response?.data?.data);
            // console.log(response.data.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setIsLoading(false);
        }
    }

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


    useEffect(() => {
        fetchReviews();
        window.scrollTo(0, 0);
    }, []);

    return (<>
    
        <div className='pt-5'></div>
        <section className='ai-bg res-build pt-4 mt-5'>
            <div className="container-fluid">
                <div className="row m-0">
                    <div className="col-lg-6 mb-4 px-0">
                        <div className="bg p-5">
                            <p className='pt-5 mt-2 head-main'>highlights your strengths, shows your personality.</p>
                            <h1 className='my-4'>Online Resume<span className='sec-col'> Builder</span> Tool</h1>
                            <p>To Do Resume's cover letter maker helps you share your story. Simply answer a few questions, customize the design, and save as a PDF.</p>
                           
                                <Link href="/create-resume" type="button" className='res-but mt-5' onClick={handleCreateResume}><span>Create a Resume</span> <FaArrowRight /></Link>
                               
                            {/* <Link to="/login" type="button" className='prim-but mt-5'><span>Create A Resume</span> <FaArrowRight /></Link> */}
                        </div>
                    </div>
                    <div className="col-lg-6 mb-4 pe-0 emp">
                        <div className="bg">
                            <Image src={res} alt=""/>
                        </div>
                    </div>
                </div>
            </div>

         
      <SafeAds />
          

            <div className='steps'>
                <div className="container my-4">
                    <p className='second-main'>Elevate Your Approach</p>

                    <h2 className='mt-3 approach'>Easy <span className='sec-col'>Steps</span> To Make <span className='sec-col'>Resume</span></h2>
                    <div className="row m-0">
                        <div className="col-lg-6">
                            <div className="bg">
                                <h2>1</h2>
                                <h3>Choose Template</h3>
                                <Image src={res1} alt="" />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="bg">
                                <h2>2</h2>
                                <h3>Fill Your Details</h3>
                                <Image src={res2} alt="" />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="bg">
                                <h2>3</h2>
                                <h3>Customize</h3>
                                <Image src={res3} alt="" />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="bg">
                                <h2>4</h2>
                                <h3>Download & Share</h3>
                                <Image src={res4} alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>




            <div className="container-fluid rev-res">
                <div className="row logo my-element m-0 mb-4" data-aos="zoom">
                    <div className="col-lg-3 align-items-center justify-content-center d-flex web-res">
                        <p>Resume Shortlisted By</p>
                    </div>


                    <div className="col-lg-9 pt-3 web-res">
                        <Slider {...settings} className='mt-4'>
                            <Image src={h1} alt="" loading="lazy" />

                            <Image src={h2} alt="" loading="lazy" />

                            <Image src={h3} alt="" loading="lazy" />

                            <Image src={h4} alt="" loading="lazy" />

                            {/* <Image src={h1} alt="" loading="lazy" /> */}
                        </Slider>
                    </div>


                   
                        <div className='resp py-3 mx-3 me-0'>
                            <h2 className='mb-3 short'>Resume Shortlisted By</h2>
                            <hr />
                            <Slider {...settings} className='mt-4'>
                                <Image src={h1} alt="" loading="lazy" />
                                <Image src={h2} alt="" loading="lazy" />
                                <Image src={h3} alt="" loading="lazy" />
                                <Image src={h4} alt="" loading="lazy" />
                                {/* <Image src={h1} alt="" loading="lazy" /> */}
                            </Slider>
                        </div>
                </div>
            </div>





            {reviews?.length > 0 &&
                <section className='temp-rev mb-4 pb-1'>
                    <div className="bg pb-0">
                        <div className="row pt-4">
                            <div className="col-lg-3 text-center my-element temp-rev-head my-auto" data-aos="fade-down" data-aos-delay="100">
                                <h3>Reviews</h3>
                                {Array(5).fill(null).map((_, index) => (
                                    <Image key={index} src={start} alt="" />
                                ))}

                                {reviews?.length &&
                                    < p className='mt-2'>Based on {reviews?.length} reviews</p>
                                }
                            </div>



                            {reviews && reviews.length > 3 ? (
                                <div className="col-lg-9">
                                    <Slider
                                        dots={false}
                                        infinite={true}
                                        arrows={false}
                                        autoplay={true}
                                        speed={500}
                                        slidesToShow={3}
                                        slidesToScroll={1}
                                        responsive={[
                                            {
                                                breakpoint: 1000,
                                                settings: {
                                                    slidesToShow: 2,
                                                    slidesToScroll: 1
                                                }
                                            },
                                            {
                                                breakpoint: 500,
                                                settings: {
                                                    slidesToShow: 1,
                                                    slidesToScroll: 1
                                                }
                                            }
                                        ]}
                                        className="review-slider row"
                                    >
                                        {reviews.map((item: any) => (
                                            <div key={item.id} className="col-lg-4 px-4 pt-3">
                                                <div className='my-element' data-aos="fade-down" data-aos-delay="100">
                                                    <div className='d-flex align-items-center justify-content-between'>

                                                        <div>
                                                            {item.reviewer_name && <h4 className='mt-1 me-2'>{item.reviewer_name},</h4>}
                                                            <div className='d-flex'>
                                                                {Array(item?.rating).fill(null).map((_, index) => (
                                                                    <Image key={index} src={start} alt="" />
                                                                ))}
                                                            </div>
                                                            <h5 className='mt-2'>{item.reviewer_title}</h5>
                                                        </div>

                                                        <Image src={item.image_url || prof} alt="" className='prof' />
                                                    </div>


                                                    <p>{item.review_text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </Slider>
                                </div>
                            ) : (
                                reviews?.map((item: any) => (
                                    <div className='my-element' data-aos="fade-down" data-aos-delay="100" key={item.id}>
                                        <div className='d-flex align-items-center justify-content-between'>
                                            <div>
                                                <h6 className='mt-1'>{item.reviewer_name}</h6>
                                                {Array(item?.rating).fill(null).map((_, index) => (
                                                    <Image key={index} src={start} alt="" className='rev-star' />
                                                ))}
                                            </div>
                                            <img src={item.image_url} alt="" className='prof' />
                                        </div>
                                        <h6 className='mt-2'>{item.reviewer_title}</h6>
                                        <p>{item.review_text}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section >
            }






      <SafeAds />
              

            <section className='career-objective-bg'>
                <div className="approach container-fluid">
                    <div className="row m-0">
                        <div className="col-lg-6 mb-4 px-0">
                            <div className="bg m-auto p-4 text-center h-100">
                                <Image src={ap} alt="" className="img-fluid" />
                            </div>
                        </div>

                        <div className="col-lg-6 mb-4 m-0 pe-0">
                            <div className="bg p-5 m-auto">
                                {/* <h4 className='pt-5 mt-2'>highlights your strengths, shows your personality.</h4> */}
                                <h2 className='my-4 pt-5 elevate'><span className='sec-col'>Elevate</span> Your <span className='sec-col'>Approach</span></h2>
                                <p className='mb-5'>Create a standout resume tailored to your unique skills and <br /> experiences. Our intuitive resume maker simplifies the process, <br /> ensuring you present your best self to potential employers.</p>


                              
                                    <Link href="/create-resume" className='prim-but mt-5' onClick={handleCreateResume}>Get Started Now</Link>
                                  
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ScrollReveal delay={200}>
                <Faq />
            </ScrollReveal>

     
      <SafeAds />
             

        </section>
    </>
    )
}

export default ResumeBuilder
