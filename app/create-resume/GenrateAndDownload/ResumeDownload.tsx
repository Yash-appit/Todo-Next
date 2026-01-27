import React, { useState } from 'react';
import { DownloadResume, resumeShareableLink } from "@/services/resume/Index";
import ToastMessage from '@/Layout/ToastMessage';
import CustomModal from '@/components/Modal/Modal';
import PackagePop from '@/components/PackagePop';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { IoCopy, IoClose } from "react-icons/io5";
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { MdKeyboardArrowDown } from "react-icons/md";
import { Spinner } from 'react-bootstrap';
import pdf from "@/assets/Images/resume-builder/pdf.svg";
import down from "@/assets/Images/resume-builder/download.svg";
import Image from 'next/image';

interface DownloadResumeModalProps {
  show: boolean;
  onHide: () => void;
  onDownloadStart?: () => void;
  onDownloadEnd?: () => void;
  GeneratedResume: any;
}

const ResumeDownload = ({
  show,
  onHide,
  onDownloadStart,
  GeneratedResume,
  onDownloadEnd
}: DownloadResumeModalProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isForgetOpen, setForgetOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
    if (panel === 'share' && isExpanded && !shareableLink) {
      fetchShareableLink();
    }
  };

  const closeDownload = () => {
    onHide();
    setExpanded(false);
    setShareableLink('');
  };

  const fetchShareableLink = async () => {
    const resumeId = sessionStorage.getItem("ResumeId") || localStorage.getItem("resumeId") || "";
    setIsLinkLoading(true);
    try {
      const param = {
        resume_id: resumeId.toString(),
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


  const createEditableResumeWindow = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    const ResumeName = localStorage.getItem('resumeName') || 'Untitled';

    // Create HTML with editing controls and styling
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
              overflow: scroll;
            }
              .resume {
              width: 600px;}

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
          <div class="note-section">
            <svg class="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span class="note-text">Note: You can reorder sections by Drag them.</span>
          </div>
          <div class="editor-controls">
            <button class="editor-btn edit-btn" onclick="toggleEditMode()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              Edit
            </button>
            <button class="editor-btn save-btn" onclick="saveEdits()" style="display: none;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
              </svg>
              Save
            </button>
            <button class="editor-btn download-btn" onclick="downloadAsPDF()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              PDF
            </button>
          </div>
        </div>
        
        <div class="resume-content" id="resumeContent">
          ${GeneratedResume}
        </div>

        <script>
          let isEditMode = false;
          let originalContent = '';
          
          function toggleEditMode() {
            const resumeContent = document.getElementById('resumeContent');
            const editBtn = document.querySelector('.edit-btn');
            const saveBtn = document.querySelector('.save-btn');
            
            if (!isEditMode) {
              // Enter edit mode
              originalContent = resumeContent.innerHTML;
              resumeContent.classList.add('edit-mode');
              makeContentEditable();
              editBtn.style.display = 'none';
              saveBtn.style.display = 'flex';
              isEditMode = true;
            } else {
              // Exit edit mode
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
            // Here you can add logic to save the edited content
            // For now, we'll just show an alert and exit edit mode
            alert('Your changes have been saved locally. Use Download PDF to get the updated version.');
            toggleEditMode();
          }
          
          function downloadAsPDF() {
            window.print();
          }
          
          // Make elements editable on click in edit mode
          document.addEventListener('click', function(e) {
            if (isEditMode && e.target.closest('.editable')) {
              e.target.focus();
            }
          });
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(editableHTML);
    printWindow.document.close();

    // Focus the new window
    printWindow.focus();

    return printWindow;
  };

  const downloadGeneratedAsPDF = async () => {
    try {
      setIsDownloading(true);
      onDownloadStart?.();
      closeDownload();

      // Create editable resume window
      const printWindow = createEditableResumeWindow();

      ToastMessage({
        type: "success",
        message: "Resume editor opened in new window. You can edit and download your resume.",
      });

    } catch (err) {
      console.error("PDF Download Error:", err);
      ToastMessage({
        type: "error",
        message: "Failed to open resume editor",
      });
    } finally {
      setIsDownloading(false);
      onDownloadEnd?.();
    }
  };


  // Alternative: Using html2pdf.js for better multi-page support

  // console.log(GeneratedResume);



  return (
    <>

      <div className="row mx-0">
        <div className="col-lg-6">
          <div className='d-flex align-items-center'>
            <img src={pdf} alt="" className='img-fluid' />
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
                  <div className="text-center py-2 prim-txt2">
                    <Spinner size='sm' /> Generating link...
                  </div>
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
            {/* <button 
                onClick={() => downloadResume('pdf')} 
                disabled={isDownloading} 
                className='prim-but py-1'
              >
                {isDownloading ? "...Downloading" : "Download"}
              </button> */}

            <button
              onClick={downloadGeneratedAsPDF}
              disabled={isDownloading}
              className='prim-but py-1'
            >
              {isDownloading ? "...Downloading" : "Preview & Download"}
            </button>

          </div>
        </div>


      </div>
    </>
  );
};

export default ResumeDownload