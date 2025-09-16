import { Redis } from '@upstash/redis';
import { randomBytes, createHash } from 'crypto';

export interface ApiKeyRecord {
  keyId: string;              // Short identifier (not the full key)
  prefix: string;             // Prefix for display (first 6 chars of key)
  hashedKey: string;          // Hashed full key
  plainKey?: string;          // Only returned on creation
  status: 'active' | 'revoked' | 'expired';
  plan: 'free' | 'basic' | 'premium' | 'enterprise' | 'test';
  permissions: string[];
  rateLimit: { requests: number; window: string };
  createdAt: string;
  createdBy: string;          // Admin user or system
  expiresAt?: string;         // ISO time when key expires
  lastUsedAt?: string;
  usage: { total: number; periodStart: string; periodCount: number };
  metadata?: Record<string, any>;
  description?: string;
}

export interface CreateApiKeyInput {
  plan?: ApiKeyRecord['plan'];
  permissions?: string[];
  rateLimit?: { requests: number; window: string };
  expiresIn?: string; // e.g., '30d', '12h'
  description?: string;
  metadata?: Record<string, any>;
  createdBy: string;
  issueJWT?: boolean | string; // optional flag consumed by route (not persisted)
}

export interface UpdateApiKeyInput {
  plan?: ApiKeyRecord['plan'];
  permissions?: string[];
  rateLimit?: { requests: number; window: string };
  status?: ApiKeyRecord['status'];
  extendExpiresIn?: string; // extend expiration
  description?: string;
  metadata?: Record<string, any>;
}

export class ApiKeyManager {
  private redis: any;
  private prefix: string;

  constructor() {
    this.redis = Redis.fromEnv();
    this.prefix = 'apikey';
  }

  /** Generate a cryptographically strong API key */
  generateKey(): { plainKey: string; hashed: string; prefix: string; keyId: string } {
    const raw = randomBytes(32).toString('hex'); // 64 hex chars
    const prefix = raw.slice(0, 6);
    const keyId = createHash('sha256').update(raw).digest('hex').slice(0, 12);
    const hashed = this.hashKey(raw);
    return { plainKey: raw, hashed, prefix, keyId };
  }

