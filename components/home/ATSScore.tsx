import React, { useState, useRef, useEffect } from 'react';
import ats from "@/assets/Images/Home/check-your-ats-score-analysis.webp";
import TiltedCard from '@/components/Animation/TiltedCard';
import * as mammoth from 'mammoth';
import ToastMessage from '@/Layout/ToastMessage';
import ATSMeter from '@/components/Admin/ATSMeter';
// import ats from "../../../assets/Images/Admin/ats.svg";
// import ResumeLoader from '../Resume/ResumeLoader';
import { AtsCheck } from '@/services/Admin';
// import upload from "../../../assets/Images/Admin/ATS/upload.svg";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Grid
} from '@mui/material';
import { MdExpandMore } from "react-icons/md";
import { TbCloudUpload } from "react-icons/tb";
// import { useResume } from '../../context/ResumeContext';
import { IoMdLock } from "react-icons/io";
// import temp from "../../../assets/Images/Templates/temp1.svg";
// import { useNavigate } from 'react-router-dom';
import { addResume } from '@/services/resume/Index';
import Lottie from 'lottie-react';
import resloader from '@/Animations/res-load.json';
import Login from '@/components/Login';
import CustomModal from '@/components/Modal/Modal';
import { trackEvent } from '@/config/AnalyticsTracker';
import { useDashboard } from '@/hooks/useDashboard';
import { useRouter } from 'next/navigation';


const getFromLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

interface ATSScore {
  file: File;
  id: string;
  thumbnail: string;
  type: 'pdf' | 'docx';
  content?: string;
}

