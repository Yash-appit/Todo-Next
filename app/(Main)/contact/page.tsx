import Contact from '@/components/Contact'
import type { Metadata } from "next";


const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com';

export const metadata: Metadata = {
    title: 'Contact TodoResume | Support, Feedback & Assistance',
    description: 'Get in touch with TodoResume for support, feedback, or questions about our resume builder, career tools, and services.',
    alternates: {
    canonical: `${WEBSITE_URL}/contact`, // Update with your actual domain
  },
};

const page = () => {
  return (
    <Contact />
  )
}

export default page
