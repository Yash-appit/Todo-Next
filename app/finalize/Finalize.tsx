"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LuDot } from "react-icons/lu";
import { saveAs } from 'file-saver';


interface ElementStyles {
  [key: string]: string;
}


const getFromLocalStorage = (key: string): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
    }
    return null;
};

const Finalize: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [resumeContent, setResumeContent] = useState<string>('');
  const [resumeName, setResumeName] = useState<string>(getFromLocalStorage('resumeName') || 'Untitled');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [isGeneratingDOC, setIsGeneratingDOC] = useState<boolean>(false);
  const resumeContentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resumeKey = searchParams.get('resumeKey');
    const resumeNameParam = searchParams.get('resumeName');

    if (resumeKey) {
      // Try to get content from localStorage using the key from URL
      const savedContent = getFromLocalStorage(resumeKey) || '';

      if (savedContent) {
        setResumeContent(savedContent);
        setResumeName(resumeNameParam || getFromLocalStorage('resumeName') || 'Untitled');
        setOriginalContent(savedContent);
      } else {
        // Fallback or handle missing content
        const savedContentBackup = getFromLocalStorage('resumeData') || '';
        if (savedContentBackup) {
          setResumeContent(savedContentBackup);
          setResumeName(getFromLocalStorage('resumeName') || 'Untitled');
          setOriginalContent(savedContentBackup);
        }
      }
    } else {
      // If no key in URL, try to get from localStorage (legacy/fallback behavior)
      const savedContent = getFromLocalStorage('resumeData') || '';
      if (savedContent) {
        setResumeContent(savedContent);
        setResumeName(getFromLocalStorage('resumeName') || 'Untitled');
        setOriginalContent(savedContent);
      } else {
        router.push('/');
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (isEditMode && resumeContentRef.current) {
      initializeDragAndDrop();
    }
  }, [resumeContent, isEditMode]);

  const initializeDragAndDrop = (): void => {
    const draggableSections = resumeContentRef.current?.querySelectorAll('.section[data-draggable="true"]');
    let draggedItem: Element | null = null;

    if (!draggableSections) return;

    draggableSections.forEach((section) => {
      section.setAttribute('draggable', 'true');

      const newSection = section.cloneNode(true);
      section.parentNode?.replaceChild(newSection, section);

      newSection.addEventListener('dragstart', function (this: HTMLElement, e: Event) {
        draggedItem = this;
        setTimeout(() => {
          this.classList.add('dragging');
        }, 0);
      });

      newSection.addEventListener('dragend', function (this: HTMLElement) {
        this.classList.remove('dragging');
        draggedItem = null;

        draggableSections.forEach(item => {
          item.classList.remove('drag-over');
        });

        updateResumeContentAfterDrag();
      });

      newSection.addEventListener('dragover', function (e: Event) {
        e.preventDefault();
      });

      newSection.addEventListener('dragenter', function (this: HTMLElement, e: Event) {
        e.preventDefault();
        if (this !== draggedItem) {
          this.classList.add('drag-over');
        }
      });

      newSection.addEventListener('dragleave', function (this: HTMLElement) {
        this.classList.remove('drag-over');
      });

      newSection.addEventListener('drop', function (this: HTMLElement, e: Event) {
        e.preventDefault();
        this.classList.remove('drag-over');

        if (draggedItem && this !== draggedItem) {
          const allSections = Array.from(document.querySelectorAll('.section[data-draggable="true"]'));
          const thisIndex = allSections.indexOf(this);
          const draggedIndex = allSections.indexOf(draggedItem);

          if (draggedIndex < thisIndex) {
            this.parentNode?.insertBefore(draggedItem, this.nextSibling);
          } else {
            this.parentNode?.insertBefore(draggedItem, this);
          }
        }
      });
    });
  };

  const updateResumeContentAfterDrag = (): void => {
    if (resumeContentRef.current) {
      const updatedHTML = resumeContentRef.current.innerHTML;
      setResumeContent(updatedHTML);
    }
  };

  const toggleEditMode = (): void => {
    if (!isEditMode) {
      setOriginalContent(resumeContent);
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  };

  const saveEdits = (): void => {
    const currentContent = resumeContentRef.current?.innerHTML || resumeContent;
    const resumeKey = searchParams.get('resumeKey');
    if (resumeKey) {
      localStorage.setItem(resumeKey, currentContent);
    }

    setResumeContent(currentContent);
    alert('Your changes have been saved!');
    setIsEditMode(false);
  };

  const resetEdits = (): void => {
    setResumeContent(originalContent);
    setIsEditMode(false);
  };

  const close = (): void => {
    const resumeKey = searchParams.get('resumeKey');
    if (resumeKey) {
      const currentContent = resumeContentRef.current?.innerHTML || resumeContent;
      localStorage.setItem(resumeKey, currentContent);
    }
    router.push('/create-resume');
  };

  // Enhanced PDF Generation
  // Alternative: Fixed DPI approach
  const downloadAsPDF = async () => {
    if (!resumeContentRef.current) return;

    setIsGeneratingPDF(true);

    try {
      const element = resumeContentRef.current;
      const printWindow = window.open('', '_blank');

      if (printWindow) {
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${resumeName}</title>
          <style>
            @media print {
              body {
                width: 8.5in;
                margin: 0 auto;
                padding: 0;
                font-size: 12pt !important;
                transform: none !important;
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
                margin: 15px;
                size: letter;
              }
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
        </html>
      `);

        printWindow.document.close();
        printWindow.focus();

        // Wait for content to load
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 200);
      }

    } catch (error) {
      console.error('Error with print method:', error);
      alert('Please use Ctrl+P to print your resume as PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };


  const downloadRawHTMLasDOC = () => {
    if (!resumeContent) return;

    const PAGE_GAP = 20;

    // Option 1: Remove any color styles from resumeContent
    const normalizedContent = resumeContent
      .replace(/color:\s*[^;"]*;/gi, '') // Remove color styles
      .replace(/color:\s*[^;"]*/gi, '') // Remove color without semicolon
      .replace(/style="([^"]*color[^"]*)"/gi, '') // Remove styles with color
      .replace(/<font[^>]*>/gi, '') // Remove font tags if any
      .replace(/<\/font>/gi, '');

    // Option 2: Or force black color by adding style attributes
    const forcedBlackContent = resumeContent
      .replace(/(<[^>]+)(style="[^"]*")/gi, (match, tag, style) => {
        return `${tag}style="${style}; color: #000000 !important;"`;
      })
      .replace(/(<[^>]+)(?!style)/gi, (match, tag) => {
        // Add style to elements without style attribute
        if (tag.match(/<(p|h[1-6]|div|span|li|td|th)/i)) {
          return `${tag} style="color: #000000;"`;
        }
        return match;
      });

    // Use either normalizedContent or forcedBlackContent in your template
    const contentToUse = normalizedContent; // or forcedBlackContent

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
            <w:AutoHyphenation/>
          </w:WordDocument>
        </xml>
        <![endif]-->
  
        <style>
          @page { 
            size: 8.5in 11in; 
            margin: 0.5in 0.5in;
          }
          * {
            color: #000000 !important; /* Force black on ALL elements */
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
              ${contentToUse}
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
    saveAs(blob, fileName);
  };


  const makeContentEditable = (): void => {
    const editableElements = resumeContentRef.current?.querySelectorAll('h1, h2, h3, p, li, td, span, .editable');
    editableElements?.forEach(element => {
      element.setAttribute('contenteditable', 'true');
    });
  };

  const makeContentNonEditable = (): void => {
    const editableElements = resumeContentRef.current?.querySelectorAll('[contenteditable="true"]');
    editableElements?.forEach(element => {
      element.removeAttribute('contenteditable');
    });
  };

  useEffect(() => {
    if (isEditMode) {
      makeContentEditable();
      setTimeout(() => {
        initializeDragAndDrop();
      }, 100);
    } else {
      makeContentNonEditable();
    }
  }, [isEditMode]);

  return (<>
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
          <button className="editor-btn back-btn" onClick={close}>
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
                    <strong>Reorder Sections</strong>
                    <p>Drag the handle (⋮⋮) to reorder sections</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon"><LuDot /></div>
                  <div className="tip-content">
                    <strong>Save Changes</strong>
                    <p>Click "Save Changes" when done editing</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon"><LuDot /></div>
                  <div className="tip-content">
                    <strong>Cancel</strong>
                    <p>Click "Cancel" to discard all changes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`resume-preview-container ${isEditMode ? 'with-sidebar' : ''}`}>
          <div className="resume-paper">
            <div
              ref={resumeContentRef}
              id="resumeContent"
              className={`resume-content ${isEditMode ? 'edit-mode' : ''}`}
              dangerouslySetInnerHTML={{ __html: resumeContent }}
            />
          </div>
        </div>
      </div>

      <style>{`
        // :root {
        //   --zoom-level: 1;
        // }
        
        .finalize-container {
          padding: 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
          min-height: 100vh;
          // transform: scale(var(--zoom-level));
          transform-origin: top center;
        }

        .finalize-container table {
            border-collapse: inherit;
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

        .generating{
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

         .main-content{
         display: block;
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

        .resume-paper {
          background: white;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          overflow: auto;
          min-height: calc(100vh - 200px);
        }

        .resume-content {
          max-width: 8.5in;
          min-height: 11in;
          margin: 0 auto;
          background: white;
          padding: 20px;
          box-sizing: border-box;
          position: relative;
        }

        .resume {
        height: auto;
        }

        /* Edit mode styles */
        .section[data-draggable="true"] {
          position: relative;
          transition: all 0.3s ease;
          padding: 8px;
          border-radius: 4px;
        }

        .section[data-draggable="true"]::before {
          content: '⋮⋮';
          position: absolute;
          left: -25px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          font-size: 18px;
          cursor: move;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 10;
        }

        .edit-mode .section[data-draggable="true"]::before {
          opacity: 1;
        }

        .section[data-draggable="true"].dragging {
          opacity: 0.5;
          background: rgba(0, 123, 255, 0.1);
          border: 2px dashed #007bff;
        }

        .section[data-draggable="true"].drag-over {
          border: 2px dashed #0A5840;
          background-color: rgba(10, 88, 64, 0.05);
        }

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
          
          .resume-content {
            padding: 20px;
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
          
          .resume-paper {
            padding: 10px 0;
          }
          
          .resume-content {
            padding: 0;
            min-height: auto;
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

        @media (max-width: 480px) {
          .editor-btn {
            padding: 8px 16px;
            font-size: 13px;
          }
          
          .btn-icon {
            font-size: 14px;
          }
          
          .zoom-controls {
            width: 100%;
            justify-content: center;
          }
          
          .preview-info {
            width: 100%;
            justify-content: space-between;
          }
          
          .resume-content {
            padding: 10px;
          }
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
          
          .resume-paper {
            box-shadow: none;
            padding: 0;
            border-radius: 0;
          }
          
          .resume-content {
            padding: 0.5in;
            margin: 0;
            box-shadow: none;
          }
          
          .section[data-draggable="true"]::before {
            display: none;
          }
          
          .edit-mode [contenteditable="true"] {
            outline: none !important;
            background: transparent !important;
          }
            .resume {
            height: auto;
            }
        }
      `}</style>
    </div>
  </>);
};

export default Finalize;