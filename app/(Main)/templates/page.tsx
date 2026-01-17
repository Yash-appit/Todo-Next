import type { Metadata } from "next";
import Templates from "@/components/Templates";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com';

export const metadata: Metadata = {
    title: 'Professional Resume Templates | Modern & ATS-Friendly Designs',
    description: 'Browse modern, ATS-friendly resume templates crafted by experts. Choose executive, IT, tech, simple, or professional styles and create a standout resume easily.',
    alternates: {
      canonical: `${WEBSITE_URL}/templates`, // Update with your actual domain
    },
};

export default function TemplatePage() {
  return <Templates />;
}