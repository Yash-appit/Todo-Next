import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Slider,
    IconButton,
    Button
} from '@mui/material';
import { FaPlus, FaMinus } from "react-icons/fa6";
import { FaUndo } from "react-icons/fa";

interface LineHeightSettingProps {
    Generate: () => void;
}

const LineHeightSetting = ({ Generate }: LineHeightSettingProps) => {
    const [heightValue, setHeightValue] = useState(100);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

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
    // Load initial value from localStorage on component mount
    useEffect(() => {
        const savedResumeData = getFromLocalStorage('resumeData');
        const settings = getFromLocalStorage('settings');
        
        // First, try to get from resumeData (existing logic)
        if (savedResumeData) {
            try {
                const parsedData = JSON.parse(savedResumeData);
                const savedHeight = parsedData.resume_data?.settings?.letterHeight;
                
                if (savedHeight) {
                    // Extract numeric value from percentage string (e.g., "125%" -> 125)
                    const numericValue = parseInt(savedHeight.replace('%', ''));
                    if (!isNaN(numericValue)) {
                        setHeightValue(numericValue);
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
                const savedHeight = parsedSettings.letterHeight;
                
                if (savedHeight) {
                    // Extract numeric value from percentage string (e.g., "175%" -> 175)
                    const numericValue = parseInt(savedHeight.replace('%', ''));
                    if (!isNaN(numericValue)) {
                        setHeightValue(numericValue);
                        // console.log('Loaded line height from settings:', numericValue);
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
                            letterHeight: `${value}%`
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
            if(savedResumeData) {
                const parsedData = JSON.parse(savedResumeData);

                const updatedData = {
                    resume_data: {
                        ...parsedData.resume_data,
                        settings: {
                            ...parsedData.resume_data?.settings,
                            letterHeight: `${value}%`
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
                    letterHeight: `${value}%`
                };
                setToLocalStorage('settings', JSON.stringify(updatedSettings));
            } catch (error) {
                console.error('Error updating settings:', error);
            }
        }
    };

    // Debounced Generate function
    const debouncedGenerate = useCallback(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        const newTimer = setTimeout(() => {
            Generate();
        }, 1000); // 1 second debounce
        
        setDebounceTimer(newTimer);
    }, [Generate, debounceTimer]);

    // Clean up timer on component unmount
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

    const handleSpacingChange = (event: Event, newValue: number | number[]) => {
        const value = Array.isArray(newValue) ? newValue[0] : newValue;
        setHeightValue(value);
        updateLocalStorage(value);
        debouncedGenerate();
    };

    const decrementSpacing = () => {
        if (heightValue > 0) {
            const newValue = heightValue - 25;
            setHeightValue(newValue);
            updateLocalStorage(newValue);
            debouncedGenerate();
        }
    };

    const incrementSpacing = () => {
        if (heightValue < 200) {
            const newValue = heightValue + 25;
            setHeightValue(newValue);
            updateLocalStorage(newValue);
            debouncedGenerate();
        }
    };

    const resetToDefault = () => {
        setHeightValue(100);
        updateLocalStorage(100);
        
        // Call Generate immediately for reset
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        Generate();
    };

    return (
        <Box sx={{ mb: 4 }} className="spacing-setting">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className='pt-4 mb-0'>
                    Line Height: {heightValue}%
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

            {/* Bootstrap grid system */}
            <div className="row align-items-center g-3">
                <div className="col-auto">
                    <IconButton
                        onClick={decrementSpacing}
                        disabled={heightValue <= 0}
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
                        value={heightValue}
                        onChange={handleSpacingChange}
                        aria-labelledby="spacing-slider"
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}`}
                        marks
                        min={0}
                        max={200}
                        step={25}
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
                        disabled={heightValue >= 200}
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

export default LineHeightSetting;