const cookieName = 'caprus_id_session';
const sessionLifetimeSeconds = 8 * 60 * 60;

function encode(value: string) {
  return btoa(value).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

async function sign(value: string) {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) throw new Error('AUTH_SESSION_SECRET is not configured');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return encode(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)))));
}

export async function createSessionToken(username: string) {
  const payload = encode(JSON.stringify({ username, expiresAt: Date.now() + sessionLifetimeSeconds * 1000 }));
  return `${payload}.${await sign(payload)}`;
}

export async function isValidSession(request: Request) {
  const cookie = request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
  if (!cookie) return false;
  const token = cookie.slice(cookieName.length + 1);
  const [payload, signature] = token.split('.');
  if (!payload || !signature || signature !== await sign(payload)) return false;
  try {
    const decoded = JSON.parse(atob(payload.replaceAll('-', '+').replaceAll('_', '/')));
    return decoded.username === process.env.AUTH_USERNAME && decoded.expiresAt > Date.now();
  } catch { return false; }
}

export function sessionCookie(token: string) {
  return `${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${sessionLifetimeSeconds}`;
}

export function expiredSessionCookie() {
  return `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
