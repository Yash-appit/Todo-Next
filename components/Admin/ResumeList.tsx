"use client"
import { useEffect, useState } from 'react';
import nodata from '@/assets/Images/not.svg';
import { ResumesList, DeleteResume, addResume, pinResume } from "@/services/resume/Index";
import ToastMessage from '@/Layout/ToastMessage';
// import Loader from '../Layout/Loader';
import CustomModal from '@/components/Modal/Modal';
// import { Spinner } from 'react-bootstrap';
import { MdPushPin, MdDelete } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import del from "@/assets/Images/Admin/del.png";
import "@/styles/Shimmer.css";
import { RiUnpinFill } from "react-icons/ri";
import GaugeChart from "./GaugeChart";
import '@/styles/Admin.css';
import { CoverLetterList, DeleteCoverLetter } from "@/services/CVTemplate/index";
// import { ResumeProvider } from '../../context/ResumeContext';
import SafeAds from '@/common/SafeAds';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


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

const UpdatedResume: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resumes, setResumes] = useState<any[] | null | any>(null);
  const [coverLetters, setCoverLetters] = useState<any[] | null | any>(null);
  const [hoveredResume, setHoveredResume] = useState<number | null>(null);
  const [hoveredCoverLetter, setHoveredCoverLetter] = useState<number | null>(null);
  const [isDelOpen, setDelOpen] = useState(false);
  const [deleteResumeId, setDeleteResumeId] = useState<number | null>(null);
  const [deleteCoverLetterId, setDeleteCoverLetterId] = useState<number | null>(null);
  const [ResumeName, setResumeName] = useState<string>(getFromLocalStorage('resumeName') || "Untitled");
  const router = useRouter();
  const [pinnedResumes, setPinnedResumes] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'resumes' | 'coverLetters'>('resumes');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalLength: 0,
    totalPage: 0
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCreateResWidth();
    fetchData();
  }, [activeTab, currentPage]);

  const fetchData = async () => {
    if (activeTab === 'resumes') {
      await fetchResumes();
    } else {
      await fetchCoverLetters();
    }
  };

  const handlePinResume = async (resumeId: number, resumePined: number) => {
    try {
      const payload = { resume_id: resumeId, is_resume_pin: resumePined === 1 ? 0 : 1 };
      setIsLoading(true);
      const resp = await pinResume(payload);

      ToastMessage({
        type: "success",
        message: resp.data.message || "Resume pinned successfully!",
      });

      setPinnedResumes(prev =>
        prev.includes(resumeId)
          ? prev.filter(id => id !== resumeId)
          : [...prev, resumeId]
      );

      await fetchResumes();
    } catch (error) {
      let errorMessage = (error as Error).message;
      ToastMessage({
        type: "error",
        message: errorMessage || error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (deleteResumeId) {
      try {
        setIsLoading(true);
        const resp = await DeleteResume({ resume_id: deleteResumeId });

        ToastMessage({
          type: "success",
          message: resp.data.message || "Resume deleted successfully!",
        });

        await fetchResumes();
      } catch (error) {
        let errorMessage = (error as Error).message;
        ToastMessage({
          type: "error",
          message: errorMessage,
        });
      } finally {
        setIsLoading(false);
        setDelOpen(false);
        setDeleteResumeId(null);
      }
    }
  };

  const handleDeleteCoverLetter = async () => {
    if (deleteCoverLetterId) {
      try {
        setIsLoading(true);
        const resp = await DeleteCoverLetter(deleteCoverLetterId);

        ToastMessage({
          type: "success",
          message: resp.data.message || "Cover letter deleted successfully!",
        });

        await fetchCoverLetters();
      } catch (error) {
        let errorMessage = (error as Error).message;
        ToastMessage({
          type: "error",
          message: errorMessage,
        });
      } finally {
        setIsLoading(false);
        setDelOpen(false);
        setDeleteCoverLetterId(null);
      }
    }
  };

  const fetchResumes = async (page = currentPage) => {
    try {
      setIsLoading(true);
      const response = await ResumesList(page); // Assuming your API accepts page parameter
      setResumes(response?.data);
      // console.log(response?.data);
      
      setPagination(response?.paginationData || {
        currentPage: 1,
        totalLength: 0,
        totalPage: 0
      });
      setIsLoading(false);
    } catch (error) {
      let errorMessage = (error as Error).message;
      ToastMessage({
        type: "error",
        message: errorMessage,
      });
      setIsLoading(false);
    }
  };

  const fetchCoverLetters = async () => {
    try {
      setIsLoading(true);
      const response = await CoverLetterList();
      setCoverLetters(response?.data);
      setIsLoading(false);
    } catch (error) {
      let errorMessage = (error as Error).message;
      ToastMessage({
        type: "error",
        message: errorMessage,
      });
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    if (activeTab !== 'resumes' || pagination.totalPage <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPage, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <li key="prev" className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
        <button
          className="page-link"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          &laquo;
        </button>
      </li>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <li key={1} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(1)}>
            1
          </button>
        </li>
      );
      if (startPage > 2) {
        pages.push(
          <li key="ellipsis1" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={`page-item ${pagination.currentPage === i ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }

    // Last page
    if (endPage < pagination.totalPage) {
      if (endPage < pagination.totalPage - 1) {
        pages.push(
          <li key="ellipsis2" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
      pages.push(
        <li key={pagination.totalPage} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(pagination.totalPage)}>
            {pagination.totalPage}
          </button>
        </li>
      );
    }

    // Next button
    pages.push(
      <li key="next" className={`page-item ${pagination.currentPage === pagination.totalPage ? 'disabled' : ''}`}>
        <button
          className="page-link"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPage}
        >
          &raquo;
        </button>
      </li>
    );

    return (
      <div className="pagination-container mt-4 d-flex justify-content-center align-items-center mb-4">
        <div className="pagination-info me-3">
          Showing page {pagination.currentPage} of {pagination.totalPage}
        </div>
        <nav aria-label="Resume pagination">
          <ul className="pagination mb-0">
            {pages}
          </ul>
        </nav>
      </div>
    );
  };

  const EditResume = (resume_data: any, resumeId: number, template_id: any, resume_name: any) => {
    try {
      const resumeData = { resume_data: resume_data };
      setToLocalStorage("resumeData", JSON.stringify(resumeData));
      setToLocalStorage("resumeName", resume_name);
      setToSessionStorage("ResumeId", resumeId.toString());
      setToLocalStorage("resumeId", resumeId.toString());

      setToSessionStorage("templateId", template_id);
      setToSessionStorage("selectedTemplateId", template_id);
      setToLocalStorage("resumeImage", resumeData.resume_data?.personaldetails?.imageUrl);
      setToLocalStorage("customHeading", JSON.stringify(resumeData?.resume_data?.customHeading || []));
      setToLocalStorage("settings", JSON.stringify(resumeData?.resume_data?.settings || []));

      setTimeout(() => {
        router.push("/create-resume");
      }, 400);
    } catch (error) {
      console.error("Error sanitizing and saving resume data:", error);
    }
  };

  const EditCoverLetter = (coverLetter: any) => {
    try {
      setToSessionStorage("cvData", JSON.stringify(coverLetter.cover_letter));
      setToSessionStorage("CvName", coverLetter.title);
      setToSessionStorage("coverLetterId", coverLetter.cover_letter_id.toString());
      setToSessionStorage("CLtemplateId", coverLetter.cover_template_id);

      setTimeout(() => {
        router.push("/create-cover-letter");
      }, 400);
    } catch (error) {
      console.error("Error sanitizing and saving cover letter data:", error);
    }
  };

  const ShimmerEffect = () => (
    <div className={`row ${(activeTab === 'resumes' ? resumes?.length : coverLetters?.length) > 3 ? "justify-content-center" : "justify-content-start"} text-start p-2 pt-4 m-0`}>
      {[...Array(6)].map((_, index) => (
        <div key={index} className='col text-center my-3 px-3'>
          <div className='resume-item'>
            <div className="shimmer" style={{ height: '280px', width: '350px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  const setCreateResWidth = () => {
    const images = document.querySelectorAll('.resume-item img');
    const DEFAULT_WIDTH = '182px';

    if (images.length > 0) {
      const firstImageWidth = images[0].clientWidth;
      const createResElement = document.querySelector('.create-res') as HTMLElement;

      if (createResElement) {
        createResElement.style.width = `${firstImageWidth}px`;
      }
    } else {
      const createResElement = document.querySelector('.create-res') as HTMLElement;
      if (createResElement) {
        createResElement.style.width = DEFAULT_WIDTH;
      }
    }
  };

  const handleCreateResume = () => {
    const CheckGuest = localStorage.getItem('GuestData');
    if (CheckGuest === "true") {
      localStorage.removeItem('resumeId');
      localStorage.removeItem('GuestData');
      localStorage.removeItem('resumeData');
    }
    sessionStorage.removeItem('templateId');
    localStorage.removeItem('templateId');
     sessionStorage.removeItem('selectedTemplateId');
    sessionStorage.removeItem('ResumeId');
    localStorage.removeItem("resumeName");
    sessionStorage.removeItem('GuestId');
    
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

      const isResumeDataEmpty = (resumeData: any): boolean => {
        if (typeof resumeData !== 'object' || resumeData === null) {
          return resumeData === null || resumeData === '' || resumeData === undefined;
        }

        if (Array.isArray(resumeData)) {
          if (resumeData.length === 0) {
            return true;
          }
          return resumeData.every((item) => isResumeDataEmpty(item));
        }

        return Object.values(resumeData).every((value) => isResumeDataEmpty(value));
      };

      const isEmpty = isResumeDataEmpty(resume_data);

      if (!isEmpty) {
        if (resume_id) {
          addResume({ resume_id, resume_name: ResumeName, ...resume_data })
            .then((response) => {
              console.log('Resume updated successfully:');
              sessionStorage.setItem('ResumeId', response?.data?.data?.id);
            })
            .catch((error) => {
              console.error('Error updating resume:', error);
            });
        } 
      }

      localStorage.removeItem('resumeId');
      localStorage.removeItem('resumeData');
      localStorage.removeItem('resumeName');
      localStorage.removeItem('resumeImage');
      localStorage.removeItem('customHeading');
      localStorage.removeItem('settings');
      sessionStorage.removeItem('templateId');
      localStorage.removeItem('templateId');
       sessionStorage.removeItem('selectedTemplateId');
    }
  };

  return (
    <>
      <div className='update-resume'>
        {/* Tabs Navigation */}
        <div className="tabs-container mb-4">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'resumes' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('resumes');
                  setCurrentPage(1);
                }}
              >
                Resumes
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'coverLetters' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('coverLetters');
                  setCurrentPage(1);
                }}
              >
                Cover Letters
              </button>
            </li>
          </ul>
        </div>

        {isLoading ? (
          <ShimmerEffect />
        ) : (
          <>
            {activeTab === 'resumes' ? (
              <>
                <div className={`row ${resumes?.length > 3 ? "justify-content-center" : "justify-content-start"} text-start p-2 pt-4 m-0`}>
                  <Link href="/create-resume" onClick={handleCreateResume}
                    className='col text-center mt-3 create p-0 mx-4 text-decoration-none'
                  >
                    <div className="create-res">
                      <div className='mt-5 pt-5'>
                        <FaPlus />
                        <p>New Resume</p>
                      </div>
                    </div>
                  </Link>
                  {resumes && resumes.map((resume: any) => (
                      <div
                        key={resume.resume_id}
                        className='col text-center my-3 px-4 position-relative'
                        onMouseEnter={() => setHoveredResume(resume.resume_id)}
                        onMouseLeave={() => setHoveredResume(null)}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const target = e.currentTarget;
                          const clickY = e.clientY - target.getBoundingClientRect().top;
                          const height = target.clientHeight;

                          if (clickY < height / 1.2) {
                            EditResume(resume.resume_data, resume.resume_id, resume.template_id, resume.resume_name);
                          }
                        }}
                        style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                      >
                        <div className='resume-item'>
                          <img src={resume.image || nodata.src} alt="" loading="lazy" />
                          <GaugeChart value={resume.resume_completion} />
                          {hoveredResume === resume.resume_id && (
                            <div className="pin-drawer">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePinResume(resume.resume_id, resume.resume_pined);
                                }}
                                className={`pin-button ${pinnedResumes.includes(resume.resume_id) ? 'pinned' : ''}`}
                              >
                                {resume.resume_pined === 1 ? <RiUnpinFill /> : <MdPushPin />}
                              </button>
                            </div>
                          )}
                          {resume.resume_id && (
                            <div className="preview my-element" data-aos="fade-up" data-aos-delay="100">
                              <br />
                              <p className='text-start'>
                                <p>{resume?.resume_name || "Untitled"}</p>
                                {new Date(resume.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                                {', '}
                                ({new Date(resume.created_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })})
                              </p>
                              <button onClick={(e) => {
                                e.stopPropagation();
                                setDeleteResumeId(resume.resume_id);
                                setDelOpen(true);
                              }}
                                disabled={isLoading}
                                className='preview-button p-0 z-1'>
                                <MdDelete />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                  
                  ))}
                </div>
                {renderPagination()}
              </>
            ) : null}
            
            {activeTab === 'coverLetters' ? (
              <div className={`row ${coverLetters?.length > 3 ? "justify-content-center" : "justify-content-start"} text-start p-2 pt-4 m-0`}>
                <Link href="/cover-letter"
                  className='col text-center mt-3 create p-0 mx-4 text-decoration-none'
                >
                  <div className="create-res">
                    <div className='mt-5 pt-5'>
                      <FaPlus />
                      <p>New Cover Letter</p>
                    </div>
                  </div>
                </Link>
                {coverLetters && coverLetters.length > 0 ? (
                  coverLetters.map((coverLetter:any) => (
                    <div
                      key={coverLetter.cover_letter_id}
                      className='col text-center my-3 px-4 position-relative'
                      onMouseEnter={() => setHoveredCoverLetter(coverLetter.id)}
                      onMouseLeave={() => setHoveredCoverLetter(null)}
                      onClick={(e) => {
                        const target = e.currentTarget;
                        const clickY = e.clientY - target.getBoundingClientRect().top;
                        const height = target.clientHeight;

                        if (clickY < height / 1.2) {
                          EditCoverLetter(coverLetter);
                        }
                      }}
                    >
                      <div className='resume-item'>
                        <img src={coverLetter.image || coverLetter.template_image} alt="Cover Letter" loading="lazy" />
                        {hoveredCoverLetter === coverLetter.id && (
                          <div className="pin-drawer">
                            {/* Add pin functionality if needed */}
                          </div>
                        )}
                        <div className="preview my-element" data-aos="fade-up" data-aos-delay="100">
                          <p className='text-start'>
                            <p>{coverLetter.title || "Untitled"}</p>
                          </p>
                          <button onClick={(e) => {
                            e.stopPropagation();
                            setDeleteCoverLetterId(coverLetter.cover_letter_id);
                            setDelOpen(true);
                          }}
                            disabled={isLoading}
                            className='preview-button p-0 z-1'>
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center">
                    {/* <img src={nodata} alt="No data" style={{ width: '200px' }} />
                    <p>No cover letters found</p> */}
                  </div>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>

      <CustomModal
        show={isDelOpen}
        onHide={() => setDelOpen(false)}
        custom='delete'
        title="Delete"
      >
        <Image src={del} alt="" />
        <h4 className='mt-3'>Are you sure you <span className='sec-col'>want to <br /> delete this {activeTab === 'resumes' ? 'resume' : 'cover letter'}?</span></h4>
        <h5 className='mt-3'>Are you sure you <span className='sec-col'>want to delete <br />this {activeTab === 'resumes' ? 'resume' : 'cover letter'}?</span></h5>
        <p className='my-2'>You you will not able to restore this file if you delete it.</p>
        <div className='d-flex align-items-center justify-content-center'>
          <button className="prim-but w-50 m-1 me-3" onClick={activeTab === 'resumes' ? handleDeleteResume : handleDeleteCoverLetter}>
            Delete
          </button>
          <button className="sec-but w-50 m-1 me-0 mx-3" onClick={() => setDelOpen(false)}>
            Cancel
          </button>
        </div>
      </CustomModal>

      {/* <ResumeProvider> */}
        <SafeAds />
      {/* </ResumeProvider> */}
    </>
  );
}

export default UpdatedResume;
