"use client"

import React, { useEffect, useState } from 'react';
import "@/styles/CoverLetter.css";
import "@/styles/Other.css";
import { CVTemplateList, addCoverLetter } from '@/services/CVTemplate';
import { reviewList } from '@/services/review';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import prof from "@/assets/Images/resume-builder/profile.png";
import start from "@/assets/Images/Templates/star.png";
import Faq from '@/components/home/faq';
import Loader from '@/Layout/Loader';
import SafeAds from '@/common/SafeAds';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// import { ResumeProvider } from '../../context/ResumeContext';
// import { Helmet } from 'react-helmet';


const setToSessionStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, value);
    }
};

const CoverLetter = () => {
    const [loading, setLoading] = useState(true);
    const [ResumeList, setResumeList] = useState<any>([]);
    const [Isloading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState<any>([]);
    const router = useRouter();

    const fetchTemplate = async () => {
        try {
            const templates = await CVTemplateList();
            // console.log(templates.data);

            setResumeList(templates?.data || []);
            // console.log(ResumeList[0].id);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching template:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchTemplate();
        fetchReviews();
    },
        [])


    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await reviewList("Home");
            setReviews(response?.data?.data || []);
            // console.log(response.data.data);
            // console.log("Hello");
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setIsLoading(false);
        }
    }

    if (loading) {
        <Loader />;
    }

    const handleUseTemplate = async (templateId: string) => {
        try {
            const emptyCoverLetterData = {
                name: "",
                address: "",
                phone: "",
                email: "",
                date: "",
                recipientName: "",
                recipientAddress: "",
                recipientPhone: "",
                recipientEmail: "",
                content: ""
            };



            const newdata = {
                name: "John Day",
                address: "Address",
                phone: "1234567890",
                email: "ABC@gmail.com",
                date: "Date",
                recipientName: "John Day",
                recipientAddress: "Address",
                recipientPhone: "1234567890",
                recipientEmail: "ABC@gmail.com",
                content: "<p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>"
            }

            const response = await addCoverLetter({
                templale_id: templateId,
                title: "Untitled",
                cover_letter_data: emptyCoverLetterData
            });

            // console.log(response);
            setToSessionStorage("coverLetterId", response?.data?.data);
            setToSessionStorage("CLtemplateId", templateId);
            setToSessionStorage("cvData", JSON.stringify(newdata));
            router.push("/create-cover-letter")
            // console.log(response?.data?.message);

            // You can add additional logic here, like redirecting to the editor page
        } catch (error: any) {
            console.error("Error creating cover letter:", error?.message || error);
        }
    };


    return (<>
        {/* <Helmet>
        <title>Free Cover Letter Builder | Create Cover Letters Online</title>
     
      <meta
        name="description"
        content="Create a professional cover letter online in minutes. Use TodoResume’s free builder to write, customize, and download your perfect cover letter in PDF."
      />
      <link rel="canonical" href="https://todoresume.com/cover-letter" />
    </Helmet> */}
        <section className='row pt-5 cov-let mb-5 mx-0'>
            <div className="col-lg-6 pt-5 m-auto text-center">
                <h2 className='pt-5 mt-5'><span className='black'>Design</span>, Write & Download Your Cover Letter <span className='black'>Instantly</span></h2>

                <p className='mb-0 mt-4 pt-2'>Pick a template, customize with ready-made content, and download in seconds.</p>
                <p className='mb-4 pb-2'>Professional designs to choose from.</p>

                {ResumeList &&
                    <button className='prim-but' onClick={() => handleUseTemplate(ResumeList && ResumeList[0]?.id)}>Create Cover Letter</button>
                }
            </div>
        </section>


        <SafeAds />


        <section className='container-fluid cov-list'>

            <h4>Cover <span className='sec-col'>Letter</span></h4>
            <div className="cov-grid">
                {ResumeList && ResumeList.map((list: any) => (
                    <div key={list.id} className='list'>
                        <div className="template-hover-container">
                            <Image src={list.image} alt="" width={300} height={400} style={{ width: '100%', height: 'auto' }} />
                            <h5>{list.name}</h5>
                            {list.id &&
                                <div className="button-container">
                                    <button className="use-template-btn prim-but" onClick={() => handleUseTemplate(list.id)}>Use This Template</button>
                                </div>
                            }
                        </div>
                    </div>
                ))}
            </div>

        </section>



        <SafeAds />


        {reviews.length > 0 &&
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
                                        <Image src={item.image_url} alt="" className='prof' width={50} height={50} />
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



        <Faq />

        <SafeAds />

    </>)
}

export default CoverLetter
