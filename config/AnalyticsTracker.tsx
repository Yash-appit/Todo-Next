// src/components/Analytics/AnalyticsTracker.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import ReactGA from 'react-ga4';
import { ANALYTICS_KEY } from '../config/index';

// Type definitions for GA4 events
type GAEvent = {
  category: string;
  action: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
};

const AnalyticsTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const GA_MEASUREMENT_ID = ANALYTICS_KEY;

  // Initialize GA4 once
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
      console.warn('Google Analytics Measurement ID not configured');
      return;
    }

    if (typeof window === 'undefined') return;

    try {
      ReactGA.initialize(GA_MEASUREMENT_ID, {
        gaOptions: {
          cookieFlags: 'SameSite=None;Secure'
        },
        gtagOptions: {
          send_page_view: false // We'll handle page views manually
        }
      });

      console.log('Google Analytics initialized successfully');

      // Set default consent
      ReactGA.gtag('consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'granted',
        personalization_storage: 'denied',
        security_storage: 'granted'
      });

    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  }, [GA_MEASUREMENT_ID]);

  // Track page views on route change
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;
    if (!pathname) return;

    try {
      const page = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      const pageTitle = document.title || 'Unknown Page';
      
      console.log('Tracking page view:', page);

      // Method 1: Using send for pageview
      ReactGA.send({
        hitType: 'pageview',
        page,
        title: pageTitle
      });

      // Method 2: Using event for page_view (GA4 recommended)
      ReactGA.event('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: page
      });

    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }, [pathname, searchParams, GA_MEASUREMENT_ID]);

  return null;
};

// Export helper functions for manual event tracking
export const trackEvent = (event: GAEvent) => {
  if (!ANALYTICS_KEY || ANALYTICS_KEY === 'G-XXXXXXXXXX') {
    console.warn('Analytics not configured - event not tracked:', event);
    return;
  }
  
  try {
    ReactGA.event(event.action, {
      category: event.category,
      label: event.label,
      value: event.value,
      nonInteraction: event.nonInteraction
    });
    
    console.log('Event tracked:', event);
  } catch (error) {
    console.error('Failed to track event:', error, event);
  }
};

export const trackOutboundLink = (url: string, newTab = true) => {
  if (!ANALYTICS_KEY || ANALYTICS_KEY === 'G-XXXXXXXXXX') return;

  trackEvent({
    category: 'Outbound Link',
    action: 'click',
    label: url
  });

  // Small delay to ensure event is tracked before navigation
  setTimeout(() => {
    if (newTab) {
      window.open(url, '_blank', 'noopener noreferrer');
    } else {
      window.location.href = url;
    }
  }, 100);
};

export default AnalyticsTracker;