  /** Hash key for storage */
  hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  /** Parse timespan like 30d, 12h, 15m into ms */
  private parseDuration(input?: string): number | undefined {
    if (!input) return undefined;
    const m = input.match(/^(\d+)([smhd])$/);
    if (!m) return undefined;
    const value = parseInt(m[1]);
    const unit = m[2];
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return undefined;
    }
  }

  /** Create new API key */
  async create(input: CreateApiKeyInput): Promise<ApiKeyRecord> {
    const { plainKey, hashed, prefix, keyId } = this.generateKey();
    const now = new Date();
    const expiresMs = this.parseDuration(input.expiresIn);
    const record: ApiKeyRecord = {
      keyId,
      prefix,
      hashedKey: hashed,
      plainKey,
      status: 'active',
      plan: input.plan || 'basic',
      permissions: input.permissions || ['read', 'search', 'details'],
      rateLimit: input.rateLimit || { requests: 100, window: '1m' },
      createdAt: now.toISOString(),
      createdBy: input.createdBy,
      expiresAt: expiresMs ? new Date(now.getTime() + expiresMs).toISOString() : undefined,
      usage: { total: 0, periodStart: now.toISOString(), periodCount: 0 },
      metadata: input.metadata,
      description: input.description,
    };

    // Prepare storage object (exclude plainKey, remove null/undefined, stringify complex types)
    const storage: Record<string, string> = {};
    const toStore = { ...record } as any;
    delete toStore.plainKey; // never persist plain key
    for (const [k, v] of Object.entries(toStore)) {
      if (v === undefined || v === null) continue; // skip null/undefined (fix Upstash null args)
      if (typeof v === 'object') {
        storage[k] = JSON.stringify(v);
      } else {
        storage[k] = String(v);
      }
    }

    // Store record hash
    await this.redis.hset(this.keyRecordKey(keyId), storage);
    // Add mapping hashed->keyId for lookup
    await this.redis.set(this.keyHashLookupKey(hashed), keyId);
    // Add to global sets
    await this.redis.sadd(this.keySetKey('all'), keyId);
    await this.redis.sadd(this.keySetKey(record.status), keyId);

    return record;
  }

  /** List keys (basic metadata) */
  async list(status?: ApiKeyRecord['status']): Promise<ApiKeyRecord[]> {
    const setKey = this.keySetKey(status || 'all');
    const ids: string[] = await this.redis.smembers(setKey);
    if (!ids || ids.length === 0) return [];
    const results: ApiKeyRecord[] = [];
    for (const id of ids) {
      const rec = await this.redis.hgetall(this.keyRecordKey(id));
      if (rec && Object.keys(rec).length) {
        const normalized = this.normalizeRecord(rec);
        results.push(this.mask(normalized));
      }
    }
    return results.sort((a,b)=> (a.createdAt < b.createdAt ? 1 : -1));
  }

  /** Get a single key by keyId */
  async get(keyId: string, includePlain = false): Promise<ApiKeyRecord | null> {
    const rec = await this.redis.hgetall(this.keyRecordKey(keyId));
    if (!rec || Object.keys(rec).length === 0) return null;
    const normalized = this.normalizeRecord(rec);
    return includePlain ? normalized : this.mask(normalized);
  }

  /** Find by raw API key (plain) */
  async findByApiKey(apiKey: string): Promise<ApiKeyRecord | null> {
    const hashed = this.hashKey(apiKey);
    const keyId = await this.redis.get(this.keyHashLookupKey(hashed));
    if (!keyId) return null;
    return this.get(keyId, true);
  }

  /** Update key */
  async update(keyId: string, updates: UpdateApiKeyInput): Promise<ApiKeyRecord | null> {
    const existing = await this.get(keyId, true);
    if (!existing) return null;

    if (updates.extendExpiresIn) {
      const addMs = this.parseDuration(updates.extendExpiresIn);
      if (addMs) {
        const base = existing.expiresAt ? new Date(existing.expiresAt).getTime() : Date.now();
        existing.expiresAt = new Date(base + addMs).toISOString();
      }
    }

    if (updates.plan) existing.plan = updates.plan;
    if (updates.permissions) existing.permissions = updates.permissions;
    if (updates.rateLimit) existing.rateLimit = updates.rateLimit;
    if (updates.description !== undefined) existing.description = updates.description;
    if (updates.metadata) existing.metadata = { ...(existing.metadata||{}), ...updates.metadata };

    if (updates.status && updates.status !== existing.status) {
      // Move between status sets
      await this.redis.srem(this.keySetKey(existing.status), keyId);
      existing.status = updates.status;
      await this.redis.sadd(this.keySetKey(existing.status), keyId);
    }

    // Sanitize before persisting (exclude plainKey, remove null/undefined)
    const storage: Record<string, string> = {};
    const toStore = { ...existing } as any;
    delete toStore.plainKey;
    for (const [k, v] of Object.entries(toStore)) {
      if (v === undefined || v === null) continue;
      if (typeof v === 'object') storage[k] = JSON.stringify(v); else storage[k] = String(v);
    }
    await this.redis.hset(this.keyRecordKey(keyId), storage);
    return this.mask(existing);
  }

  /** Revoke key */
  async revoke(keyId: string): Promise<boolean> {
    const existing = await this.get(keyId, true);
    if (!existing) return false;
    if (existing.status === 'revoked') return true;

    await this.redis.srem(this.keySetKey(existing.status), keyId);
    existing.status = 'revoked';
    await this.redis.sadd(this.keySetKey('revoked'), keyId);
    // Persist sanitized
    const storage: Record<string, string> = {};
    const toStore = { ...existing } as any;
    delete toStore.plainKey;
    for (const [k, v] of Object.entries(toStore)) {
      if (v === undefined || v === null) continue;
      if (typeof v === 'object') storage[k] = JSON.stringify(v); else storage[k] = String(v);
    }
    await this.redis.hset(this.keyRecordKey(keyId), storage);
    return true;
  }

  /** Record usage (called by middleware) */
  async recordUsage(keyId: string): Promise<void> {
    const existing = await this.get(keyId, true);
    if (!existing) return;
    const now = new Date();
    existing.usage.total += 1;
    existing.usage.periodCount += 1;
    existing.lastUsedAt = now.toISOString();
    const storage: Record<string, string> = {};
    const toStore = { ...existing } as any;
    delete toStore.plainKey;
    for (const [k, v] of Object.entries(toStore)) {
      if (v === undefined || v === null) continue;
      if (typeof v === 'object') storage[k] = JSON.stringify(v); else storage[k] = String(v);
    }
    await this.redis.hset(this.keyRecordKey(keyId), storage);
  }

  /** Expiration check */
  isExpired(rec: ApiKeyRecord): boolean {
    if (!rec.expiresAt) return false;
    return Date.now() > new Date(rec.expiresAt).getTime();
  }

  /** Mask plain key & hashedKey for responses */
  mask(rec: ApiKeyRecord): ApiKeyRecord {
    const clone = { ...rec };
    if (clone.plainKey) clone.plainKey = `${clone.plainKey.slice(0,6)}...${clone.plainKey.slice(-4)}`;
    clone.hashedKey = `${clone.hashedKey.slice(0,6)}...`;
    return clone;
  }

  /** Normalize record fields (JSON parse) */
  private normalizeRecord(raw: any): ApiKeyRecord {
    const rateLimit = typeof raw.rateLimit === 'string' ? JSON.parse(raw.rateLimit) : raw.rateLimit;
    const permissions = typeof raw.permissions === 'string' ? JSON.parse(raw.permissions) : raw.permissions;
    const usage = typeof raw.usage === 'string' ? JSON.parse(raw.usage) : raw.usage;
    const metadata = typeof raw.metadata === 'string' ? JSON.parse(raw.metadata) : raw.metadata;
    return { ...raw, rateLimit, permissions, usage, metadata } as ApiKeyRecord;
  }

  // Redis key helpers
  private keyRecordKey(keyId: string) { return `${this.prefix}:record:${keyId}`; }
  private keyHashLookupKey(hash: string) { return `${this.prefix}:hash:${hash}`; }
  private keySetKey(name: string) { return `${this.prefix}:set:${name}`; }
}

export const apiKeyManager = new ApiKeyManager();
