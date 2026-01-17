// src/GaugeChart.tsx
import React from 'react';
import { Gauge } from '@mui/x-charts/Gauge';
import { Box } from '@mui/material';

interface GaugeChartProps {
  value: number;
}

const CustomGaugeChart: React.FC<GaugeChartProps> = ({ value }) => {
  return (
    <Box 
      className='chart-arc'
      sx={{ 
        width: '100%', 
        height: '100%',
        aspectRatio: '1 / 1', // Makes it square
        position: 'relative',
        margin: '0 auto'
      }}
    >
      <Box className='chart-bg'>
        {/* Background content if needed */}
      </Box>
      
      <Gauge
        value={value}
        cornerRadius="50%"
        startAngle={0}
        endAngle={360}
        innerRadius="72%"
        outerRadius="100%"
        text={`${value}%`}
        sx={{
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
};

export default CustomGaugeChart;