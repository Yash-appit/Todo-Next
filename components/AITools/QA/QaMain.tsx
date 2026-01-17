"use client"

import React, { useState, useEffect } from 'react';
import qa from "@/assets/Images/AITools/Qa/qa.svg";
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
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    useMediaQuery,
    useTheme
} from '@mui/material';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IoIosArrowDown } from "react-icons/io";
import { QuestionType, GenerateQA } from '@/services/AI/Index';
import { BsStars, BsX } from "react-icons/bs";
// import { ResumeProvider, useResume } from '../../context/ResumeContext';
import empty from "../../../assets/Images/AITools/blank.svg";
import ToastMessage from '@/Layout/ToastMessage';
import SafeAds from '@/common/SafeAds';
import { useDashboard } from '@/hooks/useDashboard';
import Loader from '@/Layout/Loader';
import { HiArrowRight } from 'react-icons/hi';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Define TypeScript interfaces
interface QuestionType {
    id: number;
    type: string;
}

interface QAPair {
    question: string;
    answer: string;
}

interface ExperienceLevel {
    value: string;
    label: string;
}


  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

const QaMain = () => {
    const [token, setToken] = React.useState(getFromLocalStorage('token'));
    const [questionTypeId, setQuestionTypeId] = useState<string>('');
    const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
    const [generatedQA, setGeneratedQA] = useState<QAPair[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isFetchingTypes, setIsFetchingTypes] = useState(false);
    const [company, setCompany] = useState('');
    const [title, setTitle] = useState('');
    const [experienceLevel, setExperienceLevel] = useState<string>('');
    const [numberOfQuestions, setNumberOfQuestions] = useState<string>('');
    const [openDialog, setOpenDialog] = useState(false);

    const experienceLevels: ExperienceLevel[] = [
        { value: 'entry', label: 'Entry Level' },
        { value: 'mid', label: 'Mid Level' },
        { value: 'senior', label: 'Senior Level' },
        { value: 'executive', label: 'Executive Level' }
    ];

    const questionCounts = [5, 10, 15, 20];

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const router = useRouter();
    const { dashboard, fetchDashboard } = useDashboard();

    useEffect(() => {
        if (dashboard?.packageData?.package_status) {
            if (dashboard?.packageData?.package_status !== "active") {
                router.push("/packages");
            }
        } else {
            <Loader />
        }
    }, [dashboard?.packageData?.package_status]);

    const fetchquestionTypes = async () => {
        setIsFetchingTypes(true);
        setError(null);

        try {
            const response = await QuestionType();
            setQuestionTypes(response?.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load industry types');
        } finally {
            setIsFetchingTypes(false);
        }
    };

    const handleGenerateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!questionTypeId || !title.trim()) {
            ToastMessage({
                type: "error",
                message: 'Please enter the required fields',
            });
            return;
        }

        if (!questionTypeId) {
            ToastMessage({
                type: "error",
                message: 'Please select an Question type',
            });
            return;
        }

        if (!title.trim()) {
            ToastMessage({
                type: "error",
                message: 'Please enter a job title',
            });
            return;
        }

        if (!experienceLevel) {
            ToastMessage({
                type: "error",
                message: 'Please select experience level',
            });
            return;
        }

        if (!numberOfQuestions) {
            ToastMessage({
                type: "error",
                message: 'Please select number of questions',
            });
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);
        setGeneratedQA([]);

        try {
            const response = await GenerateQA({
                question_type_id: Number(questionTypeId),
                job_title: title.trim(),
                seniority: experienceLevel,
                questions_no: parseInt(numberOfQuestions)
            });

            // Type assertion or proper typing for the response
            const qaData: QAPair[] = response?.data?.data || [];
            setGeneratedQA(qaData);
            if (isMobile) {
                setOpenDialog(true);
            }
            setSuccess(true);
            fetchDashboard();
        } catch (err: any) {
            ToastMessage({
                type: "error",
                message: err.response?.data?.message || err || 'An error occurred while generating the template',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        const textToCopy = generatedQA.map(qa =>
            `Question: ${qa.question}\nAnswer: ${qa.answer}\n\n`
        ).join('');

        navigator.clipboard.writeText(textToCopy);
        ToastMessage({
            type: "info",
            message: "Copied!",
        });
    };

    useEffect(() => {
        if (token) {
            fetchquestionTypes();
        }
        setToken(getFromLocalStorage('token'));
    }, [token]);

    return (<>
        <div className="container-fluid">
            <div className="row m-0 generate-tool">
                {!token &&
                    <div className="col-lg-6 mb-4 px-0">
                        <div className="bg p-5">
                            <p className='pt-5 mt-2 head-main'>highlights your strengths, shows your personality.</p>
                            <h1 className='my-4'>Interview <span className='sec-col'>Prep Tool – by Todo</span> Resume</h1>
                            <p>Todo Resume helps you practice smarter with realistic interview questions and ideal responses.</p>

                            <Link href={token ? "/qa-generator" : "/login"} className='prim-but main-but mt-5'><span>Create Interview Q&A</span> <FaArrowRight /></Link>
                        </div>
                    </div>
                }

                {token &&
                    <div className="col-lg-6 mb-4 px-0 border-0">
                        <div className="bg">
                            <div className='p-3 rounded-4 form'>
                                <h2 className='mb-4'>Master Common <span className='sec-col'>Interview Questions with Winning </span> Answers</h2>

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
                                        maxLength: 80,
                                    }}
                                />

                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel id="experience-level-label">Experience Level</InputLabel>
                                    <Select
                                        labelId="experience-level-label"
                                        value={experienceLevel}
                                        label="Experience Level"
                                        onChange={(e) => setExperienceLevel(e.target.value)}
                                        className='text-start'
                                    >
                                        <MenuItem value="">
                                            <em>Select experience level</em>
                                        </MenuItem>
                                        {experienceLevels.map((level) => (
                                            <MenuItem key={level.value} value={level.value}>
                                                {level.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel id="questions-count-label">Number of Questions</InputLabel>
                                    <Select
                                        labelId="questions-count-label"
                                        value={numberOfQuestions}
                                        label="Number of Questions"
                                        onChange={(e) => setNumberOfQuestions(e.target.value)}
                                        className='text-start'
                                    >
                                        <MenuItem value="">
                                            <em>Select number of questions</em>
                                        </MenuItem>
                                        {questionCounts.map((count) => (
                                            <MenuItem key={count} value={count.toString()}>
                                                {count}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel id="industry-type-label">Question Type</InputLabel>
                                    <Select
                                        labelId="industry-type-label"
                                        id="questionType"
                                        value={questionTypeId}
                                        label="Question Type"
                                        onChange={(e) => {
                                            setQuestionTypeId(e.target.value);
                                            setError(null);
                                        }}
                                        className='text-start'
                                    >
                                        <MenuItem value="">
                                            <em>Select a Question type</em>
                                        </MenuItem>
                                        {questionTypes.map((type) => (
                                            <MenuItem key={type.id} value={type.id.toString()}>
                                                {type.type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Box sx={{ mt: 3, alignItems: "center", display: "flex", gap: 2, flexWrap: "wrap" }}>
                                    {isMobile && generatedQA.length > 0 &&
                                        <button
                                            onClick={() => setOpenDialog(true)}
                                            className='sec-but'
                                        >
                                            Show result
                                        </button>
                                    }

                                    <button
                                        className='prim-but'
                                        onClick={handleGenerateTemplate}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Generating...' : <> Generate <HiArrowRight className='mx-2 me-0' /> </>}
                                    </button>
                                </Box>

                                {error && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {error}
                                    </Alert>
                                )}
                            </div>

                            {isMobile && <SafeAds />}
                        </div>
                    </div>
                }

                {!isMobile && generatedQA.length > 0 &&
                    <div className="col-lg-6 border-0">
                        {success && generatedQA.length > 0 && (
                            <Box>
                                <div className="bg p-3">
                                    <Typography variant="h5" gutterBottom>
                                        Generated Questions ({generatedQA.length})
                                    </Typography>
                                    <div className='p-3 rounded-3 form text-start'>
                                        <List>
                                            {generatedQA.map((qa, index) => (
                                                <React.Fragment key={index}>
                                                    <Accordion>
                                                        <AccordionSummary
                                                            expandIcon={<IoIosArrowDown />}
                                                            aria-controls={`panel${index}-content`}
                                                            id={`panel${index}-header`}
                                                        >
                                                            <Typography><strong>Question {index + 1}:</strong> {qa.question}</Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails>
                                                            <Typography>
                                                                <strong>Answer:</strong> {qa.answer}
                                                            </Typography>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                    {index < generatedQA.length - 1 && <Divider />}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    </div>

                                    <Button
                                        className='sec-but'
                                        onClick={copyToClipboard}
                                        sx={{ my: 2 }}
                                    >
                                        Copy to Clipboard
                                    </Button>
                                </div>
                            </Box>
                        )}

                        <SafeAds />
                    </div>
                }

                {(!generatedQA || generatedQA.length == 0) &&
                    <div className="col-lg-6 mb-4 pe-0 emp">
                        <div className="bg">
                            <Image src={qa} alt="Interview Preparation" />
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
                    Generated Questions ({generatedQA.length})
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

                {!isLoading && generatedQA.length > 0 && (
                    <Box>
                        <div className='p-3 rounded-3 form text-start mt-4'>
                            <List>
                                {generatedQA.map((qa, index) => (
                                    <React.Fragment key={index}>
                                        <Accordion>
                                            <AccordionSummary
                                                expandIcon={<IoIosArrowDown />}
                                                aria-controls={`panel${index}-content`}
                                                id={`panel${index}-header`}
                                            >
                                                <Typography><strong>Question {index + 1}:</strong> {qa.question}</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Typography>
                                                    <strong>Answer:</strong> {qa.answer}
                                                </Typography>
                                            </AccordionDetails>
                                        </Accordion>
                                        {index < generatedQA.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </div>

                        <Button
                            className='sec-but'
                            onClick={copyToClipboard}
                            sx={{ my: 2 }}
                        >
                            Copy to Clipboard
                        </Button>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    </>)
}

export default QaMain;