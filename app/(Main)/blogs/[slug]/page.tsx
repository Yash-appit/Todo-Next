import BlogDetail from './BlogDetail';
import type { Metadata } from "next";
// import { WEBSITE_URL } from '@/config';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

// Move API call to a separate function to reuse in both page and metadata
async function fetchBlogData(slug: string) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined in environment variables');
  }

  if (!slug) {
    throw new Error('Slug is required');
  }

  const url = `${API_BASE_URL}v1/setting/blog?slug=${slug}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();
  return responseData;
}

// Generate dynamic metadata
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const blogData = await fetchBlogData(slug);

    // Handle different possible data structures
    const data = blogData?.data || blogData;
    const WEBSITE_URL = process.env.NEXT_WEBSITE_URL;

    return {
      title: data.meta_title || data.title || 'Blog Post',
      description: data.meta_description || data.excerpt || data.description || 'Read our latest blog post',
      keywords: data.meta_keywords || data.tags?.join(', ') || 'blog, article',
      alternates: {
        canonical: `${WEBSITE_URL}/blogs/${slug}`, // Update with your actual domain
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);

    // Return default metadata if blog data fetch fails
    return {
      title: 'Blog Post',
      description: 'Read our latest blog post',
      keywords: 'blog, article',
    };
  }
}

export default async function BlogDetailsPage({ params }: BlogPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let blogData = null;
  let error = null;

  if (!slug) {
    console.log('No slug found, returning not found');
    return <div className='mt-5 pt-5'><h1>Blog not found - Missing slug</h1></div>;
  }

  try {
    console.log('Fetching blog details for slug:', slug);

    const responseData = await fetchBlogData(slug);
    blogData = responseData;

  } catch (err: any) {
    console.error('Error fetching blog data:', err);
    error = err;
  }

  if (error) {
    console.log('Rendering error state');
    return (
      <div className=' pt-5'>
        <h1>Error loading blog</h1>
        <p>{error?.message}</p>
        <div style={{ marginTop: '20px', background: '#f4f4f4', padding: '10px' }}>
          <h3>Debug Information:</h3>
          <p><strong>API_BASE_URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT SET'}</p>
          <p><strong>Slug:</strong> {slug}</p>
          <p><strong>Error:</strong> {error?.message}</p>
        </div>
      </div>
    );
  }

  if (!blogData) {
    console.log('No blog data found');
    return (
      <div className='mt-5 pt-5'>
        <h1>Blog not found</h1>
        <div style={{ marginTop: '20px', background: '#f4f4f4', padding: '10px' }}>
          <h3>Debug Information:</h3>
          <p><strong>API_BASE_URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT SET'}</p>
          <p><strong>Slug:</strong> {slug}</p>
        </div>
      </div>
    );
  }

  return <BlogDetail initialData={blogData} />;
}