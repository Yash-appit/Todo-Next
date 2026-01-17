"use client"
import blank from "@/assets/Images/blank.jpg";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useState, useEffect, useRef } from 'react';
import ToastMessage from '@/Layout/ToastMessage';
import { blogList } from '@/services/blogs/index';
import Loader from "@/Layout/Loader";
import blog from "@/assets/Images/Blogs/home-blog.png";
import TiltedCard from "@/components/Animation/TiltedCard";
import BlogAds from "./BlogAds";
// import { Helmet } from 'react-helmet';
import noImage from "@/assets/Images/blank.jpg";
import Image from "next/image";
import Link from "next/link";
import "@/styles/Other.css"

// Cache key for sessionStorage
const BLOG_CACHE_KEY = 'blogDataCache';
// In-memory cache as fallback
let memoryCache: any = null;


const Blogs = () => {
  const [CareerAdvice, setCareerAdvice] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [usingMemoryCache, setUsingMemoryCache] = useState(false);
  const [metaTagsReady, setMetaTagsReady] = useState(false);
  const fetchedOnce = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    setEqualHeight();
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted) {
      // Check if we have cached data first
      const cachedData = getCachedBlogData();
      if (cachedData) {
        setCareerAdvice(cachedData);
        setIsLoading(false);
        // Mark meta tags as ready immediately for cached data
        setTimeout(() => setMetaTagsReady(true), 0);
      } else {
        fetchData();
      }

      setEqualHeight();
      fetchedOnce.current = true;
    }
  }, [isMounted]);

  useEffect(() => {
    if (CareerAdvice && isMounted) {
      setEqualHeight();
    }
  }, [CareerAdvice, isMounted]);

  // Function to get cached blog data
  const getCachedBlogData = () => {
    try {
      // First try sessionStorage
      const cachedData = sessionStorage.getItem(BLOG_CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        return data;
      }
    } catch (error) {
      console.warn('Error reading from sessionStorage, trying memory cache:', error);
    }

    // Fallback to memory cache
    if (memoryCache) {
      setUsingMemoryCache(true);
      return memoryCache;
    }

    return null;
  };

  // Function to set cached blog data
  const setCachedBlogData = (data: any[]) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };

      // Try to use sessionStorage first
      sessionStorage.setItem(BLOG_CACHE_KEY, JSON.stringify(cacheData));
      setUsingMemoryCache(false);
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn('sessionStorage quota exceeded, using memory cache');
        // Fallback to memory cache
        memoryCache = data;
        setUsingMemoryCache(true);
      } else {
        console.error('Error setting cache:', error);
      }
    }
  };

  // Function to extract first image from HTML content
  const extractFirstImage = (htmlContent: string) => {
    if (!htmlContent) return null;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Extract first image
    const firstImgElement = tempDiv.querySelector('img');
    const firstImage = firstImgElement ? firstImgElement.src : null;

    return firstImage;
  };

  const setEqualHeight = () => {
    const elements = document.querySelectorAll('.border') as NodeListOf<HTMLElement>;
    let minHeight = 0;

    elements.forEach((el) => {
      el.style.height = 'auto';
      minHeight = Math.max(minHeight, el.clientHeight);
    });

    elements.forEach((el) => {
      el.style.minHeight = `${minHeight}px`;
    });
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await blogList();
      setCareerAdvice(response?.data);
// console.log(response.data);

      // Cache the response data
      if (response?.data) {
        setCachedBlogData(response.data);
      }
      
      // Mark meta tags as ready after data is loaded
      setTimeout(() => setMetaTagsReady(true), 0);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      let errorMessage = (error as Error).message;
      ToastMessage({
        type: "error",
        message: errorMessage,
      });
      // Even on error, mark meta tags as ready
      setTimeout(() => setMetaTagsReady(true), 0);
    }
  };

  const settings = {
    infinite: true,
    speed: 300,
    slidesToShow: 4,
    autoplay: true,
    autoplaySpeed: 2000,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <>
      {/* Meta Tags - Always render first */}
      

      {/* Content - Conditionally render after meta tags are ready */}
      <div className='container-fluid py-5 career-advice'>
        {isLoading ? (
          <Loader />
        ) : (
          // Only render main content when meta tags are ready
          metaTagsReady && (
            <>
              <section className="mt-5 pt-1">
                <div className="row mt-4 bg-white rounded-4 p-3 pt-4 mx-0">
                  <div className="col-lg-7 my-element" data-aos="fade-up" data-aos-delay="100">
                    <h1 className="mt-3">The 10- Step Winning Guide to Selecting Resume</h1>
                    <p className="mt-5 fs-4">Craft a standout resume that captures your unique strengths <br />and propels you toward your dream career with these expert <br />tips and strategies.</p>
                  </div>

                  <div className="col-lg-5 my-element" data-aos="fade-up" data-aos-delay="100">
                    <Image src={blog} alt="Resume Writing Guide" className="img-fluid" />
                  </div>
                </div>
              </section>

              <BlogAds />

              <section className="mt-2">
                <h2 className="text-center pt-2 my-element fs-1" data-aos="fade-up" data-aos-delay="100">All Articles</h2>
                <div className="row mx-1 gridlay">
                  {CareerAdvice?.map((item, index) => {
                    return (
                      <Link href={`/blogs/${item?.slug}`} className="mt-4 pt-4 mx-0 my-element" key={item?.id} data-aos="fade-down">
                        <div className="bg-white p-4 rounded-4">
                          <img
                            src={item?.image || noImage.src}
                            alt={item.title}
                            className="img-fluid mb-3"
                          />

                          <div className="d-flex align-items-center py-2">
                            {item?.created_at && <p className="pe-2 mb-0">Published On {new Date(item.created_at).toLocaleDateString('en-GB')}</p>}
                            {item?.updated_at && <li>Updated On {new Date(item.updated_at).toLocaleDateString('en-GB')}</li>}
                          </div>
                          <h4>{item.title}</h4>

                          <p className="desc">{item.short_description}</p>

                          <h6 className="sec-col text-decoration-underline">Read More...</h6>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </>
          )
        )}
      </div>
    </>
  );
};

export default Blogs;