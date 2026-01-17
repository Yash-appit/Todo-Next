import React, { useState, useEffect } from 'react';
import {
    Box,
    Slider,
    IconButton,
    Button
} from '@mui/material';
import { FaPlus, FaMinus } from "react-icons/fa6";
import { FaUndo } from "react-icons/fa";

interface SpacingSettingProps {
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

const SpacingSetting = ({ Generate }: SpacingSettingProps) => {
    const [spacingValue, setSpacingValue] = useState(0);
    const [showPreview, setShowPreview] = useState(true);

    // Load initial value from localStorage on component mount
    useEffect(() => {
        const savedResumeData = getFromLocalStorage('resumeData');
        const settings = getFromLocalStorage('settings');
        
        // First, try to get from resumeData (existing logic)
        if (savedResumeData) {
            try {
                const parsedData = JSON.parse(savedResumeData);
                const savedSpacing = parsedData.resume_data?.settings?.spacing;
                
                if (savedSpacing) {
                    // Extract numeric value from px string (e.g., "5px" -> 5)
                    const numericValue = parseInt(savedSpacing.replace('px', ''));
                    if (!isNaN(numericValue)) {
                        setSpacingValue(numericValue);
                        return; // Exit if found in resumeData
                    }
                }
            } catch (error) {
                console.error('Error parsing resumeData:', error);
            }
        }
        
        // If not found in resumeData, try to get from settings
        if (settings) {
            try {
                const parsedSettings = JSON.parse(settings);
                const savedSpacing = parsedSettings.spacing;
                
                if (savedSpacing) {
                    // Extract numeric value from px string (e.g., "2px" -> 2)
                    const numericValue = parseInt(savedSpacing.replace('px', ''));
                    if (!isNaN(numericValue)) {
                        setSpacingValue(numericValue);
                        // console.log('Loaded spacing from settings:', numericValue);
                    }
                }
            } catch (error) {
                console.error('Error parsing settings:', error);
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
                            spacing: `${value}px`
                        }
                    }
                };

                setToLocalStorage('resumeData', JSON.stringify(updatedData));
            } catch (error) {
                console.error('Error updating resumeData:', error);
            }
        } else {
            // If no resumeData exists, create a new one
            const savedResumeData = getFromLocalStorage('resumeData');
            if(savedResumeData){
                const parsedData = JSON.parse(savedResumeData);

                const updatedData = {
                    resume_data: {
                        ...parsedData.resume_data,
                        settings: {
                            ...parsedData.resume_data?.settings,
                            spacing: `${value}px`
                        }
                    }
                };

                setToLocalStorage('resumeData', JSON.stringify(updatedData)); 
            }
        }
        
        // Also update the settings object
        const currentSettings = getFromLocalStorage('settings');
        if (currentSettings) {
            try {
                const parsedSettings = JSON.parse(currentSettings);
                const updatedSettings = {
                    ...parsedSettings,
                    spacing: `${value}px`
                };
                setToLocalStorage('settings', JSON.stringify(updatedSettings));
            } catch (error) {
                console.error('Error updating settings:', error);
            }
        }
    };

    const handleSpacingChange = (event: Event, newValue: number | number[]) => {
        const value = Array.isArray(newValue) ? newValue[0] : newValue;
        setSpacingValue(value);
        updateLocalStorage(value);
        
        setTimeout(() => {
            Generate();
        }, 200);
    };

    const decrementSpacing = () => {
        if (spacingValue > -10) {
            const newValue = spacingValue - 1;
            setSpacingValue(newValue);
            updateLocalStorage(newValue);
            
            setTimeout(() => {
                Generate();
            }, 200);
        }
    };

    const incrementSpacing = () => {
        if (spacingValue < 10) {
            const newValue = spacingValue + 1;
            setSpacingValue(newValue);
            updateLocalStorage(newValue);
            
            setTimeout(() => {
                Generate();
            }, 200);
        }
    };

    const resetToDefault = () => {
        setSpacingValue(0);
        updateLocalStorage(0);
        
        setTimeout(() => {
            Generate();
        }, 200);
    };

    return (
        <Box sx={{ mb: 4 }} className="spacing-setting sec-space">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className='pt-4 mb-0'>
                    Letter Spacing: {spacingValue}px
                </h5>
                <Button
                    onClick={resetToDefault}
                    startIcon={<FaUndo />}
                    size="small"
                    variant="outlined"
                    title='Reset'
                    color="secondary"
                    className='prim-but-2 mt-2'
                >
              
                </Button>
            </div>

            {/* Bootstrap grid system for slider controls */}
            <div className="row align-items-center g-3">
                <div className="col-auto">
                    <IconButton
                        onClick={decrementSpacing}
                        disabled={spacingValue <= -10}
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
                        value={spacingValue}
                        onChange={handleSpacingChange}
                        aria-labelledby="spacing-slider"
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}`}
                        marks
                        min={-10}
                        max={10}
                        step={1}
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
                        onClick={incrementSpacing}
                        disabled={spacingValue >= 10}
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

export default SpacingSetting;