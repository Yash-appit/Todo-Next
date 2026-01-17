import ReactGA from 'react-ga4';
import {ANALYTICS_KEY} from '../config/index';

// Initialize Google Analytics
export const initGA = (): void => {
  const measurementId = ANALYTICS_KEY;

};

// Track page views
export const trackPageView = (path: string): void => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

// Track custom events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
): void => {
  ReactGA.event({
    category,
    action,
    label,
    value
  });
};

// Track exceptions/errors
export const trackException = (description: string, fatal: boolean = false): void => {
  ReactGA.event('exception', {
    description,
    fatal
  });
};