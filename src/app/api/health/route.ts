import { NextResponse } from 'next/server';

// Health check endpoint for Docker, load balancers, and uptime monitors.
// Verifies the app is running and optionally checks external dependencies.
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'mietrecht-assistant',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
}