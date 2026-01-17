

// // src/config.ts

// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
// export const OTHER_CONFIG = import.meta.env.VITE_OTHER_CONFIG as string;
// export const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_API_KEY as string;
// export const BASE_URL = import.meta.env.VITE_BASE_URL as string;
// export const ANALYTICS_KEY = import.meta.env.VITE_ANALYTICS_KEY as string;
// export const TAWK_PROPERTY_KEY = import.meta.env.VITE_TAWK_PROPERTY_KEY as string;


// src/config.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL as string;

export const WEBSITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL as string;

export const OTHER_CONFIG =
  process.env.NEXT_PUBLIC_OTHER_CONFIG as string;

export const RAZORPAY_KEY =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY as string;

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL as string;

export const ANALYTICS_KEY =
  process.env.NEXT_PUBLIC_ANALYTICS_KEY as string;

export const TAWK_PROPERTY_KEY =
  process.env.NEXT_PUBLIC_TAWK_PROPERTY_KEY as string;
