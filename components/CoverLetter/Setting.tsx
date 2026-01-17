import React, { useState } from 'react';
import { IoMdColorPalette } from "react-icons/io";

const ColorSettings = () => {
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

  const setToSessionStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, value);
    }
};

  const [selectedColor, setSelectedColor] = useState(null);

  const handleColorClick = (color:any) => {
    setSelectedColor(color);
    setToSessionStorage("TempColour" , color);
    // You can add additional logic here to apply the color to your template
  };

  return (
    <div className="p-4 setting">
      <h4 className="d-flex align-items-center gap-2 mb-4">
        <IoMdColorPalette /> Template Color
      </h4>
      
      <div className="d-flex flex-wrap gap-3 mb-4">
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
      
      {selectedColor && (
        <div className="mt-3">
          <p className="mb-1">Selected Color:</p>
          <div className="d-flex align-items-center gap-2">
            <div 
              className="color-square" 
              style={{ backgroundColor: selectedColor }}
            />
            <code>{selectedColor}</code>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorSettings;