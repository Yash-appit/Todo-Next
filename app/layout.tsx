import type { Metadata } from "next";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Free Resume & Cover Letter Builder | TodoResume",
  description: "Build a free ATS-friendly resume and cover letter in minutes. Use TodoResume tools—ATS Checker, Job Analyzer & AI Career Generators to boost your career.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
      <Toaster richColors position="top-center" />
        {children}
      </body>
    </html>
  );
}

