import "../globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from "@/Layout/Navbar";
import Footer from "@/Layout/Footer";
import { RefreshProvider } from "@/context/RefreshContext";
import type { Metadata } from "next";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com';

export const metadata: Metadata = {
  title: "TodoResume Free Resume & Cover Letter Builder | Career Tools",
  description: "Create free resumes and cover letters online with TodoResume. Use AI career tools, ATS resume checker, and interview prep to grow your career.",
   alternates: {
    canonical: `${WEBSITE_URL}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (<>
        <RefreshProvider>
        <Navbar />
        </RefreshProvider>
        {children}
        <Footer />
        </>);
}
