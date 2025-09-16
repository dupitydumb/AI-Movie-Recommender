# 🚀 Production Deployment Checklist

## 🔴 CRITICAL SECURITY FIXES REQUIRED

### 1. Environment Variables & API Keys
**STATUS: ❌ EXPOSED - IMMEDIATE ACTION REQUIRED**

**Current Issues:**
- API keys are committed to `.env` files in repository
- Sensitive tokens are visible in plain text
- TMDB, Google API, Upstash Redis tokens are compromised

**Actions Required:**
```bash
# 1. Rotate ALL these keys immediately:
- UPSTASH_REDIS_REST_TOKEN (regenerate in Upstash dashboard)
- TMDB API key (regenerate in TMDB settings)
- GAPI key (regenerate in Google Cloud Console)
- SUPABASE_SERVICE_ROLE_KEY (regenerate in Supabase dashboard)

# 2. Remove .env files from git history:
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env .env.local' --prune-empty --tag-name-filter cat -- --all

# 3. Add to .gitignore if not already:
.env
.env.local
.env.production
.env.development
```

### 2. Console Logging - Remove Debug Output
**STATUS: ❌ SECURITY RISK**

**Issues Found:**
- API keys logged in `/movie/[id]/watch/page.tsx` line 39
- Test user data exposed in auth middleware
- Sensitive authentication data in console

**Files to Fix:**
```typescript
// ❌ Remove these console.log statements:

// src/app/movie/[id]/watch/page.tsx:39
console.log("API Key:", apiKey); // REMOVE THIS

// src/lib/auth-middleware.ts:332,341
console.log(`Test user ${userId} has exhausted...`); // REMOVE
console.log(`Updated test user ${userId} usage...`); // REMOVE

// src/components/animation/NetworkBackground.tsx:10,80,92
console.log("NetworkBackground component..."); // REMOVE DEBUG LOGS
```

### 3. Development Files & Test Scripts
**STATUS: ❌ SHOULD BE REMOVED**

**Files to Remove/Exclude:**
```bash
# Remove these test files from production:
- test-jwt.js
- test-api.js
- test-search-flow.js
- api-test-suite.js
- api-tester.html

# Add to .gitignore:
test-*.js
api-test-*.js
api-tester.html
```

### 4. Next.js Config Security
**STATUS: ⚠️ NEEDS REVIEW**

**Current Issue:**
```typescript
// next.config.ts - Exposing server-side env vars
env: {
  GAPI: process.env.GAPI, // ❌ Exposed to client
  TMDB: process.env.TMDB, // ❌ Exposed to client
  API_KEY: process.env.API_KEY, // ❌ Exposed to client
}
```

**Fix Required:**
```typescript
// ✅ Only expose what client needs:
const nextConfig: NextConfig = {
  // Remove server-side env vars from here
  env: {
    BASE_URL: process.env.BASE_URL,
    // Only include NEXT_PUBLIC_ prefixed vars
  },
  images: {
    domains: ["image.tmdb.org", "ui-avatars.com"],
    dangerouslyAllowSVG: true,
  },
};
```

## 🟡 RECOMMENDED PRODUCTION OPTIMIZATIONS

### 5. Error Handling & Logging
**Current Status: Inconsistent**

**Improvements Needed:**
```typescript
// Replace console.error with proper logging service
// Consider: Winston, Pino, or cloud logging

// Example production error handler:
const logger = {
  error: (message: string, error?: Error) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service (DataDog, LogRocket, etc.)
      // Don't expose sensitive data
    } else {
      console.error(message, error);
    }
  }
};
```

### 6. JWT Secret Security
**Current Status: Using fallback**

**Issue:**
```typescript
// src/lib/jwt.ts:47
console.warn('JWT_SECRET not set in environment variables. Using fallback.');
```

**Fix:**
```bash
# Ensure JWT_SECRET is set in production:
JWT_SECRET=your-super-secure-256-bit-secret-key-here
```

### 7. Rate Limiting & Security Headers
**Status: Partially Implemented**

**Add Security Headers:**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

### 8. Database Connection Security
**Status: ✅ Good (Using Upstash Redis)**

### 9. API Route Protection
**Status: ✅ Good (JWT + Rate limiting implemented)**

## 🔧 DEPLOYMENT STEPS

### Step 1: Clean Repository
```bash
# 1. Remove sensitive files
rm .env .env.local test-*.js api-test*.js api-tester.html

# 2. Update .gitignore
echo ".env*" >> .gitignore
echo "test-*.js" >> .gitignore

# 3. Remove from git history
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env .env.local' --prune-empty --tag-name-filter cat -- --all
```

### Step 2: Set Environment Variables in Hosting Platform
```bash
# Vercel/Netlify/Railway Environment Variables:
JWT_SECRET=new-super-secure-256-bit-secret
UPSTASH_REDIS_REST_URL=new-redis-url
UPSTASH_REDIS_REST_TOKEN=new-redis-token
TMDB=new-tmdb-jwt-token
GAPI=new-google-api-key
API_KEY=new-api-key
BASE_URL=https://screenpick.fun
NEXT_PUBLIC_SUPABASE_URL=new-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=new-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=new-supabase-service-key
NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=your-stripe-pricing-table-id
NEXT_PUBLIC_TMDB_API_KEY=new-tmdb-api-key
# ... etc for all keys
```

### Step 3: Remove Console Logs
```bash
# Search and remove all console.log statements:
grep -r "console\." src/ --include="*.tsx" --include="*.ts"
# Review each and remove/replace with proper logging
```

### Step 4: Update Configuration
- Fix next.config.ts to not expose server env vars
- Add security headers
- Enable production optimizations

### Step 5: Test Production Build
```bash
npm run build
npm run start
# Test all functionality works without console logs
```

## 🎯 PRIORITY ORDER

1. **IMMEDIATE (Security Critical):**
   - Rotate all API keys
   - Remove console.log with sensitive data
   - Fix next.config.ts env exposure

2. **HIGH (Before Deployment):**
   - Remove test files
   - Clean git history
   - Set proper JWT_SECRET

3. **MEDIUM (Post-Deployment):**
   - Add security headers
   - Implement proper logging
   - Monitor error rates

## ✅ PRODUCTION READY INDICATORS

- [ ] All API keys rotated and set in hosting platform
- [ ] No console.log statements with sensitive data
- [ ] Test files removed from repository
- [ ] next.config.ts doesn't expose server env vars
- [ ] JWT_SECRET properly set (not using fallback)
- [ ] Security headers configured
- [ ] .env files not in git history
- [ ] Production build succeeds
- [ ] All API endpoints work with new keys

**Estimated Time to Fix: 2-3 hours**
**Risk Level if Deployed Now: 🔴 HIGH - API keys compromised**
