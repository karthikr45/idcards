import { createSessionToken, sessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json() as { username?: string; password?: string };
    if (!process.env.AUTH_USERNAME || !process.env.AUTH_PASSWORD) return Response.json({ error: 'Login is not configured.' }, { status: 503 });
    if (username !== process.env.AUTH_USERNAME || password !== process.env.AUTH_PASSWORD) {
      return Response.json({ error: 'Incorrect username or password.' }, { status: 401 });
    }
    const token = await createSessionToken(username);
    return Response.json({ ok: true }, { headers: { 'Set-Cookie': sessionCookie(token), 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Unable to sign in. Please try again.' }, { status: 400 });
  }
}
