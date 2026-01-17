"use client"

import React, { useState, useEffect } from 'react';
import emp from "@/assets/Images/AITools/email-temp/em-temp.svg";
import { FaArrowRight } from "react-icons/fa6";
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
// import { ResumeProvider, useResume } from '../../context/ResumeContext';
import empty from "@/assets/Images/AITools/blank.svg";
import ToastMessage from '@/Layout/ToastMessage';
import { useDashboard } from '@/hooks/useDashboard';
import { HiArrowRight } from "react-icons/hi";
import Link from 'next/link';
import Image from 'next/image';

  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

const CareerObjectiveMain = () => {
    const [token, setToken] = React.useState(getFromLocalStorage('token'));
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
        } catch (err:any) {
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
        if (token) {
            fetchEmailTypes();
        }
        setToken(getFromLocalStorage('token'));
    }, [token]);


    return (<>
        <div className="container-fluid">
           
                {!token &&
                  <div className="row m-0 generate-tool">
                        <div className="col-lg-6 mb-4 px-0">
                            <div className="bg p-5">
                                <p className='pt-5 mt-2 head-main'>highlights your strengths, shows your personality.</p>
                                <h1 className='my-4'>AI-Powered <span className='sec-col'>Email Writing</span> Tool</h1>
                                <p>Let Todo Resume help you write clear, effective emails for job applications, follow-ups, and more.</p>


                                <Link href={token ? "/email-template-generator" : "/login"} type="button" className='prim-but main-but mt-5'><span>Create Email Template</span> <FaArrowRight /></Link>
                            </div>
                        </div>
                        <div className="col-lg-6 mb-4 pe-0 emp">
                            <div className="bg">
                                <Image src={emp} alt="" />
                            </div>
                        </div>
                    </div>
                }

                {token &&
                <div className="row text-center w-100 justify-content-center mb-4">
                    <div className="col-lg-7">
                        <h2 className='mb-4'>Generate personalized <span className='sec-col'> emails in seconds for seamless </span > workplace communication.</h2>
                        <div className="bg h-auto bg-white rounded-4">
                            <div className='p-4 rounded-3 form mt-4'>
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
                                        {emailTypes.map((type:any) => (
                                            <MenuItem key={type.id} value={type.id}>
                                                {type.type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <div className="flex items-center">
                                    {isMobile && template &&
                                        <button
                                            onClick={() => setOpenDialog(true)}
                                            className='sec-but'
                                        >
                                            Show result
                                        </button>
                                    }

                                    <button
                                        onClick={handleGenerateTemplate}
                                        className="prim-but m-2"
                                        disabled={isLoading}
                                    >
                                     {isLoading ? 'Generating...' : <> Generate <HiArrowRight className='mx-2 me-0' /> </>}
                                    </button>
                                </div>
                                {/* </form> */}

                                {error && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                        <span className="block sm:inline">{error}</span>
                                    </div>
                                )}
                            </div>


                            {!isMobile &&
                        <div className="mt-4">
                            {success && template && (
                                <div className='p-3 rounded-3 form text-start mt-4'>
                                    {/* <h2 className="text-xl font-semibold mb-2">Generated Template</h2> */}
                                    <Typography variant="h5" gutterBottom px={{ textAlign: 'center', textWeight: 'bold' }}>
                                        Generated Template
                                    </Typography>
                                    <div className="bg-gray-50 p-4 whitespace-pre-wrap">
                                        {template}
                                    </div>

                                    <div className="m-4 mb-0 mt-3 text-center">
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
                        </div>
                    }
                        </div>
                    </div>
                            </div>
                }
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

    </>)
}

export default CareerObjectiveMain
