// Server-side environment validation.
// Called in the API routes and server components that need external services.
// Next.js builds succeed with placeholder values (see CI pipeline) but
// runtime calls to missing APIs fail with a clear message instead of
// a cryptic 500 error.

const SERVER_ENV_VARS = [
  'GROQ_API_KEY',
] as const;

const CLIENT_ENV_VARS = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_GOOGLE_PLACES_API_KEY',
] as const;

export function validateServerEnv(): void {
  const missing = SERVER_ENV_VARS.filter(
    (key) => !process.env[key] || process.env[key] === 'placeholder'
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing server environment variables: ${missing.join(', ')}\n` +
      'Add them to .env.local for local development or to Vercel for production.'
    );
  }
}

export function validateClientEnv(): void {
  const missing = CLIENT_ENV_VARS.filter(
    (key) => !process.env[key] || process.env[key] === 'placeholder'
  );

  if (missing.length > 0) {
    console.warn(
      `Missing client environment variables: ${missing.join(', ')}\n` +
      'Some features may not work correctly.'
    );
  }
}