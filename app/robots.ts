import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://todoresume.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/private/', 
        '/admin/', 
        '/(dashboard)/', // Next.js route groups aren't real paths, but if they resulted in URLs they would be here. 
        // Real dashboard paths:
        '/ats-checker',
        '/career-objective-generator',
        '/email-template-generator', // wait, this is a tool, is it protected? 
        // The dashboard routes list:
        // /ats-checker
        // /career-objective-generator
        // /email-template-generator
        // /feedback
        // /job-description-analyzer
        // /job-description-generator
        // /linkedin-bio-generator
        // /manage-subscription
        // /qa-generator
        // /resumes
        // /settings
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
