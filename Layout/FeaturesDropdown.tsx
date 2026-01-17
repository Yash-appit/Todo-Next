import { useState, useRef, useEffect } from 'react';
import { NavDropdown } from 'react-bootstrap';
import { IoIosArrowDown } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';
import rb from '@/assets/Images/Navbar/rb.svg';
import ats from '@/assets/Images/Navbar/ats.svg';
import rw from '@/assets/Images/Navbar/rw.svg';
import fs from '@/assets/Images/Navbar/fs.svg';
import qa from '@/assets/Images/Navbar/qa.svg';
import jda from '@/assets/Images/Navbar/jda.svg';
import jdg from '@/assets/Images/Navbar/jdg.svg';
import pt from '@/assets/Images/Navbar/pt.svg';
import cl from '@/assets/Images/Navbar/cl.svg';
import roc from "@/assets/Images/Navbar/roc.svg";
import Link from 'next/link';

  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };
const FeaturesDropdown = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  // const dropdownRef = useRef(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [token, setToken] = useState(getFromLocalStorage('token'));
  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  const handleMouseEnter = () => {
    // Clear any pending timeout to close
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    // Set a timeout to close after a short delay
    const timeout = setTimeout(() => {
      setShowDropdown(false);
    }, 200); // 300ms delay before closing
    setHoverTimeout(timeout);
  };

  return (
    <div
      className="features-dropdown-container"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
    >
      <NavDropdown
        title={
          <div className="d-flex align-items-center">
            Features
            <IoIosArrowDown
              className={`dropdown-arrow ms-2 ${showDropdown ? 'rotate-180' : ''}`}
              size={16}
            />
          </div>
        }
        id="features-dropdown"
        show={showDropdown}
        onToggle={(isOpen) => { }}
        className="features-nav-dropdown no-caret"
      >
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={handleMouseEnter} // Keep open when hovering dropdown
            onMouseLeave={handleMouseLeave}
            >
              <div className="features-dropdown-content pb-3">

                <div className="dropdown-section-title px-5 py-4 d-flex ">
                  <img src={roc.src} alt="" />

                  <div className='px-2'>
                    <h5>
                      Build Better with These Resume Tools
                    </h5>
                    <p className='mb-0'>All-in-One Tools - Templates,  ATS Checker & Resume Magic in Minutes!</p>
                  </div>
                </div>

                <div className="row px-4 pt-2">
                  <Link href="/resume-builder" onClick={() => setShowDropdown(false)} className="col-lg-4">
                    <img src={rb.src} alt="" />
                    <div>
                      <h4>Resume Builder</h4>
                      <p>Build Your Professional Resume in Minutes — Quick,Simple & Free!</p>
                    </div>
                  </Link>



                  <Link href="/ats-score" onClick={() => setShowDropdown(false)} className="col-lg-4">
                    <img src={ats.src} alt="" />
                    <div>
                      <h4>ATS Checker</h4>
                      <p>Smart Resume Optimization — ATS-Ready, Recruiter-Approved.</p>
                    </div>
                  </Link>




                  <Link href="/cover-letter" onClick={() => setShowDropdown(false)} className="col-lg-4">
                    <img src={cl.src} alt="" />
                    <div>
                      <h4>Cover Letter Builder</h4>
                      <p>Create a Powerful Cover Letter — Tailored to Your Resume & Job Role.</p>
                    </div>
                  </Link>




                  <Link href="/ai-tools/email-template-generator" onClick={() => setShowDropdown(false)} className="col-lg-4">
                    <img src={pt.src} alt="" />
                    <div>
                      <h4>Email Template Generator</h4>
                      <p>Professional Template Generator — Written to Impress, Built to Win.</p>
                    </div>
                  </Link>




                  <Link href="/ai-tools/linkedin-bio-generator" onClick={() => setShowDropdown(false)} className="col-lg-4">
                    <img src={rw.src} alt="" />
                    <div>
                      <h4>Linkedin Bio Generator</h4>
                      <p>Generate a Professionally Written Linkedin Bio — Custom-Fit to Your Career Goals.</p>
                    </div>
                  </Link>




                  <Link href="/ai-tools/qa-generator" onClick={() => setShowDropdown(false)} className="col-lg-4">
                    <img src={qa.src} alt="" />
                    <div>
                      <h4>Q/A Generator</h4>
                      <p>Generate a Professionally Written Question & Answer — Custom-Fit to Your Career Goals.</p>
                    </div>
                  </Link>




                  <Link href="/ai-tools/job-description-generator" onClick={() => setShowDropdown(false)} className="col-lg-4">
                    <img src={jdg.src} alt="" />
                    <div>
                      <h4>Job Description Generator</h4>
                      <p>Get your perfect Job Description — Describe The Perfect Job Role.</p>
                    </div>
                  </Link>



                  <Link href= "/ai-tools/job-description-analyzer" onClick={() => setShowDropdown(false)} className="col-lg-4">
                    <img src={jda.src} alt="" />
                    <div>
                      <h4>Job Description Analyzer</h4>
                      <p>Get your perfect Job Description — Describe The Perfect Job Role.</p>
                    </div>
                  </Link>


                  <Link href="/ai-tools/career-objective-generator" onClick={() => setShowDropdown(false)} className="col-lg-4">
                    <img src={cl.src} alt="" />
                    <div>
                      <h4>Career Objective Generator</h4>
                      <p>Generate Objective — Describe The Perfect Objective.</p>
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </NavDropdown>
    </div>
  );
};

export default FeaturesDropdown;