"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import "@/styles/Other.css";
import Loader from '@/Layout/Loader';
import BlogDetailAds from './BlogDetailAds';
import "@/styles/BlogDetails.css";

interface BlogDetailsProps {
  initialData?: any;
  initialError?: any;
}

const BlogDetail: React.FC<BlogDetailsProps> = ({ initialData, initialError }) => {
    // console.log(initialData);
    
    const [data, setData] = useState<any | null>(initialData || null);
    // console.log(data);
    const [isLoading, setIsLoading] = useState(!initialData && !initialError);
    const [metaTagsReady, setMetaTagsReady] = useState(!!initialData);
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    // Define 301 redirect mappings
    const permanentRedirects: Record<string, string> = {
        'top-hr-interview-questions-and-answers-in-2025': 'hr-interview-questions-and-answers',
        'how-to-write-resignation-in-2025': 'how-to-write-a-resignation-letter-in-2025',
        'how-to-write-a-cover-letter': 'how-to-write-a-cover-letter-guide-in-2025',
        'top-30-interview-questions-and-expert': 'top-interview-questions-and-expert-answers-2025',
        'resume-margin-guidelines': 'resume-margin-guide',
        'hr-interview-questions-and-answers-in-2025': 'hr-interview-questions-and-answers',
    };

    // Check if current slug needs a 301 redirect
    const checkForRedirect = (currentSlug: string) => {
        if (permanentRedirects[currentSlug]) {
            // console.log(`301 Redirect initiated: /blogs/${currentSlug} → /blogs/${permanentRedirects[currentSlug]}`);
            router.replace(`/blogs/${permanentRedirects[currentSlug]}`);
            return true;
        }
        return false;
    };


    // Only fetch if we don't have initial data
    useEffect(() => {
        if (slug && !initialData && !initialError) {
            window.scrollTo(0, 0);
            
            // Check hardcoded redirects first
            if (checkForRedirect(slug)) {
                setIsLoading(false);
                return;
            }
        }
    }, [slug, initialData, initialError]);

    // Handle initial error
    useEffect(() => {
        if (initialError) {
            // Handle initial error from server-side fetch
            if (slug && checkForRedirect(slug)) {
                return;
            }
            router.push('/404');
        }
    }, [initialError, slug, router]);

    // Rest of your component remains the same...
    const hasContent = (htmlString: string) => {
        if (typeof window === 'undefined') return false;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlString;
        return tempDiv.textContent?.trim() !== "";
    };

    const formatBlogContent = (htmlContent: string) => {
        if (!htmlContent || typeof window === 'undefined') return '';

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlContent;

        const images = tempDiv.getElementsByTagName('img');
        for (let img of images) {
            img.classList.add('img-fluid', 'blog-content-image');
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.loading = 'lazy';

            if (!img.alt) {
                img.alt = 'Blog image';
            }
        }

        const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            heading.classList.add('blog-heading');
        });

        const paragraphs = tempDiv.getElementsByTagName('p');
        for (let p of paragraphs) {
            p.classList.add('blog-paragraph');
        }

        const lists = tempDiv.querySelectorAll('ul, ol');
        lists.forEach(list => {
            list.classList.add('blog-list');
        });

        return tempDiv.innerHTML;
    };

    const shouldRedirect = () => {
        if (!slug) return false;
        
        if (permanentRedirects[slug]) {
            return true;
        }
        
        if (data?.redirect_to || data?.canonical_slug !== slug) {
            return true;
        }
        
        return false;
    };

    if (shouldRedirect() && isLoading) {
        return <Loader />;
    }

    // Get metadata - use data from props if available
    const getMetadata = () => {
        if (!data) {
            return {
                title: 'TodoResume Blog',
                description: 'Read career tips, resume advice, and interview guidance on TodoResume Blog.',
                canonical: `https://todoresume.com/blogs/${slug || ''}`,
            };
        }

        const metaTitle = data?.meta_title || `${data.title} | TodoResume Blog`;
        const metaDescription = data?.meta_description || 
                              (data?.description ? 
                               data?.description.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : 
                               'Read this article on TodoResume Blog for career tips and resume advice.');
        const canonicalUrl = data.canonical_url || `https://todoresume.com/blogs/${data?.slug}`;

        return {
            title: metaTitle,
            description: metaDescription,
            canonical: canonicalUrl,
        };
    };

    const metadata = getMetadata();

    return (
        <>
            {/* Meta Tags for client-side updates */}
            {/* <Head>
                <title>{metadata.title}</title>
                <meta name="title" content={metadata.title} />
                <meta name="description" content={metadata.description} />
                <link rel="canonical" href={metadata.canonical} />
            </Head> */}

            {/* Content */}
            <div className="container blog-det pt-5">
                {isLoading ? (
                    <Loader />
                ) : (
                    metaTagsReady && data && (
                        <div className="row pt-5 mt-4 mx-0">
                            <BlogDetailAds />
                            
                            <div className="col-lg-12">
                                {data.data.title && (
                                    <h1 className="blog-main-title mb-4">
                                        {data.data.title}
                                    </h1>
                                )}

                                {data.data.image && (
                                    <div className="blog-featured-image mb-4">
                                        <img
                                            src={data.data.image}
                                            alt={data.data.title || "Blog featured image"}
                                            className="img-fluid featured-image"
                                            loading="lazy"
                                        />
                                    </div>
                                )}

                                {(data.data.author || data.data.published_date) && (
                                    <div className="blog-meta mb-4">
                                        {data.data.author && (
                                            <span className="blog-author me-3">
                                                By {data.data.author}
                                            </span>
                                        )}
                                        {data.data.published_date && (
                                            <span className="blog-date">
                                                {new Date(data.data.published_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="col-lg-12">
                                {data.data.description && hasContent(data.data.description) && (
                                    <div
                                        className="blog-content"
                                        dangerouslySetInnerHTML={{
                                            __html: formatBlogContent(data.data.description)
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>
        </>
    );
};

export default BlogDetail;