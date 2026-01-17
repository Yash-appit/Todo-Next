import React, { useEffect, useState } from 'react';

// Define types for the package data
interface PackageData {
  package_status: string;
}

interface DashboardData {
  packageData?: PackageData;
}

interface ResumeContextType {
  dashboard?: DashboardData;
}

const BlogDetailAds: React.FC = () => {

  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };
  // Check if user doesn't have an active package
    const packageData = getFromLocalStorage("package");
     const shouldShowAds = packageData !== "true";


  useEffect(() => {
    if (shouldShowAds && !scriptLoaded) {
      // Check if the script is already in the document
      const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
      
      if (!existingScript) {
        // Load the Google AdSense script
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4949029990361775';
        script.async = true;
        script.setAttribute('crossorigin', 'anonymous');
        document.head.appendChild(script);
        
        script.onload = () => {
          setScriptLoaded(true);
        };
        
        script.onerror = () => {
          console.error('Failed to load AdSense script');
          setScriptLoaded(false);
        };
      } else {
        // If script already exists, just mark as loaded
        setScriptLoaded(true);
      }
    }
  }, [shouldShowAds, scriptLoaded]);

  // Initialize ads after component mounts and script is loaded
  useEffect(() => {
    if (scriptLoaded && shouldShowAds) {
      // Use a small delay to ensure the ad container is rendered
      const timer = setTimeout(() => {
        try {
          if ((window as any).adsbygoogle) {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          }
        } catch (error) {
          console.error('Error initializing ads:', error);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [scriptLoaded, shouldShowAds]);

  // Always show the ad container
  return (
    <>
    {shouldShowAds &&
    <div className='text-center py-3'>
      <ins 
        className="adsbygoogle"
        style={{ 
          display: 'block',
        }}
        data-ad-client="ca-pub-4949029990361775"
        data-ad-slot="4883430396"
        data-ad-format="autorelaxed"
        data-full-width-responsive="true"
      ></ins>
    </div>
}
  </>);
};

export default BlogDetailAds;