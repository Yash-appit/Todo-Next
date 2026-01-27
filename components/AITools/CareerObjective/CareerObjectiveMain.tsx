"use client"

import React, { useState, useEffect } from 'react';
import cb from "@/assets/Images/AITools/cb.svg";
import Image from 'next/image';
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
import { IndustryType, CareerObjectiveGenerator } from '@/services/AI/Index';
import { BsStars, BsX } from "react-icons/bs";
import ToastMessage from '@/Layout/ToastMessage';
import { HiArrowRight } from "react-icons/hi";
import Link from 'next/link';

// import Ads from '../../../Home/Ads';

const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
    }
    return null;
};

const EmailTempMain = () => {
    const [token, setToken] = React.useState(getFromLocalStorage('token'));
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
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load industry types');
        } finally {
            setIsFetchingTypes(false);
        }
    };

    const handleGenerateTemplate = async (e: any) => {
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
        } catch (err: any) {
            // setError(err.response?.data?.message || 'An error occurred while generating the template');
            ToastMessage({
                type: "error",
                message: err?.response?.data?.message || err || 'An error occurred while generating the template',
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
            <div className="generate-tool row m-0">
                <div className="col-lg-6 mb-4 px-0 border-0">
                    <div className="bg p-5">
                        {!token && (<>
                            <p className='pt-5 mt-2 head-main'>highlights your strengths, shows your personality.</p>
                            <h1 className='my-4'>Online <span className='sec-col'>Smart Career Objective</span> Tool</h1>
                            <p>Write a job-winning career objective in seconds with Todo Resume’s AI - </p>

                            <p>smart, professional, and tailored to your goals.</p>
                            <Link href={token ? "/qa-generator" : "/login"} type="button" className='prim-but main-but mt-5'><span>Create Career Objective</span> <FaArrowRight /></Link>
                        </>)}

                        {token &&
                            <>
                                <div className='rounded-3 form mt-4'>
                                    <h2 className='mb-4'>Create <span className='sec-col'>your professional Smart Career objective</span > in seconds.</h2>

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
                                            {industryTypes.map((type: any) => (
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
                                            {isLoading ? 'Generating...' : <>Generate <HiArrowRight className='mx-2 me-0' /></>}
                                        </button>
                                    </Box>


                                    {error && (
                                        <Alert severity="error" sx={{ mt: 2 }}>
                                            {error}
                                        </Alert>
                                    )}
                                </div>

                                {/* {isMobile &&

                                    <Ads />


                                } */}
                            </>
                        }
                    </div>




                </div>
                <div className="col-lg-6 mb-4 pe-0 border-0">

                    {!success && !jobDescription && (
                        <div className="bg">
                            <Image src={cb} alt="" />
                        </div>
                    )}

                    {/* <Ads /> */}
                </div>

                {success && jobDescription && (
                    <div className="col-lg-6 border-0 mb-4 pe-0 border-0">
                        <div className="bg">
                            {success && jobDescription && (
                                <div className='p-3 rounded-3 form text-start'>
                                    <Typography variant="h5" gutterBottom>
                                        Generated Career Objective
                                    </Typography>
                                    <Typography variant='body2' px={{ mt: 4 }}>
                                        {jobDescription}
                                    </Typography>



                                    <Button
                                        variant="outlined"
                                        className='sec-but mt-4'
                                        onClick={copy.copyJobDescription}
                                    >
                                        Copy to Clipboard
                                    </Button>
                                </div>
                            )}

                        </div>
                        {/* <Ads /> */}

                    </div>
                )}
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
    </>)
}

export default EmailTempMain
