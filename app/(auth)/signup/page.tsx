import type { Metadata } from "next";
import Signup from "@/components/Signup";

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
  title: "Sign Up for TodoResume | Free Resume Builder",
  description: "Sign up for a free TodoResume account to create professional resumes and cover letters. Access AI tools and templates to boost your career.",
  alternates: {
    canonical: `${WEBSITE_URL}/signup`, // Update with your actual domain
  },
};      

export default function signup() {
  return <Signup />;
}