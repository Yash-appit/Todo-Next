import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DownloadResume, resumeShareableLink } from "@/services/resume/Index";
import ToastMessage from '@/Layout/ToastMessage';
// import { decode as atob } from 'base-64';
import pdf from "@/assets/Images/resume-builder/pdf.svg";
// import doc from "../../../assets/Images/resume-builder/doc.png";
// import { useNavigate } from 'react-router-dom';
// import { Buffer } from 'buffer';
import CustomModal from '@/components/Modal/Modal';
// import Package from '../Package/Package';
import PackagePop from '@/components/PackagePop';
// import ReactHtmlParser from 'react-html-parser';
import ResumeLoader from './ResumeLoader';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { IoCopy } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { MdKeyboardArrowDown } from "react-icons/md";
import down from "@/assets/Images/resume-builder/download.svg";
import { Spinner } from 'react-bootstrap';
import Image from 'next/image';

interface ResumeGeneratedProps {
  GeneratedResume: any;
  ResumeLoading?: boolean;
}

const setToLocalStorage = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
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

const ResumeGenerated = ({ GeneratedResume, ResumeLoading }: ResumeGeneratedProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // const [selectedDownloadOption, setSelectedDownloadOption] = useState('');

  useEffect(() => {
    // Detect iOS device
    const detectIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent);
    };

    const handleResize = () => {
      const width = window.innerWidth;
      setIsSmallScreen(width < 1200);
      setIsIOS(detectIOS());
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const getScaleBasedOnWidth = (width: number): number => {
    // iOS-specific scaling adjustments
    if (isIOS) {
      if (width <= 375) return 35;    // iPhone SE, iPhone 12 mini
      if (width <= 390) return 38;    // iPhone 12/13/14
      if (width <= 414) return 40;    // iPhone Plus models
      if (width <= 428) return 42;    // iPhone Pro Max models
      if (width <= 768) return 45;    // iPad mini portrait
      if (width <= 834) return 50;    // iPad Air portrait
      if (width <= 1024) return 55;   // iPad landscape
      return 60;
    }

    // Non-iOS devices
    if (width <= 400) return 40;
    if (width <= 600) return 50;
    if (width <= 990) return 60;
    if (width <= 1024) return 75;
    if (width <= 1440) return 75;
    return 75;
  };

  const [scale, setScale] = useState(getScaleBasedOnWidth(window.innerWidth));
  // const [fileType, setFileType] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [id, setId] = useState<string>(sessionStorage.getItem("selectedTemplateId") || "");
  // const navigate = useNavigate();
  const [isForgetOpen, setForgetOpen] = useState(false);
  // const openForget = () => setForgetOpen(true);
  // const closeForget = () => setForgetOpen(false);
  // const [hasRendered, setHasRendered] = useState(false);
  const [isDownloadOpen, setDownloadOpen] = useState(false);
  const [previousResume, setPreviousResume] = useState('');

  const closeDownload = () => {
    setDownloadOpen(false);
    setExpanded(false); // Reset accordion state when closing modal
    setShareableLink(''); // Clear shareable link when closing
  }
  const [shareableLink, setShareableLink] = useState('');
  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | false>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pageHeightRef = useRef<number>(11 * 96);
  // const resumeToRender = id === "28" ? decodeURIComponent(GeneratedResume) : GeneratedResume;

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
    if (panel === 'share' && isExpanded && !shareableLink) {
      fetchShareableLink();
    }
  };

  // Smooth update function for resume content
  const updateResumeContent = useCallback(() => {
    if (!iframeRef.current || !GeneratedResume) return;

    setIsTransitioning(true);

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!doc) return;

    // Store current scroll position
    const scrollTop = iframe.contentWindow?.scrollY || 0;

    // Create a temporary container for the new content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = GeneratedResume;

    // Add CSS for transition
    const transitionStyle = document.createElement('style');
    transitionStyle.textContent = `
      .resume-content {
        transition: opacity 0.3s ease-in-out;
      }
      .resume-content.fade-out {
        opacity: 0;
      }
      .resume-content.fade-in {
        opacity: 1;
      }
    `;
    tempDiv.querySelector('head')?.appendChild(transitionStyle);

    // Apply fade-out class to current content
    const currentContent = doc.querySelector('.resume-content');
    if (currentContent) {
      currentContent.classList.add('fade-out');
    }

    // After fade out completes, update content and fade in
    setTimeout(() => {
      // Replace the entire document content
      doc.open();
      doc.write(tempDiv.innerHTML);

      // Add our transition classes and styles
      const body = doc.querySelector('body');
      if (body) {
        body.classList.add('resume-content');
        body.classList.add('fade-out'); // Start faded out

        // Add the same styling as in renderResume
        const paginationStyle = document.createElement('style');
        paginationStyle.textContent = `
          @page {
            size: 8.5in 11in;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            transition: opacity 0.3s ease-in-out;
          }
          .page-break {
            page-break-after: always;
            height: 0;
            margin: 0;
            border: none;
          }
          * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
        `;
        doc.head.appendChild(paginationStyle);

        // iOS-specific styling
        body.style.position = 'relative';
        body.style.overflowX = 'hidden';
        body.style.width = '8.5in';
        body.style.maxHeight = '4in';
        body.style.minHeight = '4in';
        body.style.transformOrigin = 'top left';
        body.style.transform = `scale(${scale / 100})`;
        body.style.background = `${id === "26" ? "#1a1a1a" : "white"}`;
        body.style.height = `${id === "26" ? "120vh" : "auto"}`;

        if (isIOS) {
          body.style.webkitTransform = `scale(${scale / 100})`;
          body.style.webkitTransformOrigin = 'top left';
        }
      }

      doc.close();

      // Add page breaks and calculate pages
      addPageBreaks(doc);

      // Restore scroll position
      iframe.contentWindow?.scrollTo(0, scrollTop);

      // Fade in the new content
      setTimeout(() => {
        const newBody = doc.querySelector('body');
        if (newBody) {
          newBody.classList.remove('fade-out');
          newBody.classList.add('fade-in');
        }

        setIsTransitioning(false);
        setIsLoading(false);
      }, 50);
    }, 300); // Match this with the CSS transition duration
  }, [GeneratedResume, scale, isIOS, id]);



  useEffect(() => {
    if (GeneratedResume && iframeRef.current) {
      if (previousResume === '') {
        // Initial render
        setIsLoading(true);
        renderResume();
      } else {
        // Update with transition
        updateResumeContent();
      }
      setPreviousResume(GeneratedResume);
    }
  }, [GeneratedResume, scale, updateResumeContent]);




  useEffect(() => {
    if (iframeRef.current && !isLoading && !isTransitioning) {
      scrollToCurrentPage();
    }
  }, [currentPage, isLoading, isTransitioning]);



  // Update scale when screen size changes
  useEffect(() => {
    setScale(getScaleBasedOnWidth(window.innerWidth));
  }, [isSmallScreen, isIOS]);




  const fetchShareableLink = async () => {
    const resumeId = getFromSessionStorage("ResumeId") || getFromLocalStorage("resumeId");
    setIsLinkLoading(true);
    try {
      const param = {
        resume_id: resumeId?.toString(),
      }
      const response = await resumeShareableLink(param);
      setShareableLink(response?.data?.data || '');
    } catch (error) {
      ToastMessage({
        type: "error",
        message: "Failed to generate shareable link"
      });
    } finally {
      setIsLinkLoading(false);
    }
  };



  const downloadResume = async (type: string) => {
    try {
      setIsTransitioning(true);
      setIsDownloading(true);
      closeDownload();
      const resumeID = Number(getFromSessionStorage("ResumeId")) || Number(getFromLocalStorage("resumeId"));
      const templateID = getFromSessionStorage("selectedTemplateId");

      const response = await DownloadResume({
        resume_id: resumeID,
        template_id: templateID,
        type: type,
      });
      ToastMessage({
        type: "success",
        message: "Resume downloaded successfully!",
      });
    } catch (error) {
      // if (error === "You have not subscribed to any package") {
      //   setTimeout(() => {
      //     openForget();
      //   }, 2000);
      // }
      ToastMessage({
        type: "error",
        message: error,
      });
    } finally {
      setIsDownloading(false);
      setIsTransitioning(false);
    }
  };

  const renderResume = () => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (doc) {
      doc.open();
      doc.write(GeneratedResume);

      // Enhanced CSS for iOS compatibility
      const paginationStyle = document.createElement('style');
      paginationStyle.textContent = `
        @page {
          size: 8.5in 11in;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          -webkit-text-size-adjust: 100%;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .page-break {
          page-break-after: always;
          height: 0;
          margin: 0;
          border: none;
        }
        * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `;
      doc.head.appendChild(paginationStyle);
      doc.close();

      iframe.onload = () => {
        addPageBreaks(doc);
        setIsLoading(false);
      };
    }
  };

  const addPageBreaks = (doc: Document) => {
    if (!doc.body) return;

    const existingBreaks = doc.querySelectorAll('.page-break');
    existingBreaks.forEach(br => br.remove());

    const pageHeight = pageHeightRef.current;
    const bodyHeight = doc.body.scrollHeight;
    const calculatedPages = Math.ceil(bodyHeight / pageHeight);
    setTotalPages(calculatedPages > 0 ? calculatedPages : 1);

    doc.body.style.minHeight = `${pageHeight}px`;

    for (let i = 1; i < calculatedPages; i++) {
      const yPosition = i * pageHeight;
      const pageBreak = doc.createElement('div');
      pageBreak.className = 'page-break';
      pageBreak.style.position = 'absolute';
      pageBreak.style.top = `${yPosition}px`;
      pageBreak.style.left = '0';
      pageBreak.style.width = '100%';
      pageBreak.style.height = '0';
      pageBreak.dataset.pageNumber = i.toString();
      doc.body.appendChild(pageBreak);
    }

    // iOS-specific styling adjustments
    doc.body.style.position = 'relative';
    doc.body.style.overflowX = 'hidden';
    doc.body.style.width = '8.5in';
    doc.body.style.maxHeight = '4in';
    doc.body.style.minHeight = '4in';
    doc.body.style.transformOrigin = 'top left';
    doc.body.style.transform = `scale(${scale / 100})`;
    doc.body.style.background = `${id === "26" ? "#1a1a1a" : "white"}`;
    doc.body.style.height = `${id === "26" ? "120vh" : "auto"}`;

    // iOS-specific fixes
    if (isIOS) {
      doc.body.style.webkitTransform = `scale(${scale / 100})`;
      doc.body.style.webkitTransformOrigin = 'top left';
    }
  };

  const scrollToCurrentPage = () => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (doc && doc.body) {
      const pageHeight = pageHeightRef.current;
      const scrollPosition = (currentPage - 1) * pageHeight;

      iframe.contentWindow?.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        ToastMessage({
          type: "success",
          message: "Link copied to clipboard!"
        });
      })
      .catch(() => {
        ToastMessage({
          type: "error",
          message: "Failed to copy link"
        });
      });
    closeDownload();
  };

  return (<>
    <div className="resume-generated-container templates">
      {/* <DownloadResumeList /> */}
      <div className='d-flex justify-content-end align-items-center pt-1 pb-4'>
        {isSmallScreen ? (
          <div className='d-flex gap-2'>
            <button
              className='prim-but py-3'
              disabled={isDownloading || isTransitioning}
              onClick={() => downloadResume('pdf')}
              style={{
                minHeight: '44px',
                fontSize: isIOS ? '16px' : 'inherit'
              }}
            >
              Download PDF
            </button>

            <button
              className='prim-but py-3'
              disabled={isDownloading || isTransitioning}
              onClick={() => downloadResume('document')}
              style={{
                minHeight: '44px',
                fontSize: isIOS ? '16px' : 'inherit'
              }}
            >
              Download DOC
            </button>
          </div>)
          :
          <button
            className='prim-but-2 py-2'
            disabled={isDownloading || isTransitioning}
            onClick={() => setDownloadOpen(true)}
            style={{
              minHeight: '44px',
              fontSize: isIOS ? '16px' : 'inherit'
            }}
          >
            Download
          </button>
        }
      </div>

      <div className="resume-preview-wrapper">
        {/* Loading overlay during transitions */}
        {isTransitioning && (
          <div className="transition-overlay">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Updating...</span>
            </div>
          </div>
        )}

        <div className="page-container">
          <iframe
            ref={iframeRef}
            className="resume-preview-iframe"
            title="Resume Preview"
            style={{
              height: `${11 * scale / 100}in`,
              width: `${8.5 * scale / 100}in`,
              minHeight: `${11 * scale / 100}in`,
              minWidth: `${8.5 * scale / 100}in`,
              opacity: isTransitioning ? 0.7 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
          <div className="page-shadow"></div>
        </div>
      </div>

      <style>{`
        .resume-generated-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: ${isIOS ? '10px' : '20px'};
          -webkit-overflow-scrolling: touch;
          position: relative;
        }

        .transition-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
          border-radius: 4px;
        }

        .resume-preview-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .page-navigation {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .page-nav-btn {
          background: none;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 5px 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          min-height: 44px;
          min-width: 44px;
          -webkit-tap-highlight-color: transparent;
        }

        .page-nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-indicator {
          font-size: ${isIOS ? '16px' : '14px'};
        }

        .resume-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .resume-preview-wrapper {
          flex: 1;
          overflow: ${isIOS ? 'auto' : 'hidden'};
          -webkit-overflow-scrolling: touch;
          border-radius: 4px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: ${isSmallScreen ? '0 10px' : '0 20px'};
          min-height: ${11 * scale / 100}in;
          position: relative;
        }

        .resume p, .resume li {
          word-break: break-word;
          -webkit-hyphens: auto;
          -moz-hyphens: auto;
          -ms-hyphens: auto;
          hyphens: auto;
        }

        .page-container {
          position: relative;
          height: ${11 * scale / 100}in;
          width: ${8.5 * scale / 100}in;
          min-height: ${11 * scale / 100}in;
          min-width: ${8.5 * scale / 100}in;
          margin: ${isSmallScreen ? '0 auto' : '0'};
        }

        .resume-preview-iframe {
          border: none;
          background-color: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          overflow: hidden;
          min-height: ${11 * scale / 100}in;
          min-width: ${8.5 * scale / 100}in;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }

        .page-shadow {
          position: absolute;
          top: 5px;
          left: 5px;
          right: -5px;
          bottom: -5px;
          background-color: rgba(0,0,0,0.03);
          z-index: -1;
          border-radius: 2px;
        }

        /* iOS-specific media queries */
        @media screen and (max-width: 428px) and (-webkit-min-device-pixel-ratio: 2) {
          .resume-generated-container {
            padding: 10px 5px;
          }
          
          .resume-preview-wrapper {
            padding: 0 5px;
          }
          
          .page-container {
            max-width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }

        /* iPad specific adjustments */
        @media screen and (min-width: 768px) and (max-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) {
          .resume-preview-wrapper {
            padding: 0 15px;
          }
        }

        /* Prevent zoom on input focus for iOS */
        input, select, textarea, button {
          font-size: ${isIOS ? '16px' : 'inherit'} !important;
        }

        /* Touch-friendly buttons */
        .prim-but-2, .dropdown-toggle {
          min-height: 44px !important;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
      `}</style>
    </div>

    <CustomModal show={isForgetOpen} onHide={() => setForgetOpen(false)} custom='package pack2' title='' size='lg'>
      <PackagePop close={() => setForgetOpen(false)} fetchPay={GeneratedResume} />
    </CustomModal>

    <CustomModal show={isDownloadOpen} onHide={closeDownload} custom='download-pop' title='Download Resume' size='lg'>
      <button onClick={closeDownload} className='close'><IoClose /></button>
      <div className="row mx-0">
        <div className="col-lg-6">
          <div className='d-flex align-items-center'>
            <Image src={pdf} alt="" className='img-fluid' />
            <p className='mb-0 px-2'>resume .(pdf)</p>
          </div>
          <div className="share-link-section mt-4">
            <Accordion
              expanded={expanded === 'share'}
              onChange={handleAccordionChange('share')}
              sx={{
                boxShadow: 'none',
                border: '1px solid #ddd',
                borderRadius: '4px !important',
                '&:before': {
                  display: 'none'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<MdKeyboardArrowDown />}
                aria-controls="share-content"
                id="share-header"
                sx={{
                  minHeight: '44px !important',
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    margin: '8px 0'
                  }
                }}
              >

                <span>Shareable Link</span>
              </AccordionSummary>
              <AccordionDetails>
                {isLinkLoading ? (
                  <div className="text-center py-2 prim-txt2"><Spinner size='sm' /> Generating link...</div>
                ) : (
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={shareableLink}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={copyToClipboard}
                            edge="end"
                            color="primary"
                          >
                            <IoCopy />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </AccordionDetails>
            </Accordion>
          </div>

          <div className='justify-content-center text-center d-flex flex-column align-items-center mt-4'>
            <button onClick={() => downloadResume('pdf')} disabled={isDownloading} className='prim-but py-1'> {isDownloading ? "...Downloading" : "Download"}</button>
          </div>
        </div>

        <div className="col-lg-6 pb-4 img-block">
          <Image src={down} alt="" className='img-fluid' />
        </div>
      </div>

    </CustomModal>
  </>);
};

export default ResumeGenerated;



