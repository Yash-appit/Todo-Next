"use client"

import React, { useState, useEffect } from 'react';
import "@/styles/Other.css";
import { addResume } from '@/services/resume/Index';
import { FaArrowRight } from "react-icons/fa6";
import Faq from '@/components/home/faq';
import start from "@/assets/Images/Templates/star.png";
import blank from "@/assets/Images/blank.jpg";
import res1 from "@/assets/Images/Templates/res1.webp";
import res2 from "@/assets/Images/Templates/res2.webp";
import res3 from "@/assets/Images/Templates/res3.webp";
import temp1 from "@/assets/Images/AITools/rs1.webp";
import temp2 from "@/assets/Images/AITools/rs2.webp";
import temp3 from "@/assets/Images/AITools/rs3.webp";
import temp4 from "@/assets/Images/Templates/temp4.webp";
import temp5 from "@/assets/Images/Templates/temp5.webp";
import temp6 from "@/assets/Images/Templates/temp6.webp";
import { reviewList } from '@/services/review';
import ToastMessage from '@/Layout/ToastMessage';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import prof from "@/assets/Images/resume-builder/profile.png";
import ScrollReveal from '@/components/Animation/ScrollReveal2';
import TiltedCard from '@/components/Animation/TiltedCard';
import SafeAds from '@/common/SafeAds';
import Image from 'next/image';
import Link from 'next/link';
import "@/styles/Other.css";
import "@/styles/Home.css";


const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

