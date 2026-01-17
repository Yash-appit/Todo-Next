"use client"

import React, { useState } from 'react';
import jba from "@/assets/Images/AITools/job-analyzer/jba.svg";
import { FaArrowRight } from "react-icons/fa6";
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
import { useForm } from 'react-hook-form';
import { JDAnalyzer } from '@/services/AI/Index';
import ToastMessage from '@/Layout/ToastMessage';
import SafeAds from '@/common/SafeAds';
import { useDashboard } from '@/hooks/useDashboard';
import { HiArrowRight } from 'react-icons/hi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

const JobAnalyzerMain = () => {
    const [token, setToken] = React.useState(getFromLocalStorage('token'));
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const router = useRouter();
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

    const onSubmit = async (dat:any) => {


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
    };
    return (<>
        <div className="container-fluid">
            <div className="row m-0">


                {token &&
                    <div className="col-lg-6 mb-4 px-0">
                        <div className="bg p-5">
                            <form onSubmit={handleSubmit(onSubmit)} className='p-3 rounded-3 form mt-4'>
                                <h2 className='mb-4'>Smart <span className='sec-col'>Job Description Analyzer – match your skills</span> to the job perfectly.</h2>
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
                                        className='sec-but mt-3'
                                    >
                                        Show result
                                    </button>
                                }

                                <button
                                    type="submit"
                                    className='prim-but m-3 me-0'
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Generating...' : <>Generate <HiArrowRight className='mx-2 me-0' /></>}
                                </button>



                            </form>
                        </div>
                    </div>
                }

                {!token &&
                    <div className="col-lg-6 mb-4 px-0">
                        <div className="bg p-5">
                            <p className='pt-5 mt-2 head-main'>highlights your strengths, shows your personality.</p>
                            <h1 className='my-4'>Smart <span className='sec-col'>JD Analyzer – by Todo</span> Resume</h1>
                            <p>Understand what recruiters want - analyze job descriptions and align your application perfectly.</p>
                            <Link href={token ? "/job-description-analyzer" : "/login"} type='button' className='prim-but main-but mt-5'><span>Create JD Analyzer</span> <FaArrowRight /></Link>
                        </div>
                    </div>
                }


                {!isMobile && analysisResult && (<>
                    <div className="col-lg-6 border-0 mb-4">
                        <div className='bg'>
                            {isLoading && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            )}
                            {analysisResult && (
                                <div className='p-3 rounded-3 form text-start'>
                                    <Typography variant="h5" gutterBottom>
                                        Analysis Results
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>Key Skills</Typography>
                                    <List dense>
                                        {analysisResult.key_skills.map((skill:any, index:any) => (
                                            <ListItem key={index}>
                                                <ListItemText primary={`• ${skill}`} />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Keywords</Typography>
                                    <List dense>
                                        {analysisResult.keywords.map((keyword:any, index:any) => (
                                            <ListItem key={index}>
                                                <ListItemText primary={`• ${keyword}`} />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Resume Bullet Points</Typography>
                                    <List dense>
                                        {analysisResult.resume_bullets.map((bullet:any, index:any) => (
                                            <ListItem key={index}>
                                                <ListItemText primary={`• ${bullet}`} />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Cover Letter Points</Typography>
                                    <List dense>
                                        {analysisResult.cover_letter_points.map((point:any, index:any) => (
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
                        </div>

        <SafeAds />
                    </div>
                </>)}


                {!analysisResult &&
                    <div className="col-lg-6 mb-4 pe-0 emp">
                        <div className="bg">
                            <Image src={jba} alt="" />
                        </div>
                    </div>
                }
            </div>
        </div>


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
                            {analysisResult?.key_skills.map((skill: any, index: any) => (
                                <ListItem key={index}>
                                    <ListItemText primary={`• ${skill}`} />
                                </ListItem>
                            ))}
                        </List>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Keywords</Typography>
                        <List dense>
                            {analysisResult.keywords.map((keyword:any, index:any) => (
                                <ListItem key={index}>
                                    <ListItemText primary={`• ${keyword}`} />
                                </ListItem>
                            ))}
                        </List>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Resume Bullet Points</Typography>
                        <List dense>
                            {analysisResult.resume_bullets.map((bullet:any, index:any) => (
                                <ListItem key={index}>
                                    <ListItemText primary={`• ${bullet}`} />
                                </ListItem>
                            ))}
                        </List>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Cover Letter Points</Typography>
                        <List dense>
                            {analysisResult.cover_letter_points.map((point:any, index:any) => (
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
    </>)
}

export default JobAnalyzerMain
