// app/ai-tools/[toolPath]/page.tsx
import AIToolLayout from './AIToolLayout';
import { getToolByPath } from '@/config/aiTools';
import { Metadata } from 'next';

// Generate metadata based on the tool path
export async function generateMetadata({ params }: { params: { toolPath: string } }): Promise<Metadata> {
    const {toolPath} = await params;
  const toolConfig = await getToolByPath(toolPath);
//   console.log(toolConfig);
// console.log(toolPath);

  
  
  const metadataMap: Record<string, { title: string; description: string; keywords: string[] }> = {
    'email-template-generator': {
      title: 'AI Email Template Generator | Write Job Emails Easily | Todo Resume',
      description: 'Create professional job emails with AI. Use free credits to write effective email templates for applications, follow-ups, or networking in minutes.',
      keywords: ['AI email generator', 'job email templates', 'professional emails', 'email writing AI', 'career emails']
    },
    'linkedin-bio-generator': {
      title: 'AI LinkedIn Bio Generator | Create Professional LinkedIn Summary | Todo Resume',
      description: 'Generate your LinkedIn bio instantly with Todo Resume\'s AI tool. Craft a professional, recruiter-ready, and unique LinkedIn summary that boosts your profile visibility.',
      keywords: ['LinkedIn bio generator', 'AI LinkedIn summary', 'professional bio', 'LinkedIn optimization', 'career profile']
    },
    'qa-generator': {
      title: 'AI Interview Q&A Generator | Smart Interview Prep Tool | Todo Resume',
      description: 'Ace your next interview with Todo Resume\'s AI Interview Q&A Generator. Get role-specific, HR, and technical interview questions tailored to your job title.',
      keywords: ['interview questions generator', 'AI interview prep', 'Q&A generator', 'job interview practice', 'HR questions']
    },
    'job-description-generator': {
      title: 'AI Job Description Generator | Create Job Posts Instantly | Todo Resume',
      description: 'Generate professional, keyword-optimized job descriptions in seconds with Todo Resume\'s AI Job Description Generator. Attract top talent faster and smarter.',
      keywords: ['job description generator', 'AI job posting', 'recruitment tool', 'HR software', 'job ad creator']
    },
    'job-description-analyzer': {
      title: 'AI Job Description Analyzer | Match Resume to JD Smartly | Todo Resume',
      description: 'Analyze job descriptions instantly with Todo Resume\'s AI Job Description Analyzer. Understand recruiter needs, optimize your resume, and boost interview chances.',
      keywords: ['job description analyzer', 'resume matching tool', 'JD analyzer', 'ATS optimization', 'job match analysis']
    },
    'career-objective-generator': {
      title: 'AI Career Objective Generator | ATS-Friendly & Custom Goals | Todo Resume',
      description: 'Create a tailored career objective in seconds! Our AI-powered tool writes ATS-optimized, job-ready goals for freshers, professionals & career changers.',
      keywords: ['career objective generator', 'ATS resume builder', 'professional summary', 'resume objective', 'career goals']
    }
  };

  const defaultMeta = {
    title: 'AI Tools for Career Success | Todo Resume',
    description: 'Boost your career with AI-powered tools for resume building, interview preparation, and job applications.',
  };

  const meta = metadataMap[toolPath] || defaultMeta;
  const url = `https://todoresume.com/ai-tools/${toolPath}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: url,
      siteName: 'Todo Resume',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      creator: '@todoresume',
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Generate static paths for better SEO
export async function generateStaticParams() {
  const paths = [
    'email-template-generator',
    'linkedin-bio-generator',
    'qa-generator',
    'job-description-generator',
    'job-description-analyzer',
    'career-objective-generator'
  ];
  
  return paths.map((toolPath) => ({
    toolPath,
  }));
}

export default AIToolLayout;