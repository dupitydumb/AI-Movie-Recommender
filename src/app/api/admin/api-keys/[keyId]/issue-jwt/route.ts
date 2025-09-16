import { NextRequest, NextResponse } from 'next/server';
import { authenticate, getCORSHeaders } from '@/lib/auth-middleware';
import { apiKeyManager } from '@/lib/api-key-manager';
import { generateTokens } from '@/lib/jwt';
import { randomUUID } from 'crypto';

async function ensureAdmin(req: NextRequest) {
  const auth = await authenticate(req, { requireAuth: false });
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers.get('x-admin-secret');
  if (auth.success) {
    const user = auth.context.user;
    if (user.permissions?.includes('admin')) return { ok: true, userId: user.userId };
  }
  if (adminSecret && providedSecret && providedSecret === adminSecret) {
    return { ok: true, userId: 'admin_secret_user' };
  }
  return { ok: false };
}

// Use single-arg signature to avoid Next type inference issue; derive keyId from URL path
export async function POST(req: NextRequest) {
  const headers = getCORSHeaders();
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  const admin = await ensureAdmin(req);
  if (!admin.ok) {
    return NextResponse.json({ error: { code: 'forbidden', message: 'Admin access required', requestId, timestamp } }, { status: 403, headers });
  }

  // Extract keyId from pathname: /api/admin/api-keys/[keyId]/issue-jwt
  let keyId: string | null = null;
  try {
    const pathname = new URL(req.url).pathname;
    const match = pathname.match(/api-keys\/([^/]+)\/issue-jwt$/);
    if (match) keyId = match[1];
  } catch {}
  if (!keyId) {
    return NextResponse.json({ error: { code: 'bad_request', message: 'Unable to parse keyId from path', requestId, timestamp } }, { status: 400, headers });
  }
  const record = await apiKeyManager.get(keyId, true);
  if (!record) {
    return NextResponse.json({ error: { code: 'not_found', message: 'Key not found', requestId, timestamp } }, { status: 404, headers });
  }
  if (record.status !== 'active') {
    return NextResponse.json({ error: { code: 'invalid_state', message: `Key status is ${record.status}`, requestId, timestamp } }, { status: 400, headers });
  }
  if (apiKeyManager.isExpired(record)) {
    await apiKeyManager.update(record.keyId, { status: 'expired' });
    return NextResponse.json({ error: { code: 'expired', message: 'Key is expired', requestId, timestamp } }, { status: 400, headers });
  }

  // We no longer possess the original plain key (not persisted). Use synthetic claim.
  const syntheticApiKey = `key:${record.keyId}`;
  const tokens = await generateTokens({
    userId: `user_${record.keyId}`,
    email: record.metadata?.email,
    apiKey: syntheticApiKey,
    plan: record.plan === 'test' ? 'free' : record.plan,
    rateLimit: record.rateLimit,
    permissions: record.permissions,
  });

  const masked = apiKeyManager.mask(record);
  return NextResponse.json({ success: true, data: { key: masked, tokens } }, { status: 200, headers });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: getCORSHeaders() });
}
