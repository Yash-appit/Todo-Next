"use client"

import React, { useEffect, useState } from 'react';
import lin from "@/assets/Images/AITools/linkedin-bio/lin-bio.svg";
import { FaArrowRight, FaTrash } from "react-icons/fa6";
import { useForm } from 'react-hook-form';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    FormControl,
    FormHelperText,
    Paper,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    useMediaQuery,
    useTheme,
    TextField
} from '@mui/material';
import { FaUpload } from "react-icons/fa6";
import { styled } from '@mui/material/styles';
import { BsStars, BsX } from "react-icons/bs";
import linkedin from "../../../assets/Images/Admin/lin.svg";
import empty from "../../../assets/Images/AITools/blank.svg";
import { LinkedinBio } from '@/services/AI/Index';
import ToastMessage from '@/Layout/ToastMessage';
import Loader from '@/Layout/Loader';
import SafeAds from '@/common/SafeAds';
import { useDashboard } from '@/hooks/useDashboard';
import { HiArrowRight } from 'react-icons/hi';
import '@/styles/Admin.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});


  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

const LinkedinBioMain = () => {
    const [token, setToken] = React.useState(getFromLocalStorage('token'));
    const {
        handleSubmit,
    } = useForm();
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [bio, setBio] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const [description, setDescription] = useState<string>('');
    const { fetchDashboard } = useDashboard();

    const copy = {
        copyBio: async () => {
            await navigator.clipboard.writeText(bio);
            ToastMessage({
                type: "info",
                message: "Copied!",
            });
        }
    }

    const packageData = getFromLocalStorage("package");
    const shouldShowAds = packageData !== "true";

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            const fileType = selectedFile.type;
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

            if (validTypes.includes(fileType)) {
                setFile(selectedFile);
                setError(null);
            } else {
                setFile(null);
                ToastMessage({
                    type: "error",
                    message: 'Please upload a PDF or DOC/DOCX file only.',
                });
            }
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        // Clear the file input value to allow re-uploading the same file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const onSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            if (file) {
                formData.append('resume', file);
            }

            formData.append('description', description.trim());

            const response = await LinkedinBio(formData);
            setBio(response?.data?.data);
            fetchDashboard();
        } catch (err) {
            ToastMessage({
                type: "error",
                message: err || 'Failed to generate LinkedIn bio. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (<>
        <div className="container-fluid generate-tool">
            <div className="row m-0">
                {!token &&
                    <div className="col-lg-6 mb-4 px-0">
                        <div className="bg p-5">
                            <h4 className='pt-5 mt-2'>highlights your strengths, shows your personality.</h4>
                            <h1 className='my-4'>Craft Your <span className='sec-col'>Perfect LinkedIn Bio</span> with AI</h1>
                            <p>Let Todo Resume's AI turn your experience into a standout LinkedIn summary - professionally written, recruiter-ready, and uniquely you.</p>

                            <Link href={token ? "/linkedin-bio-generator" : "/login"} type='button' className='prim-but main-but my-5'><span>Create Linkedin Bio</span> <FaArrowRight /></Link>
                        </div>
                    </div>
                }

                {token &&
                    <div className="col-lg-6 mb-4 px-0 border-0">
                        <div className="bg">
                            <div className='p-4 rounded-4 form'>
                                <h2 className='mb-4'>Generate a smart, <span className='sec-col'>professional LinkedIn Bio in seconds</span> that gets attention.</h2>
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <FormControl fullWidth error={!!error}>
                                            {!file ? (
                                                <Button
                                                    component="label"
                                                    fullWidth
                                                    className='upload-but'
                                                >
                                                    <FaUpload className='me-1 ' />Upload Your Resume (PDF or DOC)
                                                    <VisuallyHiddenInput
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        accept=".pdf,.doc,.docx"
                                                    />
                                                </Button>
                                            ) : (
                                                <Box 
                                                    sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'space-between',
                                                        p: 2,
                                                        border: '1px solid #e0e0e0',
                                                        borderRadius: 1,
                                                        backgroundColor: '#f5f5f5'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <FaUpload />
                                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                                            Selected file: {file.name}
                                                        </Typography>
                                                    </Box>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={handleRemoveFile}
                                                        sx={{ color: '#f44336' }}
                                                        title="Remove file"
                                                    >
                                                        <FaTrash />
                                                    </IconButton>
                                                </Box>
                                            )}
                                            {error && <FormHelperText>{error}</FormHelperText>}
                                        </FormControl>
                                    </div>

                                    <div className="col-12 mb-3">
                                        <TextField
                                            fullWidth
                                            label="Enter your description"
                                            multiline
                                            rows={4}
                                            variant="outlined"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            inputProps={{
                                                minLength: 2,
                                                maxLength: 3000,
                                            }}
                                            placeholder="e.g., Experienced software engineer with 5+ years in web development, specializing in React and Node.js..."
                                        />
                                    </div>

                                    <div className="col-12">
                                        <Box sx={{ mt: 3, alignItems: "center", display: "flex", gap: 2, paddingLeft: 3 }}>
                                            {isMobile && bio &&
                                                <button
                                                    onClick={() => setOpenDialog(true)}
                                                    className='sec-but'
                                                >
                                                    Show result
                                                </button>
                                            }

                                            <button
                                                onClick={onSubmit}
                                                disabled={isLoading || (!file && description.trim().length === 0)}
                                                className='prim-but'
                                            >
                                                {isLoading ? 'Generating...' : <> Generate <HiArrowRight className='mx-2 me-0'/></>}
                                            </button>
                                        </Box>
                                    </div>
                                </div>
                            </div>

                            {isMobile && <SafeAds />}
                        </div>
                    </div>
                }

                {!isMobile && bio && (
                    <div className="col-lg-6 border-0 mb-4">
                        <div className="bg">
                            {isLoading && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            )}
                            {bio && (
                                <div className='p-4 rounded-3 form text-start'>
                                    <Typography variant="h5" gutterBottom>
                                        Your LinkedIn Bio:
                                    </Typography>
                                    <Paper elevation={2} sx={{ p: 3, mb: 2, whiteSpace: 'pre-wrap' }}>
                                        {bio}
                                    </Paper>
                                </div>
                            )}

                            {bio &&
                                <Button
                                    variant="outlined"
                                    className='sec-but mx-3'
                                    onClick={copy.copyBio}
                                >
                                    Copy to Clipboard
                                </Button>
                            }

                            <SafeAds />
                        </div>
                    </div>
                )}

                {!bio &&
                    <div className="col-lg-6 mb-4 pe-0 emp border-0">
                        <div className="bg p-4 pb-0">
                            <img src={lin.src} alt="" className='p-4' />
                        </div>
                    </div>
                }
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
                    Your LinkedIn Bio:
                    <IconButton onClick={() => setOpenDialog(false)}>
                        <BsX />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                )}
                {bio && (
                    <div className='p-3 rounded-3 form text-start mt-4'>
                        <Paper elevation={2} sx={{ p: 3, mb: 2, whiteSpace: 'pre-wrap' }}>
                            {bio}
                        </Paper>

                        {bio &&
                            <Button
                                variant="outlined"
                                className='sec-but'
                                onClick={copy.copyBio}
                            >
                                Copy to Clipboard
                            </Button>
                        }
                    </div>
                )}
            </DialogContent>
        </Dialog>
    </>)
}

export default LinkedinBioMain;