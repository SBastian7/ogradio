/**
 * robots.txt
 * Tells search engines how to crawl the site
 */

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'], // Disallow API routes and admin (if any)
      },
    ],
    sitemap: 'https://ogclub.radio/sitemap.xml', // Update with your actual domain
  }
}
