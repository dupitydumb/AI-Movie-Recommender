import { NextRequest, NextResponse } from 'next/server';
import { authenticate, getCORSHeaders } from '@/lib/auth-middleware';
import { apiKeyManager, UpdateApiKeyInput } from '@/lib/api-key-manager';
import { randomUUID } from 'crypto';

// Admin auth helper (JWT with admin permission OR x-admin-secret header)
async function ensureAdmin(req: NextRequest) {
  const auth = await authenticate(req, { requireAuth: false });
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers.get('x-admin-secret');
  if (auth.success && auth.context.user.permissions?.includes('admin')) return { ok: true };
  if (adminSecret && providedSecret === adminSecret) return { ok: true };
  return { ok: false };
}

// Extract keyId from request URL (/api/admin/api-keys/{keyId})
function extractKeyId(req: NextRequest): string | null {
  try {
    const pathname = new URL(req.url).pathname;
    // Match .../api-keys/<keyId> (end or followed by slash)
    const match = pathname.match(/api-keys\/([^/]+)(?:$|\/)/);
    if (match) return match[1];
  } catch {}
  return null;
}

export async function GET(req: NextRequest) {
  const headers = getCORSHeaders();
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  if (!(await ensureAdmin(req)).ok) {
    return NextResponse.json({ error: { code: 'forbidden', message: 'Admin access required', requestId, timestamp } }, { status: 403, headers });
  }
  const keyId = extractKeyId(req);
  if (!keyId) {
    return NextResponse.json({ error: { code: 'bad_request', message: 'Unable to parse keyId from path', requestId, timestamp } }, { status: 400, headers });
  }
  const rec = await apiKeyManager.get(keyId);
  if (!rec) return NextResponse.json({ error: { code: 'not_found', message: 'API key not found', requestId, timestamp } }, { status: 404, headers });
  return NextResponse.json({ success: true, data: rec }, { status: 200, headers });
}

export async function PATCH(req: NextRequest) {
  const headers = getCORSHeaders();
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  if (!(await ensureAdmin(req)).ok) {
    return NextResponse.json({ error: { code: 'forbidden', message: 'Admin access required', requestId, timestamp } }, { status: 403, headers });
  }
  const keyId = extractKeyId(req);
  if (!keyId) {
    return NextResponse.json({ error: { code: 'bad_request', message: 'Unable to parse keyId from path', requestId, timestamp } }, { status: 400, headers });
  }
  let body: UpdateApiKeyInput = {};
  try { body = await req.json(); } catch {}
  const updated = await apiKeyManager.update(keyId, body);
  if (!updated) return NextResponse.json({ error: { code: 'not_found', message: 'API key not found', requestId, timestamp } }, { status: 404, headers });
  return NextResponse.json({ success: true, data: updated }, { status: 200, headers });
}

export async function DELETE(req: NextRequest) {
  const headers = getCORSHeaders();
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  if (!(await ensureAdmin(req)).ok) {
    return NextResponse.json({ error: { code: 'forbidden', message: 'Admin access required', requestId, timestamp } }, { status: 403, headers });
  }
  const keyId = extractKeyId(req);
  if (!keyId) {
    return NextResponse.json({ error: { code: 'bad_request', message: 'Unable to parse keyId from path', requestId, timestamp } }, { status: 400, headers });
  }
  const success = await apiKeyManager.revoke(keyId);
  if (!success) return NextResponse.json({ error: { code: 'not_found', message: 'API key not found', requestId, timestamp } }, { status: 404, headers });
  return NextResponse.json({ success: true, data: { revoked: true, keyId } }, { status: 200, headers });
}

export async function OPTIONS() { return new NextResponse(null, { status: 200, headers: getCORSHeaders() }); }
