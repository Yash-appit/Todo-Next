import { useState, useEffect } from 'react';
// import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';
import CustomModal from '@/components/Modal/Modal';
import { TbLogout2 } from "react-icons/tb";
import hand from "@/assets/Images/Admin/Navbar/hand.png";
import Sub from "@/assets/Images/Admin/Navbar/sub.svg";
import logout from "@/assets/Images/auth/logout.png";
// import { useCredits } from '@/hooks/useCredits';
import Image from 'next/image';
import { usePathname } from 'next/navigation';


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


const Header: React.FC = () => {
  const [isLogoutOpen, setLogoutOpen] = useState(false);
  const [name, setName] = useState(getFromLocalStorage('name'));
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const pathname = usePathname();
  // const { fetchCredits, credits, totalCredits } = useCredits();
  // const creditsData = localStorage.getItem('credits');
  // const totalCreditsData = localStorage.getItem('total_credits');


  // const displayCredits = () => {
  //   // Always show credits, even if 0
  //   const creditsData = localStorage.getItem('credits');
  //   const totalCreditsData = localStorage.getItem('total_credits');
    
  //   // Use localStorage values if available, otherwise use state values
  //   const displayCreditValue = creditsData !== null ? parseInt(creditsData) : (credits || 0);
  //   const displayTotalValue = totalCreditsData !== null ? parseInt(totalCreditsData) : (totalCredits || 0);
    
  //   // Always return the credits string, even if values are 0
  //   return `${displayCreditValue}/${displayTotalValue} Credits`;
  // };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('resumeId');
    localStorage.removeItem('GuestData');
    localStorage.removeItem('resumeData');
    sessionStorage.removeItem('templateId');
    localStorage.removeItem('templateId');
     sessionStorage.removeItem('selectedTemplateId');
    sessionStorage.removeItem('ResumeId');
    localStorage.removeItem("resumeName");
    sessionStorage.removeItem('GuestId');
    window.location.href = '/';
  };

  // Function to truncate name after 6 letters
  const truncateName = (name: string | null, maxLetters: number): string => {
    if (!name) return '';
    if (name.length > maxLetters) {
      return name.slice(0, maxLetters) + '...';
    }
    return name;
  };

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setName(getFromLocalStorage('name'));
  }, []);

  return (
    <>
      <Navbar className='admin-nav d-flex justify-content-between px-5 pe-5 my-element' data-aos="fade-down">
        <div className='d-flex align-items-center'>
          {location.pathname.includes('/manage-subscription') ? (
            <>
              <Image src={Sub} alt="hand" className='p-2 me-2' />
              <h4 className='mb-0'>Your <span className='sec-col'>Plan</span></h4>
            </>
          ) : (
            <>
              <Image src={hand} alt="hand" className='me-3' />
              <h4 className='mb-0'>
                {windowWidth <= 500 ? "" : "Welcome in," }
                <span className='sec-col text-capitalize'>
                &nbsp;{windowWidth <= 500 ? truncateName(name, 5) : name || "User"}
                </span>
                 {/* ({displayCredits()}) */}
              </h4>
            </>
          )}
        </div>
        <button onClick={() => setLogoutOpen(true)} className='prim-but'>
          <TbLogout2 className='me-2' />Logout
        </button>
      </Navbar>

      <CustomModal show={isLogoutOpen} onHide={() => setLogoutOpen(false)} custom='logout' title="">

        <Image src={logout} alt="logout"/>
        <h1>Logout</h1>
        <p className="black">
          Are you sure you want to logout?
        </p>
        <div className="w-100">
          <button className="prim-but w-75" onClick={handleLogout}>
            Yes, Logout
          </button>
          <button className="sec-but w-75 my-4" onClick={() => setLogoutOpen(false)}>
           Cancel
          </button>
        </div>
      </CustomModal>
    </>
  );
};

export default Header;