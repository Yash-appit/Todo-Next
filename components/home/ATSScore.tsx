import React, { useState, useRef, useEffect } from 'react';
import ats from "@/assets/Images/Home/check-your-ats-score-analysis.webp";
import TiltedCard from '@/components/Animation/TiltedCard';
// import * as mammoth from 'mammoth';
import ToastMessage from '@/Layout/ToastMessage';
import ATSMeter from '@/components/ATSMeter/ATSMeter';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { MdExpandMore } from "react-icons/md";
import { TbCloudUpload } from "react-icons/tb";
import dynamic from 'next/dynamic';
// import Lottie from 'lottie-react';
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import resloader from '@/Animations/res-load.json';
import Login from '@/components/Login';
import CustomModal from '@/components/Modal/Modal';
import { trackEvent } from '@/config/AnalyticsTracker';
import { useDashboard } from '@/hooks/useDashboard';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Define types
interface ScoreDetails {
  check_type: string;
  score: {
    weighted: number;
    max_possible: number;
  };
  severity: 'High' | 'Medium' | 'Low';
  issues?: string | string[] | { [key: string]: any };
  explanation?: string;
  solution?: string;
  solutions?: string | string[] | { [key: string]: any };
}

interface FormatAnalysis {
  total_score: number;
  max_possible_score: number;
  score_details: ScoreDetails[];
}

interface ContentAnalysis {
  total_score: number;
  max_possible_score: number;
  score_details: ScoreDetails[];
}

interface RBResume {
  style?: string;
  color_scheme?: string;
  format?: string;
  font_size?: string;
}

interface ATSScoreResponse {
  total_score: number;
  format: FormatAnalysis;
  content: ContentAnalysis;
  rb_resume?: RBResume;
}

interface ResumeData {
  personalDetails?: any;
  personaldetails?: any;
  [key: string]: any;
}

interface ATSScoreFile {
  file: File;
  id: string;
  thumbnail: string;
  type: 'pdf' | 'docx';
  content?: string;
  atsScore?: ATSScoreResponse;
}

// Declare pdfjsLib in window object
declare global {
  interface Window {
    pdfjsLib?: any;
  }
}


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

