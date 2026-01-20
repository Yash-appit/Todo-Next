import type { Metadata } from "next";
import CoverLetter from "./CoverLetter";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com';

export const metadata: Metadata = {
    title: 'Free Cover Letter Builder Online | Professional Templates',
    description: 'Create a professional cover letter online for free. Choose ready-to-use templates, customize your content, and download a polished cover letter PDF.',
    alternates: {
      canonical: `${WEBSITE_URL}/cover-letter`, // Update with your actual domain
    },
};

export default function Coverletter() {
  return <CoverLetter />;
}