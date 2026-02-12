/**
 * sitemap.xml
 * Helps search engines discover all pages on the site
 */

import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ogclub.radio' // Update with your actual domain

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always', // Homepage changes frequently with new tracks
      priority: 1,
    },
    {
      url: `${baseUrl}/diagnostics`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]
}
