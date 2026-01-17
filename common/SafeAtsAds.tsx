'use client';

import React, { Suspense, lazy } from 'react';

// Define the props interface if AtsPromotions component accepts any props
interface AtsPromotionsProps {
  // Add any props that the AtsPromotions component accepts
  // Example: title?: string;
}

// Type for the lazy-loaded module
type AtsPromotionsComponent = React.ComponentType<AtsPromotionsProps>;

const SafeAtsAds: React.FC<AtsPromotionsProps> = (props) => {
  // Lazy load the AtsPromotions component with error handling
  const LazyAtsPromotions = lazy(async (): Promise<{ default: AtsPromotionsComponent }> => {
    try {
      const mod = await import('@/components/Admin/AITools/AtsPromotions');
      return mod;
    } catch (err) {
      console.warn('Failed to load AtsPromotions component:', err);
      // Return a no-op component if import fails
      return { 
        default: () => null 
      };
    }
  });

  return (
    <Suspense fallback={null}>
      <LazyAtsPromotions {...props} />
    </Suspense>
  );
};

export default SafeAtsAds;