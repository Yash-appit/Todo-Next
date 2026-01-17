import React, { useState, useEffect } from 'react';
import { MdKeyboardArrowDown } from "react-icons/md";

interface Font {
  name: string;
  link: string;
  weights: string;
  description: string;
}

interface FontSettingProps {
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

const FontSetting = ({ Generate }: FontSettingProps) => {
  // Font data with names, links, weights and descriptions
  const fonts: Font[] = [
    { 
      name: 'Default', 
      link: '',
      weights: 'System default',
      description: 'Uses your device\'s default system font for optimal performance'
    },
    { 
      name: 'Roboto', 
      link: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap',
      weights: '300, 400, 500',
      description: 'A modern, approachable font with a mechanical skeleton and largely geometric forms.'
    },
    { 
      name: 'Open Sans', 
      link: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&display=swap',
      weights: '300, 400, 600',
      description: 'A humanist sans serif typeface with excellent legibility characteristics.'
    },
    { 
      name: 'Montserrat', 
      link: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&display=swap',
      weights: '300, 400, 500',
      description: 'Inspired by vintage posters and signs with a geometric structure and vintage feel.'
    },
    { 
      name: 'Lato', 
      link: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap',
      weights: '300, 400, 700',
      description: 'A sans serif typeface with semi-rounded details that give it a feeling of warmth.'
    },
    { 
      name: 'Source Sans Pro', 
      link: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600&display=swap',
      weights: '300, 400, 600',
      description: 'The first open source sans serif typeface with a clean, modern aesthetic.'
    },
    { 
      name: 'Oswald', 
      link: 'https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500&display=swap',
      weights: '300, 400, 500',
      description: 'A reworking of classic Alternate Gothic sans serif typefaces, optimized for screens.'
    },
    { 
      name: 'Slabo 27px', 
      link: 'https://fonts.googleapis.com/css2?family=Slabo+27px&display=swap',
      weights: '400',
      description: 'A typeface optimized for 27px size with harmonized metrics for consistent layout.'
    },
    { 
      name: 'Raleway', 
      link: 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500&display=swap',
      weights: '300, 400, 500',
      description: 'An elegant sans-serif typeface family with thin weights and expanded variants.'
    }
  ];

  // Get initial font from localStorage if it exists
  const [selectedFont, setSelectedFont] = useState<string>(() => {
    const savedResumeData = getFromLocalStorage('resumeData');
    const settings = getFromLocalStorage('settings');
    
    // First, try to get from resumeData
    if (savedResumeData) {
      try {
        const parsedData = JSON.parse(savedResumeData);
        const resumeFont = parsedData.resume_data?.settings?.font;
        if (resumeFont) {
          console.log('Loaded font from resumeData:', resumeFont);
          return resumeFont;
        }
      } catch (error) {
        console.error('Error parsing resumeData from localStorage:', error);
      }
    }
    
    // If not found in resumeData, try to get from settings
    if (settings) {
      try {
        const parsedSettings = JSON.parse(settings);
        const settingsFont = parsedSettings.font;
        if (settingsFont) {
          console.log('Loaded font from settings:', settingsFont);
          return settingsFont;
        }
      } catch (error) {
        console.error('Error parsing settings from localStorage:', error);
      }
    }
    
    return 'Default';
  });

  // Update localStorage when font changes
  useEffect(() => {
    updateLocalStorage(selectedFont);
  }, [selectedFont]);

  const updateLocalStorage = (font: string) => {
    const savedResumeData = getFromLocalStorage('resumeData');
    
    if (savedResumeData) {
      try {
        const parsedData = JSON.parse(savedResumeData);
        
        // Update the font in settings within resume_data
        const updatedData = {
          resume_data: {
            ...parsedData.resume_data,
            settings: {
              ...parsedData.resume_data?.settings,
              font: font === 'Default' ? null : font
            }
          }
        };
        
        // Save back to localStorage with key 'resumeData'
        setToLocalStorage('resumeData', JSON.stringify(updatedData));
      } catch (error) {
        console.error('Error parsing or updating resumeData:', error);
      }
    } else {
      // If no resumeData exists, create a new one with the proper structure
      const newResumeData = {
        resume_data: {
          settings: {
            font: font === 'Default' ? null : font
          },
          // Initialize all other fields with empty values
          achievementDetails: [{achievementName: "", year: null}],
          certificateDetails: [{certificateId: "", courseName: "", detail: "", present: "", startDate: null, endDate: ""}],
          declarations: [{name: "", declaration: "", place: "", date: null}],
          educationDetails: [{eduName: "", degreeName: "", location: "", grade: "", yearFrom: null, yearTo: null, present: "",}],
          experienceDetails: [{companyName: "", jobPosition: "", yearFrom: null, yearTo: null, present: "", detail: ""}],
          interest: [{interest: ""}],
          internshipDetails: [{companyName: "", jobPosition: "", yearFrom: null, yearTo: null, detail: ""}],
          languageDetails: [],
          personaldetails: {name: "", email: "", profession: "", address: "", city: "", country: "", pincode: "", phone: "",},
          projectDetails: [{projectTitle: "", projectDescription: "", yearFrom: null, yearTo: null, role: "", companyName: ""}],
          referenceDetails: [{refName: "", refWebsite: "", refEmail: "", refJobTitle: "", refPhone: "", refCompanyName: ""}],
          skill: [],
          socialLinks: [{url: "", name: "", urlName: "", iconUrl: ""}],
          strength: []
        }
      };
      
      setToLocalStorage('resumeData', JSON.stringify(newResumeData));
    }

    // Also update the settings object
    const currentSettings = getFromLocalStorage('settings');
    if (currentSettings) {
      try {
        const parsedSettings = JSON.parse(currentSettings);
        const updatedSettings = {
          ...parsedSettings,
          font: font === 'Default' ? null : font
        };
        setToLocalStorage('settings', JSON.stringify(updatedSettings));
      } catch (error) {
        console.error('Error updating settings:', error);
      }
    } else {
      // If no settings exist, create new one
      const newSettings = {
        font: font === 'Default' ? null : font,
        color: null,
        fontcolor: null,
        letterHeight: '100%',
        spacing: '0px'
      };
      setToLocalStorage('settings', JSON.stringify(newSettings));
    }
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFont = e.target.value;
    setSelectedFont(newFont);
    
    setTimeout(() => {
      Generate();
    }, 200);
  };

  return (
    <div>
        <h5 className="mb-4">
       Font
      </h5>
      <div className='mb-3 d-flex align-items-center gap-2 font-setting'>
        {/* <label htmlFor="font-select" className='w-auto'>Choose a font:</label> */}
        <select
          id="font-select"
          value={selectedFont === 'Default' ? 'Default' : selectedFont}
          onChange={handleFontChange}
        >
          {fonts.map(font => (
            <option key={font.name} value={font.name}>
              {font.name}
            </option>
          ))}
        </select>
        <MdKeyboardArrowDown />
      </div>
      
      
    </div>
  );
};

export default FontSetting;