// const ATSScore = () => {
const ATSScore: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<ATSScore[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ATSScore | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [score, setScore] = useState<any>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  // const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [LoginModal, setLoginModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { fetchDashboard } = useDashboard();
  const packageData = localStorage.getItem('package');
  // console.log(typeof(packageData));

  const generatePDFThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = async () => {
        try {
          const pdfjsLib = (window as any).pdfjsLib;
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          const page = await pdf.getPage(1);

          // Increase scale for better quality
          const viewport = page.getViewport({ scale: 2.0 }); // Increased from 0.5 to 2.0
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          // Set higher DPI for better quality
          const outputScale = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = Math.floor(viewport.width) + "px";
          canvas.style.height = Math.floor(viewport.height) + "px";

          if (context) {
            context.scale(outputScale, outputScale);
            const renderContext = {
              canvasContext: context,
              viewport: viewport
            };

            await page.render(renderContext).promise;
            resolve(canvas.toDataURL('image/jpeg', 0.9)); // Use JPEG with quality 0.9
          } else {
            throw new Error('Could not get canvas context');
          }
        } catch (error) {
          console.error('PDF thumbnail generation error:', error);
          reject(error);
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Improved DOCX thumbnail generation with better formatting
  const generateDOCXThumbnail = async (file: File): Promise<{ thumbnail: string; content: string }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });

      // Create a temporary div with better styling
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = result.value;
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '30px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';

      // Style headings and paragraphs for better readability
      const style = document.createElement('style');
      style.textContent = `
          h1, h2, h3 { color: #333; margin: 10px 0; }
          p { margin: 8px 0; color: #444; }
          li { margin: 5px 0; }
        `;
      tempDiv.appendChild(style);

      document.body.appendChild(tempDiv);

      // Create higher quality canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800; // Increased width
      canvas.height = 1000; // Increased height

      if (ctx) {
        // Draw background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw document content
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';

        // Extract text and format it better
        const text = tempDiv.textContent || '';
        const paragraphs = text.split('\n').filter(p => p.trim().length > 0);

        // Draw first few paragraphs with better formatting
        let yPos = 40;
        paragraphs.slice(0, 15).forEach(paragraph => {
          const words = paragraph.split(' ');
          let line = '';

          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > canvas.width - 40 && line !== '') {
              ctx.fillText(line, 30, yPos);
              yPos += 24; // Increased line height
              line = words[i] + ' ';
            } else {
              line = testLine;
            }
          }

          if (line) {
            ctx.fillText(line, 30, yPos);
            yPos += 24;
          }

          yPos += 8; // Extra space between paragraphs
        });

        // Add document icon at the bottom
        ctx.fillStyle = '#4285f4';
        ctx.fillRect(30, yPos + 20, 40, 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('DOCX', 35, yPos + 50);
      }

      document.body.removeChild(tempDiv);

      return {
        thumbnail: canvas.toDataURL('image/jpeg', 0.9), // Use JPEG with quality 0.9
        content: result.value
      };
    } catch (error) {
      console.error('Error generating DOCX thumbnail:', error);
      throw error;
    }
  };

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    trackEvent({
      category: 'Tool',
      action: 'ATS Checker Used',
      label: 'ATS Checker'
    });

    const files = event.target.files;
    if (!files) return;

    setIsProcessing(true);

    const newFiles: ATSScore[] = [];
    const oversizedFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = file.type;

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file.name);

        ToastMessage({
          type: 'error',
          message: `${file.name} exceeds the 2MB file size limit.`,
        });

        continue;
      }

      if (fileType === 'application/pdf' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
          const id = Math.random().toString(36).substr(2, 9);

          if (fileType === 'application/pdf') {
            const thumbnail = await generatePDFThumbnail(file);
            newFiles.push({
              file,
              id,
              thumbnail,
              type: 'pdf'
            });
          } else {
            const { thumbnail, content } = await generateDOCXThumbnail(file);
            newFiles.push({
              file,
              id,
              thumbnail,
              type: 'docx',
              content
            });
          }
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          setUploadedFiles([]);
          // showToast(`Error processing ${file.name}`, 'error');
        }
      }
    }

    // Update state with new files
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Call uploadFilesToAts with the new files directly
    await uploadFilesToAts(newFiles);
  };



  // const removeFile = (id: string) => {
  //   setUploadedFiles(prev => prev.filter(file => file.id !== id));
  //   if (selectedFile?.id === id) {
  //     setSelectedFile(null);
  //   }
  // };

  // const previewFile = (file: FileWithPreview) => {
  //   setSelectedFile(file);
  // };

  // const formatFileSize = (bytes: number): string => {
  //   if (bytes === 0) return '0 Bytes';
  //   const k = 1024;
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  // };

  const uploadFilesToAts = async (filesToUpload?: ATSScore[]) => {
    // Use provided files or existing uploadedFiles
    const files = filesToUpload || uploadedFiles;

    // if (files.length === 0) {
    //   // showToast('No files to upload', 'error');
    //   ToastMessage({
    //     type: 'error',
    //     message: 'No files to upload'
    //   });
    //   return;
    // }

    setIsUploading(true);
    setApiError(null);

    try {
      for (const fileData of files) {
        try {
          const formData = new FormData();
          formData.append('resume', fileData.file);

          // Call the AtsCheck API
          const response = await AtsCheck(formData);
          // console.log('ATS Check response:', response.data);
          // console.log("ATS SCore", response?.data?.data?.resume_data?.atsData);
          // console.log('Resume Data', response?.data?.data?.resume_data?.resumeData);

          setScore(response?.data?.data?.resume_data?.atsData);
          setResumeData(response?.data?.data?.resume_data?.resumeData);
          // Update the file with ATS score
          setUploadedFiles(prev => prev.map(file =>
            file.id === fileData.id
              ? { ...file, atsScore: response?.data?.score }
              : file
          ));
          fetchDashboard();
          // showToast(`Successfully processed ${fileData.file.name}`, 'success');
        } catch (error) {
          let errorMessage = (error);
          // console.error(`Error uploading ${fileData.file.name}:`, error);
          ToastMessage({
            type: 'error',
            message: errorMessage || error
          });
          setUploadedFiles([]);
          // showToast(`Error processing ${fileData.file.name}`, 'error');
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'info';
    }
  };


  const editResume = () => {
    sessionStorage.removeItem('templateId');
    localStorage.removeItem('templateId');
    sessionStorage.removeItem('selectedTemplateId');
    sessionStorage.removeItem('ResumeId');
    localStorage.removeItem("resumeName");
    sessionStorage.removeItem('GuestId');

    let transformedResumeData = { ...resumeData };

    // Check if personalDetails exists and rename it to personaldetails
    if (transformedResumeData.personalDetails) {
      transformedResumeData.personaldetails = transformedResumeData.personalDetails;
      delete transformedResumeData.personalDetails;
    }

    // Create the object to send
    const resumedata = {
      resume_data: transformedResumeData
    };

    // Save to localStorage - this must happen before navigation
    localStorage.setItem('resumeData', JSON.stringify(resumedata));

    // Navigate to create-resume page
    router.push('/create-resume');
  };



  const formatIssues = (issues: any) => {
    if (!issues) {
      return "No issues found";
    }

    if (Array.isArray(issues)) {
      return issues.length > 1 ? issues.join(', ') : issues[0];
    }

    if (typeof issues === 'object') {
      return Object.entries(issues)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }

    return String(issues);
  };


  const formatSolutions = (solutions: any) => {
    if (!solutions) {
      return "No solutions found";
    }

    if (Array.isArray(solutions)) {
      return solutions.length > 1 ? solutions.join(', ') : solutions[0];
    }

    if (typeof solutions === 'object') {
      return Object.entries(solutions)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }

    return String(solutions);
  };

  return (<>
    <section className='ats-score mb-4 pt-5'>
      <div className='container-fluid pt-5'>

        {isUploading || !score && (
          <div className="row m-0 mt-4">
            <div className="col-lg-6 px-0">
              <div className="upload h-100">
                <h1 className='text-center sec-col italic mt-5 pt-5'>Check Your ATS Score</h1>
                <p className='text-center'>Find out if your resume can beat ATS bots and get seen <br />by real recruiters before you even apply.</p>

                <div className="text-center justify-content-center d-flex">
                  <div className='p-3 mt-4'>
                    <div className="file-upload-container text-center h-100">
                      <div className="file-drop-area pb-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileUpload}
                          multiple
                          className="d-none"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer w-100 justify-content-center">
                          <TbCloudUpload />
                          <p className="my-0">Upload your resume <br />PDFs only (up to 2MB)</p>
                        </label>
                      </div>
                      {/* <p className='sec-col text-decoration-underline'>20 AI Credits left</p> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 pe-0">
              <div className="score text-center">
                {!score &&
                  <TiltedCard
                    altText='Businesswoman checking a digital risk gauge to analyze resume performance and check your ATS score.'
                    captionText=' Evaluate how well your resume performs in ATS systems with TodoResume’s “Check Your ATS Score” tool.'
                    title='Check Your ATS Score | Smart Resume Analyzer Tool'
                    imageSrc={ats.src}
                    containerHeight="100%"
                    containerWidth="100%"
                    imageHeight="100%"
                    imageWidth="100%"
                    rotateAmplitude={12}
                    scaleOnHover={1.01}
                    showMobileWarning={false}
                    showTooltip={false}
                    displayOverlayContent={true}
                  />
                }
              </div>
            </div>
          </div>
        )}

        {uploadedFiles?.length > 0 &&
          <div className="row justify-content-center m-0">

            {score ? (
              <>
                <div className="col-lg-8">
                  <div className='score text-center my-4 bg-white rounded-4 p-3'>
                    <div className="chart">
                      {score?.total_score > 70 ? (
                        <h4>Your Resume is ATS Friendly</h4>
                      ) : (
                        <h4>Your Resume Needs Improvement</h4>
                      )}
                      {score !== null && (
                        <ATSMeter value={score?.total_score} />
                      )}
                    </div>

                    <div className="ats-data-accordion mt-4">
                      <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<MdExpandMore />}>
                          <Typography sx={{ fontWeight: 'bold' }}>
                            Format Analysis (Score: {score?.format?.total_score}/{score?.format?.max_possible_score})
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {score?.format?.score_details.map((item: any, index: number) => (
                              <Box key={index} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, textAlign: 'left' }}>
                                <div className='row'>
                                  <div className='col-lg-6 col-12'>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                      {item?.check_type} (Score: {item?.score?.weighted}/{item?.score?.max_possible})
                                    </Typography>
                                  </div>
                                  <div className='col-lg-6 col-12'>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1, justifyContent: { lg: 'flex-end', xs: 'flex-start' }, pt: 0 }}>
                                      <Typography variant="body2">Severity:</Typography>
                                      <Chip
                                        label={item?.severity}
                                        color={getSeverityColor(item?.severity)}
                                        size="small"
                                      />
                                    </Box>
                                  </div>
                                </div>

                                {item?.issues && (
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Issues:</strong> {formatIssues(item?.issues)}
                                  </Typography>
                                )}

                                {item?.explanation &&
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Explanation:</strong> {item?.explanation}
                                  </Typography>
                                }

                                {item?.solutions && (
                                  <Typography variant="body2">
                                    <strong>Solution:</strong> {formatSolutions(item?.solutions)}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Box>
                        </AccordionDetails>
                      </Accordion>

                      <Accordion>
                        <AccordionSummary expandIcon={<MdExpandMore />}>
                          <Typography sx={{ fontWeight: 'bold' }}>
                            Content Analysis (Score: {score?.content?.total_score}/{score?.content?.max_possible_score})
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
                            {score?.content?.score_details.map((item: any, index: number) => (
                              <Box key={index} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                <div className='row'>
                                  <div className='col-lg-6 col-12'>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                      {item.check_type} (Score: {item?.score?.weighted}/{item?.score?.max_possible})
                                    </Typography>
                                  </div>
                                  <div className='col-lg-6 col-12'>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1, justifyContent: { lg: 'flex-end', xs: 'flex-start' }, pt: 0 }}>
                                      <Typography variant="body2">Severity:</Typography>
                                      <Chip
                                        label={item?.severity}
                                        color={getSeverityColor(item?.severity)}
                                        size="small"
                                      />
                                    </Box>
                                  </div>
                                </div>
                                {item?.issues && (
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Issues:</strong> {formatIssues(item?.issues)}
                                  </Typography>
                                )}

                                {item?.explanation &&
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Explanation:</strong> {item?.explanation}
                                  </Typography>
                                }
                                {item?.solutions && (
                                  <Typography variant="body2">
                                    <strong>Solution:</strong> {formatSolutions(item?.solutions)}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Box>
                        </AccordionDetails>
                      </Accordion>

                      {score?.rb_resume?.style && score?.rb_resume?.color_scheme && score?.rb_resume?.format && score?.rb_resume?.font_size &&
                        <Accordion>
                          <AccordionSummary expandIcon={<MdExpandMore />}>
                            <Typography sx={{ fontWeight: 'bold' }}>Resume Builder Information</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, textAlign: 'left' }}>
                              {score?.rb_resume?.style && <Typography variant="body2"><strong>Style:</strong> {score?.rb_resume?.style}</Typography>}
                              {score?.rb_resume?.color_scheme && <Typography variant="body2"><strong>Color Scheme:</strong> {score?.rb_resume?.color_scheme}</Typography>}
                              {score?.rb_resume?.format && <Typography variant="body2"><strong>Format:</strong> {score?.rb_resume?.format}</Typography>}
                              {score?.rb_resume?.font_size && <Typography variant="body2"><strong>Font Size:</strong> {score?.rb_resume?.font_size}</Typography>}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      }
                    </div>
                  </div>
                </div>

                {/* Only show these divs when there's no API error and we have score data */}
                {!apiError && score && (
                  <>
                    {/* Loading animation div - only show when processing and no score yet */}
                    {isUploading && !score && (
                      <div className="col-lg-8 justify-content-center" style={{
                        opacity: !score ? 1 : 0,
                        transition: 'opacity 0.3s ease-in'
                      }}>
                        <div className="text-center">
                          <Lottie
                            className="lottie"
                            animationData={resloader}
                            loop
                            autoplay
                          />
                        </div>
                      </div>
                    )}

                    {/* Thumbnail div - only show when we have successful data */}
                    <div className="col-lg-4 border-0">
                      <div className='position-relative edit mt-4'>
                        {score && (
                          <div className="bg">
                            <button className='prim-but' onClick={() => editResume()}>Edit Your Resume</button>
                          </div>
                        )}
                        {uploadedFiles && uploadedFiles.map((fileData) => (
                          <img
                            src={fileData.thumbnail}
                            alt={`${fileData?.file.name} thumbnail`}
                            className="img-fluid rounded border"
                            style={{
                              height: '100%',
                              width: 'auto',
                              objectFit: 'cover',
                              maxHeight: "580px",
                              position: 'sticky',
                              top: '18%',
                              opacity: fileData?.thumbnail ? 1 : 0,
                              transition: 'opacity 0.3s ease-in'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              // Show loading state only when uploading and no error
              !apiError && isUploading && (<>
                <div className="col-lg-8 justify-content-center" style={{
                  opacity: !score ? 1 : 0,
                  transition: 'opacity 0.3s ease-in'
                }}>
                  <div className="text-center">
                    <Lottie
                      className="lottie"
                      animationData={resloader}
                      loop
                      autoplay
                    />
                  </div>
                </div>

                <div className="col-lg-4 border-0">
                  <div className='position-relative edit mt-4'>
                    {/* {score && resumeData && (
                          <div className="bg">
                            <button className='prim-but' onClick={() => editResume()}>Edit Your Resume</button>
                          </div>
                          )} */}
                    {uploadedFiles && uploadedFiles.map((fileData) => (
                      <img
                        src={fileData.thumbnail}
                        alt={`${fileData?.file.name} thumbnail`}
                        className="img-fluid rounded border"
                        style={{
                          height: '100%',
                          width: 'auto',
                          objectFit: 'cover',
                          maxHeight: "580px",
                          position: 'sticky',
                          top: '18%',
                          opacity: fileData?.thumbnail ? 1 : 0,
                          transition: 'opacity 0.3s ease-in'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </>)
            )}
          </div>
        }
      </div>
    </section>

    <CustomModal show={LoginModal} onHide={() => setLoginModal(false)} custom='LoginModal' title="">
      <Login close={() => setLoginModal(false)} />
    </CustomModal>
  </>)
}

export default ATSScore
