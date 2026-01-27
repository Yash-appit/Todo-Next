"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import "@/styles/Other.css";
import BlogDetailAds from './BlogDetailAds';
import "@/styles/BlogDetails.css";

interface BlogDetailsProps {
    initialData?: any;
    initialError?: any;
}

const BlogDetail: React.FC<BlogDetailsProps> = ({ initialData, initialError }) => {
    const [data, setData] = useState<any | null>(initialData || null);
    const router = useRouter();
    const params = useParams();
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

    // Check for 301 redirects on mount
    useEffect(() => {
        if (slug && permanentRedirects[slug]) {
            router.replace(`/blogs/${permanentRedirects[slug]}`);
        }
    }, [slug]);

    // Handle server-side redirect or canonical URL redirect
    useEffect(() => {
        if (data?.redirect_to) {
            router.replace(`/blogs/${data.redirect_to}`);
        } else if (data?.data?.canonical_slug && data?.data?.canonical_slug !== slug) {
            router.replace(`/blogs/${data.data.canonical_slug}`);
        }
    }, [data, slug]);

    // Handle initial error
    useEffect(() => {
        if (initialError) {
            if (slug && !permanentRedirects[slug]) {
                router.push('/404');
            }
        }
    }, [initialError, slug]);

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

    // If no data, show nothing (loading.tsx will handle the loader)
    if (!data || !data.data) {
        return null;
    }

    return (
        <div className="container blog-det pt-5">
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
                            <Image
                                src={data.data.image}
                                alt={data.data.title || "Blog featured image"}
                                className="img-fluid featured-image"
                                width={800}
                                height={600}
                                unoptimized
                                style={{ width: '100%', height: 'auto' }}
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
        </div>
    );
};

export default BlogDetail;