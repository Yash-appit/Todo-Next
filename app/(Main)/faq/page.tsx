import FAQ from "@/components/FAQ";
import type { Metadata } from "next";


const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com';

export const metadata: Metadata = {
    title: 'TodoResume FAQs | Resume Builder & Career Tools Help',
    description: 'Find answers to common questions about TodoResume’s resume builder, ATS checker, AI career tools, pricing, and account usage.',
    alternates: {
    canonical: `${WEBSITE_URL}/faq`, // Update with your actual domain
  },
};

const page = () => {
  return (
    <FAQ/>
  )
}

export default page
