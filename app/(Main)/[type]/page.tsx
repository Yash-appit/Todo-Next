import Legal from "@/components/Legal";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ type: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const host = 'todoresume.com'; // Use your actual domain
  const currentPath = `/${type}`;

  // About Us page
  if (type === 'aboutUs') {
    return {
      title: 'About TodoResume | Resume, ATS & Career Tools Platform',
      description: 'Learn about TodoResume—our mission to help job seekers create resumes, check ATS scores, prepare for interviews, and grow their careers with smart tools.',
      openGraph: {
        title: 'About TodoResume | Resume, ATS & Career Tools Platform',
        description: 'Learn about TodoResume—our mission to help job seekers create resumes, check ATS scores, prepare for interviews, and grow their careers with smart tools.',
        type: 'website',
        url: `https://${host}${currentPath}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: 'About TodoResume | Resume, ATS & Career Tools Platform',
        description: 'Learn about TodoResume—our mission to help job seekers create resumes, check ATS scores, prepare for interviews, and grow their careers with smart tools.',
      },
      alternates: {
        canonical: `https://${host}${currentPath}`,
      },
    };
  }

  // Terms and Conditions page
  if (type === 'termAndCondition') {
    return {
      title: 'Terms & Conditions | TodoResume Website Policies',
      description: 'Read TodoResume\'s terms and conditions to understand our website usage policies, user responsibilities, services, and legal guidelines.',
      openGraph: {
        title: 'Terms & Conditions | TodoResume Website Policies',
        description: 'Read TodoResume\'s terms and conditions to understand our website usage policies, user responsibilities, services, and legal guidelines.',
        type: 'website',
        url: `https://${host}${currentPath}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Terms & Conditions | TodoResume Website Policies',
        description: 'Read TodoResume\'s terms and conditions to understand our website usage policies, user responsibilities, services, and legal guidelines.',
      },
      alternates: {
        canonical: `https://${host}${currentPath}`,
      },
    };
  }

  // Privacy Policy page
  if (type === 'privacyPolicy') {
    return {
      title: 'Privacy Policy | TodoResume Data & User Privacy',
      description: 'Read TodoResume’s privacy policy to learn how we collect, use, and protect your personal information and ensure data security.',
      openGraph: {
        title: 'Privacy Policy | TodoResume Data & User Privacy',
        description: 'Read TodoResume’s privacy policy to learn how we collect, use, and protect your personal information and ensure data security.',
        type: 'website',
        url: `https://${host}${currentPath}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Privacy Policy | TodoResume Data & User Privacy',
        description: 'Read TodoResume’s privacy policy to learn how we collect, use, and protect your personal information and ensure data security.',
      },
      alternates: {
        canonical: `https://${host}${currentPath}`,
      },
    };
  }

  // Refund Policy page
  if (type === 'refundPolicy') {
    return {
      title: 'Refund Policy | TodoResume Payments & Refund Terms',
      description: 'Review TodoResume’s refund policy to understand payment terms, eligibility, and conditions for refunds on our services and packages.',
      openGraph: {
        title: 'Refund Policy | TodoResume Payments & Refund Terms',
        description: 'Review TodoResume’s refund policy to understand payment terms, eligibility, and conditions for refunds on our services and packages.',
        type: 'website',
        url: `https://${host}${currentPath}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Refund Policy | TodoResume Payments & Refund Terms',
        description: 'Review TodoResume’s refund policy to understand payment terms, eligibility, and conditions for refunds on our services and packages.',
      },
      alternates: {
        canonical: `https://${host}${currentPath}`,
      },
    };
  }

  return {};
}

const Page = () => {
  return <Legal />;
}

export default Page;