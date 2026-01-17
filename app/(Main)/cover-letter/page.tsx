import type { Metadata } from "next";
import CoverLetter from "./CoverLetter";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com';

export const metadata: Metadata = {
    title: 'Free Cover Letter Builder | Create Cover Letters Online',
    description: 'Build a free ATS-friendly resume and cover letter in minutes. Use TodoResume tools—ATS Checker, Job Analyzer & AI Career Generators to boost your career.',
    alternates: {
      canonical: `${WEBSITE_URL}/cover-letter`, // Update with your actual domain
    },
};

export default function Coverletter() {
  return <CoverLetter />;
}