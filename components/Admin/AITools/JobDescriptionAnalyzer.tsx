"use client"

import React, { useState, useEffect } from 'react';
import { JDAnalyzer } from '@/services/AI/Index';
import jda from "@/assets/Images/Admin/jda.svg";
import {
    Grid,
    TextField,
    Paper,
    Typography,
    Box,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Button,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { BsStars, BsX } from "react-icons/bs";
// import { ResumeProvider, useResume } from '../../context/ResumeContext';
// import { useNavigate } from 'react-router-dom';
import Loader from '@/Layout/Loader';
import ToastMessage from '@/Layout/ToastMessage';
import { useForm } from 'react-hook-form';
import empty from "@/assets/Images/AITools/blank.svg";
import SafeAds from '@/common/SafeAds';
import { useDashboard } from '@/hooks/useDashboard';
import Image from 'next/image';

  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

const JobDescriptionAnalyzer = () => {

    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const { fetchDashboard } = useDashboard();
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm();

    const jobDescription = watch("job_description");

    // const {
    //     dashboard
    // } = useResume();

    // const shouldShowAds = dashboard?.packageData?.package_status !== "active";
      const packageData = getFromLocalStorage("package");
     const shouldShowAds = packageData !== "true";

    const onSubmit = async (data: any) => {


        setIsLoading(true);
        setError(null);

        try {
            const result = await JDAnalyzer({ job_description: jobDescription });
            setAnalysisResult(result?.data?.data);
            if (isMobile) {
                setOpenDialog(true);
            }
                      fetchDashboard();
        } catch (err) {
            setError('Failed to analyze job description. Please try again.');
            // console.error('API Error:', err);
            ToastMessage({
                type: "error",
                message: err || 'Failed to analyze job description. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const copy = {
        copyanalysisResult: async () => {
            await navigator.clipboard.writeText(analysisResult);
            ToastMessage({
                type: "info",
                message: "Copied!",
            });
        }
    }

    return (
        <>
       
            <div className="generate-tool text-end">
                <h4> <img src={jda} alt="" />Job <span className='sec-col'>Description</span> Analyzer</h4>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-6">
                            <form onSubmit={handleSubmit(onSubmit)} className='p-3 rounded-3 form mt-4'>
                                <h5 className='mb-4'>Smart <span>Job Description Analyzer – match your skills</span> to the job perfectly.</h5>
                                <TextField
                                    label="Job Description"
                                    multiline
                                    fullWidth
                                    rows={10}
                                    variant="outlined"
                                    className="sec-bg"
                                    placeholder="Paste the job description here..."
                                    inputProps={{ maxLength: 3000 }}
                                    {...register("job_description", {
                                        required: "Job description is required",
                                        minLength: {
                                            value: 20,
                                            message: "Job description must be at least 20 characters"
                                        },
                                        maxLength: {
                                            value: 3000,
                                            message: "Job description must not exceed 3000 characters"
                                        }
                                    })}
                                    error={!!errors.job_description}
                                    helperText={errors.job_description?.message as string || ""}
                                />



                                {isMobile && analysisResult &&
                                    <button
                                        onClick={() => setOpenDialog(true)}
                                        className='gen-but mt-3'
                                    >
                                        Show result
                                    </button>
                                }

                                <button
                                    type="submit"
                                    className='gen-but m-3 me-0'
                                    disabled={isLoading}
                                >
                                    <BsStars /> {isLoading ? 'Generating...' : 'Generate'}
                                </button>



                            </form>

                            {isMobile &&


                       

      <SafeAds />
                           

                            }
                        </div>

                        {!isMobile && (<>
                            <div className="col-lg-6 border-0">
                                {isLoading && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <CircularProgress />
                                    </Box>
                                )}
                                {analysisResult && (
                                    <div className='p-3 rounded-3 form text-start mt-4'>
                                        <Typography variant="h5" gutterBottom>
                                            Analysis Results
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>Key Skills</Typography>
                                        <List dense>
                                            {analysisResult.key_skills.map((skill:any, index:number) => (
                                                <ListItem key={index}>
                                                    <ListItemText primary={`• ${skill}`} />
                                                </ListItem>
                                            ))}
                                        </List>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Keywords</Typography>
                                        <List dense>
                                            {analysisResult.keywords.map((keyword:any, index:number) => (
                                                <ListItem key={index}>
                                                    <ListItemText primary={`• ${keyword}`} />
                                                </ListItem>
                                            ))}
                                        </List>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Resume Bullet Points</Typography>
                                        <List dense>
                                            {analysisResult.resume_bullets.map((bullet: any, index: number) => (
                                                <ListItem key={index}>
                                                    <ListItemText primary={`• ${bullet}`} />
                                                </ListItem>
                                            ))}
                                        </List>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Cover Letter Points</Typography>
                                        <List dense>
                                            {analysisResult.cover_letter_points.map((point:any, index:number) => (
                                                <ListItem key={index}>
                                                    <ListItemText primary={`• ${point}`} />
                                                </ListItem>
                                            ))}
                                        </List>

                                        {/* <Button
                                            variant="outlined"
                                            className='sec-but mt-3'
                                            onClick={copy.copyanalysisResult}

                                        >
                                            Copy to Clipboard
                                        </Button> */}
                                    </div>
                                )}

                            
      <SafeAds />

                                    {!analysisResult &&
                                        <div className='p-5 pt-0 text-center empty'>
                                            <Image src={empty} alt="" className='w-100 p-5 pt-2' />
                                            <h6>Decode Your Job Fit</h6>
                                            <p>Analyze job descriptions to uncover skills, gaps, and opportunities tailored to your career path.</p>
                                        </div>
                                    }
                            </div>
                        </>)}
                    </div>
                </div>
            </div>

            {/* Dialog for mobile view */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="md"
                fullScreen={isMobile}
                className='ai-dialog'
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        Analysis Results
                        <IconButton onClick={handleCloseDialog}>
                            <BsX />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {analysisResult && (
                        <div className='p-3 rounded-3 form text-start mt-2'>
                            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>Key Skills</Typography>
                            <List dense>
                                {analysisResult.key_skills.map((skill:any, index:number) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={`• ${skill}`} />
                                    </ListItem>
                                ))}
                            </List>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Keywords</Typography>
                            <List dense>
                                {analysisResult.keywords.map((keyword:any, index:number) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={`• ${keyword}`} />
                                    </ListItem>
                                ))}
                            </List>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Resume Bullet Points</Typography>
                            <List dense>
                                {analysisResult.resume_bullets.map((bullet:any, index:number) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={`• ${bullet}`} />
                                    </ListItem>
                                ))}
                            </List>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Cover Letter Points</Typography>
                            <List dense>
                                {analysisResult.cover_letter_points.map((point:any, index:number) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={`• ${point}`} />
                                    </ListItem>
                                ))}
                            </List>

                            {/* <Button
                                            variant="outlined"
                                            className='sec-but mt-3'
                                            onClick={copy.copyanalysisResult}

                                        >
                                            Copy to Clipboard
                                        </Button> */}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default JobDescriptionAnalyzer;
