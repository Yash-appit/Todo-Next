"use client";

import { useState, useEffect, useRef } from 'react';
import { Container, Form, Nav, Navbar, NavDropdown, Button, Row } from 'react-bootstrap';
import logo from '@/assets/Images/Logo/white-logo.png';
import CustomModal from "@/components/Modal/Modal";
import Offcanvas from "react-bootstrap/Offcanvas";
import { addResume } from '@/services/resume/Index';
import out from '@/assets/Images/auth/logout.png';
import FeaturesDropdown from './FeaturesDropdown';
import { MdOutlineSegment } from "react-icons/md";
import { FaUserPlus } from "react-icons/fa6";
import prof from "@/assets/Images/resume-builder/profile.png";
import { useRefresh } from '@/context/RefreshContext';
import { useFCMToken } from '@/config/useFCMToken';
import whiteLogo from '@/assets/Images/Logo/white-logo.png';
import { IoCloseCircleOutline } from "react-icons/io5";
import { MdDashboard, MdLogout } from "react-icons/md";
import { GiTwoCoins } from "react-icons/gi";
import { useDashboard } from '@/hooks/useDashboard';
import "@/styles/Mainlayout.css";
import "@/styles/Admin.css";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const router = useRouter();
  
  // Initialize windowWidth with 0 for server-side rendering
  const [windowWidth, setWindowWidth] = useState(0);
  
  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };
  
  const dashboardData = getFromLocalStorage('package');
  const { dashboard, fetchDashboard } = useDashboard();
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const { snackbar } = useFCMToken();

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const openLoginModal = () => router.push("/login");
  const [isRegModalOpen, setRegModalOpen] = useState(false);
  const openRegModal = () => router.push("/signup");
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isLogoutOpen, setLogoutOpen] = useState(false);
  const [isBuyOpen, setBuyOpen] = useState(false);
  const { refresh } = useRefresh();

  const expand = "lg";
  
  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  const handleCreateResume = () => {
    const resume_id = getFromLocalStorage('resumeId');
    const resumeData = getFromLocalStorage('resumeData');

    if (resumeData) {
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

      const filteredResumeData = Object.fromEntries(
        Object.entries(cleanedData).filter(([key, value]) => {
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return true;
        })
      );

      const resume_data = { resume_data: { ...filteredResumeData } };

      if (resume_id) {
        addResume({ resume_id, ...resume_data })
          .then((response) => {
            console.log('Resume updated successfully:');
          })
          .catch((error) => {
            console.error('Error updating resume:', error);
          });
      } else {
        addResume(resume_data)
          .then((response) => {
            console.log('Resume created successfully:');
          })
          .catch((error) => {
            console.error('Error creating resume:', error);
          });
      }

      localStorage.removeItem('resumeId');
      localStorage.removeItem('resumeData');
    }
  };

  useEffect(() => {
    // Set initial window width after component mounts (client-side)
    setWindowWidth(typeof window !== 'undefined' ? window.innerWidth : 0);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getGapClass = () => {
    return windowWidth >= 990 && windowWidth <= 1200 ? 'gap-2' : 'gap-4';
  };

  useEffect(() => {
    // Only add scroll listener on client-side
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('resumeId');
    localStorage.removeItem('GuestData');
    localStorage.removeItem('resumeData');
    
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('templateId');
      sessionStorage.removeItem('selectedTemplateId');
      sessionStorage.removeItem('ResumeId');
      sessionStorage.removeItem('GuestId');
    }
    
    localStorage.removeItem("resumeName");
    window.location.href = '/';
  };

  useEffect(() => {
    // Update token and name from localStorage on client-side
    const storedToken = getFromLocalStorage('token');
    const storedName = getFromLocalStorage('name');
    setToken(storedToken);
    setName(storedName);
    
    if (!dashboardData && storedToken) {
      fetchDashboard();
    }
  }, [refresh]);

  // Don't render anything until we know the window width (client-side)
  if (typeof window === 'undefined' || windowWidth === 0) {
    return null; // or a loading skeleton
  }

  return (
    <>
      {/* {snackbar} */}
      <Navbar expand="lg" className='nav-bg'>
        <Container fluid className='p-0'>
          <Row className='m-0 d-flex justify-content-between align-items-center w-100'>
            <Navbar.Brand href="/" className='w-auto'>
              <Image src={logo} alt="" loading="lazy" className='p-2 h-auto' />
            </Navbar.Brand>

            <div className='d-flex align-items-center w-auto'>
              {windowWidth < 990 && !token && (
                <NavDropdown 
                  title={<FaUserPlus />} 
                  id="mobile-auth-dropdown" 
                  className='mobile-auth-dropdown p-2'
                >
                  <NavDropdown.Item onClick={openLoginModal}>Login</NavDropdown.Item>
                  <NavDropdown.Item onClick={openRegModal}>Sign Up</NavDropdown.Item>
                </NavDropdown>
              )}

              {windowWidth < 990 && token && (
                <NavDropdown 
                  title={<Image src={prof} alt="Profile" />} 
                  id="mobile-auth-dropdown" 
                  className='mobile-auth-dropdown p-2 border-0'
                >
                  <NavDropdown.Item href='/resumes'>Dashboard</NavDropdown.Item>
                  <NavDropdown.Item onClick={() => setLogoutOpen(true)}>Logout</NavDropdown.Item>
                </NavDropdown>
              )}

              <Navbar.Toggle 
                onClick={() => setShowOffcanvas(true)}
                aria-controls="offcanvasNavbar" 
                className='w-auto'
              >
                <MdOutlineSegment className='fs-1 text-white' />
              </Navbar.Toggle>
            </div>
            
            <Navbar.Offcanvas
              id="offcanvasNavbar"
              show={showOffcanvas}
              onHide={() => setShowOffcanvas(false)}
              placement="start"
              className="custom-offcanvas main-offcanvas"
            >
              <Offcanvas.Header>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                  <Image src={whiteLogo} alt="Logo" />
                </Offcanvas.Title>
                <button
                  type="button"
                  className="position-absolute end-0 top-5 me-2 bg-transparent border-0"
                  onClick={() => setShowOffcanvas(false)}
                  aria-label="Close"
                >
                  <IoCloseCircleOutline />
                </button>
              </Offcanvas.Header>
              
              <Offcanvas.Body className="off-campus-body">
                <Nav
                  className={`justify-content-center align-items-baseline flex-grow-1 pe-3 ${getGapClass()}`}
                  navbarScroll
                >
                  {windowWidth >= 990 && <FeaturesDropdown />}
                  <Nav.Link href="/blogs">Blogs</Nav.Link>
                  <Nav.Link href="/aboutUs">About</Nav.Link>

                  <Form className="d-flex p-4">
                    {windowWidth <= 990 && (
                      <NavDropdown title="Features" id="logged" className='p-2'>
                        <NavDropdown.Item href="/resume-builder">Resume Builder</NavDropdown.Item>
                        <NavDropdown.Item href="/ai-tools/email-template-generator">Email Template Generator</NavDropdown.Item>
                        <NavDropdown.Item href="/ai-tools/linkedin-bio-generator">Linkedin Bio Generator</NavDropdown.Item>
                        <NavDropdown.Item href="/ai-tools/qa-generator">Q&A Generator</NavDropdown.Item>
                        <NavDropdown.Item href="/cover-letter">Cover Letter Builder</NavDropdown.Item>
                        <NavDropdown.Item href="/ai-tools/career-objective-generator">Career Objective Generator</NavDropdown.Item>
                        <NavDropdown.Item href="/ats-score">ATS Checker</NavDropdown.Item>
                        <NavDropdown.Item href="/ai-tools/job-description-generator">Job Description Generator</NavDropdown.Item>
                        <NavDropdown.Item href="/ai-tools/job-description-analyzer">Job Description Analyzer</NavDropdown.Item>
                      </NavDropdown>
                    )}
                  </Form>
                </Nav>

                {windowWidth > 990 && (
                  <Form className="d-flex p-4 logged">
                    {token ? (
                      <NavDropdown title={name || "User"} id="logged" className='p-2'>
                        <NavDropdown.Item href="/resumes">
                          <MdDashboard /> Dashboard
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => setLogoutOpen(true)}>
                          <MdLogout /> Logout
                        </NavDropdown.Item>
                      </NavDropdown>
                    ) : (
                      <>
                        <Button onClick={openLoginModal} className='sec-but text-capitalize mx-3'>
                          Log In
                        </Button>
                        <Button onClick={openRegModal} className='prim-but-2 text-capitalize'>
                          Sign Up
                        </Button>
                      </>
                    )}
                  </Form>
                )}
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Row>
        </Container>

        <CustomModal 
          show={isLogoutOpen} 
          onHide={() => setLogoutOpen(false)} 
          custom='logout' 
          title="Logout"
        >
          <Image src={out} alt="logout" />
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
      </Navbar>
    </>
  );
}

export default Header;