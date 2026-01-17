// src/config/aiTools.ts
import { lazy, ComponentType } from 'react';

// Lazy load components for better performance
const CareerObjectiveMain = lazy(() => import('@/components/AITools/CareerObjective/CareerObjectiveMain'));
const CareerObjectiveBody = lazy(() => import('@/components/AITools/CareerObjective/CareerObjectiveBody1'));
const JobDescriptionMain = lazy(() => import('@/components/AITools/JobDescription/JobDescriptionMain'));
const JobDescriptionBody = lazy(() => import('@/components/AITools/JobDescription/JobDescriptionBody1'));
const EmailTempMain = lazy(() => import('@/components/AITools/EmailTemplate/EmailTempMain'));
const EmailTempBody = lazy(() => import('@/components/AITools/EmailTemplate/EmailTempBody1'));
const LinkedinBioMain = lazy(() => import('@/components/AITools/LinkedinBio/LinkedinBioMain'));
const LinkedinBioBody = lazy(() => import('@/components/AITools/LinkedinBio/LinkedinBioBody1'));
const JobAnalyzerMain = lazy(() => import('@/components/AITools/JobAnalyzer/JobAnalyzerMain'));
const JobAnalyzerBody = lazy(() => import('@/components/AITools/JobAnalyzer/JobAnalyzerBody1'));
const QaMain = lazy(() => import('@/components/AITools/QA/QaMain'));
const QaBody = lazy(() => import('@/components/AITools/QA/QaBody1'));
// Import other tools similarly...

export interface AIToolConfig {
  path: string;
  MainComponent: ComponentType;
  BodyComponent: ComponentType;
  metadata?: {
    title: string;
    description: string;
  };
}

export const aiToolsConfig: AIToolConfig[] = [
  {
    path: 'career-objective-generator',
    MainComponent: CareerObjectiveMain,
    BodyComponent: CareerObjectiveBody,
    metadata: {
      title: 'AI Career Objective Generator | ATS-Friendly & Custom Goals',
      description: 'Create a tailored career objective in seconds! Our AI-powered tool writes ATS-optimized, job-ready goals for freshers, professionals & career changers.'
    }
  },
  {
    path: 'job-description-generator',
    MainComponent: JobDescriptionMain,
    BodyComponent: JobDescriptionBody,
    metadata: {
      title: 'AI Job Description Generator | Create Job Posts Instantly',
      description: 'Generate professional, keyword-optimized job descriptions in seconds with Todo Resume\'s AI Job Description Generator. Attract top talent faster and smarter.'
    }
  },
  {
    path: 'email-template-generator',
    MainComponent: EmailTempMain,
    BodyComponent: EmailTempBody,
    metadata: {
      title: 'AI Email Template Generator | Write Job Emails Easily',
      description: 'Create professional job emails with AI. Use free credits to write effective email templates for applications, follow-ups, or networking in minutes.'
    }
  },
  {
    path: 'linkedin-bio-generator',
    MainComponent: LinkedinBioMain,
    BodyComponent: LinkedinBioBody,
    metadata: {
      title: 'AI LinkedIn Bio Generator | Create Professional LinkedIn Summary',
      description: 'Generate your LinkedIn bio instantly with Todo Resume\'s AI tool. Craft a professional, recruiter-ready, and unique LinkedIn summary that boosts your profile visibility.'
    }
  },
  {
    path: 'job-description-analyzer',
    MainComponent: JobAnalyzerMain,
    BodyComponent: JobAnalyzerBody,
    metadata: {
      title: 'AI Job Description Analyzer | Match Resume to JD Smartly',
      description: 'Analyze job descriptions instantly with Todo Resume\'s AI Job Description Analyzer. Understand recruiter needs, optimize your resume, and boost interview chances.'
    }
  },
  {
    path: 'qa-generator',
    MainComponent: QaMain,
    BodyComponent: QaBody,
    metadata: {
      title: 'AI Interview Q&A Generator | Smart Interview Prep Tool',
      description: 'Ace your next interview with Todo Resume\'s AI Interview Q&A Generator. Get role-specific, HR, and technical interview questions tailored to your job title.'
    }
  },
  // Add more tools here...
];

export const getToolByPath = (path: string): AIToolConfig | undefined => {
  return aiToolsConfig.find(tool => tool.path === path);
};

// Helper function to get all paths for static generation
export const getAllToolPaths = (): string[] => {
  return aiToolsConfig.map(tool => tool.path);
};