import { createSessionToken, getRuntimeEnv, sessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json() as { username?: string; password?: string };
    const configuredUsername = getRuntimeEnv('AUTH_USERNAME');
    const configuredPassword = getRuntimeEnv('AUTH_PASSWORD');
    if (!configuredUsername || !configuredPassword) return Response.json({ error: 'Login is not configured.' }, { status: 503 });
    if (username !== configuredUsername || password !== configuredPassword) {
      return Response.json({ error: 'Incorrect username or password.' }, { status: 401 });
    }
    const token = await createSessionToken(username);
    return Response.json({ ok: true }, { headers: { 'Set-Cookie': sessionCookie(token), 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Unable to sign in. Please try again.' }, { status: 400 });
  }
}
