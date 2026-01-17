'use client';

import React, { Suspense, lazy } from 'react';

// Define the props interface if Ads component accepts any props
interface AdsProps {
  // Add any props that the Ads component accepts
  // Example: title?: string;
}

// Type for the lazy-loaded module
type AdsComponent = React.ComponentType<AdsProps>;

// Create a wrapper component for lazy loading with error boundary
const SafeAds: React.FC = () => {
  // Lazy load the Ads component with error handling
  const LazyAds = lazy(async (): Promise<{ default: AdsComponent }> => {
    try {
      const mod = await import('@/components/home/Ads');
      return mod;
    } catch (err) {
      console.warn('Failed to load Ads component:', err);
      // Return a no-op component if import fails (e.g., blocked by ad blocker)
      return { 
        default: () => null 
      };
    }
  });

  return (
    <Suspense fallback={null}>
      <LazyAds />
    </Suspense>
  );
};

export default SafeAds;