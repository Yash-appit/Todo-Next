"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LuDot } from "react-icons/lu";
import ToastMessage from '@/Layout/ToastMessage';

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

const Finalize: React.FC = () => {
  const router = useRouter();
  const [resumeContent, setResumeContent] = useState<string>('');
  const [resumeName, setResumeName] = useState<string>('Untitled');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [isGeneratingDOC, setIsGeneratingDOC] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(100);
  const [showBut, setShowBut] = useState<string>('');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageHeightRef = useRef<number>(11 * 96); // 11 inches in pixels

  useEffect(() => {
    // Check if we have resume data
    if (typeof window !== 'undefined') {
      // Try to get from URL params first
      const urlParams = new URLSearchParams(window.location.search);
      const resumeKey = urlParams.get('resumeKey');
      
      let savedContent = '';
      let savedName = 'Untitled';
      
      if (resumeKey) {
        savedContent = getFromLocalStorage(resumeKey) || '';
        savedName = getFromLocalStorage('resumeName') || 'Untitled';
      } else {
        // Fallback to localStorage
        savedContent = getFromLocalStorage('finalizeResume') || getFromLocalStorage('resumeData') || '';
        savedName = getFromLocalStorage('resumeName') || 'Untitled';
      }
      
      if (savedContent) {
        setResumeContent(savedContent);
        setResumeName(savedName);
        setOriginalContent(savedContent);
        
        // Save to a consistent key for this session
        setToLocalStorage('finalizeResume', savedContent);
      } else {
        ToastMessage({
          type: "error",
          message: "No resume data found. Please create a resume first.",
        });
        router.push('/create-resume');
      }
    }
  }, [router]);

  // Responsive scaling
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
      return /iPad|iPhone|iPod/.test(navigator.userAgent);
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const isIOSDevice = detectIOS();
      setIsSmallScreen(width < 1200);
      setIsIOS(isIOSDevice);

      // Calculate scale based on current width and device type
      const newScale = getScaleBasedOnWidth(width, isIOSDevice);
      setScale(newScale);
      
      // Update button class
      setShowBut(isSmallScreen ? "prim-but" : "sec-but2");
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

  // Update iframe content
  const updateResumeContent = useCallback(() => {
    if (!iframeRef.current || !resumeContent) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!doc) return;

    const scrollTop = iframe.contentWindow?.scrollY || 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = resumeContent;

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
      ${isEditMode ? `
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
         
          ${!isEditMode ? `
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
        body.style.background = 'white';

        if (isIOS) {
          body.style.webkitTransform = `scale(${scale / 100})`;
          body.style.webkitTransformOrigin = 'top left';
        }

        // Make content editable when in edit mode
        if (isEditMode) {
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
  }, [resumeContent, isEditMode, scale, isIOS]);

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
      setResumeContent(updatedContent);
    }
  };

  const addPageBreaks = (doc: Document) => {
    if (!doc.body) return;

    const existingBreaks = doc.querySelectorAll('.page-break');
    existingBreaks.forEach(br => br.remove());

    const pageHeight = pageHeightRef.current;
    const bodyHeight = doc.body.scrollHeight;

    doc.body.style.minHeight = `${pageHeight}px`;

    for (let i = 1; i < Math.ceil(bodyHeight / pageHeight); i++) {
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
  };

  // Initialize iframe content
  useEffect(() => {
    if (resumeContent && iframeRef.current) {
      setIsLoading(true);
      updateResumeContent();
    }
  }, [resumeContent, updateResumeContent]);

  const toggleEditMode = (): void => {
    if (!isEditMode) {
      setOriginalContent(resumeContent);
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  };

  const saveEdits = (): void => {
    updateEditedResume();
    
    if (typeof window !== 'undefined') {
      setToLocalStorage('finalizeResume', resumeContent);
    }

    alert('Your changes have been saved!');
    setIsEditMode(false);
  };

  const resetEdits = (): void => {
    setResumeContent(originalContent);
    setIsEditMode(false);
  };

  const close = (): void => {
    router.push('/create-resume');
  };

  const downloadAsPDF = async () => {
    if (!iframeRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      const element = iframeRef.current;
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        // Get content from iframe
        const iframeDoc = element.contentDocument || element.contentWindow?.document;
        const content = iframeDoc?.documentElement.outerHTML || '';
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${resumeName}</title>
            <style>
              @media print {
                body {
                display: flex;
                justify-content:center;
                  width: 8.5in;
                  margin: 0 auto;
                  padding: 0;
                  font-size: 12pt !important;
                  transform: none !important;
                  background: white !important;
                }
                * {
                  word-wrap: break-word !important;
                  max-width: 100% !important;
                  font-size: inherit !important;
                }
                h1 { font-size: 24pt !important; }
                h2 { font-size: 18pt !important; }
                h3 { font-size: 14pt !important; }
                p, li, td { font-size: 12pt !important; }
                @page {
                  margin: 0.5in;
                  size: letter;
                }
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
          </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load
        
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 0);
      
      }
      
    } catch (error) {
      console.error('Error with print method:', error);
      alert('Please use Ctrl+P to print your resume as PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const downloadRawHTMLasDOC = async () => {
    if (!resumeContent) return;
    setIsGeneratingDOC(true);
  
    try {
      const PAGE_GAP = 20;
      
      // Create a temporary iframe to get cleaned content
      const tempIframe = document.createElement('iframe');
      tempIframe.style.display = 'none';
      document.body.appendChild(tempIframe);
      
      const tempDoc = tempIframe.contentDocument || tempIframe.contentWindow?.document;
      if (!tempDoc) throw new Error('Could not create document');
      
      tempDoc.open();
      tempDoc.write(resumeContent);
      tempDoc.close();
      
      // Remove any drag handles and edit elements
      const dragHandles = tempDoc.querySelectorAll('.drag-handle, .section[data-draggable="true"]::before');
      dragHandles.forEach(handle => handle.remove());
      
      // Remove edit mode styles
      tempDoc.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.removeAttribute('contenteditable');
      });
      
      const cleanedContent = tempDoc.documentElement.outerHTML;
      document.body.removeChild(tempIframe);
      
      // Remove any color styles from resumeContent
      const normalizedContent = cleanedContent
        .replace(/color:\s*[^;"]*;/gi, '')
        .replace(/color:\s*[^;"]*/gi, '')
        .replace(/style="([^"]*color[^"]*)"/gi, '')
        .replace(/<font[^>]*>/gi, '')
        .replace(/<\/font>/gi, '');
  
      const docStr = `
        <!DOCTYPE html>
        <html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:w="urn:schemas-microsoft-com:office:word">
        <head>
          <meta charset="utf-8"/>
          <title>${resumeName}</title>
    
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
            </w:WordDocument>
          </xml>
          <![endif]-->
    
          <style>
            @page { 
              size: 8.5in 11in; 
              margin: 0.5in 0.5in;
            }
            * {
              color: #000000 !important;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 0;
              line-height: 1.5;
            }
            .center-table {
              width: 100%;
              border-collapse: inherit;
              margin-top: 0;
            }
            .content-cell {
              width: 7.5in;
              padding: 0;
              vertical-align: top;
            }
            table {
              border-collapse: inherit;
              width: -webkit-fill-available;
            }
            p {
              margin: 0.08in 0;
            }
            h1, h2, h3, h4, h5, h6 {
              margin: 0.2in 0 0.08in 0;
            }
            h1:first-child, h2:first-child, h3:first-child {
              margin-top: 0;
            }
            div {
              margin-bottom: 0.12in;
            }
          </style>
        </head>
    
        <body>
          <table class="center-table" align="center">
            <tr>
              <td class="content-cell">
                ${normalizedContent}
              </td>
            </tr>
          </table>
          <div style="height:${PAGE_GAP}px;"></div>
        </body>
        </html>
      `;
    
      const blob = new Blob(['\uFEFF' + docStr], {
        type: 'application/msword;charset=utf-8',
      });
    
      const fileName = `${resumeName.replace(/\s+/g, '_')}.doc`;
      
      // Using a simple download approach
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating DOC:', error);
      ToastMessage({
        type: "error",
        message: "Error generating DOC file. Please try again.",
      });
    } finally {
      setIsGeneratingDOC(false);
    }
  };

  const iframeWidth = 8.5 * (scale / 100);
  const iframeHeight = 11 * (scale / 100);

  return (
    <div className="finalize-container" ref={containerRef}>
      <div className="editor-header">
        <div className="header-left">
          <h1>{resumeName} - Final Preview</h1>
          <p className="header-subtitle">Review and download your resume</p>
        </div>
        <div className="editor-controls">
          {isEditMode ? (
            <>
              <button className="editor-btn save-btn" onClick={saveEdits}>
                Save Changes
              </button>
              <button className="editor-btn cancel-btn" onClick={resetEdits}>
                Cancel
              </button>
            </>
          ) : (
            <button className="editor-btn edit-btn" onClick={toggleEditMode}>
              <span className="btn-icon">✏️</span>
              Edit Resume
            </button>
          )}

          {!isEditMode && (
            <div className="download-options">
              <button
                className={`editor-btn download-btn pdf-btn ${isGeneratingPDF ? 'loading' : ''}`}
                onClick={downloadAsPDF}
                disabled={isGeneratingPDF || isGeneratingDOC}
                style={{
                  minHeight: '44px',
                  fontSize: isIOS ? '16px' : 'inherit',
                }}
              >
                {isGeneratingPDF ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">📄</span>
                    Download PDF
                  </>
                )}
              </button>
              <button
                className={`editor-btn download-btn doc-btn ${isGeneratingDOC ? 'loading' : ''}`}
                onClick={downloadRawHTMLasDOC}
                disabled={isGeneratingPDF || isGeneratingDOC}
                style={{
                  minHeight: '44px',
                  fontSize: isIOS ? '16px' : 'inherit',
                }}
              >
                {isGeneratingDOC ? (
                  <div className='generating'>
                    <span className="spinner"></span>
                    Generating...
                  </div>
                ) : (
                  <div className='generating'>
                    <span className="btn-icon">📝</span>
                    Download DOC
                  </div>
                )}
              </button>
            </div>
          )}
          <button 
            className="editor-btn back-btn" 
            onClick={close}
            style={{
              minHeight: '44px',
              fontSize: isIOS ? '16px' : 'inherit',
            }}
          >
            <span className="btn-icon">←</span>
            Go Back
          </button>
        </div>
      </div>

      <div className="main-content-wrapper">
        {isEditMode && (
          <div className="edit-tips-sidebar">
            <div className="edit-tips">
              <h3>✏️ Edit Mode Tips</h3>
              <div className="tips-grid">
                <div className="tip-item">
                  <div className="tip-icon"><LuDot /></div>
                  <div className="tip-content">
                    <strong>Edit Text</strong>
                    <p>Click on any text to edit it directly</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon"><LuDot /></div>
                  <div className="tip-content">
                    <strong>Save Changes</strong>
                    <p>Click &quot;Save Changes&quot; when done editing</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon"><LuDot /></div>
                  <div className="tip-content">
                    <strong>Cancel</strong>
                    <p>Click &quot;Cancel&quot; to discard all changes</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon"><LuDot /></div>
                  <div className="tip-content">
                    <strong>Download</strong>
                    <p>Exit edit mode to download PDF or DOC</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`resume-preview-container ${isEditMode ? 'with-sidebar' : ''}`}>
          <div className="resume-preview-controls">
            <div className="preview-info">
              <span className="info-badge">
                {isEditMode ? 'Edit Mode' : 'Preview Mode'}
              </span>
              <span className="page-size">US Letter (8.5&quot; × 11&quot;)</span>
            </div>
          </div>
          
          <div className="resume-preview-wrapper">
            {isLoading && (
              <div className="loading-overlay">
                <div className="spinner" />
                <span>Loading resume...</span>
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
                  cursor: isEditMode ? 'text' : 'default'
                }}
              />
              <div className="page-shadow"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .finalize-container {
          padding: ${isIOS ? '10px' : '20px'};
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
          min-height: 100vh;
          -webkit-overflow-scrolling: touch;
        }

        .editor-header {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .header-left h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 24px;
          font-weight: 600;
        }

        .header-subtitle {
          margin: 5px 0 0;
          color: #666;
          font-size: 14px;
        }

        .editor-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .download-options {
          display: flex;
          gap: 10px;
          margin-right: 10px;
        }

        .editor-btn {
          padding: 10px 20px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 2px solid transparent;
          white-space: nowrap;
        }

        .editor-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .editor-btn.loading {
          opacity: 0.8;
        }

        .btn-icon {
          font-size: 16px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .edit-btn {
          background: transparent;
          border-color: #0A5840;
          color: #0A5840;
        }

        .edit-btn:hover:not(:disabled) {
          background: rgba(10, 88, 64, 0.1);
        }

        .generating {
          height: 25px;
        }

        .save-btn {
          background: #0A5840;
          color: white;
          border-color: #0A5840;
        }

        .save-btn:hover:not(:disabled) {
          background: #08865e;
          border-color: #08865e;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
          border-color: #6c757d;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #545b62;
          border-color: #545b62;
        }

        .download-btn {
          color: white;
          border: none;
          height: 40px;
        }

        .pdf-btn {
          background: linear-gradient(135deg, #0A5840, #0c6e50);
          height: 40px;
        }

        .pdf-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #08865e, #0a8c65);
        }

        .doc-btn {
          background: linear-gradient(135deg, #2c5899, #3a6bc5);
          height: 40px;
        }

        .doc-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1e4a8a, #2c5cb8);
        }

        .back-btn {
          background: #6c757d;
          color: white;
          border-color: #6c757d;
        }

        .back-btn:hover:not(:disabled) {
          background: #545b62;
          border-color: #545b62;
        }

        .main-content-wrapper {
          display: flex;
          gap: 20px;
        }

        .edit-tips-sidebar {
          flex: 0 0 280px;
        }

        .edit-tips {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 20px;
        }

        .edit-tips h3 {
          text-align: center;
          background: linear-gradient(90deg, #0A5840, #0c6e50);
          color: white;
          padding: 12px;
          margin: -20px -20px 20px;
          border-radius: 12px 12px 0 0;
          font-size: 16px;
          font-weight: 600;
        }

        .tips-grid {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .tip-item {
          display: flex;
          gap: 12px;
          padding: 8px;
          border-radius: 8px;
          transition: background-color 0.3s ease;
        }

        .tip-item:hover {
          background-color: #f8f9fa;
        }

        .tip-icon {
          flex-shrink: 0;
          color: #0A5840;
          font-size: 20px;
          margin-top: 2px;
        }

        .tip-content strong {
          display: block;
          color: #2c3e50;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .tip-content p {
          color: #666;
          font-size: 12px;
          margin: 0;
          line-height: 1.4;
        }

        .resume-preview-container {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .resume-preview-container.with-sidebar {
          max-width: calc(100% - 300px);
        }

        .resume-preview-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 15px 20px;
          border-radius: 12px 12px 0 0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 0;
        }

        .preview-info {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .info-badge {
          background: #e3f2fd;
          color: #1976d2;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .page-size {
          color: #666;
          font-size: 12px;
          padding: 4px 8px;
          background: #f8f9fa;
          border-radius: 4px;
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
          min-height: ${iframeHeight}in;
          position: relative;
          background: white;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .page-container {
          position: relative;
          height: ${iframeHeight}in;
          width: ${iframeWidth}in;
          min-height: ${iframeHeight}in;
          min-width: ${iframeWidth}in;
          margin: ${isSmallScreen ? '0 auto' : '0'};
        }

        .resume-preview-iframe {
          border: none;
          background-color: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          overflow: hidden;
          min-height: ${iframeHeight}in;
          min-width: ${iframeWidth}in;
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

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 10;
          border-radius: 4px;
          gap: 10px;
        }

        /* Edit mode styles */
        .edit-mode [contenteditable="true"] {
          outline: 1px dashed rgba(0, 123, 255, 0.3);
          padding: 2px 4px;
          margin: -2px -4px;
          border-radius: 3px;
          transition: outline-color 0.2s ease;
          min-height: 1em;
        }

        .edit-mode [contenteditable="true"]:hover {
          outline: 1px dashed rgba(0, 123, 255, 0.6);
          background-color: rgba(0, 123, 255, 0.05);
        }

        .edit-mode [contenteditable="true"]:focus {
          outline: 2px solid #007bff;
          background-color: rgba(0, 123, 255, 0.08);
        }

        /* Mobile Responsive Styles */
        @media (max-width: 1200px) {
          .main-content-wrapper {
            flex-direction: column;
          }
          
          .edit-tips-sidebar {
            flex: 0 0 auto;
            width: 100%;
            position: static;
            margin-bottom: 20px;
          }
          
          .resume-preview-container.with-sidebar {
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .finalize-container {
            padding: 10px;
          }
          
          .editor-header {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }
          
          .editor-controls {
            flex-direction: column;
            align-items: stretch;
            flex-direction: column-reverse;
          }
          
          .download-options {
            justify-content: space-between;
            margin-right: 0;
            gap: 8px;
          }
          
          .header-left h1 {
            font-size: 20px;
          }
          
          .resume-preview-wrapper {
            padding: 0 10px;
          }
          
          .resume-preview-controls {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
          
          .edit-tips h3 {
            font-size: 14px;
            padding: 10px;
          }
        }

        @media screen and (max-width: 428px) and (-webkit-min-device-pixel-ratio: 2) {
          .finalize-container {
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

        @media screen and (min-width: 768px) and (max-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) {
          .resume-preview-wrapper {
            padding: 0 15px;
          }
        }

        input, select, textarea, button {
          font-size: ${isIOS ? '16px' : 'inherit'} !important;
        }

        .editor-btn, .dropdown-toggle {
          min-height: 44px !important;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        /* Print styles */
        @media print {
          .editor-header,
          .edit-tips-sidebar,
          .resume-preview-controls {
            display: none !important;
          }
          
          .finalize-container {
            padding: 0;
            background: white;
            transform: none !important;
          }
          
          .resume-preview-wrapper {
            box-shadow: none;
            padding: 0;
            border-radius: 0;
          }
          
          .resume-preview-iframe {
            box-shadow: none;
            border: none;
          }
          
          .edit-mode [contenteditable="true"] {
            outline: none !important;
            background: transparent !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Finalize;