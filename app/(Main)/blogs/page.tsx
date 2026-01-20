import type { Metadata } from "next";
import Blogs from "./blogs";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com';

export const metadata: Metadata = {
  // title: "Our Privacy Policy | SavingSathi App",
  // description: "Read the SavingSathi privacy policy to understand how we handle your data, ensure security, manage permissions, and protect your personal information.",
  // keywords: "SavingSathi, privacy-policy, savings, social platform, group deals, money saving, collaborative decisions",
  // openGraph: {
  //   title: "Our Privacy Policy | SavingSathi App",
  //   description: "Read the SavingSathi privacy policy to understand how we handle your data, ensure security, manage permissions, and protect your personal information.",
  //   type: "website",
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "Our Privacy Policy | SavingSathi App",
  //   description: "Read the SavingSathi privacy policy to understand how we handle your data, ensure security, manage permissions, and protect your personal information.",
  // },
  // alternates: {
  //   canonical: "https://savingsathi.com/privacy-policy", // Canonical URL
  // },
  title: "Resume Writing & Interview Guides | Jobs & Career Blog",
  description: "Read expert blogs on resume writing, interview preparation, job search tips, and AI career trends to stay ahead in today’s job market.",
  alternates: {
    canonical: `${WEBSITE_URL}/blogs`, // Update with your actual domain
  },
};

export default function blogs() {
  return <Blogs />;
}