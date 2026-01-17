import React, { useState, useEffect } from 'react';
import {
    Box,
    Slider,
    IconButton,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import { FaPlus, FaMinus } from "react-icons/fa6";
import { FaUndo, FaChevronDown } from "react-icons/fa";

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


const FontSizeSettings = ({ Generate }: FontSizeProps) => {
    const [headingFontSize, setHeadingFontSize] = useState(1.0);
    const [contentFontSize, setContentFontSize] = useState(1.0);
    const [expanded, setExpanded] = useState<boolean>(true);

    // Load initial values from localStorage on component mount
    useEffect(() => {
        const savedResumeData = getFromLocalStorage('resumeData');
        const settings = getFromLocalStorage('settings');
        
        // First, try to get from resumeData (existing logic)
        if (savedResumeData) {
            try {
                const parsedData = JSON.parse(savedResumeData);
                const settings = parsedData.resume_data?.settings || {};

                // Load heading font size
                if (settings.headingFontSize) {
                    const numericValue = parseFloat(settings.headingFontSize);
                    if (!isNaN(numericValue) && numericValue >= 1.01 && numericValue <= 2) {
                        setHeadingFontSize(numericValue);
                    } else if (!isNaN(numericValue)) {
                        const clampedValue = Math.max(1.01, Math.min(2, numericValue));
                        setHeadingFontSize(clampedValue);
                    }
                }

                // Load content font size
                if (settings.ContentfontSize) {
                    const numericValue = parseFloat(settings.ContentfontSize);
                    if (!isNaN(numericValue) && numericValue >= 1.01 && numericValue <= 2) {
                        setContentFontSize(numericValue);
                    } else if (!isNaN(numericValue)) {
                        const clampedValue = Math.max(1.01, Math.min(2, numericValue));
                        setContentFontSize(clampedValue);
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
                
                // Load heading font size from settings
                if (parsedSettings.headingFontSize) {
                    const numericValue = parseFloat(parsedSettings.headingFontSize);
                    if (!isNaN(numericValue)) {
                        const clampedValue = Math.max(1.01, Math.min(2, numericValue));
                        setHeadingFontSize(clampedValue);
                        console.log('Loaded headingFontSize from settings:', clampedValue);
                    }
                }
                
                // Load content font size from settings
                if (parsedSettings.ContentfontSize) {
                    const numericValue = parseFloat(parsedSettings.ContentfontSize);
                    if (!isNaN(numericValue)) {
                        const clampedValue = Math.max(1.01, Math.min(2, numericValue));
                        setContentFontSize(clampedValue);
                        console.log('Loaded ContentfontSize from settings:', clampedValue);
                    }
                }
            } catch (error) {
                console.error('Error parsing settings:', error);
            }
        }
    }, []);

    const updateLocalStorage = (type: 'heading' | 'content', value: number) => {
        const savedResumeData = getFromLocalStorage('resumeData');
        const key = type === 'heading' ? 'headingFontSize' : 'ContentfontSize';
        
        if (savedResumeData) {
            try {
                const parsedData = JSON.parse(savedResumeData);

                const updatedData = {
                    resume_data: {
                        ...parsedData.resume_data,
                        settings: {
                            ...parsedData.resume_data?.settings,
                            [key]: value.toString()
                        }
                    }
                };

                setToLocalStorage('resumeData', JSON.stringify(updatedData));
            } catch (error) {
                console.error('Error updating resumeData:', error);
            }
        } else {
            const savedResumeData = getFromLocalStorage('resumeData');
            // If no resumeData exists, create a new one
            if(savedResumeData) {
            const parsedData = JSON.parse(savedResumeData);

            const updatedData = {
                resume_data: {
                    ...parsedData.resume_data,
                    settings: {
                        ...parsedData.resume_data?.settings,
                        [key]: value.toString()
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
                    [key]: value.toString()
                };
                setToLocalStorage('settings', JSON.stringify(updatedSettings));
            } catch (error) {
                console.error('Error updating settings:', error);
            }
        }
    };

    const handleHeadingFontSizeChange = (event: Event, newValue: number | number[]) => {
        const value = Array.isArray(newValue) ? newValue[0] : newValue;
        const roundedValue = Math.round(value * 100) / 100;
        setHeadingFontSize(roundedValue);
        updateLocalStorage('heading', roundedValue);
        
        setTimeout(() => {
            Generate();
        }, 200);
    };

    const handleContentFontSizeChange = (event: Event, newValue: number | number[]) => {
        const value = Array.isArray(newValue) ? newValue[0] : newValue;
        const roundedValue = Math.round(value * 100) / 100;
        setContentFontSize(roundedValue);
        updateLocalStorage('content', roundedValue);
        
        setTimeout(() => {
            Generate();
        }, 200);
    };

    const decrementFontSize = (type: 'heading' | 'content') => {
        const currentValue = type === 'heading' ? headingFontSize : contentFontSize;
        const setter = type === 'heading' ? setHeadingFontSize : setContentFontSize;
        
        if (currentValue > 0.0) {
            const newValue = Math.round((currentValue - 0.25) * 100) / 100;
            const clampedValue = Math.max(0.0, newValue);
            setter(clampedValue);
            updateLocalStorage(type, clampedValue);
            
            setTimeout(() => {
                Generate();
            }, 200);
        }
    };

    const incrementFontSize = (type: 'heading' | 'content') => {
        const currentValue = type === 'heading' ? headingFontSize : contentFontSize;
        const setter = type === 'heading' ? setHeadingFontSize : setContentFontSize;
        
        if (currentValue < 2) {
            const newValue = Math.round((currentValue + 0.25) * 100) / 100;
            const clampedValue = Math.min(2, newValue);
            setter(clampedValue);
            updateLocalStorage(type, clampedValue);
            
            setTimeout(() => {
                Generate();
            }, 200);
        }
    };

    const resetToDefault = (type: 'heading' | 'content') => {
        const setter = type === 'heading' ? setHeadingFontSize : setContentFontSize;
        setter(1.0);
        updateLocalStorage(type, 1.0);
        
        setTimeout(() => {
            Generate();
        }, 200);
    };

    const resetAllToDefault = () => {
        setHeadingFontSize(1.0);
        setContentFontSize(1.0);
        updateLocalStorage('heading', 1.0);
        updateLocalStorage('content', 1.0);
        
        setTimeout(() => {
            Generate();
        }, 200);
    };

    const handleAccordionChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded);
    };

    const marks = [
        { value: 0.0, label: '0.0x' },
        { value: 0.25, label: '0.25x' },
        { value: 0.5, label: '0.5x' },
        { value: 0.75, label: '0.75x' },
        { value: 1.0, label: '1.0x' },
        { value: 1.25, label: '1.25x' },
        { value: 1.5, label: '1.5x' },
        { value: 1.75, label: '1.75x' },
        { value: 2.0, label: '2.0x' }
    ];

    const FontSizeControl = ({ 
        type, 
        value, 
        onChange, 
        onDecrement, 
        onIncrement, 
        onReset 
    }: {
        type: 'heading' | 'content';
        value: number;
        onChange: (event: Event, newValue: number | number[]) => void;
        onDecrement: () => void;
        onIncrement: () => void;
        onReset: () => void;
    }) => (
        <Box sx={{ mb: 4 }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className='pt-2 mb-0'>
                    {type === 'heading' ? 'Heading Font Size' : 'Content Font Size'}
                </h5>
                <Button
                    onClick={onReset}
                    startIcon={<FaUndo />}
                    size="small"
                    variant="outlined"
                    title={`Reset to 1.0x`}
                    color="secondary"
                    className='prim-but-2'
                >
                    Reset
                </Button>
            </div>

            {/* Bootstrap grid system */}
            <div className="row align-items-center g-2">
                <div className="col-auto">
                    <IconButton
                        onClick={onDecrement}
                        disabled={value <= 0.25}
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
                        value={value}
                        onChange={onChange}
                        aria-labelledby={`${type}-font-size-slider`}
                        valueLabelDisplay="auto"
                        marks={marks}
                        min={0.0}
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
                        onClick={onIncrement}
                        disabled={value >= 2}
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

    return (
        <Box sx={{ mb: 4 }} className="spacing-setting">
            <div className="d-flex justify-content-between align-items-center my-3">
                <h6 className="mb-0">
                   Font Size Settings
                </h6>
                <Button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent accordion toggle when clicking reset
                        resetAllToDefault();
                    }}
                    startIcon={<FaUndo />}
                    size="small"
                    variant="outlined"
                    title="Reset all spacing to default"
                    color="secondary"
                    className='prim-but-2'
                >
                    Reset All
                </Button>
            </div>
            
            <Accordion 
                expanded={expanded}
                onChange={handleAccordionChange}
                sx={{ mb: 2 }}
            >
                <AccordionSummary
                    expandIcon={<FaChevronDown />}
                    aria-controls="font-size-content"
                    id="font-size-header"
                    className='arrow-but'
                >
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <h6 className="mb-0">Font Size Settings</h6>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <FontSizeControl
                        type="heading"
                        value={headingFontSize}
                        onChange={handleHeadingFontSizeChange}
                        onDecrement={() => decrementFontSize('heading')}
                        onIncrement={() => incrementFontSize('heading')}
                        onReset={() => resetToDefault('heading')}
                    />
                    
                    <FontSizeControl
                        type="content"
                        value={contentFontSize}
                        onChange={handleContentFontSizeChange}
                        onDecrement={() => decrementFontSize('content')}
                        onIncrement={() => incrementFontSize('content')}
                        onReset={() => resetToDefault('content')}
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default FontSizeSettings;