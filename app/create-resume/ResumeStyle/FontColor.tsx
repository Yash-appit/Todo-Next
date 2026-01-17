import React, { useState } from 'react';
import { IoMdColorPalette } from "react-icons/io";
import { FcCancel } from "react-icons/fc";
import "@/styles/CoverLetter.css";

interface ColorSettingsProps {
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

const FontColor = ({ Generate }: ColorSettingsProps) => {
  const colorOptions = [
    '#3B82F6', // blue-500
    '#EF4444', // red-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#14B8A6', // teal-500
    '#F97316', // orange-500
  ];

  // Get initial color from localStorage if it exists
  const [selectedColor, setSelectedColor] = useState(() => {
    const savedResumeData = getFromLocalStorage('resumeData');
    const settings = getFromLocalStorage('settings');
    
    // First, try to get from resumeData
    if (savedResumeData) {
      try {
        const parsedData = JSON.parse(savedResumeData);
        const resumeColor = parsedData.resume_data?.settings?.fontcolor;
        if (resumeColor) {
          // console.log('Loaded font color from resumeData:', resumeColor);
          return resumeColor;
        }
      } catch (error) {
        console.error('Error parsing resumeData from localStorage:', error);
      }
    }
    
    // If not found in resumeData, try to get from settings
    if (settings) {
      try {
        const parsedSettings = JSON.parse(settings);
        const settingsColor = parsedSettings.fontcolor;
        if (settingsColor) {
          // console.log('Loaded font color from settings:', settingsColor);
          return settingsColor;
        }
      } catch (error) {
        console.error('Error parsing settings from localStorage:', error);
      }
    }
    
    return null;
  });

  const handleColorClick = (fontcolor: string) => {
    setSelectedColor(fontcolor);
    sessionStorage.setItem("FontColour", fontcolor);
    
    // Update both resumeData and settings
    updateLocalStorage(fontcolor);
    Generate();
  };

  const updateLocalStorage = (fontcolor: string | null) => {
    // Get the resume data from localStorage
    const savedResumeData = getFromLocalStorage('resumeData');
    if (savedResumeData) {
      try {
        const parsedData = JSON.parse(savedResumeData);
        
        // Update the color in settings within resume_data
        const updatedData = {
          resume_data: {
            ...parsedData.resume_data,
            settings: {
              ...parsedData.resume_data?.settings,
              fontcolor: fontcolor
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
      const savedResumeData = getFromLocalStorage('resumeData');
      if (savedResumeData) {
      const parsedData = JSON.parse(savedResumeData);
        
        // Update the color in settings within resume_data
        const updatedData = {
          resume_data: {
            ...parsedData.resume_data,
            settings: {
              ...parsedData.resume_data?.settings,
              fontcolor: fontcolor
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
          fontcolor: fontcolor
        };
        setToLocalStorage('settings', JSON.stringify(updatedSettings));
      } catch (error) {
        console.error('Error updating settings:', error);
      }
    } else {
      // If no settings exist, create new one
      const newSettings = {
        fontcolor: fontcolor,
        font: null,
        letterHeight: '100%',
        spacing: '0px'
      };
      setToLocalStorage('settings', JSON.stringify(newSettings));
    }
  };

  const handleClearColor = () => {
    setSelectedColor(null);
    sessionStorage.removeItem("FontColour");
    
    // Remove color from both localStorage locations
    updateLocalStorage(null);
    
    if (selectedColor) {
      Generate();
    }
  };

  return (
    <div className="py-4 setting">
      <h5 className="mb-4">
         Font Color
      </h5>
      
      <div className="d-flex flex-wrap gap-3 mb-4">
        {/* Default (null) option */}
        <div
          className="color-circle d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: '#f8f9fa',
            border: selectedColor === null ? '3px solid #333' : '1px solid #dee2e6',
          }}
          onClick={handleClearColor}
          title="Default color"
        >
          <FcCancel size={25} />
        </div>
        
        {/* Color options */}
        {colorOptions.map((color) => (
          <div
            key={color}
            className="color-circle"
            style={{
              backgroundColor: color,
              border: selectedColor === color ? '3px solid #333' : 'none',
            }}
            onClick={() => handleColorClick(color)}
          />
        ))}
      </div>
      
      
    </div>
  );
};

export default FontColor;