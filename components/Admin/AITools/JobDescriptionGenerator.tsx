"use client"

import React, { useState, useEffect } from 'react';
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
import jdg from "@/assets/Images/Navbar/jdg.svg";
import { BsStars, BsX } from "react-icons/bs";
import ToastMessage from '@/Layout/ToastMessage';
// import { useResume, ResumeProvider } from '../../context/ResumeContext';
// import { useNavigate } from 'react-router-dom';
import Loader from '@/Layout/Loader';
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

const JobDescriptionGenerator = () => {
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
        fetchIndustryTypes();
    }, []);

    return (<>

        <div className="generate-tool text-end">
            <h4> <img src={jdg} alt="" />Job <span className='sec-col'>Description</span> Generator</h4>
            <div className="container-fluid">

                <div className="row">
                    <div className="col-lg-6">
                        <div className='p-3 rounded-3 form mt-4'>
                            <h5 className='mb-4'>Get Your <span className='job-gen'>Perfect Job </span > Description.</h5>


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

                            <Box sx={{ mt: 3, alignItems: "center", display: "flex", justifyContent: "end" }}>
                                {isMobile && jobDescription &&
                                    <button
                                        onClick={() => setOpenDialog(true)}
                                        className='gen-but'
                                    >
                                        Show result
                                    </button>
                                }

                                <Button
                                    onClick={handleGenerateTemplate}
                                    disabled={isLoading}
                                    className='gen-but mx-3 me-0'
                                >
                                    <BsStars /> {isLoading ? 'Generating...' : 'Generate'}
                                </Button>
                            </Box>


                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </Alert>
                            )}
                        </div>
                        {isMobile &&


                          

        <SafeAds />
                           

                        }
                    </div>

                    {!isMobile &&
                        <div className="col-lg-6 border-0">
                            {success && jobDescription && (
                                <div className='p-3 rounded-3 form text-start mt-4'>
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

                                {!jobDescription &&
                                    <div className='p-5 pt-0 text-center empty'>
                                        <Image src={empty} alt="" className='w-100 p-5 pt-2' />
                                        <h6>Define Your Dream Role</h6>
                                        <p>Craft the perfect job description that reflects your ideal responsibilities, growth, and career path.</p>
                                    </div>
                                }
                     
                        </div>
                    }
                </div>
            </div>
        </div>

        {/* Mobile Dialog - Only shown on mobile */}
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
    </>
    );
};

export default JobDescriptionGenerator;
