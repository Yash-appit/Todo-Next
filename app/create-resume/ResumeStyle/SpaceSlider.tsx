import React, { useState, useEffect } from 'react';
import {
    Box,
    Slider,
    IconButton,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography
} from '@mui/material';
import { FaPlus, FaMinus } from "react-icons/fa6";
import { FaUndo } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa6";

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

const SpacingSettings = ({ Generate }: SpacingSettingProps) => {
    const [horizontalSpacing, setHorizontalSpacing] = useState(0);
    const [verticalSpacing, setVerticalSpacing] = useState(0);
    const [expanded, setExpanded] = useState<string | false>('panel1');

    // Load initial values from localStorage on component mount
    useEffect(() => {
        const savedResumeData = getFromLocalStorage('resumeData');
        const settings = getFromLocalStorage('settings');
        
        // First, try to get from resumeData (existing logic)
        if (savedResumeData) {
            try {
                const parsedData = JSON.parse(savedResumeData);
                const settings = parsedData.resume_data?.settings || {};
                
                // Load horizontal spacing
                if (settings.topBottomSpacing) {
                    const numericValue = parseInt(settings.topBottomSpacing.replace('px', ''));
                    if (!isNaN(numericValue)) {
                        setHorizontalSpacing(numericValue);
                    }
                }
                
                // Load vertical spacing
                if (settings.verticalSpacing) {
                    const numericValue = parseInt(settings.verticalSpacing.replace('px', ''));
                    if (!isNaN(numericValue)) {
                        setVerticalSpacing(numericValue);
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
                
                // Load horizontal spacing from settings
                if (parsedSettings.topBottomSpacing) {
                    const numericValue = parseInt(parsedSettings.topBottomSpacing.replace('px', ''));
                    if (!isNaN(numericValue)) {
                        setHorizontalSpacing(numericValue);
                        // console.log('Loaded topBottomSpacing from settings:', numericValue);
                    }
                }
                
                // Load vertical spacing from settings
                if (parsedSettings.verticalSpacing) {
                    const numericValue = parseInt(parsedSettings.verticalSpacing.replace('px', ''));
                    if (!isNaN(numericValue)) {
                        setVerticalSpacing(numericValue);
                        // console.log('Loaded verticalSpacing from settings:', numericValue);
                    }
                }
            } catch (error) {
                console.error('Error parsing settings:', error);
            }
        }
    }, []);

    const updateLocalStorage = (horizontal: number, vertical: number) => {
        const savedResumeData = getFromLocalStorage('resumeData');
        
        if (savedResumeData) {
            try {
                const parsedData = JSON.parse(savedResumeData);

                const updatedData = {
                    resume_data: {
                        ...parsedData.resume_data,
                        settings: {
                            ...parsedData.resume_data?.settings,
                            topBottomSpacing: `${horizontal}px`,
                            verticalSpacing: `${vertical}px`
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
                const parsedData = JSON.parse(savedResumeData);

                const updatedData = {
                    resume_data: {
                        ...parsedData.resume_data,
                        settings: {
                            ...parsedData.resume_data?.settings,
                            topBottomSpacing: `${horizontal}px`,
                            verticalSpacing: `${vertical}px`
                        }
                    }
                };   
            }
        }
        
        // Also update the settings object
        const currentSettings = getFromLocalStorage('settings');
        if (currentSettings) {
            try {
                const parsedSettings = JSON.parse(currentSettings);
                const updatedSettings = {
                    ...parsedSettings,
                    topBottomSpacing: `${horizontal}px`,
                    verticalSpacing: `${vertical}px`
                };
                setToLocalStorage('settings', JSON.stringify(updatedSettings));
            } catch (error) {
                console.error('Error updating settings:', error);
            }
        }
    };

    const handleHorizontalChange = (event: Event, newValue: number | number[]) => {
        const value = Array.isArray(newValue) ? newValue[0] : newValue;
        setHorizontalSpacing(value);
        updateLocalStorage(value, verticalSpacing);
        
        setTimeout(() => {
            Generate();
        }, 200);
    };

    const handleVerticalChange = (event: Event, newValue: number | number[]) => {
        const value = Array.isArray(newValue) ? newValue[0] : newValue;
        setVerticalSpacing(value);
        updateLocalStorage(horizontalSpacing, value);
        
        setTimeout(() => {
            Generate();
        }, 200);
    };

    const decrementHorizontal = () => {
        if (horizontalSpacing > 0) {
            const newValue = horizontalSpacing - 1;
            setHorizontalSpacing(newValue);
            updateLocalStorage(newValue, verticalSpacing);
            
            setTimeout(() => {
                Generate();
            }, 200);
        }
    };

    const incrementHorizontal = () => {
        if (horizontalSpacing < 10) {
            const newValue = horizontalSpacing + 1;
            setHorizontalSpacing(newValue);
            updateLocalStorage(newValue, verticalSpacing);
            
            setTimeout(() => {
                Generate();
            }, 200);
        }
    };

    const decrementVertical = () => {
        if (verticalSpacing > 0) {
            const newValue = verticalSpacing - 1;
            setVerticalSpacing(newValue);
            updateLocalStorage(horizontalSpacing, newValue);
            
            setTimeout(() => {
                Generate();
            }, 200);
        }
    };

    const incrementVertical = () => {
        if (verticalSpacing < 10) {
            const newValue = verticalSpacing + 1;
            setVerticalSpacing(newValue);
            updateLocalStorage(horizontalSpacing, newValue);
            
            setTimeout(() => {
                Generate();
            }, 200);
        }
    };

    const resetToDefault = () => {
        setHorizontalSpacing(0);
        setVerticalSpacing(0);
        updateLocalStorage(0, 0);
        
        setTimeout(() => {
            Generate();
        }, 200);
    };

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    const SpacingSlider = ({ 
        title, 
        value, 
        onChange, 
        onDecrement, 
        onIncrement, 
        min = 0, 
        max = 10 
    }: {
        title: string;
        value: number;
        onChange: (event: Event, newValue: number | number[]) => void;
        onDecrement: () => void;
        onIncrement: () => void;
        min?: number;
        max?: number;
    }) => (
        <Box sx={{ mb: 3 }} className="spacing-setting">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Typography variant="h6" className="mb-0">
                    {title}: {value}px
                </Typography>
            </div>

            {/* Bootstrap grid system for slider controls */}
            <div className="row align-items-center g-3">
                <div className="col-auto">
                    <IconButton
                        onClick={onDecrement}
                        disabled={value <= min}
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
                        aria-labelledby="spacing-slider"
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}px`}
                        marks
                        min={min}
                        max={max}
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
                        onClick={onIncrement}
                        disabled={value >= max}
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
        <Box sx={{ mb: 4 }} className="spacing-setting sp-slider">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Typography variant="h6" fontWeight="bold" className="mb-0">
                    Spacing Settings
                </Typography>
                <Button
                    onClick={resetToDefault}
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
                expanded={expanded === 'panel1'} 
                onChange={handleAccordionChange('panel1')}
                sx={{ mb: 1 }}
            >
                <AccordionSummary
                    expandIcon={<FaChevronDown />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    className='arrow-but'
                >
                    <Typography variant='h6' className="mb-0">Horizontal & Vertical Spacing</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <SpacingSlider
                        title="Section Vertical Spacing"
                        value={horizontalSpacing}
                        onChange={handleHorizontalChange}
                        onDecrement={decrementHorizontal}
                        onIncrement={incrementHorizontal}
                    />
                    
                    <SpacingSlider
                        title="Section Horizontal Spacing"
                        value={verticalSpacing}
                        onChange={handleVerticalChange}
                        onDecrement={decrementVertical}
                        onIncrement={incrementVertical}
                    />
                </AccordionDetails>
            </Accordion>

            {/* Optional: Separate accordions for each spacing type */}
        </Box>
    );
};

export default SpacingSettings;