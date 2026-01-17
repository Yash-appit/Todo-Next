"use client"

import React, { useState, useEffect } from 'react'
import { IoIosArrowForward } from "react-icons/io";
import ats from "@/assets/Images/ATS/ats.svg";
import ats1 from "@/assets/Images/ATS/ats1.svg";
import ats2 from "@/assets/Images/ATS/ats2.svg";
import ats3 from "@/assets/Images/ATS/ats3.svg";
import PackageFaq from '@/components/Package/PackageFaq';
import { reviewList } from '@/services/review';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import start from "@/assets/Images/Templates/star.png";
import prof from "@/assets/Images/resume-builder/profile.png";
import TiltedCard from '@/components/Animation/TiltedCard';
// import ScrollReveal from '@/components/Animation/ScrollReveal';
import SafeAtsAds from '@/common/SafeAtsAds';
import Image from 'next/image';
import Link from 'next/link';
import "@/styles/Other.css";
// import { Helmet } from 'react-helmet';

const ATSScore = () => {
    const [reviews, setReviews] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    
    // Initialize token on client side only
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('token');
            setToken(storedToken);
        }
    }, []);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await reviewList("Home");
            setReviews(response?.data?.data);
            // console.log(response.data);
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


    return (<>
      {/* <Helmet>
        <title>ATS Resume Checker Online | Improve Your Resume Score</title>
      
      <meta
        name="description"
        content="Check your resume’s ATS score online with free credits. Identify keyword gaps, optimize formatting, and boost your resume’s chances to pass ATS systems."
      />
      <link rel="canonical" href="https://todoresume.com/ats-score" />
    </Helmet> */}
        <section className='sec-bg2 ats-sec'>
            <div className="container-fluid pt-4">
                <div className="row pt-5">
                    <div className="col-lg-6 mt-5 p-0 my-element" data-aos="fade-up" data-aos-delay="200">
                        <div className="cont p-5 pt-4 bg-white rounded-4 mx-3 me-0">
                            <h1 className='mt-3'>Get Your<span className='sec-col'> Resume</span > <br />

                                ATS <span className='italic'>Score</span></h1>
                            <p className='py-4 my-3'>Craft a standout resume that captures your unique strengths and propels you toward your dream career with these expert tips and strategies.</p>

                            <div className="d-flex align-items-center">
                                {/* <Link to="/create-resume" type='button' className='prim-but mt-3'>Our Service</Link> */}
                                {token ? (
                                    <Link href="/ats-checker" type='buthrefn' className='prim-but mt-3'>ATS Checker <IoIosArrowForward /></Link>
                                ) : (
                                    <Link href="/login" type='button' className='prim-but mt-3'>ATS Checker <IoIosArrowForward /></Link>
                                )}

                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 pt-5 cont-img my-element" data-aos="fade-up" data-aos-delay="200">
                        <div className="bg-white p-3 text-center rounded-4">
                            <TiltedCard
                                imageSrc={ats.src}
                                // altText="Kendrick Lamar - GNX Album Cover"
                                // captionText="Kendrick Lamar - GNX"
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
                            {/* <img src={ats} alt="" loading="lazy" className='w-100' /> */}
                        </div>
                    </div>
                </div>
            </div>

                {/* <AiAds /> */}
<SafeAtsAds />
          
        </section>


        <section className='ats-sec2 my-4'>
            <div className="container-fluid">
                <div className="bg-white">

                    <div className="row">
                        <div className="col-lg-6 my-element" data-aos="fade-up" data-aos-delay="200">
                            <span className='head'>01</span>
                            <h2 className='sec-col'>Enhance Your Resume With AI</h2>
                            <p>Leverage advanced AI technology to optimize your resume for ATS. Ensure your skills and experience are highlighted to match job requirements effectively.</p>
                        </div>
                        <div className="col-lg-6 my-element pt-4" data-aos="fade-up" data-aos-delay="200">
                            <div className="img-sec">
                                {/* <img src={ats1} alt="" loading="lazy" className='w-100' /> */}
                                <TiltedCard
                                    imageSrc={ats1.src}
                                    // altText="Kendrick Lamar - GNX Album Cover"
                                    // captionText="Kendrick Lamar - GNX"
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
                    </div>


                    <div className="row ats2">
                        <div className="col-lg-6 my-element pt-4" data-aos="fade-up" data-aos-delay="200">
                            <div className="img-sec">
                                {/* <img src={ats2} alt="" loading="lazy" className='w-100 ' /> */}
                                <TiltedCard
                                    imageSrc={ats2.src}
                                    // altText="Kendrick Lamar - GNX Album Cover"
                                    // captionText="Kendrick Lamar - GNX"
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





                        <div className="col-lg-6 my-element pt-4" data-aos="fade-up" data-aos-delay="200">
                            <span className='head'>02</span>
                            <h2 className='sec-col'>Perform an ATS compatibility check.</h2>
                            <p>Instantly evaluate your resume's compatibility with ATS. Identify key areas for improvement to ensure your resume passes the initial screening process.</p>
                        </div>


                        <div className="col-lg-12">
                
                                {/* <AiAds /> */}
<SafeAtsAds />
                     
                        </div>
                    </div>





                    <div className="row">
                        <div className="col-lg-7 my-element ats3 pt-4" data-aos="fade-up" data-aos-delay="200">
                            <span className='head'>03</span>
                            <h2 className='sec-col'>Utilize the top resume builder in the field.</h2>
                            <p>Create a professional, ATS friendly resume with the TO DO RESUME. Tailor your resume effortlessly to meet the demands of top employers and increase your chances of success.</p>
                        </div>




                        <div className="col-lg-5 my-element pt-4 ats2" data-aos="fade-up" data-aos-delay="200">
                            <div className="img-sec pt-5 mt-5 pb-5">
                                {/* <img src={ats3} alt="" loading="lazy" className='w-100 pt-5' /> */}
                                <TiltedCard
                                    imageSrc={ats3.src}
                                    // altText="Kendrick Lamar - GNX Album Cover"
                                    // captionText="Kendrick Lamar - GNX"
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
                    </div>
                </div>
            </div>
        </section>


        <section className='temp-rev mb-4 pb-1'>
            <div className="bg pb-0">
                <div className="row pt-4">
                    <div className="col-lg-3 text-center my-element temp-rev-head my-auto" data-aos="fade-down" data-aos-delay="100">
                        <h4>Reviews</h4>
                        {Array(5).fill(null).map((_, index) => (
                            <Image key={index} src={start} alt="" />
                        ))}
                        {/* <p className='mt-2'>Based on 1,326 reviews</p> */}
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
                                {reviews && reviews.map((item: any) => (
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
                        reviews && reviews?.map((item: any) => (

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
        </section>

      
            {/* <AiAds /> */}
<SafeAtsAds />
          

        
            <PackageFaq />
      
    </>)
}

export default ATSScore
