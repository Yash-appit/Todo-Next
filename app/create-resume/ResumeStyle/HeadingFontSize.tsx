import React, { useState, useEffect } from 'react';
import {
    Box,
    Slider,
    IconButton,
    Button
} from '@mui/material';
import { FaPlus, FaMinus } from "react-icons/fa6";
import { FaUndo } from "react-icons/fa";

interface FontSizeProps {
    Generate: () => void;
}
  const setToLocalStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
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


const HeadingFontSize = ({ Generate }: FontSizeProps) => {
    const [fontSizeValue, setFontSizeValue] = useState(1.0);
    const [showPreview, setShowPreview] = useState(true);

    // Load initial value from localStorage on component mount
    useEffect(() => {
        const savedResumeData = getFromLocalStorage('resumeData');
        if (savedResumeData) {
            try {
                const parsedData = JSON.parse(savedResumeData);
                const savedFontSize = parsedData.resume_data?.settings?.headingFontSize;
                
                if (savedFontSize) {
                    // Parse the fontSize value (it should be a string like "1.2")
                    const numericValue = parseFloat(savedFontSize);
                    if (!isNaN(numericValue) && numericValue >= 1.01 && numericValue <= 2) {
                        setFontSizeValue(numericValue);
                    } else if (!isNaN(numericValue)) {
                        // Clamp the value to valid range
                        const clampedValue = Math.max(1.01, Math.min(2, numericValue));
                        setFontSizeValue(clampedValue);
                    }
                }
            } catch (error) {
                console.error('Error parsing resumeData:', error);
            }
        }
    }, []);

    const updateLocalStorage = (value: number) => {
        const savedResumeData = getFromLocalStorage('resumeData');
        
        if (savedResumeData) {
            try {
                const parsedData = JSON.parse(savedResumeData);

                const updatedData = {
                    resume_data: {
                        ...parsedData.resume_data,
                        settings: {
                            ...parsedData.resume_data?.settings,
                            headingFontSize: value.toString()
                        }
                    }
                };

                setToLocalStorage('resumeData', JSON.stringify(updatedData));
            } catch (error) {
                console.error('Error updating resumeData:', error);
            }
        } else {
            const savedResumeData = getFromLocalStorage('resumeData');
            if(savedResumeData) {
                // If no resumeData exists, create a new one
                const parsedData = JSON.parse(savedResumeData);

                const updatedData = {
                    resume_data: {
                        ...parsedData.resume_data,
                        settings: {
                            ...parsedData.resume_data?.settings,
                            headingFontSize: value.toString()
                        }
                    }
                };

                setToLocalStorage('resumeData', JSON.stringify(updatedData));
            }
        }
    };

    const handleFontSizeChange = (event: Event, newValue: number | number[]) => {
        const value = Array.isArray(newValue) ? newValue[0] : newValue;
        const roundedValue = Math.round(value * 100) / 100; // Round to 2 decimal places
        setFontSizeValue(roundedValue);
        updateLocalStorage(roundedValue);
        
        setTimeout(() => {
            Generate();
        }, 200);
    };

    const decrementFontSize = () => {
        if (fontSizeValue > 1.01) {
            const newValue = Math.round((fontSizeValue - 0.23) * 100) / 100;
            const clampedValue = Math.max(1.01, newValue);
            setFontSizeValue(clampedValue);
            updateLocalStorage(clampedValue);
            
            setTimeout(() => {
                Generate();
            }, 200);
        }
    };

    const incrementFontSize = () => {
        if (fontSizeValue < 2) {
            const newValue = Math.round((fontSizeValue + 0.25) * 100) / 100;
            const clampedValue = Math.min(2, newValue);
            setFontSizeValue(clampedValue);
            updateLocalStorage(clampedValue);
            
            setTimeout(() => {
                Generate();
            }, 200);
        }
    };

    const resetToDefault = () => {
        setFontSizeValue(1.0);
        updateLocalStorage(1.0);
        
        setTimeout(() => {
            Generate();
        }, 200);
    };

    // Format the value label to show 2 decimal places
    const formatValueLabel = (value: number) => {
        return value.toFixed(2);
    };

    // Generate marks for the slider
    const marks = [
        { value: 1.0, label: '1.0x' },
        { value: 1.25, label: '1.25x' },
        { value: 1.5, label: '1.5x' },
        { value: 1.75, label: '1.75x' },
        { value: 2.0, label: '2.0x' }
    ];

    return (
        <Box sx={{ mb: 4 }} className="spacing-setting">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className='pt-4 mb-0'>
                    Heading Font Size
                </h5>
                <Button
                    onClick={resetToDefault}
                    startIcon={<FaUndo />}
                    size="small"
                    variant="outlined"
                    title='Reset to 1.0x'
                    color="secondary"
                    className='prim-but-2 mt-2'
                >
                    Reset
                </Button>
            </div>

            {/* Bootstrap grid system */}
            <div className="row align-items-center g-3">
                <div className="col-auto">
                    <IconButton
                        onClick={decrementFontSize}
                        disabled={fontSizeValue <= 1.01}
                        color="primary"
                        sx={{
                            border: '1px solid',
                            borderColor: 'primary.main',
                            borderRadius: 1
                        }}
                    >
                        <FaMinus />
                    </IconButton>
                </div>
                <div className="col">
                    <Slider
                        value={fontSizeValue}
                        onChange={handleFontSizeChange}
                        aria-labelledby="font-size-slider"
                        valueLabelDisplay="auto"
                        marks={marks}
                        min={1.0}
                        max={2.0}
                        step={0.25}
                        sx={{
                            color: 'primary.main',
                            height: 8,
                            '& .MuiSlider-thumb': {
                                width: 20,
                                height: 20,
                                backgroundColor: '#fff',
                                border: '2px solid currentColor',
                                '&:focus, &:hover, &.Mui-active': {
                                    boxShadow: '0 0 0 8px rgba(63, 81, 181, 0.16)',
                                },
                            },
                            '& .MuiSlider-valueLabel': {
                                backgroundColor: 'primary.main',
                                borderRadius: 1,
                                fontSize: 12,
                            },
                        }}
                    />
                </div>
                <div className="col-auto">
                    <IconButton
                        onClick={incrementFontSize}
                        disabled={fontSizeValue >= 2}
                        color="primary"
                        sx={{
                            border: '1px solid',
                            borderColor: 'primary.main',
                            borderRadius: 1
                        }}
                    >
                        <FaPlus />
                    </IconButton>
                </div>
            </div>
        </Box>
    );
};

export default HeadingFontSize;