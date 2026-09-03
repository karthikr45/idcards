import { isValidSession } from '@/lib/auth';

export async function GET(request: Request) {
  return Response.json({ authenticated: await isValidSession(request) }, { headers: { 'Cache-Control': 'no-store' } });
}
