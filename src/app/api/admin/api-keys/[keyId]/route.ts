import { NextRequest, NextResponse } from 'next/server';
import { authenticate, getCORSHeaders } from '@/lib/auth-middleware';
import { apiKeyManager, UpdateApiKeyInput } from '@/lib/api-key-manager';
import { randomUUID } from 'crypto';

async function ensureAdmin(req: NextRequest) {
  const auth = await authenticate(req, { requireAuth: false });
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers.get('x-admin-secret');
  if (auth.success && auth.context.user.permissions?.includes('admin')) return { ok: true };
  if (adminSecret && providedSecret === adminSecret) return { ok: true };
  return { ok: false };
}

export async function GET(_: NextRequest, { params }: { params: { keyId: string } }) {
  const headers = getCORSHeaders();
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  if (!(await ensureAdmin(_)).ok) {
    return NextResponse.json({ error: { code: 'forbidden', message: 'Admin access required', requestId, timestamp } }, { status: 403, headers });
  }
  const rec = await apiKeyManager.get(params.keyId);
  if (!rec) return NextResponse.json({ error: { code: 'not_found', message: 'API key not found', requestId, timestamp } }, { status: 404, headers });
  return NextResponse.json({ success: true, data: rec }, { status: 200, headers });
}

export async function PATCH(req: NextRequest, { params }: { params: { keyId: string } }) {
  const headers = getCORSHeaders();
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  if (!(await ensureAdmin(req)).ok) {
    return NextResponse.json({ error: { code: 'forbidden', message: 'Admin access required', requestId, timestamp } }, { status: 403, headers });
  }
  let body: UpdateApiKeyInput = {};
  try { body = await req.json(); } catch {}
  const updated = await apiKeyManager.update(params.keyId, body);
  if (!updated) return NextResponse.json({ error: { code: 'not_found', message: 'API key not found', requestId, timestamp } }, { status: 404, headers });
  return NextResponse.json({ success: true, data: updated }, { status: 200, headers });
}

export async function DELETE(req: NextRequest, { params }: { params: { keyId: string } }) {
  const headers = getCORSHeaders();
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  if (!(await ensureAdmin(req)).ok) {
    return NextResponse.json({ error: { code: 'forbidden', message: 'Admin access required', requestId, timestamp } }, { status: 403, headers });
  }
  const success = await apiKeyManager.revoke(params.keyId);
  if (!success) return NextResponse.json({ error: { code: 'not_found', message: 'API key not found', requestId, timestamp } }, { status: 404, headers });
  return NextResponse.json({ success: true, data: { revoked: true, keyId: params.keyId } }, { status: 200, headers });
}

export async function OPTIONS() { return new NextResponse(null, { status: 200, headers: getCORSHeaders() }); }
