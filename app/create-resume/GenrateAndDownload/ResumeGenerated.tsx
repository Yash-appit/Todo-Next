'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from 'react-bootstrap';
import CustomModal from '@/components/Modal/Modal';
import { IoClose } from "react-icons/io5";
import Login from '@/components/Login';
import { useRefresh } from '@/context/RefreshContext';
import ToastMessage from '@/Layout/ToastMessage';
import '@/styles/Resumebuilder.css'; // Create this CSS file for styles

interface ResumeGeneratedProps {
  GeneratedResume: any;
  ResumeLoading?: boolean;
  onDownloadClick: () => void;
  isDownloading?: boolean;
  isTransitioning?: boolean;
  setShowDialog: (showDialog: boolean) => void;
}

const ResumeGenerated = ({
  GeneratedResume,
  ResumeLoading,
  onDownloadClick,
  isDownloading = false,
  isTransitioning = false,
  setShowDialog
}: ResumeGeneratedProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [scale, setScale] = useState<number>(75);
  const [id, setId] = useState<string>('');
  const [previousResume, setPreviousResume] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedResume, setEditedResume] = useState('');
  const [isDownloadingEdited, setIsDownloadingEdited] = useState(false);
  const [showPDFDialog, setShowPDFDialog] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pageHeightRef = useRef<number>(11 * 96); // 11 inches in pixels (96 PPI)
  const [token, setToken] = useState<string | null>(null);
  const [LoginModal, setLoginModal] = useState(false);
  const { refresh } = useRefresh();
  const router = useRouter();

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

  // Get sessionStorage and localStorage values
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setId(sessionStorage.getItem("selectedTemplateId") || "");
      setToken(localStorage.getItem('token'));
    }
  }, []);

  // Function to validate resume data
  const isEmpty = (): boolean => {
    if (typeof window === 'undefined') return true;

    const resumeData: any = localStorage.getItem('resumeData');
    if (!resumeData) return true;

    try {
      const parsedData = JSON.parse(resumeData);

      const isEmptyObject = (obj: any) =>
        Object.values(obj).every((value) => value === null || value === "");

      const sanitizeResumeData = (resumeData: any) => {
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

      const cleanedData = sanitizeResumeData(parsedData.resume_data || {});
      const filteredResumeData = Object.fromEntries(
        Object.entries(cleanedData).filter(([key, value]) => {
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return true;
        })
      );

      // Check if all objects and arrays are empty
      const isEmptyData = Object.values(filteredResumeData).every(value => {
        if (Array.isArray(value)) {
          return value.length === 0;
        } else if (typeof value === 'object' && value !== null) {
          return Object.values(value).every(val => val === null || val === "" || val === undefined);
        } else {
          return value === null || value === "" || value === undefined;
        }
      });

      return isEmptyData;
    } catch (error) {
      console.error('Error parsing resume data:', error);
      return true;
    }
  };

  // Function to open finalize preview
  const openFinalizePreview = () => {
    const empty = isEmpty();

    if (!empty) {
      setShowDialog(true);
      const resumeContent = isEditing ? editedResume : GeneratedResume;
      const resumeStorageKey = `finalizeResume_${Date.now()}`;

      setToLocalStorage(resumeStorageKey, resumeContent);

      // Store template ID and other necessary data
      const templateId = getFromSessionStorage("selectedTemplateId") || "";
      const resumeName = getFromLocalStorage('resumeName') || 'My Resume';

      // Navigate to finalize page with query parameters
      router.push(`/finalize?resumeKey=${resumeStorageKey}&templateId=${templateId}&resumeName=${encodeURIComponent(resumeName)}`);
    } else {
      ToastMessage({
        type: "error",
        message: "Resume is Empty! Please fill data.",
      });
    }
  };

  const renderButtons = () => {
    // For authenticated users
    if (token) {
      return (
        <button
          className={`py-2 ${isEditing ? (isSmallScreen ? "prim-but" : "sec-but2") : 'prim-but-2'}`}
          onClick={isEditing ? handleEditToggle : openFinalizePreview}
          disabled={isDownloading || isTransitioning || isDownloadingEdited}
          style={{
            minHeight: '44px',
            fontSize: isIOS ? '16px' : 'inherit',
          }}
        >
          {isEditing ? 'Reset' : 'Finalize'}
        </button>
      );
    } else {
      return (
        <button
          className="prim-but-2"
          onClick={() => setLoginModal(true)}
          style={{
            minHeight: '44px',
            fontSize: isIOS ? '16px' : 'inherit',
          }}>
          Download PDF
        </button>
      );
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
    }
  }, [refresh]);

  // Initialize edited resume when GeneratedResume changes
  useEffect(() => {
    if (GeneratedResume && GeneratedResume !== editedResume) {
      setEditedResume(GeneratedResume);
    }
  }, [GeneratedResume, refresh]);

  const getScaleBasedOnWidth = useCallback((width: number, isIOSDevice: boolean): number => {
    if (isIOSDevice) {
      if (width <= 375) return 35;
      if (width <= 390) return 38;
      if (width <= 414) return 40;
      if (width <= 428) return 42;
      if (width <= 768) return 45;
      if (width <= 834) return 50;
      if (width <= 1024) return 55;
      return 60;
    }

    if (width <= 400) return 40;
    if (width <= 600) return 50;
    if (width <= 990) return 60;
    if (width <= 1024) return 75;
    if (width <= 1440) return 75;
    return 75;
  }, []);

  useEffect(() => {
    const detectIOS = (): boolean => {
      if (typeof window === 'undefined') return false;
      return /iPad|iPhone|iPod/.test(navigator.userAgent);
    };

    const handleResize = () => {
      if (typeof window === 'undefined') return;
      
      const width = window.innerWidth;
      const isIOSDevice = detectIOS();
      setIsSmallScreen(width < 1200);
      setIsIOS(isIOSDevice);

      // Calculate scale based on current width and device type
      const newScale = getScaleBasedOnWidth(width, isIOSDevice);
      setScale(newScale);
    };

    // Initialize on mount
    if (typeof window !== 'undefined') {
      handleResize();

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      }
    };
  }, [getScaleBasedOnWidth]);

  const updateResumeContent = useCallback(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!doc) return;

    const scrollTop = iframe.contentWindow?.scrollY || 0;
    const tempDiv = document.createElement('div');
    const contentToRender = isEditing ? editedResume : GeneratedResume;
    tempDiv.innerHTML = contentToRender;

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
      ${isEditing ? `
        * {
          -webkit-touch-callout: text;
          -webkit-user-select: text;
          -khtml-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
          cursor: text;
        }
        [contenteditable="true"]:focus {
          outline: 2px solid #007bff;
          background-color: rgba(0, 123, 255, 0.1);
          border-radius: 2px;
        }
      ` : ''}
    `;
    tempDiv.querySelector('head')?.appendChild(transitionStyle);

    const currentContent = doc.querySelector('.resume-content');
    if (currentContent) {
      currentContent.classList.add('fade-out');
    }

    setTimeout(() => {
      doc.open();
      doc.write(tempDiv.innerHTML);

      const body = doc.querySelector('body');
      if (body) {
        body.classList.add('resume-content');
        body.classList.add('fade-out');

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
         
          ${!isEditing ? `
            * {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
          ` : ''}
        `;
        doc.head.appendChild(paginationStyle);

        // Apply scaling and styling
        body.style.position = 'relative';
        body.style.overflowX = 'hidden';
        body.style.width = '8.5in';
        body.style.minHeight = '11in';
        body.style.transformOrigin = 'top left';
        body.style.transform = `scale(${scale / 100})`;
        body.style.background = `${id === "26" ? "#1a1a1a" : "white"}`;

        if (isIOS) {
          body.style.webkitTransform = `scale(${scale / 100})`;
          body.style.webkitTransformOrigin = 'top left';
        }

        // Make content editable when in edit mode
        if (isEditing) {
          makeContentEditable(body);
        }
      }

      doc.close();
      addPageBreaks(doc);
      iframe.contentWindow?.scrollTo(0, scrollTop);

      setTimeout(() => {
        const newBody = doc.querySelector('body');
        if (newBody) {
          newBody.classList.remove('fade-out');
          newBody.classList.add('fade-in');
        }
        setIsLoading(false);
      }, 50);
    }, 300);
  }, [isEditing, editedResume, GeneratedResume, scale, isIOS, id]);

  const makeContentEditable = (body: HTMLElement) => {
    const editableElements = body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, span, div');

    editableElements.forEach(element => {
      if (element.textContent && element.textContent.trim().length > 0) {
        element.setAttribute('contenteditable', 'true');
        element.addEventListener('input', handleContentEdit);
        element.addEventListener('blur', handleContentBlur);
      }
    });
  };

  const handleContentEdit = (event: Event) => {
    // Real-time updates can be handled here if needed
  };

  const handleContentBlur = (event: Event) => {
    updateEditedResume();
  };

  const updateEditedResume = () => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (doc) {
      const updatedContent = doc.documentElement.outerHTML;
      setEditedResume(updatedContent);
    }
  };

  useEffect(() => {
    if ((GeneratedResume || editedResume) && iframeRef.current) {
      if (previousResume === '') {
        setIsLoading(true);
        renderResume();
      } else {
        updateResumeContent();
      }
      setPreviousResume(isEditing ? editedResume : GeneratedResume);
    }
  }, [GeneratedResume, editedResume, isEditing]);

  useEffect(() => {
    if (iframeRef.current && !isLoading && !isTransitioning) {
      scrollToCurrentPage();
    }
  }, [currentPage, isLoading, isTransitioning]);

  const renderResume = () => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (doc) {
      doc.open();
      doc.write(isEditing ? editedResume : GeneratedResume);

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
        ${!isEditing ? `
          * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
        ` : ''}
      `;
      doc.head.appendChild(paginationStyle);
      doc.close();

      iframe.onload = () => {
        addPageBreaks(doc);
        if (isEditing) {
          makeContentEditable(doc.body);
        }
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

    // Apply scaling to the body
    doc.body.style.position = 'relative';
    doc.body.style.overflowX = 'hidden';
    doc.body.style.width = '8.5in';
    doc.body.style.minHeight = '11in';
    doc.body.style.transformOrigin = 'top left';
    doc.body.style.transform = `scale(${scale / 100})`;
    doc.body.style.background = `${id === "26" ? "#1a1a1a" : "white"}`;

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

  const handleEditToggle = () => {
    if (isEditing) {
      updateEditedResume();
    }
    setIsEditing(!isEditing);
  };

  const createEditableResumeWindow = () => {
    if (typeof window === 'undefined') return null;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    const ResumeName = getFromLocalStorage('resumeName') || 'Untitled';
    const resumeStorageKey = `editableResume_${Date.now()}`;
    setToLocalStorage(resumeStorageKey, editedResume || GeneratedResume);

    const editableHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${ResumeName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .editor-header {
              position: fixed;
              top: 0;
              right: 0;
              left: 0;
              background: #fff;
              padding: 15px 20px;
              border-bottom: 2px solid #e0e0e0;
              display: flex;
              justify-content: flex-end;
              align-items: center;
              gap: 15px;
              z-index: 1000;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .editor-controls {
              display: flex;
              gap: 10px;
              align-items: center;
            }
            .note-section {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              background: #e7f3ff;
              border: 1px solid #b6d7ff;
              border-radius: 6px;
              margin: auto;
            }
            .note-text {
              font-size: 15px;
              color: #0066cc;
              font-weight: 500;
            }
            .info-icon {
              color: #0066cc;
              font-size: 16px;
              flex-shrink: 0;
            }
            .editor-btn {
              padding: 10px 20px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.3s ease;
            }
            .download-btn {
              background: #0A5840;
              border-radius: 30px !important;
              border: 3px solid #0A5840 !important;
              font-size: 1.118em !important; 
              padding: 10px 25px !important;
              text-decoration: none;
              transition: ease 0.3s;
              color: #fff !important;
            }
            .download-btn:hover {
              background: #0A5840;
            }
            .save-btn {
              background: #0A5840;
              border-radius: 30px !important;
              border: 3px solid #0A5840 !important;
              font-size: 1.118em !important; 
              padding: 10px 25px !important;
              text-decoration: none;
              transition: ease 0.3s;
              color: #fff !important;
            }
            .save-btn:hover {
              background: #0A5840;
            }
            .edit-btn {
              background: transparent !important;
              padding: 10px 25px !important;
              border-radius: 30px !important;
              border: 0 !important;
              font-size: 16px !important; 
              color: #0A5840 !important;
              border: 2px solid #0A5840 !important;
              font-weight: 400 !important;
              transition: ease 0.3s;
            }
            .edit-btn:hover {
              background: #fff;
            }
            .resume-content {
              margin-top: 80px;
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              min-height: calc(100vh - 100px);
            }
            .editable {
              outline: 2px dashed transparent;
              transition: outline-color 0.3s ease;
              padding: 2px 4px;
              margin: -2px -4px;
              border-radius: 3px;
            }
            .editable:hover {
              outline-color: #007bff;
            }
            .editable:focus {
              outline: 2px dashed #007bff;
            }
            .edit-mode .editable {
              outline: 2px dashed #007bff;
            }

            .resume-content .drag-handle {
              display: none !important;
            }
            @media print {
              .editor-header {
                display: none !important;
              }
              .resume-content {
                margin-top: 0;
                box-shadow: none;
                padding: 0;
              }
              body {
                background: white;
                padding: 0;
              }
            }
          </style>
      </head>
      <body>
        <div class="editor-header">
          <div class="editor-controls">
            <button class="editor-btn download-btn" onclick="downloadAsPDF()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Download PDF
            </button>
          </div>
        </div>
        
        <div class="resume-content" id="resumeContent">
          <!-- Content will be loaded from localStorage -->
        </div>
  
        <script>
          const resumeStorageKey = '${resumeStorageKey}';
          
          function loadResumeContent() {
            const savedContent = getFromLocalStorage(resumeStorageKey);
            if (savedContent) {
              document.getElementById('resumeContent').innerHTML = savedContent;
            } else {
              document.getElementById('resumeContent').innerHTML = '<p>Error: Resume content not found. Please close this window and try again.</p>';
            }
          }
          
          document.addEventListener('DOMContentLoaded', loadResumeContent);
          
          let isEditMode = false;
          let originalContent = '';
          
          function toggleEditMode() {
            const resumeContent = document.getElementById('resumeContent');
            const editBtn = document.querySelector('.edit-btn');
            const saveBtn = document.querySelector('.save-btn');
            
            if (!isEditMode) {
              originalContent = resumeContent.innerHTML;
              resumeContent.classList.add('edit-mode');
              makeContentEditable();
              editBtn.style.display = 'none';
              saveBtn.style.display = 'flex';
              isEditMode = true;
            } else {
              resumeContent.classList.remove('edit-mode');
              makeContentNonEditable();
              editBtn.style.display = 'flex';
              saveBtn.style.display = 'none';
              isEditMode = false;
            }
          }
          
          function makeContentEditable() {
            const editableElements = document.querySelectorAll('#resumeContent h1, #resumeContent h2, #resumeContent h3, #resumeContent p, #resumeContent li, #resumeContent td, #resumeContent span');
            editableElements.forEach(element => {
              element.setAttribute('contenteditable', 'true');
              if (!element.classList.contains('editable')) {
                element.classList.add('editable');
              }
            });
          }
          
          function makeContentNonEditable() {
            const editableElements = document.querySelectorAll('#resumeContent [contenteditable="true"]');
            editableElements.forEach(element => {
              element.removeAttribute('contenteditable');
              element.classList.remove('editable');
            });
          }
          
          function saveEdits() {
            const resumeContent = document.getElementById('resumeContent');
           setToLocalStorage(resumeStorageKey, resumeContent.innerHTML);
            alert('Your changes have been saved!');
            toggleEditMode();
          }
          
          function downloadAsPDF() {
            const resumeContent = document.getElementById('resumeContent').innerHTML;
            setToLocalStorage(resumeStorageKey, resumeContent);
            window.print();
          }
          
          document.addEventListener('click', function(e) {
            if (isEditMode && e.target.closest('.editable')) {
              e.target.focus();
            }
          });
          
          window.addEventListener('beforeunload', function() {
            setTimeout(() => {
              localStorage.removeItem(resumeStorageKey);
            }, 1000);
          });
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(editableHTML);
    printWindow.document.close();
    printWindow.focus();

    return printWindow;
  };

  const handleDownloadEditedPDF = async () => {
    setIsDownloadingEdited(true);

    try {
      const printWindow = createEditableResumeWindow();
      console.log("Resume editor opened in new window");
      setShowPDFDialog(false);
    } catch (error) {
      console.error('Error opening resume editor:', error);
      // handleDownloadEditedResume(); // Uncomment if you have this function
    } finally {
      setIsDownloadingEdited(false);
    }
  };

  const iframeWidth = 8.5 * (scale / 100);
  const iframeHeight = 11 * (scale / 100);
  const showBut = isSmallScreen ? "prim-but" : "sec-but2";

  return (
    <>
      <div className="resume-generated-container templates">
        {validationError && (
          <div className="alert alert-danger mb-3" role="alert">
            <strong>Error:</strong> {validationError}
          </div>
        )}
        
        {isEditing && (
          <div className="alert alert-info mb-3" role="alert">
            <strong>Edit Mode:</strong> <small>Click on any text in the resume to edit it.</small>
            <small> Use the "Download PDF" button to get a printable PDF version of your edited resume.</small>
            <small> <br/><ul><li>Use = icon to drag the section</li>
            <li>= icon will be removed in Downloaded PDF file</li>
            </ul></small>
          </div>
        )}
        
        <div className='d-flex justify-content-between align-items-center pt-1 pb-4'
          style={{
            position: 'relative',
            zIndex: 20,
            pointerEvents: 'auto'
          }}>

          <div className="d-flex justify-content-between w-100">
            {renderButtons()}

            {isEditing && token && (
              <button
                className={`${showBut}`}
                onClick={handleDownloadEditedPDF}
                disabled={isDownloadingEdited}
                style={{
                  minHeight: '44px',
                  fontSize: isIOS ? '16px' : 'inherit',
                }}
              >
                {isDownloadingEdited ? 'Opening Editor...' : 'Download PDF'}
              </button>
            )}
          </div>
        </div>

        <div className="resume-preview-wrapper">
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
                height: `${iframeHeight}in`,
                width: `${iframeWidth}in`,
                minHeight: `${iframeHeight}in`,
                minWidth: `${iframeWidth}in`,
                opacity: isTransitioning ? 0.7 : 1,
                transition: 'opacity 0.3s ease-in-out',
                cursor: isEditing ? 'text' : 'default'
              }}
            />
            <div className="page-shadow"></div>
          </div>
        </div>
      </div>

      <CustomModal show={LoginModal} onHide={() => setLoginModal(false)} custom='LoginModal' title="">
        <Login close={() => setLoginModal(false)} />
      </CustomModal>
    </>
  );
};

export default ResumeGenerated;