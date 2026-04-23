import { createClient } from '@sanity/client';

// Sanity client configured for read-only CDN access.
// The CDN (useCdn: true) gives us cached responses with near-zero latency
// for published content. We only need writes in the Sanity Studio,
// not from this app.
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
});

// Fetch all articles sorted by category for the rights encyclopedia.
// We fetch only the fields we need for the list view — body content
// is fetched separately when a user opens an individual article.
export async function getArticles() {
  return sanityClient.fetch(
    `*[_type == "article"] | order(category asc) {
      _id, title, slug, category, summary, bgb_references, last_reviewed
    }`
  );
}

export async function getArticleBySlug(slug: string) {
  return sanityClient.fetch(
    `*[_type == "article" && slug.current == $slug][0] {
      _id, title, slug, category, summary, body, bgb_references, last_reviewed
    }`,
    { slug }
  );
}