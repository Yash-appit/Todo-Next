"use client"

import { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import ToastMessage from '@/Layout/ToastMessage';
import { useForm } from 'react-hook-form';
import { TextField } from '@mui/material';
import { feedback } from '@/services/contact';
import { FaStar } from 'react-icons/fa';
import '@/styles/Other.css';
// import { ResumeProvider, useResume } from '../../context/ResumeContext';
import SafeAds from '@/common/SafeAds';

type FeedbackFormData = {
    title: string;
    message: string;
    rating: number;
};

const Feedback = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FeedbackFormData>();
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        message: '',
        variant: 'success'
    });
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const packageData = localStorage.getItem("package");
     const shouldShowAds = packageData !== "true";
    // const { dashboard } = useResume();
    // const shouldShowAds = dashboard?.packageData?.package_status !== "active";

    const onSubmit = async (data: FeedbackFormData) => {
        setIsLoading(true);
        try {
            // Create a new object with feedback_title instead of title
            const feedbackData = {
                feedback_title: data.title,
                message: data.message,
                rating: rating
            };
            
            const response = await feedback(feedbackData); // Send the modified data
            const message = response.data.message;
            ToastMessage({
                type: "success",
                message,
            });
            reset();
            setRating(0);
        } catch (error) {
            const errorMessage = error || "An error occurred. Please try again.";
            ToastMessage({
              type: "error",
              message: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (<>
        <div className="container change-pass feedback-page py-2 px-5">
            {shouldShowAds &&
        <SafeAds />
            }
            <form onSubmit={handleSubmit(onSubmit)} className='row p-3'>
                <div className="pb-4 pt-2 page-head">
                    <h5>Feedback<span>/Suggestion</span></h5>
                </div>

                <div className="col-lg-6 mb-4">
                    <TextField
                        label="Title"
                        className='sec-bg'
                        fullWidth
                        {...register("title", { 
                            required: "Title is required",
                            maxLength: {
                                value: 200,
                                message: "Title should not exceed 500 characters"
                            },
                            minLength: {
                                value: 10,
                                message: "Title should be at least 10 characters"
                            }
                            
                        })}
                        error={!!errors.title}
                        helperText={errors.title?.message}
                    />
                </div>  
                
                <div className="col-lg-6 mb-4">
                    <div className="main-star mb-3">
                        <label className="form-label mb-0">Rate</label>
                        <div className="star-rating">
                            {[...Array(5)].map((star, index) => {
                                const ratingValue = index + 1;
                                return (
                                    <label key={index}>
                                        <input 
                                            type="radio" 
                                            name="rating" 
                                            value={ratingValue} 
                                            onClick={() => setRating(ratingValue)}
                                            style={{ display: 'none' }}
                                        />
                                        <FaStar 
                                            className="star mx-2" 
                                            color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"} 
                                            size={50}
                                            onMouseEnter={() => setHover(ratingValue)}
                                            onMouseLeave={() => setHover(0)}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                        {errors.rating && (
                            <p className="text-danger small mt-1">{errors.rating.message}</p>
                        )}
                    </div>
                </div>

                <div className="col-lg-12 mb-4">
                    <TextField
                        label="Message"
                        className='sec-bg rounded-3'
                        fullWidth
                        multiline
                        rows={6}
                        {...register("message", { 
                            required: "Message is required",
                            maxLength: {
                                value: 500,
                                message: "Message should not exceed 500 characters"
                            },
                            minLength: {
                                value: 10,
                                message: "Message should be at least 10 characters"
                            }
                        })}
                        error={!!errors.message}
                        helperText={errors.message?.message}
                    />
                </div>

                <div className="col-lg-12 mb-3 text-end">
                    <button type="submit" className='prim-but'>
                        {isLoading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                <span className="ms-2">Submitting...</span>
                            </>
                        ) : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
        </>)
}

export default Feedback;