const ATSScore: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<ATSScoreFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ATSScoreFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [score, setScore] = useState<ATSScoreResponse | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  );
  const [LoginModal, setLoginModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { fetchDashboard } = useDashboard();
  const packageData = typeof window !== 'undefined' ? localStorage.getItem('package') : null;

  const generatePDFThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check if running in browser
      if (typeof window === 'undefined') {
        reject(new Error('Not running in browser environment'));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';

      script.onload = async () => {
        try {
          if (!window.pdfjsLib) {
            throw new Error('PDF.js library not loaded');
          }

          const arrayBuffer = await file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
          const page = await pdf.getPage(1);

          // Increase scale for better quality
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) {
            throw new Error('Could not get canvas context');
          }

          // Set higher DPI for better quality
          const outputScale = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = Math.floor(viewport.width) + "px";
          canvas.style.height = Math.floor(viewport.height) + "px";

          context.scale(outputScale, outputScale);
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };

          await page.render(renderContext).promise;
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch (error) {
          console.error('PDF thumbnail generation error:', error);
          reject(error);
        }
      };

      script.onerror = () => reject(new Error('Failed to load PDF.js'));
      document.head.appendChild(script);
    });
  };

  const generateDOCXThumbnail = async (file: File): Promise<{ thumbnail: string; content: string }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const mammoth = await import('mammoth');
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

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      canvas.width = 800;
      canvas.height = 1000;

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
            yPos += 24;
            line = words[i] + ' ';
          } else {
            line = testLine;
          }
        }

        if (line) {
          ctx.fillText(line, 30, yPos);
          yPos += 24;
        }

        yPos += 8;
      });

      // Add document icon at the bottom
      ctx.fillStyle = '#4285f4';
      ctx.fillRect(30, yPos + 20, 40, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('DOCX', 35, yPos + 50);

      document.body.removeChild(tempDiv);

      return {
        thumbnail: canvas.toDataURL('image/jpeg', 0.9),
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

    const newFiles: ATSScoreFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = file.type;

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        ToastMessage({
          type: 'error',
          message: `${file.name} exceeds the 2MB file size limit.`,
        });
        continue;
      }

      if (fileType === 'application/pdf' ||
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
          const id = Math.random().toString(36).substring(2, 11);
          let thumbnail: string;
          let content: string | undefined;

          if (fileType === 'application/pdf') {
            thumbnail = await generatePDFThumbnail(file);
          } else {
            const result = await generateDOCXThumbnail(file);
            thumbnail = result.thumbnail;
            content = result.content;
          }

          newFiles.push({
            file,
            id,
            thumbnail,
            type: fileType === 'application/pdf' ? 'pdf' : 'docx',
            content
          });
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          ToastMessage({
            type: 'error',
            message: `Error processing ${file.name}`
          });
        }
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    await uploadFilesToAts(newFiles);
  };

  const uploadFilesToAts = async (filesToUpload?: ATSScoreFile[]) => {
    const files = filesToUpload || uploadedFiles;

    if (files.length === 0) {
      ToastMessage({
        type: 'error',
        message: 'No files to upload'
      });
      return;
    }

    setIsUploading(true);
    setApiError(null);

    try {
      for (const fileData of files) {
        try {
          const formData = new FormData();
          formData.append('resume', fileData.file);

          // Mock API response - replace with actual API call
          // const response = await AtsCheck(formData);
          // setScore(response?.data?.data?.resume_data?.atsData);
          // setResumeData(response?.data?.data?.resume_data?.resumeData);

          // Mock data for demonstration
          const mockScore: ATSScoreResponse = {
            total_score: 75,
            format: {
              total_score: 40,
              max_possible_score: 50,
              score_details: [
                {
                  check_type: 'Format Check',
                  score: { weighted: 20, max_possible: 25 },
                  severity: 'Low',
                  issues: 'Minor formatting issues',
                  explanation: 'Some formatting could be improved',
                  solutions: 'Use consistent formatting'
                }
              ]
            },
            content: {
              total_score: 35,
              max_possible_score: 50,
              score_details: [
                {
                  check_type: 'Content Check',
                  score: { weighted: 15, max_possible: 25 },
                  severity: 'Medium',
                  issues: 'Content needs improvement',
                  explanation: 'Could use more keywords',
                  solutions: 'Add relevant keywords'
                }
              ]
            }
          };

          setScore(mockScore);
          setResumeData({ personalDetails: { name: 'John Doe' } });

          setUploadedFiles(prev => prev.map(file =>
            file.id === fileData.id
              ? { ...file, atsScore: mockScore }
              : file
          ));

          if (fetchDashboard) {
            fetchDashboard();
          }
        } catch (error: any) {
          const errorMessage = error?.message || 'Error processing file';
          ToastMessage({
            type: 'error',
            message: errorMessage
          });
          setUploadedFiles([]);
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
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('templateId');
      localStorage.removeItem('templateId');
      sessionStorage.removeItem('selectedTemplateId');
      sessionStorage.removeItem('ResumeId');
      localStorage.removeItem("resumeName");
      sessionStorage.removeItem('GuestId');
    }

    let transformedResumeData = { ...resumeData };

    if (transformedResumeData?.personalDetails) {
      transformedResumeData.personaldetails = transformedResumeData.personalDetails;
      delete transformedResumeData.personalDetails;
    }

    const resumedata = {
      resume_data: transformedResumeData
    };

    if (typeof window !== 'undefined') {
      setToLocalStorage('resumeData', JSON.stringify(resumedata));
    }

    router.push('/create-resume');
  };

  const formatIssues = (issues: any): string => {
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

  const formatSolutions = (solutions: any): string => {
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

  // Check for window object on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(getFromLocalStorage('token'));
    }
  }, []);

  return (
    <>
      <section className='ats-score mb-4 pt-5'>
        <div className='container-fluid pt-5'>
          {!isUploading && !score && (
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 pe-0">
                <div className="score text-center">
                  <TiltedCard
                    altText='Businesswoman checking a digital risk gauge to analyze resume performance and check your ATS score.'
                    captionText=' Evaluate how well your resume performs in ATS systems with TodoResume "Check Your ATS Score" tool.'
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
                    priority={true}
                  />
                </div>
              </div>
            </div>
          )}

          {uploadedFiles?.length > 0 && (
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
                              {score?.format?.score_details.map((item, index) => (
                                <Box key={index} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, textAlign: 'left' }}>
                                  <div className="score-details-grid" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '16px',
                                    marginBottom: '16px'
                                  }}>
                                    <div>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {item?.check_type} (Score: {item?.score?.weighted}/{item?.score?.max_possible})
                                      </Typography>
                                    </div>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      justifyContent: { lg: 'flex-end', xs: 'flex-start' }
                                    } as any}>
                                      <Typography variant="body2">Severity:</Typography>
                                      <Chip
                                        label={item?.severity}
                                        color={getSeverityColor(item?.severity) as any}
                                        size="small"
                                      />
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

                                  {item?.solution && (
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
                              {score?.content?.score_details.map((item, index) => (
                                <Box key={index} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                  <div className="score-details-grid" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '16px',
                                    marginBottom: '16px'
                                  }}>
                                    <div>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {item.check_type} (Score: {item?.score?.weighted}/{item?.score?.max_possible})
                                      </Typography>
                                    </div>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      justifyContent: { lg: 'flex-end', xs: 'flex-start' }
                                    } as any}>
                                      <Typography variant="body2">Severity:</Typography>
                                      <Chip
                                        label={item?.severity}
                                        color={getSeverityColor(item?.severity) as any}
                                        size="small"
                                      />
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
                                  {item?.solution && (
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
                                {score?.rb_resume?.color_scheme && <Typography variant="body2"><strong>Color Scheme:</strong> {score?.rb_resume?.color_scheme}</Typography>
                                }
                                {score?.rb_resume?.format && <Typography variant="body2"><strong>Format:</strong> {score?.rb_resume?.format}</Typography>}
                                {score?.rb_resume?.font_size && <Typography variant="body2"><strong>Font Size:</strong> {score?.rb_resume?.font_size}</Typography>}
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        }
                      </div>
                    </div>
                  </div>

                  {!apiError && score && (
                    <>
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

                      <div className="col-lg-4 border-0">
                        <div className='position-relative edit mt-4'>
                          {score && (
                            <div className="bg">
                              <button className='prim-but' onClick={() => editResume()}>Edit Your Resume</button>
                            </div>
                          )}
                          {uploadedFiles.map((fileData) => (
                            <Image
                              key={fileData.id}
                              src={fileData.thumbnail}
                              alt={`${fileData.file.name} thumbnail`}
                              width={400}
                              height={580}
                              className="img-fluid rounded border"
                              style={{
                                objectFit: 'cover' as const,
                                maxHeight: "580px",
                                position: 'sticky',
                                top: '18%',
                                opacity: fileData.thumbnail ? 1 : 0,
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
                !apiError && isUploading && (
                  <>
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
                        {uploadedFiles.map((fileData) => (
                          <Image
                            key={fileData.id}
                            src={fileData.thumbnail}
                            alt={`${fileData.file.name} thumbnail`}
                            width={400}
                            height={580}
                            className="img-fluid rounded border"
                            style={{
                              objectFit: 'cover' as const,
                              maxHeight: "580px",
                              position: 'sticky',
                              top: '18%',
                              opacity: fileData.thumbnail ? 1 : 0,
                              transition: 'opacity 0.3s ease-in'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )
              )}
            </div>
          )}
        </div>
      </section>

      <CustomModal show={LoginModal} onHide={() => setLoginModal(false)} custom='LoginModal' title="">
        <Login close={() => setLoginModal(false)} />
      </CustomModal>
    </>
  );
};

export default ATSScore;