"use client"

import React, { useState, useRef } from 'react';
import * as mammoth from 'mammoth';
import ToastMessage from '@/Layout/ToastMessage';
import ATSMeter from './ATSMeter';
import ats from "@/assets/Images/Admin/ats.svg";
import { AtsCheck } from '@/services/Admin';
import upload from "@/assets/Images/Admin/ATS/upload.svg";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { MdExpandMore } from "react-icons/md";
import { addResume } from '@/services/resume/Index';
import Lottie from 'lottie-react';
import resloader from '@/Animations/res-load.json';
import { trackEvent } from '@/config/AnalyticsTracker';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface FileWithPreview {
  file: File;
  id: string;
  thumbnail: string;
  type: 'pdf' | 'docx';
  content?: string;
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

const FileUploadPreview: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [score, setScore] = useState<any>(null);
  const [resumeData, setResumeData] = useState(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

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

          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

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
            resolve(canvas.toDataURL('image/jpeg', 0.9));
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

  const generateDOCXThumbnail = async (file: File): Promise<{ thumbnail: string; content: string }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });

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

      const style = document.createElement('style');
      style.textContent = `
        h1, h2, h3 { color: #333; margin: 10px 0; }
        p { margin: 8px 0; color: #444; }
        li { margin: 5px 0; }
      `;
      tempDiv.appendChild(style);

      document.body.appendChild(tempDiv);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 1000;

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';

        const text = tempDiv.textContent || '';
        const paragraphs = text.split('\n').filter(p => p.trim().length > 0);

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

        ctx.fillStyle = '#4285f4';
        ctx.fillRect(30, yPos + 20, 40, 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('DOCX', 35, yPos + 50);
      }

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
    setApiError(null);

    const newFiles: FileWithPreview[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > MAX_FILE_SIZE) {
        ToastMessage({
          type: 'error',
          message: `${file.name} exceeds the 2MB file size limit.`,
        });
        continue;
      }
      
      const fileType = file.type;

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

  const uploadFilesToAts = async (filesToUpload?: FileWithPreview[]) => {
    const files = filesToUpload || uploadedFiles;

    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setApiError(null);
    try {
      for (const fileData of files) {
        try {
          const formData = new FormData();
          formData.append('resume', fileData.file);

          const response = await AtsCheck(formData);
          setScore(response?.data?.data?.resume_data?.atsData);
          setResumeData(response?.data?.data?.resume_data?.resumeData);

          setUploadedFiles(prev => prev.map(file =>
            file.id === fileData.id
              ? { ...file, atsScore: response?.data?.score }
              : file
          ));
        } catch (error) {
          let errorMessage:any = (error);
          setApiError(errorMessage);
          ToastMessage({
            type: 'error',
            message: errorMessage || error
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

  const formatSolutions = (solutions:any) => {
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

  const editResume = (resumeData:any) => {
    const resumedata = { resume_data: resumeData };

    setToLocalStorage("resumeData", JSON.stringify(resumedata));
    addResume({ resume_name: 'Resume', ...resumedata })
      .then((response) => {
        setToLocalStorage("resumeId", response?.data?.data?.id);
      })
      .catch((error) => {
        console.error('Error creating resume:', error);
        let errorMessage = (error);
        ToastMessage({
          type: 'error',
          message: errorMessage,
        });
      });

    setTimeout(() => {
      router.push('/create-resume');
    }, 300);
  }

  return (
    <>
      <div className="generate-tool text-end ats">
        <h4> <Image src={ats} alt="" /> ATS <span className='sec-col'>Resume</span> Checker</h4>
        <div className="container-fluid">

          {isUploading || !score && (
            <div className="row text-center justify-content-center m-0">
              <div className="col-lg-8">
                <div className='p-3 mt-4'>
                  <h4>ATS Resume <span className='ats'>Checker – Beat the Bots,</span> Land the Job.</h4>
                  <p>Instantly identify formatting errors and keyword gaps that hurt your <br />chances.</p>
                  <div className="file-upload-container py-0 px-2 text-center rounded h-100">
                    <div className="file-drop-area p-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileUpload}
                        multiple
                        className="d-none"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer w-100">
                        <Image src={upload} alt="" />
                        <h5 className="fw-medium text-dark">Click to upload files</h5>
                        <p className="text-muted small mt-2">Support for PDF and DOCX files</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {uploadedFiles.length > 0 &&
            <div className="row m-0 main-score">
              {score ? (
                <>
                  <div className="col-12 col-lg-7" style={{
                    opacity: score ? 1 : 0,
                    transition: 'opacity 0.3s ease-in'
                  }}>
                    <div className='score text-center my-4 bg-white rounded p-3'>
                      <div className="chart">
                        {score.total_score > 70 ? (
                          <h4 className='mb-0'>Your Resume is ATS Friendly</h4>
                        ) : (
                          <h4 className='mb-0'>Your Resume Needs Improvement</h4>
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
                              {score?.format?.score_details.map((item:any, index:number) => (
                                <Box key={index} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, textAlign: 'left' }}>
                                  <div className="row">
                                    <div>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {item?.check_type} (Score: {item?.score?.weighted}/{item?.score?.max_possible})
                                      </Typography>
                                    </div>
                                    <div>
                                      <div className="d-flex align-items-center gap-1 my-1 justify-content-lg-end justify-content-start pt-0">
                                        <Typography variant="body2">Severity:</Typography>
                                        <Chip
                                          label={item.severity}
                                          color={getSeverityColor(item?.severity)}
                                          size="small"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  {item?.issues && (
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                      <strong>Issues:</strong> {formatIssues(item?.issues)}
                                    </Typography>
                                  )}
                                  {item?.explanation &&
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                      <strong>Explanation:</strong> {item.explanation}
                                    </Typography>
                                  }

                                  {item?.solution && (
                                    <Typography variant="body2">
                                      <strong>Solution:</strong> {formatSolutions(item?.solution)}
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
                              {score?.content?.score_details.map((item:any, index:number) => (
                                <Box key={index} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                  <div className="row">
                                    <div>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {item?.check_type} (Score: {item?.score?.weighted}/{item?.score?.max_possible})
                                      </Typography>
                                    </div>
                                    <div>
                                      <div className="d-flex align-items-center gap-1 my-1 justify-content-lg-end justify-content-start pt-0">
                                        <Typography variant="body2">Severity:</Typography>
                                        <Chip
                                          label={item.severity}
                                          color={getSeverityColor(item?.severity)}
                                          size="small"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  {item?.issues && (
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                      <strong>Issues:</strong>{formatIssues(item?.issues)}
                                    </Typography>
                                  )}

                                  {item?.explanation &&
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                      <strong>Explanation:</strong> {item?.explanation}
                                    </Typography>
                                  }
                                  {item?.solution && (
                                    <Typography variant="body2">
                                      <strong>Solution:</strong> {formatSolutions(item?.solution)}
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
                </>
              ) : (
                !apiError && isUploading && (
                  <div className="col-12 col-lg-7 justify-content-center" style={{
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
                )
              )}

              {!apiError && uploadedFiles.length > 0 && (
                <div className="col border-0">
                  <div className='position-relative edit mt-4'>
                    {uploadedFiles && uploadedFiles.map((fileData) => (
                      <img
                        src={fileData?.thumbnail}
                        alt={`${fileData?.file.name} thumbnail`}
                        className="img-fluid rounded border"
                        style={{
                          height: '100%', width: 'auto', objectFit: 'cover', maxHeight: "480px", position: 'sticky', top: '18%', opacity: fileData.thumbnail ? 1 : 0,
                          transition: 'opacity 0.3s ease-in'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          }
        </div>
      </div>
    </>
  );
};

export default FileUploadPreview;