import "../globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from "@/Layout/Navbar";
import Footer from "@/Layout/Footer";
import { RefreshProvider } from "@/context/RefreshContext";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "TodoResume Free Resume & Cover Letter Builder | Career Tools",
  description: "Create free resumes and cover letters online with TodoResume. Use AI career tools, ATS resume checker, and interview prep to grow your career.",
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
