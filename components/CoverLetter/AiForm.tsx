import React, { useState } from 'react';
import { CoverLetterGenerator } from '@/services/AI/Index';
import { TextField, Box, CircularProgress } from '@mui/material';
import { BsStars } from 'react-icons/bs';
import ToastMessage from '@/Layout/ToastMessage';

interface AiFormprops {
    close?: any;          // or the actual shape you expect
    setData: any; // HTML string returned from the API
  }

const AiForm: React.FC<AiFormprops> = ({ close, setData }) => {
// const AiForm = ({ close, setData }) => {
    const [formData, setFormData] = useState({
        job_title: '',
        job_description: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const handleChange = (e:any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e:any) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await CoverLetterGenerator(formData);
            
            // Get cvData from sessionStorage
            const cvDataString = sessionStorage.getItem('cvData');
            let cvData = cvDataString ? JSON.parse(cvDataString) : { content: '' };
            
            // Update the content with the generated cover letter
            cvData.content = `<p>${response?.data?.coverLetter || ''}</p>`;
            
            // Store back to sessionStorage
            sessionStorage.setItem('cvData', JSON.stringify(cvData));
            setData(cvData);
            ToastMessage({
                type: 'success',
                message: 'Cover letter Content updated successfully!'    
            });
            close();
        } catch (error) {
            // console.error('Error generating cover letter:', error);
            ToastMessage({
                type: 'error',
                message: 'Failed to generate cover letter. Please try again.'    
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            <TextField
                name="job_title"
                label="Job Title"
                value={formData.job_title}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                name="job_description"
                label="Job Description"
                value={formData.job_description}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                required
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    type="submit"
                    className='prim-but fs-6'
                >
                   <BsStars /> Generate
                </button>
            </Box>
        </Box>
    );
};

export default AiForm;