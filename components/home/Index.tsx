'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReviewResume from './CreateResume';
import ViewPackage from './ViewPackage';
import Faq from './faq';
import HowWorks from './HowWorks';
import Career from './Career';
import Loader from '@/Layout/Loader';
import { utm } from '@/services/utm/Index';
// import "@/styles/Home.css";
import ATSScore from './ATSScore';
import { trackEvent, trackPageView } from '@/config/analytics';
import SafeAds from '@/common/SafeAds';
import "@/styles/Home.css";

// import { getFCMToken } from '../../config/firebase';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const router = useRouter();

  // Function to set cached component data


  const handleAddResume = async (utmData: {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    affiliateId: string | null;
    clickId: string | null;
  }) => {
    try {
      setLoading(true);
      const requestData = {
        utm_source: utmData.source || '',
        utm_medium: utmData.medium || '',
        utm_campaign: utmData.campaign || '',
        affiliate_id: utmData.affiliateId || '',
        click_id: utmData.clickId || '',
      };
      await utm(requestData);
    } catch (error) {
      console.error('Error saving UTM data:', error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  // getFCMToken();
  // }
  // , []);

  useEffect(() => {
    // if (token) {
    //   navigate('/resumes');
    //   return;
    // }

    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const affiliate_id = urlParams.get('affiliate_id');
    const clickId = urlParams.get('click_id')

    // Only proceed if at least one UTM parameter exists
    if (utmSource || utmMedium || utmCampaign || clickId || affiliate_id) {
      const utmData = {
        source: utmSource,
        medium: utmMedium,
        campaign: utmCampaign,
        affiliateId: affiliate_id,
        clickId: clickId,

      };

      // Store in sessionStorage
      sessionStorage.setItem('utm_params', JSON.stringify(utmData));

      // Clean the URL
      if (window.history.replaceState) {
        const cleanUrl = `${window.location.pathname}${window.location.hash}`;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      // Track UTM data
      handleAddResume(utmData);
    } else {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    // Track home page view
    trackPageView('/home');
  }, []);

  // GSAP Animation Effect
  useEffect(() => {
    if (!loading) {
      // Hero Section Animation
      const hero = document.querySelector('.hero-section');
      if (hero) {
        gsap.fromTo(
          hero,
          {
            backgroundColor: "transparent", // Light Teal/Green
            scale: 1,
            borderRadius: "0px",
            y: 0,
          },
          {
            backgroundColor: "#ffffff",
            scale: 0.92,
            borderRadius: "40px",
            y: 50, // Slight movement to verify scroll interaction
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom 20%", // Finish animation when bottom of hero reaches 20% from top
              scrub: 1, // Smooth scrolling effect
            },
          }
        );
      }

      // Other Sections Animation
      const components = document.querySelectorAll('.gsap-reveal');
      components.forEach((component) => {
        gsap.fromTo(
          component,
          {
            opacity: 0,
            y: 100,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: component,
              start: 'top 80%', // Trigger when top of element hits 80% of viewport height
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Cleanup
      return () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    }
  }, [loading]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {/* <MetaTags 
        title="Free Resume & Cover Letter Builder | TodoResume"
        description="Build a free ATS-friendly resume and cover letter in minutes. Use TodoResume tools—ATS Checker, Job Analyzer & AI Career Generators to boost your career."
        canonical="https://todoresume.com"
      /> */}

      <div className="hero-section" style={{ width: '100%', overflow: 'hidden' }}>
        <ATSScore />
      </div>


      <div className="gsap-reveal">
        <ReviewResume />
      </div>

      <div className="gsap-reveal">
        <ViewPackage />
      </div>

      <div className="gsap-reveal">
        <HowWorks />
      </div>

      <SafeAds />

      <div className="gsap-reveal">
        <Career />
      </div>

      <div className="gsap-reveal">
        <Faq />
      </div>

      <SafeAds />


      {/* <TawkLiveChat propertyId={TAWK_PROPERTY_KEY} widgetId="1ja8j6h8m" /> */}
    </>
  );
};

export default Home;
