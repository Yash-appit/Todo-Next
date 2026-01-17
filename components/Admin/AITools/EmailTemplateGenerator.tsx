"use client"

import React, { useState, useEffect } from 'react';
import { EmailType, EmailTemplateGen } from '@/services/AI/Index';
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    useMediaQuery,
    useTheme
} from '@mui/material';
import et from "@/assets/Images/Admin/et.svg";
import { BsStars, BsX } from "react-icons/bs";
import ToastMessage from '@/Layout/ToastMessage';
// import { ResumeProvider, useResume } from '../../context/ResumeContext';
import empty from "@/assets/Images/AITools/blank.svg";
import SafeAds from '@/common/SafeAds';
import { useDashboard } from '@/hooks/useDashboard';
import Image from 'next/image';
// import ToastMessage from '../Layout/ToastMessage'


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

const EmailTemplateGenerator = () => {
    const [isChecking, setIsChecking] = useState(true);
    const [emailTypeId, setEmailTypeId] = useState('');
    const [emailTypes, setEmailTypes] = useState([]);
    const [template, setTemplate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isFetchingTypes, setIsFetchingTypes] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const { fetchDashboard } = useDashboard();
    
    // const {
    //     dashboard
    // } = useResume();
    // const shouldShowAds = dashboard?.packageData?.package_status !== "active";
     const packageData = getFromLocalStorage("package");
     const shouldShowAds = packageData !== "true";

    const copy = {
        copyJobDescription: async () => {
            await navigator.clipboard.writeText(template);
            ToastMessage({
                type: "info",
                message: "Copied!",
            });
        }
    }

    const fetchEmailTypes = async () => {
        setIsFetchingTypes(true);
        setError(null);

        try {
            const response = await EmailType();
            setEmailTypes(response?.data);
        } catch (err: any) {
            // setError(err.response?.data?.message || 'Failed to load email types');
            ToastMessage({
                type: "error",
                message: err.response?.data?.message || 'Failed to load email types',
            });
        } finally {
            setIsFetchingTypes(false);
        }
    };

    const handleGenerateTemplate = async (e: any) => {
        e.preventDefault();

        if (!emailTypeId) {
            // setError('Please select an email type');
            // return;
            ToastMessage({
                type: "error",
                message: 'Please select an email type',
            });
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await EmailTemplateGen({
                email_type_id: Number(emailTypeId),
            });

            let templateContent = response?.data?.data || '';
    
            // Check if name exists in localStorage and replace (Candidate Name)
            try {
                const storedName = getFromLocalStorage('name');
                if (storedName && storedName.trim() !== '') {
                    // Replace all occurrences of (Candidate Name) with the stored name
                    templateContent = templateContent.replace(/\[Candidate Name\]/g, storedName);
                    // console.log( templateContent );
                    
                }
            } catch (storageError) {
                console.error('Error accessing localStorage:', storageError);
            }
        
            setTemplate(templateContent);
            setSuccess(true);
                if (isMobile) {
                setOpenDialog(true);
            }
                      fetchDashboard();
        } catch (err: any) {

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
        fetchEmailTypes();
    }, []);

    return (<>
   
        <div className="generate-tool text-end">
            <h4> <img src={et} alt="" /> Email <span className='sec-col'>Template</span> Generator</h4>
            <div className="container-fluid">

                <div className="row">
                    <div className="col-lg-6">
                        <div className='p-3 rounded-3 form mt-4'>
                            <h5 className='mb-4'>Generate personalized <span className='et'> emails in seconds for seamless </span > workplace communication.</h5>

                           
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel id="email-type-label">Select Email Type</InputLabel>
                                <Select
                                    labelId="email-type-label"
                                    id="emailType"
                                    value={emailTypeId}
                                    label="Select Email Type"
                                    onChange={(e) => {
                                        setEmailTypeId(e.target.value);
                                        setError(null);
                                    }}
                                    required
                                    disabled={isFetchingTypes}
                                    className='text-start'
                                >
                                    <MenuItem value="">
                                        <em>Select an email type</em>
                                    </MenuItem>
                                    {emailTypes.map((type: any) => (
                                        <MenuItem key={type.id} value={type.id}>
                                            {type.type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <div className="flex items-center justify-between">
                                {isMobile && template &&
                                    <button
                                        onClick={() => setOpenDialog(true)}
                                        className='gen-but'
                                    >
                                        Show result
                                    </button>
                                }

                                <button
                                    onClick={handleGenerateTemplate}
                                    className="gen-but mx-3 me-0"
                                    disabled={isLoading}
                                >
                                    <BsStars /> {isLoading ? 'Generating...' : 'Generate'}
                                </button>
                            </div>
                            {/* </form> */}

                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}
                        </div>

                        {isMobile &&


                         

      <SafeAds />
                        

                        }
                    </div>

                    {!isMobile &&
                        <div className="col-lg-6 border-0">
                            {success && template && (
                                <div className='p-3 rounded-3 form text-start mt-4'>
                                    {/* <h2 className="text-xl font-semibold mb-2">Generated Template</h2> */}
                                    <Typography variant="h5" gutterBottom>
                                        Generated Template
                                    </Typography>
                                    <div className="bg-gray-50 p-4 whitespace-pre-wrap">
                                        {template}
                                    </div>

                                    <div className="mt-4">
                                        <Button
                                            onClick={copy.copyJobDescription}
                                            variant="outlined"
                                            className="sec-but"
                                        >
                                            Copy to Clipboard
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* <ResumeProvider> */}
      <SafeAds />

                                {!template &&
                                    <div className='p-5 pt-0 text-center empty'>
                                        <Image src={empty} alt="" className='w-100 p-5 pt-2' />
                                        <h6>Written to Impress, Built to Win</h6>
                                        <p>Create ATS-friendly, recruiter-approved templates that give your application a winning edge.</p>
                                    </div>
                                }
                            {/* </ResumeProvider> */}
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
                    Generated Template
                    <IconButton onClick={() => setOpenDialog(false)}>
                        <BsX />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <div className='p-3 rounded-3 form text-start mt-4'>
                    {/* <h2 className="text-xl font-semibold mb-2">Generated Template</h2> */}
                    <div className="bg-gray-50 p-4 whitespace-pre-wrap">
                        {template}
                    </div>

                    <div className="mt-4">
                        <Button
                            onClick={copy.copyJobDescription}
                            className="sec-but"
                        >
                            Copy to Clipboard
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

    </>);
};

export default EmailTemplateGenerator;
