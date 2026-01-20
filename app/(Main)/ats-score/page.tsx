import type { Metadata } from "next";
import ATSScore from "./ATSScore";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com';

export const metadata: Metadata = {
  title: 'ATS Resume Checker Online | Check & Improve Resume Score',
  description: 'Check your resume’s ATS score online with free credits. Identify keyword gaps, fix formatting issues, and improve your chances of passing ATS systems.',
  alternates: {
    canonical: `${WEBSITE_URL}/ats-score`, // Update with your actual domain
  },
};

export default function ATSScorePage() {
  return <ATSScore />;
}