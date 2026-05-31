import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'fallback_secret_key_for_development';
const encodedKey = new TextEncoder().encode(secretKey);

export async function signToken(payload: { userId: number; userid: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as { userId: number; userid: string; role: string };
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: number, userid: string, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await signToken({ userId, userid, role });
  const cookieStore = await cookies();

  // COOKIE_SECURE should be 'true' only if the app is served over HTTPS.
  // For Tailscale VPN (plain HTTP), this MUST be false or the browser
  // will silently refuse to send the cookie on subsequent requests.
  const isSecure = process.env.COOKIE_SECURE === 'true';

  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: isSecure,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}
