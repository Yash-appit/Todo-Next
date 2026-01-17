"use client"

import Accountdetails from './Accountdetails'
import Changepassword from './Changepassword'
// import { ResumeProvider, useResume } from '../../context/ResumeContext'
import SafeAds from '@/common/SafeAds'

const setToLocalStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  };

  const setToSessionStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  };
  const getFromSessionStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  };
  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

const Settings = () => {
  // const { dashboard } = useResume();
  // const shouldShowAds = dashboard?.packageData?.package_status !== "active";
   const packageData = getFromLocalStorage("package");
   const shouldShowAds = packageData !== "true";
  return (
    <>

    
    <div className='change-pass mb-3'>
      {shouldShowAds &&
            // <ResumeProvider>
      <SafeAds />
            // </ResumeProvider>
            }
      <Accountdetails/>
      <Changepassword />
    </div>
    </>)
}

export default Settings
