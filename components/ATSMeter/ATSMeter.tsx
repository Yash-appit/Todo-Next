import React from 'react';

interface ATSMeterProps {
  value: number;
}

const COLORS = {
  documents: '#3D0CA1', // dark purple
  experience: '#A10C6A', // magenta purple
  photos: '#FFC300', // bright yellow
  content: '#FF1475', // pinkish red
};

const ATSMeter: React.FC<ATSMeterProps> = ({ value }) => {
  // The total value is 100.
  // The value represents the percentage filled.
  // We will show a segmented semi-circle/donut with 4 segments:
  // Each segment colored as per legend, length based on example approximate distribution:
  // The example image shows roughly these proportions for example value=77:
  // Content (pink): ~26%
  // Photos (yellow): ~23%
  // Experience (magenta): ~18%
  // Documents (purple): Rest to fill total (eg 10%)
  //
  // For scale, we can fix the segment values or let them share value proportionally.
  //
  // For this implementation, to mimic the same style as the image:
  // We'll animate/fill up to the given value from left to right on the donut, with segments colored same as legend.
  //
  // If preferred, the value could be split across these categories.
  // But since only one `value` prop is provided, we will fill the combined arc with these 4 color segments side by side following the 4 categories,
  // and the cumulative percentage is shown in the center.

  // Define proportions for the 4 segments (total 100)
  // Adjusted to match example's style roughly:
  const segments = [
    { label: 'Documents', color: COLORS.documents, portion: 20 },
    { label: 'Experience', color: COLORS.experience, portion: 25 },
    { label: 'Photos', color: COLORS.photos, portion: 35 },
    { label: 'Content', color: COLORS.content, portion: 20 },
  ];

  // Calculate total portion
  const totalPortion = segments.reduce((acc, seg) => acc + seg.portion, 0);

  // SVG Donut parameters
  const radius = 80;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  const center = radius + strokeWidth;

  // Calculate arc lengths for each segment based on portion of circumference
  const segmentsArcs = segments.map((seg) => ({
    ...seg,
    arcLength: (circumference * seg.portion) / totalPortion,
  }));

  // The value in % to fill of total circumference
  const fillLength = (circumference * Math.min(value, 100)) / 100;

  // We will render the background track in a light gray semi-circle from 135 to 45 degrees
  // And the colored arcs will be rendered on top, clipped at fillLength to show partial fill
  // The arcs are arranged in one continuous circle but visually we mask it into a semi-circle for style as in image.

  // Since the example is a semi-circle donut with four distinct colors,
  // we handle the arcs in sequence, accumulating the stroke-dashoffset to create the segmented effect.

  // Calculate stroke-dashoffset for each segment fill based on cumulative fill length
  let remainingFill = fillLength;
  let accumulatedOffset = 0;

  const arcsData = segmentsArcs.map((seg) => {
    const fillForSegment = Math.min(seg.arcLength, remainingFill);
    remainingFill -= fillForSegment;

    const dashArray = `${fillForSegment} ${circumference}`;
    const dashOffset = circumference - accumulatedOffset;

    accumulatedOffset += seg.arcLength;

    return {
      color: seg.color,
      dashArray,
      dashOffset,
    };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontFamily: 'Arial, sans-serif', position: 'relative' }} className='ats-graph'>
      <svg
        width={center * 2}
        height={center * 2}
        viewBox={`0 0 ${center * 2} ${center * 2}`}
        style={{
          transform: 'rotate(135deg)', // rotate to start segment from bottom left arc
        }}
      >
        {/* Background grey arcs */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#ECECEC"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset="0"
          style={{ opacity: 0.6 }}
        />
        {/* Colored arcs */}
        {arcsData.map((arc, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div>
        {/* Percentage center */}
        <div
          style={{
            position: 'absolute',
            left: `${center * 2 - 4}px`,
            marginLeft: '-120px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 32,
            fontWeight: 'bold',
            color: '#7B8BA6',
            userSelect: 'none',
            width: 60,
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
          }}
          className='ats-meter-value'
        >
          {Math.min(value, 100)}%
        </div>
        {/* Legend */}
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            fontSize: 14,
            color: '#444',
            userSelect: 'none',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {segments.map((seg) => (
            <li key={seg.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: seg.color,
                  borderRadius: 3,
                  marginRight: 8,
                  flexShrink: 0,
                }}
              />
              <span>{seg.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ATSMeter;

