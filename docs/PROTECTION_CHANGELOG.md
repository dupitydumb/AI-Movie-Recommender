# API Protection Hardening (2025-09-17)

We tightened authentication across API routes to prevent anonymous access.

Summary of changes:
- Enforced `authenticate(req, { requireAuth: true })` on protected routes:
  - /api/search
  - /api/details
  - /api/top
  - /api/trending
  - /api/genre
  - /api/getID
- Kept /api/ping public for health checks.
- Centralized rate limiting via `src/lib/auth-middleware.ts` rather than ad-hoc per-route logic.
- Standardized CORS headers via `getCORSHeaders()`.
- Updated README with secure usage instructions.

Headers to use:
- Prefer: `Authorization: Bearer <JWT>`
- Legacy: `X-RapidAPI-Key: <plain api key>` (also supported in Authorization without Bearer)

Admin endpoints:
- /api/admin/api-keys (JWT with admin permission or x-admin-secret header)

Notes:
- Anonymous usage was removed from /api/search.
- Old "route-legacy.ts" variants remain for reference but are unused by Next routing.
