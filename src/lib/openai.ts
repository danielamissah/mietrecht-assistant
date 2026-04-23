// Re-export a shared OpenAI client instance.
// The actual API calls live in the route handler (api/generate-letter/route.ts)
// so the API key never touches the client bundle.
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});