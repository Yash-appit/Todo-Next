import type { Metadata } from "next";
import Templates from "@/components/Templates";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com';

export const metadata: Metadata = {
    title: 'Free Resume Templates Online | ATS-Friendly Designs',
    description: 'Browse free, ATS-friendly resume templates to create a professional resume online. Choose a design, customize your details, and download instantly.',
    alternates: {
      canonical: `${WEBSITE_URL}/templates`, // Update with your actual domain
    },
};

export default function TemplatePage() {
  return <Templates />;
}