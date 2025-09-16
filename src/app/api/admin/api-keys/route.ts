import { NextRequest, NextResponse } from 'next/server';
import { authenticate, getCORSHeaders } from '@/lib/auth-middleware';
import { apiKeyManager, CreateApiKeyInput } from '@/lib/api-key-manager';
import { generateTokens } from '@/lib/jwt';
import { randomUUID } from 'crypto';

// Helper: admin authorization (either admin permission or header secret)
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

export async function GET(req: NextRequest) {
  const headers = getCORSHeaders();
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();

  const admin = await ensureAdmin(req);
  if (!admin.ok) {
    return NextResponse.json({
      error: { code: 'forbidden', message: 'Admin access required', requestId, timestamp }
    }, { status: 403, headers });
  }

  const status = req.nextUrl.searchParams.get('status') as any;
  const keys = await apiKeyManager.list(status);
  return NextResponse.json({ success: true, data: keys }, { status: 200, headers });
}

export async function POST(req: NextRequest) {
  const headers = getCORSHeaders();
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  const admin = await ensureAdmin(req);
  if (!admin.ok) {
    return NextResponse.json({ error: { code: 'forbidden', message: 'Admin access required', requestId, timestamp } }, { status: 403, headers });
  }

  let body: Partial<CreateApiKeyInput> = {};
  try { body = await req.json(); } catch {}

  // Basic validation
  if (body.rateLimit && (!body.rateLimit.requests || !body.rateLimit.window)) {
    return NextResponse.json({ error: { code: 'invalid_rate_limit', message: 'rateLimit must include requests and window', requestId, timestamp } }, { status: 400, headers });
  }

  const record = await apiKeyManager.create({
    plan: body.plan || 'basic',
    permissions: body.permissions || ['read','search','details'],
    rateLimit: body.rateLimit || { requests: 100, window: '1m' },
    expiresIn: body.expiresIn,
    description: body.description,
    metadata: body.metadata,
    createdBy: admin.userId || 'admin',
  });
  // If client requests JWT instead of returning plain key, issue tokens and omit plainKey
  const wantJWT = (body.issueJWT === true) || (typeof body.issueJWT === 'string' && body.issueJWT.toLowerCase() === 'true');
  if (wantJWT) {
    // record.plainKey still present here (not persisted). Use it to build JWT payload & then mask response.
    const tokens = await generateTokens({
      userId: `user_${record.keyId}`,
      email: record.metadata?.email,
      apiKey: record.plainKey!,
      plan: record.plan === 'test' ? 'free' : (record.plan as any),
      rateLimit: record.rateLimit,
      permissions: record.permissions,
    });
    const masked = { ...record };
    if (masked.plainKey) {
      masked.plainKey = `${masked.plainKey.slice(0,6)}...${masked.plainKey.slice(-4)}`;
    }
    return NextResponse.json({ success: true, data: { key: masked, tokens } }, { status: 201, headers });
  }

  return NextResponse.json({ success: true, data: record }, { status: 201, headers });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: getCORSHeaders() });
}
