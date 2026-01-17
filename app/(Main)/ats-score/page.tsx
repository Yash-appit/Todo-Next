import type { Metadata } from "next";
import ATSScore from "./ATSScore";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com';

export const metadata: Metadata = {
  title: 'Free ATS Resume Checker | Optimize Your Resume',
  description: 'Check your resume ATS score online with free credits. Identify keyword gaps, optimize formatting, and boost your resume chances to pass ATS systems.',
  alternates: {
    canonical: `${WEBSITE_URL}/ats-score`, // Update with your actual domain
  },
};

export default function ATSScorePage() {
  return <ATSScore />;
}