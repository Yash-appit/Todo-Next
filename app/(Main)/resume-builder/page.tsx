import type { Metadata } from "next";
import ResumeBuilder from "./ResumeBuilder";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com';

export const metadata: Metadata = {
    title: 'Free Online Resume Builder | ATS-Friendly Resume Templates',
    description: 'Create a professional resume online for free. Choose ATS-friendly templates, customize your details, and download your resume in PDF format instantly.',
    alternates: {
    canonical: `${WEBSITE_URL}/resume-builder`, // Update with your actual domain
  },
};

export default function Resumebuilder() {
  return <ResumeBuilder />;
}