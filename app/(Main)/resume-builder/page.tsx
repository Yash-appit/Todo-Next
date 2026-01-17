import type { Metadata } from "next";
import ResumeBuilder from "./ResumeBuilder";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com';

export const metadata: Metadata = {
    title: 'Free Online Resume Builder & Cover Letter Maker | TodoResume',
    description: 'Create your free resume and cover letter online in minutes. Build, customize, and download your professional resume in PDF format with TodoResume.',
    alternates: {
    canonical: `${WEBSITE_URL}/resume-builder`, // Update with your actual domain
  },
};

export default function Resumebuilder() {
  return <ResumeBuilder />;
}