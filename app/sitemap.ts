import { MetadataRoute } from 'next'

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type Blog = {
  slug: string;
  updated_at?: string;
  created_at?: string;
}

async function getBlogPosts(): Promise<Blog[]> {
  if (!API_BASE_URL) return [];
  
  try {
    const response = await fetch(`${API_BASE_URL}v1/setting/blog/list`, {
        next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    // Handle both array directly or { data: [...] } structure
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  } catch (error) {
    console.error('Failed to fetch blog posts for sitemap', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await getBlogPosts();
  
  const blogUrls = blogs.map((blog) => ({
    url: `${WEBSITE_URL}/blogs/${blog.slug}`,
    lastModified: new Date(blog.updated_at || blog.created_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const aiTools = [
    'email-template-generator',
    'linkedin-bio-generator',
    'qa-generator',
    'job-description-generator',
    'job-description-analyzer',
    'career-objective-generator'
  ];

  const aiToolUrls = aiTools.map(tool => ({
    url: `${WEBSITE_URL}/ai-tools/${tool}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const routes = [
    '',
    '/blogs',
    '/ats-score',
    '/contact',
    '/cover-letter',
    '/faq',
    '/resume-builder',
    '/templates',
    '/create-resume',
    '/create-cover-letter',
    '/login',
    '/signup',
    '/forget',
    '/finalize',
    '/aboutUs',
    '/termAndCondition',
    '/privacyPolicy',
    '/refundPolicy',
  ].map((route) => ({
    url: `${WEBSITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes, ...aiToolUrls, ...blogUrls];
}
