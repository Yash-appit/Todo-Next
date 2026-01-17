import type { Metadata } from "next";
import Index from "./Index";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com';

export const metadata: Metadata = {
    title: 'Free ATS-Friendly Resume Builder | Create Professional Resume',
    description: 'Build a professional, ATS-optimized resume for free. Choose from 50+ templates, AI-powered suggestions, and instant formatting.',
    alternates: {
      canonical: `${WEBSITE_URL}/create-resume`, // Update with your actual domain
    },
};

export default function CreateResume() {
  return <Index />;
}