const Templates = () => {

    const resumeData = getFromLocalStorage('resumeData');
    const [reviews, setReviews] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState(getFromLocalStorage('token'));

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await reviewList("Home");
            setReviews(response?.data?.data);
            // console.log(response.data.data);
            // console.log("Hello");
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setIsLoading(false);
        }
    }


    useEffect(() => {
        fetchReviews();
        window.scrollTo(0, 0);
    }, []);



    const handleCreateResume = () => {
        localStorage.removeItem("resumeName");
        sessionStorage.removeItem('templateId');
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


    return (<>

        <section className='temp-head'>
            <div className="container-fluid p-0 pt-5">
                <div className="bg my-element" data-aos="fade-down" data-aos-delay="100"></div>


                <div className='text-center mt-5 pt-5 my-element head' data-aos="fade-down" data-aos-delay="300">
                    <h1>Professionally Crafted Resume Templates<br /> Designed to Make a Lasting Impression.</h1>
                    <p className='mt-5 mb-0 head-p'>Creative resume templates designed by top typographers.</p>
                    <p>However you customize, your resume is sure to shine.</p>

                    <div className='mt-4 pt-3 head-but position-relative'>

                        {token ?
                            <Link href="/create-resume" onClick={handleCreateResume} className='prim-but my-element' data-aos="fade-up" data-aos-delay="200">Create My Resume <FaArrowRight /></Link>
                            : <Link href="/login" className='prim-but my-element' data-aos="fade-up" data-aos-delay="200">Create My Resume <FaArrowRight /></Link>
                        }
                    </div>
                </div>
            </div>

        </section>

        <section className='py-4 templat'>
            <div className="row">
            <div className="col-lg-12">
                
      <SafeAds />
                   
                </div>
            </div>
            <div className="row bg-white text-center">
                <div className="col">
                    <Image src={temp1} alt="" />

                    <h4>Executive</h4>
                    <p>Executive resume sample with a contemporary
                        approach and eye-catching design that makes
                        sure your application will be spotted first.</p>
                </div>

                <div className="col">
                    <Image src={temp2} alt="" />
                    <h4>IT</h4>
                    <p>One of the best resume layouts to choose when
                        you wish to showcase your IT expertise.</p>
                </div>


                <div className="col">
                    <Image src={temp4} alt="" />
                    <h4>Simple</h4>
                    <p>Simple resume layout for conservative
                        industries, which is a minimalistic upgrade from
                        the traditional resumes.</p>
                </div>
              
                <div className="col my-element" data-aos="fade-down" data-aos-delay="200">
                    <Image src={temp3} alt="" />
                    <h4>Tech</h4>
                    <p>Apply and get shortlisted for tech jobs with the
                        tech resume template that will impress hiring
                        managers.</p>
                </div>

                <div className="col my-element" data-aos="fade-down" data-aos-delay="300">
                    <Image src={temp5} alt="" />
                    <h4>Professional</h4>
                    <p>A professional resume sample that has been
                        approved by various recruiters and helped
                        numerous people get their dream job.</p>
                </div>

                <div className="col my-element" data-aos="fade-down" data-aos-delay="400">
                    <Image src={temp6} alt="" className='last' />
                    <h4>Combined</h4>
                    <p>This template combines two professional
                        resume formats. It’s a mix of the reverse-
                        chronological resume and the functional
                        resume format.</p>
                </div>
                <div className="col-lg-12">
                    
      <SafeAds />
                    
                </div>
            </div>
        </section>


        {reviews?.length > 0 &&
            <section className='temp-rev mb-4 pb-1'>
                <div className="bg pb-0">
                    <div className="row pt-4">
                        <div className="col-lg-3 text-center my-element temp-rev-head my-auto" data-aos="fade-down" data-aos-delay="100">
                            <h4>Reviews</h4>
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
                                                        {item.reviewer_name && <h6 className='mt-1 me-2'>{item.reviewer_name},</h6>}
                                                        <div className='d-flex'>
                                                            {Array(item?.rating).fill(null).map((_, index) => (
                                                                <Image key={index} src={start} alt="" />
                                                            ))}
                                                        </div>
                                                        <h6 className='mt-2'>{item.reviewer_title}</h6>
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
                                        <Image src={item.image_url} alt="" className='prof' />
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


        <ScrollReveal delay={200}>
            <Faq />
        </ScrollReveal>

        

        <ScrollReveal delay={400}>
            <section className='res-work mx-2 my-5'>
                <div className="bg p-5">
                    <div className="row">
                        <div className="col-lg-4 py-4 my-element" data-aos="fade-up" data-aos-delay="200">
                            <h2 className='mt-5'>Let your resume do
                                the work.</h2>
                            <p className='my-5 pb-1'>Join job seekers around the world and land your dream job with your best resume yet.</p>

                            {token ?
                                <Link href="/create-resume" type="button" onClick={handleCreateResume} className='prim-but'>Create My Resume <FaArrowRight /></Link>
                                : <Link href="/login" className='prim-but'>Create My Resume <FaArrowRight className='mx-3 me-0' /></Link>
                            }
                        </div>


                        <div className="col-lg-8 py-4 px-0">
                            <TiltedCard
                                imageSrc={res1.src}
                                // altText="Kendrick Lamar - GNX Album Cover"
                                // captionText="Kendrick Lamar - GNX"
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
                            <TiltedCard
                                imageSrc={res2.src}
                                // altText="Kendrick Lamar - GNX Album Cover"
                                // captionText="Kendrick Lamar - GNX"
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
                            <TiltedCard
                                imageSrc={res3.src}
                                // altText="Kendrick Lamar - GNX Album Cover"
                                // captionText="Kendrick Lamar - GNX"
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


                        <Slider
                            dots={false}
                            infinite={true}
                            speed={500}
                            slidesToShow={1}
                            slidesToScroll={1}
                            responsive={[

                                {
                                    breakpoint: 768,
                                    settings: {
                                        slidesToShow: 1,
                                        slidesToScroll: 1
                                    }
                                }
                            ]}
                            className="temp-slider"
                        >

                            <Image src={res1} alt="" className='my-element' data-aos="fade-down" data-aos-delay="100" />
                            <Image src={res2} alt="" className='my-element' data-aos="fade-down" data-aos-delay="200" />
                            <Image src={res3} alt="" className='my-element' data-aos="fade-down" data-aos-delay="300" />

                        </Slider>
                    </div>
                </div>
            </section>
        </ScrollReveal>
    </>)
}

export default Templates
