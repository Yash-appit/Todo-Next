import Legal from "@/components/Legal";
import type { Metadata } from "next";
import { headers } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const pathname = headersList.get('x-invoke-path') || '';
  const referer = headersList.get('referer') || '';
  const host = headersList.get('host') || '';

  // Alternative: check the referer or reconstruct the URL
  let currentPath = pathname;

  // If x-invoke-path doesn't work, try to extract from referer
  if (!currentPath && referer) {
    try {
      const url = new URL(referer);
      currentPath = url.pathname;
    } catch (error) {
      console.error('Error parsing referer URL:', error);
    }
  }

  // Log for debugging (remove in production)
  // console.log('Current path:', currentPath);

  // Check if the path is exactly '/aboutUs' or '/about-us' (common variations)
  const isAboutUsPage =
    currentPath === '/aboutUs' ||
    currentPath === '/about-us' ||
    currentPath.toLowerCase().includes('about');

  // Only set TodoResume metadata for about us pages
  if (isAboutUsPage) {
    return {
      title: 'About TodoResume | AI Resume Builder & Career Partner',
      description: 'Discover TodoResume\'s story — a Jaipur-based AI-powered resume platform helping job seekers craft ATS-friendly resumes & grow successful careers globally.',
      keywords: 'TodoResume, about us, AI resume builder, career platform, Jaipur, ATS resumes, job search, resume writing',
      openGraph: {
        title: 'About TodoResume | AI Resume Builder & Career Partner',
        description: 'Discover TodoResume\'s story — a Jaipur-based AI-powered resume platform helping job seekers craft ATS-friendly resumes & grow successful careers globally.',
        type: 'website',
        url: `https://${host}${currentPath}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: 'About TodoResume | AI Resume Builder & Career Partner',
        description: 'Discover TodoResume\'s story — a Jaipur-based AI-powered resume platform helping job seekers craft ATS-friendly resumes & grow successful careers globally.',
      },
      alternates: {
        canonical: `https://${host}${currentPath}`,
      },
    };
  }


  // Fallback metadata for other pages
  return {};
}

const Page = () => {
  return <Legal />;
}

export default Page;