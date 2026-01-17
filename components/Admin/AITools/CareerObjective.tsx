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
import { IndustryType, CareerObjectiveGenerator } from '@/services/AI/Index';
import ob from "@/assets/Images/Admin/ob.svg";
import { BsStars, BsX } from "react-icons/bs";
import ToastMessage from '@/Layout/ToastMessage';
// import { ResumeProvider, useResume } from '../../context/ResumeContext';
import Loader from '@/Layout/Loader';
import empty from "@/assets/Images/AITools/blank.svg";
import SafeAds from '@/common/SafeAds';
import { useDashboard } from '@/hooks/useDashboard';
import Image from 'next/image';

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

const CareerObjective = () => {
    const [industryTypeId, setIndustryTypeId] = useState('');
    const [industryTypes, setIndustryTypes] = useState([]);
    const [jobDescription, setJobDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isFetchingTypes, setIsFetchingTypes] = useState(false);
    const [company, setCompany] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [token, setToken] = useState(getFromLocalStorage('token') || '');
    const { fetchDashboard } = useDashboard();
    // const {
    //     dashboard
    // } = useResume();
    // const shouldShowAds = dashboard?.packageData?.package_status !== "active";
     const packageData = getFromLocalStorage("package");
      const shouldShowAds = packageData !== "true";

    const experienceLevels = [
        'Entry Level',
        'Mid Level',
        'Senior Level',
        'Executive'
    ];

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const copy = {
        copyJobDescription: async () => {
            await navigator.clipboard.writeText(jobDescription);
            ToastMessage({
                type: "info",
                message: "Copied!",
            });
        }
    }

    const fetchIndustryTypes = async () => {
        setIsFetchingTypes(true);
        setError(null);

        try {
            const response = await IndustryType();
            setIndustryTypes(response?.data || []);
        } catch (err:any) {
            setError(err.response?.data?.message || 'Failed to load industry types');
        } finally {
            setIsFetchingTypes(false);
        }
    };

    const handleGenerateTemplate = async (e:any) => {
        e.preventDefault();

        if (!industryTypeId || !company.trim() || !experienceLevel) {
            ToastMessage({
                type: "error",
                message: 'Please enter the required fields',
            });
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await CareerObjectiveGenerator({
                industry_id: Number(industryTypeId),
                role: company.trim(),
                experience_level: experienceLevel
            });

            // console.log("Career Objective Response:", response);

            setJobDescription(response?.data?.data);
            setSuccess(true);
            if (isMobile) {
                setOpenDialog(true);
            }
            fetchDashboard();
        } catch (err:any) {
            // setError(err.response?.data?.message || 'An error occurred while generating the template');
            ToastMessage({
                type: "error",
                message: err.response?.data?.message || err || 'An error occurred while generating the template',
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
            <h4> <img src={ob} alt="" /> Smart <span className='sec-col'>Career</span> Objective</h4>
            <div className="container-fluid">

                <div className="row">
                    <div className="col-lg-6">
                        <div className='p-3 rounded-3 form mt-4'>
                            <h5 className='mb-4'>Create <span className='obj'>your professional Smart Career</span > objective in seconds.</h5>

                            <TextField
                                label="Role"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                required
                                inputProps={{
                                    minLength: 2,
                                    maxLength: 80, // you can set a reasonable character limit
                                }}
                            />

                            <FormControl fullWidth margin="normal" required>
                                <InputLabel id="experience-level-label">Experience Level</InputLabel>
                                <Select
                                    labelId="experience-level-label"
                                    id="experienceLevel"
                                    value={experienceLevel}
                                    label="Experience Level"
                                    onChange={(e) => {
                                        setExperienceLevel(e.target.value);
                                        setError(null);
                                    }}
                                    className='text-start'
                                >
                                    <MenuItem value="">
                                        <em>Select your experience level</em>
                                    </MenuItem>
                                    {experienceLevels.map((level) => (
                                        <MenuItem key={level} value={level}>
                                            {level}
                                        </MenuItem>
                                    ))}

                                </Select>
                            </FormControl>

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

                                <button
                                    onClick={handleGenerateTemplate}
                                    disabled={isLoading}
                                    className='gen-but mx-3 me-0'
                                >
                                    <BsStars /> {isLoading ? 'Generating...' : 'Generate'}
                                </button>
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
                                        Generated Career Objective
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
                                        <h6>Start Strong with the Right Words</h6>
                                        <p>Write a career objective that captures your ambition and sets the tone for your success.</p>
                                    </div>
                                }
                         
                        </div>
                    }


                </div>
            </div>
        </div>


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
                    Generated Career Objective
                    <IconButton onClick={() => setOpenDialog(false)}>
                        <BsX />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <div className='p-3 rounded-3 form text-start mt-4'>
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
    </>
    );
};

export default CareerObjective;
