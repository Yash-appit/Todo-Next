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
import qa from "@/assets/Images/Admin/qa.svg";
import { BsStars, BsX } from "react-icons/bs";
import ToastMessage from '@/Layout/ToastMessage';
// import { ResumeProvider, useResume } from '../../context/ResumeContext';
import Loader from '@/Layout/Loader';
import empty from "@/assets/Images/AITools/blank.svg";
import SafeAds from '@/common/SafeAds';
import { useDashboard } from '@/hooks/useDashboard';
import Image from 'next/image';
import { useRouter } from 'next/navigation';


const QA = () => {
    const [questionTypeId, setQuestionTypeId] = useState('');
    const [questionTypes, setQuestionTypes] = useState([]);
    const [generatedQA, setGeneratedQA] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isFetchingTypes, setIsFetchingTypes] = useState(false);
    const [company, setCompany] = useState('');
    const [title, setTitle] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [numberOfQuestions, setNumberOfQuestions] = useState('');
    const [openDialog, setOpenDialog] = useState(false);

    const experienceLevels = [
        { value: 'entry', label: 'Entry Level' },
        { value: 'mid', label: 'Mid Level' },
        { value: 'senior', label: 'Senior Level' },
        { value: 'executive', label: 'Executive Level' }
    ];


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

    const questionCounts = [5, 10, 15, 20];

    const fetchquestionTypes = async () => {
        setIsFetchingTypes(true);
        setError(null);

        try {
            const response = await QuestionType();
            setQuestionTypes(response?.data || []);
        } catch (err:any) {
            setError(err.response?.data?.message || 'Failed to load industry types');
        } finally {
            setIsFetchingTypes(false);
        }
    };

    const handleGenerateTemplate = async (e:any) => {
        e.preventDefault();

        if (!questionTypeId || !title.trim()) {
            ToastMessage({
                type: "error",
                message: 'Please enter the required fields',
            });
            return;
        }


        if (!questionTypeId) {
            // setError('Please select an Question type');
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
            // setError('Please enter a job title');
            return;
        }

        if (!experienceLevel) {
            ToastMessage({
                type: "error",
                message: 'Please select experience level',
            });
            // setError('Please select experience level');
            return;
        }

        if (!numberOfQuestions) {
            ToastMessage({
                type: "error",
                message: 'Please select number of questions',
            });
            // setError('Please select number of questions');
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
                questions_no: numberOfQuestions
            });

            setGeneratedQA(response?.data?.data || []);
            if (isMobile) {
                setOpenDialog(true);
            }
            setSuccess(true);
            fetchDashboard();
        } catch (err:any) {
            // setError(err.response?.data?.message || err || 'An error occurred while generating the template');
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
        fetchquestionTypes();
    }, []);

    return (
        <>

            <div className="generate-tool text-end">
                <h4> <img src={qa} alt="" /> Interview <span className='sec-col'>Question</span> and Answer</h4>
                <div className="container-fluid">

                    <div className="row">
                        <div className="col-lg-6">
                            <div className='p-3 rounded-3 form mt-4'>
                                <h5 className='mb-4'>Master Common <span className='int'>Interview Questions with Winning </span > Answers</h5>

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
                                        maxLength: 80, // you can set a reasonable character limit
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
                                            <MenuItem key={count} value={count}>
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
                                        {questionTypes.map((type:any) => (
                                            <MenuItem key={type.id} value={type.id}>
                                                {type.type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Box sx={{ mt: 3, alignItems: "center", display: "flex", justifyContent: "end" }}>

                                    {isMobile && generatedQA.length > 0 &&
                                        <button
                                            onClick={() => setOpenDialog(true)}
                                            className='gen-but'
                                        >
                                            Show result
                                        </button>
                                    }


                                    <button
                                        className='gen-but mx-3 me-0'
                                        onClick={handleGenerateTemplate}
                                        disabled={isLoading}
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
                                {success && generatedQA.length > 0 && (
                                    <Box sx={{ pt: 2 }}>
                                        <Typography variant="h5" gutterBottom>
                                            Generated Questions ({generatedQA.length})
                                        </Typography>
                                        <div className='p-3 rounded-3 form text-start mt-4'>
                                            <List>
                                                {generatedQA.map((qa:any, index) => (
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
                                        </div >

                                        <Button
                                            className='sec-but'
                                            onClick={copyToClipboard}
                                            sx={{ my: 2 }}
                                        >
                                            Copy to Clipboard
                                        </Button>
                                    </Box>
                                )}



        <SafeAds />

                                {generatedQA.length == 0 &&
                                    <div className='p-5 pt-0 text-center empty'>
                                        <Image src={empty} alt="" className='w-100 p-5 pt-2' />
                                        <h6>Ace Every Interview with Confidence</h6>
                                        <p>Prepare with tailored questions and answers that highlight your strengths and impress recruiters.</p>
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

                    <Box>

                        <div className='p-3 rounded-3 form text-start mt-4'>
                            <List>
                                {generatedQA.map((qa:any, index) => (
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
                        </div >

                        <Button
                            className='sec-but'
                            onClick={copyToClipboard}
                            sx={{ my: 2 }}
                        >
                            Copy to Clipboard
                        </Button>
                    </Box>

                </DialogContent>
            </Dialog>
        </>
    );
};

export default QA;
