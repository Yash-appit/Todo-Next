// src/components/AI Tools/AIToolLayout.tsx
'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { aiToolsConfig, getToolByPath } from '@/config/aiTools';
import NotFound from '@/components/ErrorPage';
import Loader from '@/Layout/Loader';
import prof from "@/assets/Images/resume-builder/profile.png";
import ScrollReveal from '@/components/Animation/ScrollReveal';
import { reviewList } from '@/services/review';
import start from "@/assets/Images/Templates/star.png";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Faq from '@/components/home/faq';
import h1 from "@/assets/Images/Home/h1.png";
import h2 from "@/assets/Images/Home/h2.png";
import h3 from "@/assets/Images/Home/h3.png";
import h4 from "@/assets/Images/Home/h4.png";
import '@/styles/AiTools.css';
import '@/styles/Home.css';
import '@/styles/Other.css';
import Tools from './Tools';
import ap from "@/assets/Images/AITools/ap.svg";
import Resumes from './Resumes';
import AiAds from './AiAds';
import Image from 'next/image';

// Define metadata for each route
export const generateMetadata = ({ params }: { params: { toolPath: string } }) => {
  const toolConfig = getToolByPath(params.toolPath || '');
  if (!toolConfig) return {};

  const metadataMap: Record<string, { title: string; description: string }> = {
    'email-template-generator': {
      title: 'AI Email Template Generator | Job & Professional Emails',
      description: 'Write professional job emails using AI. Create email templates for applications, follow-ups, and networking with free credits in minutes.'
    },
    'linkedin-bio-generator': {
      title: 'AI LinkedIn Bio Generator | Professional Profile Summary',
      description: 'Create a professional LinkedIn bio using AI. Generate a recruiter-ready profile summary that improves visibility and credibility with free credits.'
    },
    'qa-generator': {
      title: 'AI Interview Q&A Generator | Smart Interview Preparation',
      description: 'Prepare for job interviews with AI-generated questions and answers. Get role-specific HR and technical interview questions using free credits.'
    },
    'job-description-generator': {
      title: 'AI Job Description Generator | Create Job Posts Instantly',
      description: 'Generate clear and professional job descriptions using AI. Create role-specific job posts quickly and attract the right candidates with free credits.'
    },
    'job-description-analyzer': {
      title: 'AI Job Description Analyzer | Match Resume to Job Role',
      description: 'Analyze job descriptions using AI to understand skills, keywords, and requirements. Optimize your resume and improve interview shortlisting chances.'
    },
    'career-objective-generator': {
      title: 'AI Career Objective Generator | ATS-Friendly Resume Goals',
      description: 'Create a customized, ATS-friendly career objective using AI. Ideal for freshers, professionals, and career changers applying for any role.'
    }
  };

  const meta = metadataMap[params.toolPath];
  if (!meta) return {};

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://todoresume.com/ai-tools/${params.toolPath}`,
    },
  };
};

