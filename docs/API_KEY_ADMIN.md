# API Key Administration & Management

This document describes the API key management system (admin panel + API endpoints) enabling:

- Create API keys with custom plan, permissions, rate limits and expiration
- List / filter keys by status
- Update key plan, permissions, rate limits, metadata, extend expiration
- Revoke keys (soft revoke; preserved for audit)
- Automatic expiration handling
- Usage tracking (total & period counts)
- Secure validation integrated with JWT login

## Redis Schema

| Purpose | Key Pattern | Value Type |
|---------|-------------|------------|
| Key record hash | `apikey:record:{keyId}` | Hash (fields of ApiKeyRecord) |
| Hashed-key lookup | `apikey:hash:{sha256(key)}` | keyId |
| Status sets | `apikey:set:all` / `apikey:set:active` / `apikey:set:revoked` / `apikey:set:expired` | Set(keyId) |

ApiKeyRecord fields stored (stringified where noted):
```
keyId, prefix, hashedKey, status, plan, permissions(JSON), rateLimit(JSON), createdAt,
createdBy, expiresAt, lastUsedAt, usage(JSON), metadata(JSON), description, plainKey (only ephemeral in create response)
```
`plainKey` is NEVER stored permanently in Redis. Only shown once on creation and then masked.

## Endpoints

All under `/api/admin/api-keys`.

### Auth Options
1. Provide a JWT whose `permissions` includes `admin` (Authorization: Bearer <token>)
2. Or supply `x-admin-secret: <ADMIN_SECRET>` header (set `ADMIN_SECRET` in env)

### List Keys
GET `/api/admin/api-keys` optional `?status=active|revoked|expired`
```
200 { success: true, data: ApiKeyRecord[] (masked) }
```

### Create Key
POST `/api/admin/api-keys`
```
Body: {
  plan?: 'free'|'basic'|'premium'|'enterprise'|'test',
  permissions?: string[],
  rateLimit?: { requests:number; window:string },
  expiresIn?: '30d'|'12h'|...,
  description?: string,
  metadata?: { ... }
}
```
Response includes one-time `plainKey`.

### Get Key
GET `/api/admin/api-keys/{keyId}`

### Update Key
PATCH `/api/admin/api-keys/{keyId}`
```
Body: {
  plan?, permissions?, rateLimit?, status?, extendExpiresIn?, description?, metadata?
}
```

### Revoke Key
DELETE `/api/admin/api-keys/{keyId}`

## Expiration
If a key passes `expiresAt`, validation will fail and the record may be moved to `expired` status lazily on next validation.

## Integration with JWT Flow
`validateApiKeyAndGetUserData` now consults ApiKeyManager first. Active & non-expired keys produce a user object with plan, permissions, and rateLimit derived from record.

## Rate Limiting
Per-key rate limits can be adjusted via PATCH. The existing `auth-middleware` consumes `rateLimit` from the user token.

## Admin Panel UI
Page: `/admin/api-keys` contains:
- Key list with plan edit & revoke
- Form to create new key (shows plain key once)
- Filter by status

## Security Notes
- Always serve admin panel over HTTPS
- Store `ADMIN_SECRET` securely (e.g. Vercel project env) and prefer JWT-based admin auth for auditability
- Rotate admin secret periodically if used
- Consider adding audit logging for key lifecycle events

## Future Enhancements
- Add pagination for large key sets
- Add search by prefix
- Add usage reset & analytics metrics
- Multi-tenant ownership linking keys to accounts
- Webhook on key creation/revocation

