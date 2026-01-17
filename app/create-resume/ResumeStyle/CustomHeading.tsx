import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  TextField, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Typography,
  Box
} from '@mui/material';
import { MdOutlineExpandMore } from "react-icons/md";
import { HiMiniArrowLongRight } from "react-icons/hi2";

interface CustomHeadingData {
  [key: string]: string | null;
}

interface CustomHeadingProps {
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

// Define the order and labels for sections
const SECTION_ORDER = [
  'objective',
  'about', 
  'experience',
  'achievements',
  'education',
  'internship',
  'projects',
  'skills',
  'languages',
  'certificates',
  'interest',
  'strength',
  'socialLinks',
  'declaration',
  'reference',
];

const DEFAULT_HEADINGS: CustomHeadingData = SECTION_ORDER.reduce((acc, section) => {
  acc[section] = null;
  return acc;
}, {} as CustomHeadingData);

const CustomHeading: React.FC<CustomHeadingProps> = ({ Generate }) => {
  const [headings, setHeadings] = useState<CustomHeadingData>(DEFAULT_HEADINGS);
  const [accordionExpanded, setAccordionExpanded] = useState<boolean>(false);
  const hasChanges = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedData = getFromLocalStorage('resumeData');
    const customHeading = getFromLocalStorage('customHeading');
    
    if (storedData) {
      try {
        const resumeData = JSON.parse(storedData);
        const customHeadings = resumeData.resume_data?.customHeading || 
                             JSON.parse(customHeading || '{}') || 
                             {};
        
        // Merge with default headings, preserving stored values
        setHeadings(prev => ({
          ...DEFAULT_HEADINGS,
          ...customHeadings
        }));
      } catch (error) {
        console.error('Error parsing resumeData:', error);
      }
    }
  }, []);

  // Save to localStorage and trigger Generate when headings change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (hasChanges.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        const storedData = getFromLocalStorage('resumeData');
        const resumeData = storedData ? JSON.parse(storedData) : { resume_data: {} };

        // Clean up headings by removing empty strings and trimming
        const cleanedHeadings = Object.fromEntries(
          Object.entries(headings).map(([key, value]) => [
            key, 
            value && value.trim() !== '' ? value.trim() : null
          ])
        );

        // Update resume data structure
        resumeData.resume_data = {
          ...resumeData.resume_data,
          customHeading: cleanedHeadings,
        };

        setToLocalStorage('resumeData', JSON.stringify(resumeData));
        setToLocalStorage('customHeading', JSON.stringify(cleanedHeadings));
        
        Generate();
        hasChanges.current = false;
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [headings, Generate]);

  const handleContentChange = useCallback((section: string, content: string) => {
    hasChanges.current = true;
    setHeadings(prev => ({
      ...prev,
      [section]: content
    }));
  }, []);

  const handleAccordionChange = useCallback(() => {
    setAccordionExpanded(prev => !prev);
  }, []);

  // Format section name for display
  const formatSectionName = (section: string): string => {
    return section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="container p-0 custom-heading">
      <Accordion expanded={accordionExpanded} onChange={handleAccordionChange}>
        <AccordionSummary
          expandIcon={<MdOutlineExpandMore />}
          aria-controls="custom-headings-content"
          id="custom-headings-header"
        >
          <Typography variant="h6">Add Custom Headings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Always show the first section (objective) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ minWidth: 120, textTransform: 'capitalize' }}>
                {formatSectionName('objective')}
              </Typography>
              <HiMiniArrowLongRight />
              <TextField
                value={headings.objective || ''}
                onChange={(e) => handleContentChange('objective', e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Enter objective heading"
                size="small"
              />
            </Box>
            
            {/* Show all other sections only when accordion is expanded */}
            {accordionExpanded && SECTION_ORDER.map((section) => {
              if (section === 'objective') return null;
              
              return (
                <Box key={section} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle1" sx={{ minWidth: 120, textTransform: 'capitalize' }}>
                    {formatSectionName(section)}
                  </Typography>
                  <HiMiniArrowLongRight />
                  <TextField
                    value={headings[section] || ''}
                    onChange={(e) => handleContentChange(section, e.target.value)}
                    fullWidth
                    variant="outlined"
                    placeholder={`Enter ${formatSectionName(section).toLowerCase()} heading`}
                    size="small"
                  />
                </Box>
              );
            })}
          </Box>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default CustomHeading;