const AIToolLayout: React.FC = () => {
    const params = useParams();
    const toolPath = params?.toolPath as string || '';
    const toolConfig = getToolByPath(toolPath || '/404');
    const [reviews, setReviews] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    
    useEffect(() => {
        // Access localStorage only on client side
        setToken(typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    }, []);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await reviewList("Home");
            setReviews(response?.data?.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setIsLoading(false);
        }
    }

    const handleGetStarted = () => {
        if (!token) {
            router.push('/login');
            return;
        }

        switch (pathname) {
            case '/ai-tools/email-template-generator':
                router.push('/email-template-generator');
                break;
            case '/ai-tools/linkedin-bio-generator':
                router.push('/linkedin-bio-generator');
                break;
            case '/ai-tools/qa-generator':
                router.push('/qa-generator');
                break;
            case '/ai-tools/job-description-generator':
                router.push('/job-description-generator');
                break;
            case '/ai-tools/job-description-analyzer':
                router.push('/job-description-analyzer');
                break;
            case '/ai-tools/career-objective-generator':
                router.push('/career-objective-generator');
                break;
            default:
                router.push('/');
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
    }, [toolPath]);

    if (!toolConfig) {
        if (toolPath === '404') {
            return <NotFound />;
        }
        // You could redirect here if needed
        router.push('/404');
        return null;
    }

    const { MainComponent, BodyComponent } = toolConfig;

    return (
        <>
            <div className='pt-5'></div>
            <section className='ai-bg pt-5 mt-5'>
               
                        <MainComponent />
               

                {/* Common components like logo slider can go here */}
                <div className="container-fluid rev-res">
                    <div className="row logo my-element m-0 mb-4" data-aos="zoom">
                        <div className="col-lg-3 align-items-center justify-content-center d-flex web-res">
                            <p>Resume Shortlisted By</p>
                        </div>

                        <div className="col-lg-9 pt-3 web-res">
                            <Slider {...settings} className='mt-4'>
                                <Image src={h1} alt="" width={150} height={50} loading="lazy" />
                                <Image src={h2} alt="" width={150} height={50} loading="lazy" />
                                <Image src={h3} alt="" width={150} height={50} loading="lazy" />
                                <Image src={h4} alt="" width={150} height={50} loading="lazy" />
                            </Slider>
                        </div>

                        <div className='resp py-3 mx-3 me-0'>
                            <h2 className='mb-3 short'>Resume Shortlisted By</h2>
                            <hr />
                            <Slider {...settings} className='mt-4'>
                                <Image src={h1} alt="" width={150} height={50} loading="lazy" />
                                <Image src={h2} alt="" width={150} height={50} loading="lazy" />
                                <Image src={h3} alt="" width={150} height={50} loading="lazy" />
                                <Image src={h4} alt="" width={150} height={50} loading="lazy" />
                            </Slider>
                        </div>
                    </div>
                </div>

                <AiAds />
                
                <section className='career-objective-bg'>
                    <Suspense fallback={<Loader />}>
                        <BodyComponent />
                    </Suspense>

                    {reviews?.length > 0 &&
                        <section className='temp-rev mb-4 pb-1'>
                            <div className="bg pb-0">
                                <div className="row pt-4">
                                    <div className="col-lg-3 text-center my-element temp-rev-head my-auto" data-aos="fade-down" data-aos-delay="100">
                                        <h4>Reviews</h4>
                                        {Array(5).fill(null).map((_, index) => (
                                            <Image key={index} src={start} alt="star" width={20} height={20} />
                                        ))}

                                        {reviews?.length &&
                                            <p className='mt-2'>Based on {reviews?.length} reviews</p>
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
                                                                            <Image key={index} src={start} alt="star" width={20} height={20} />
                                                                        ))}
                                                                    </div>
                                                                    <h6 className='mt-2'>{item.reviewer_title}</h6>
                                                                </div>
                                                                <Image 
                                                                    src={item.image_url || prof} 
                                                                    alt="profile" 
                                                                    width={60} 
                                                                    height={60} 
                                                                    className='prof'
                                                                />
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
                                                            <Image key={index} src={start} alt="star" width={20} height={20} className='rev-star' />
                                                        ))}
                                                    </div>
                                                    <Image 
                                                        src={item.image_url || prof} 
                                                        alt="profile" 
                                                        width={60} 
                                                        height={60} 
                                                        className='prof'
                                                    />
                                                </div>
                                                <h6 className='mt-2'>{item.reviewer_title}</h6>
                                                <p>{item.review_text}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </section>
                    }

                    <Tools />
                    <AiAds />
                    <Resumes />

                    <div className="approach container-fluid">
                        <div className="row m-0">
                            <div className="col-lg-6 mb-4 px-0">
                                <div className="bg m-auto p-4 text-center h-100">
                                    <Image src={ap} alt="approach" className="img-fluid" width={400} height={300} />
                                </div>
                            </div>

                            <div className="col-lg-6 mb-4 m-0 pe-0">
                                <div className="bg p-5 m-auto">
                                    <h4 className='my-4 pt-5 elevate-approach'>
                                        <span className='sec-col'>Elevate</span> Your <span className='sec-col'>Approach</span>
                                    </h4>
                                    <p>
                                        Create a standout resume tailored to your unique skills and <br /> 
                                        experiences. Our intuitive resume maker simplifies the process, <br /> 
                                        ensuring you present your best self to potential employers.
                                    </p>

                                    <button onClick={handleGetStarted} className='prim-but mt-5'>
                                        Get Started Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <AiAds />

                 
                        <Faq />
                  
                </section>
            </section>
        </>
    );
};

export default AIToolLayout;