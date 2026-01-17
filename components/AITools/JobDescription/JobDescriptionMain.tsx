"use client"

import React, { useState, useEffect } from 'react';
import jd from "@/assets/Images/AITools/job-description/jb-main.svg";
import { FaArrowRight } from "react-icons/fa6";
import {
    TextField,
    Select,
    MenuItem,
    Button,
    FormControl,
    InputLabel,
    Box,
    Typography,
    Paper,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { IndustryType, JobDescription } from '@/services/AI/Index';
import { BsStars, BsX } from "react-icons/bs";
// import { useResume, ResumeProvider } from '../../context/ResumeContext';
// import Loader from '../Layout/Loader';
import empty from "../../../assets/Images/AITools/blank.svg";
import ToastMessage from '@/Layout/ToastMessage';
import SafeAds from '@/common/SafeAds';
import { useDashboard } from '@/hooks/useDashboard';
import { HiArrowRight } from 'react-icons/hi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };


const JobDescriptionMain = () => {
    const [token, setToken] = React.useState(getFromLocalStorage('token'));
    const [industryTypeId, setIndustryTypeId] = useState('');
    const [industryTypes, setIndustryTypes] = useState([]);
    const [jobDescription, setJobDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isFetchingTypes, setIsFetchingTypes] = useState(false);
    const [company, setCompany] = useState('');
    const [title, setTitle] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const { fetchDashboard } = useDashboard();
    const copy = {
        copyJobDescription: async () => {
            await navigator.clipboard.writeText(jobDescription);
            ToastMessage({
                type: "info",
                message: "Copied!",
            });
        }
    }

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const router = useRouter();
    const packageData = getFromLocalStorage("package");
    const shouldShowAds = packageData !== "true";


    const fetchIndustryTypes = async () => {
        setIsFetchingTypes(true);
        setError(null);

        try {
            const response = await IndustryType();
            setIndustryTypes(response?.data || []);
            fetchDashboard();
        } catch (err:any) {
            setError(err.response?.data?.message || 'Failed to load industry types');
        } finally {
            setIsFetchingTypes(false);
        }
    };

    const handleGenerateTemplate = async (e:any) => {
        e.preventDefault();


        if (!industryTypeId || !company.trim() || !title.trim()) {
            ToastMessage({
                type: "error",
                message: 'Please enter the required fields',
            });
            return;
        }

        if (!industryTypeId) {
            // setError('Please select an industry type');
            ToastMessage({
                type: "error",
                message: 'Please select an industry type',
            });
            return;
        }

        if (!company.trim()) {
            ToastMessage({
                type: "error",
                message: 'Please enter a company name',
            });
            // setError('Please enter a company name');
            return;
        }

        if (!title.trim()) {
            ToastMessage({
                type: "error",
                message: 'Please enter a job title',
            });
            // setError('Please enter a job title');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await JobDescription({
                job_industry_id: Number(industryTypeId),
                job_company: company.trim(),
                job_title: title.trim()
            });

            setJobDescription(response?.data?.data);
            setSuccess(true);

            // Only open dialog for mobile view
            if (isMobile) {
                setOpenDialog(true);
            }
        } catch (err:any) {
            // setError(err.response?.data?.message || 'An error occurred while generating the template');
            ToastMessage({
                type: "error",
                message: err || err.response?.data?.message || 'An error occurred while generating the template',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchIndustryTypes();
        }
        setToken(getFromLocalStorage('token') || '');
    }, [token]);


    return (<>
        <div className="container-fluid">
            <div className="row m-0 generate-tool">

                {!token &&
                    <div className="col-lg-6 mb-4 px-0">
                        <div className="bg p-5">
                            <p className='pt-5 mt-2 head-main'>highlights your strengths, shows your personality.</p>
                            <h1 className='my-4'><span className='sec-col'>Instant AI Generator <br />for Job Descriptions</span> </h1>
                            <p>Quickly generate clear, tailored job descriptions to attract top talent <br />effortlessly.</p>


                            <Link href={token ? "/job-description-generator" : "/login"} type="button" className='prim-but main-but mt-5 mb-4'><span>Boost Resume</span> <FaArrowRight /></Link>
                        </div>
                    </div>
                }

                {token &&
                    <div className="col-lg-6 mb-4 px-0">
                        <div className="bg p-5">
                            <div className='p-3 rounded-3 form mt-4'>
                                <h2 className='mb-4'>Get Your <span className='sec-col'>Perfect Job </span > Description.</h2>
                                <TextField
                                    label="Company Name"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    required
                                    inputProps={{
                                        minLength: 5,
                                        maxLength: 80, // you can set a reasonable character limit
                                    }}
                                />

                                <TextField
                                    label="Job Title"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    inputProps={{
                                        minLength: 2,
                                        maxLength: 100, // you can set a reasonable character limit
                                    }}
                                />

                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel id="industry-type-label">Industry Type</InputLabel>
                                    <Select
                                        labelId="industry-type-label"
                                        id="industryType"
                                        value={industryTypeId}
                                        label="Industry Type"
                                        onChange={(e) => {
                                            setIndustryTypeId(e.target.value);
                                            setError(null);
                                        }}
                                        className='text-start'
                                    >
                                        <MenuItem value="">
                                            <em>Select an Industry type</em>
                                        </MenuItem>
                                        {industryTypes.map((type:any) => (
                                            <MenuItem key={type.id} value={type.id}>
                                                {type.industry_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Box sx={{ mt: 3, alignItems: "center", display: "flex", gap: 2 }}>
                                    {isMobile && jobDescription &&
                                        <button
                                            onClick={() => setOpenDialog(true)}
                                            className='sec-but'
                                        >
                                            Show result
                                        </button>
                                    }

                                    <button
                                        onClick={handleGenerateTemplate}
                                        disabled={isLoading}
                                        className='prim-but'
                                    >
                                     {isLoading ? 'Generating...' : <>Generate <HiArrowRight className='mx-2 me-0'/> </>}
                                    </button>
                                </Box>


                                {error && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {error}
                                    </Alert>
                                )}
                            </div>
                        </div>
                        {isMobile &&




        <SafeAds />


                        }
                    </div>
                }


                {!isMobile && jobDescription &&
                    <div className="col-lg-6 border-0 mb-4">
                        <div className="bg">
                            {success && jobDescription && (
                                <div className='p-3 rounded-3 form text-start'>
                                    <Typography variant="h5" gutterBottom>
                                        Generated Job Description
                                    </Typography>
                                    <Paper elevation={2} sx={{ p: 3, mb: 2, whiteSpace: 'pre-wrap' }}>
                                        {jobDescription}
                                    </Paper>

                                    <Button
                                        variant="outlined"
                                        className='sec-but'
                                        onClick={copy.copyJobDescription}

                                    >
                                        Copy to Clipboard
                                    </Button>
                                </div>
                            )}



        <SafeAds />

                            {/* {!jobDescription &&
                                    <div className='p-5 pt-0 text-center empty'>
                                        <img src={empty} alt="" className='w-100 p-5 pt-2' />
                                        <h6>Define Your Dream Role</h6>
                                        <p>Craft the perfect job description that reflects your ideal responsibilities, growth, and career path.</p>
                                    </div>
                                } */}
                        </div>
                    </div>
                }


                {!jobDescription &&
                    <div className="col-lg-6 mb-4 pe-0">
                        <div className="bg">
                            <img src={jd.src} alt="" className='p-5 pb-0 mt-3' />
                        </div>
                    </div>
                }
            </div>
        </div>

        
{isMobile && (
    <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
        className='ai-dialog'
    >
        <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                Generated Job Description
                <IconButton onClick={() => setOpenDialog(false)}>
                    <BsX />
                </IconButton>
            </Box>
        </DialogTitle>
        <DialogContent>
            <div className='p-3 rounded-3 form text-start mt-4'>
                {/* <Typography variant="h5" gutterBottom>
                    Generated Job Description
                </Typography> */}
                <Paper elevation={2} sx={{ p: 3, mb: 2, whiteSpace: 'pre-wrap' }}>
                    {jobDescription}
                </Paper>

                <Button
                    variant="outlined"
                    className='sec-but'
                    onClick={copy.copyJobDescription}
                >
                    Copy to Clipboard
                </Button>
            </div>
        </DialogContent>
    </Dialog>
)}


    </>)
}

export default JobDescriptionMain
