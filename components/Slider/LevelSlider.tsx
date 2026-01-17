import React, { useState, useEffect } from 'react';

interface LevelSliderProps {
  value?: number;
  onChange: (value: number) => void;
}

const LevelSlider: React.FC<LevelSliderProps> = ({ 
  value = 1, 
  onChange 
}) => {
  const levels = ['Novice', 'Beginner', 'Skillful', 'Experienced', 'Advanced'];
  const [currentLevel, setCurrentLevel] = useState(() => {
    const validValue = Math.max(1, Math.min(value, levels.length));
    return validValue - 1;
  });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const validValue = Math.max(1, Math.min(value ?? 1, levels.length));
    setCurrentLevel(validValue - 1);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    setCurrentLevel(newValue);
    onChange(newValue + 1);
  };

  const levelColors = ['#FFE5E5', '#FFE0C6', '#FBEEC5', '#CFF6CA', '#D6FFF3'];
  const borderColors = ['#FF7373', '#FFB473', '#FFDE73', '#83FF73', '#73FFD7'];

  // Adjust maxOffset and additional offset based on window width
  const maxOffset = windowWidth < 1300 ? 83 : 83; // You can adjust these values as needed
  const additionalOffset = windowWidth < 1300 ? 1 : 2;
  const leftOffset = (currentLevel / (levels.length - 1)) * maxOffset + additionalOffset;

  return (
    <div className='position-relative w-100 z-1'>
      <div className='progress-slid'>
        Level -- <span>{levels[currentLevel]}</span>
      </div>

      <input
        type="range"
        min="0"
        max={levels.length - 1}
        step="1"
        value={currentLevel}
        onChange={handleChange}
      />

      <div 
        className='slid'
        style={{
          position: 'relative',
          width: '100%',
          height: '57px',
          overflow: 'hidden',
          borderRight: `2px solid ${borderColors[currentLevel]}`,
          borderRadius: '3px',
        }}
      >
        {levels.map((level, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: '0',
              left: `${(index / levels.length) * 100}%`,
              width: `${100 / levels.length}%`,
              height: '100%',
              borderLeft: `2px solid ${borderColors[currentLevel]}`,
              borderTop: `2px solid ${borderColors[currentLevel]}`,
              borderBottom: `2px solid ${borderColors[currentLevel]}`,
              backgroundColor: levelColors[currentLevel],
              boxSizing: 'border-box',
              borderCollapse: "collapse"
            }}
          ></div>
        ))}

        <div className='slid-circle'
          style={{
            position: 'absolute',
            top: '50%',
            left: `${leftOffset}%`,
            transform: 'translateY(-50%)',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: borderColors[currentLevel],
            zIndex: 1,
            transition: 'left 0.3s ease',
          }}
        ></div>
      </div>
    </div>
  );
};

export default LevelSlider;