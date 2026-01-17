import type { Metadata } from "next";
import Login from "@/components/Login";
import { RefreshProvider } from "@/context/RefreshContext";

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
  title: "Login to TodoResume | Access Your Account",
  description: "Login to your TodoResume account to access your resumes, cover letters, and AI tools. Create professional documents in minutes.",
  alternates: {
    canonical: `${WEBSITE_URL}/login`, // Update with your actual domain
  },
};

export default function login() {
  return <RefreshProvider><Login /></RefreshProvider>;
}