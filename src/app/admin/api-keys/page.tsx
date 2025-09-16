"use client";
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiKeyItem {
  keyId: string;
  prefix: string;
  plan: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
  rateLimit: { requests: number; window: string };
  permissions: string[];
  description?: string;
  usage?: { total: number; periodCount: number };
  plainKey?: string; // only on creation
  hashedKey: string;
}
interface IssuedTokens { accessToken: string; refreshToken: string; expiresIn: string; tokenType: string; }

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [newKeyPlan, setNewKeyPlan] = useState('basic');
  const [newKeyRateRequests, setNewKeyRateRequests] = useState(100);
  const [newKeyRateWindow, setNewKeyRateWindow] = useState('1m');
  const [newKeyExpiresIn, setNewKeyExpiresIn] = useState('30d');
  const [adminSecret, setAdminSecret] = useState('');
  const [showPlainKey, setShowPlainKey] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [validated, setValidated] = useState(false);
  const [validating, setValidating] = useState(false);
  const [issued, setIssued] = useState<{ keyId: string; tokens: IssuedTokens | null } | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);
  const [createWithJWT, setCreateWithJWT] = useState(false);

  const statusPill = (status: string) => {
    const map: Record<string,string> = {
      active: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
      revoked: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
      expired: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
    };
    return map[status] || 'bg-neutral-600/20 text-neutral-300';
  };

  const copy = (txt: string) => { navigator.clipboard.writeText(txt).catch(()=>{}); };

  const validateSecret = useCallback(async () => {
    if (!adminSecret) return;
    setValidating(true);
    setError('');
    try {
      const res = await fetch('/api/admin/api-keys?limit=1', { headers: { 'x-admin-secret': adminSecret } });
      if (res.status === 403) throw new Error('Invalid admin secret');
      if (!res.ok) throw new Error('Validation failed');
      setValidated(true);
      sessionStorage.setItem('adminSecret', adminSecret);
      fetchKeys();
    } catch (e:any) {
      setError(e.message);
      setValidated(false);
    } finally { setValidating(false); }
  }, [adminSecret]);

  async function fetchKeys() {
    setLoading(true);
    setError('');
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const res = await fetch(`/api/admin/api-keys${params}`, {
        headers: adminSecret ? { 'x-admin-secret': adminSecret } : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to load keys');
      setKeys(data.data);
    } catch (e:any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (validated) fetchKeys(); /* eslint-disable-next-line */ }, [filterStatus, validated]);
  // Load persisted admin secret (session only)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('adminSecret');
      if (saved) setAdminSecret(saved);
    } catch {}
  }, []);
  // Persist when changed
  useEffect(() => {
    try {
      if (adminSecret) sessionStorage.setItem('adminSecret', adminSecret);
    } catch {}
  }, [adminSecret]);

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(adminSecret ? { 'x-admin-secret': adminSecret } : {}) },
        body: JSON.stringify({
          plan: newKeyPlan,
          rateLimit: { requests: newKeyRateRequests, window: newKeyRateWindow },
          expiresIn: newKeyExpiresIn,
          description: `Created via admin panel (${newKeyPlan})`,
          issueJWT: createWithJWT
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to create key');
      if (data.data?.tokens) {
        setIssued({ keyId: data.data.key.keyId, tokens: data.data.tokens });
        setShowIssueModal(true);
      } else {
        setShowPlainKey(data.data.plainKey);
      }
      fetchKeys();
    } catch (e:any) {
      setError(e.message);
    } finally { setCreating(false); }
  }

  async function revoke(keyId: string) {
    if (!confirm('Revoke this API key?')) return;
    try {
      const res = await fetch(`/api/admin/api-keys/${keyId}`, { method: 'DELETE', headers: adminSecret ? { 'x-admin-secret': adminSecret } : undefined });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed');
      fetchKeys();
    } catch (e:any) { setError(e.message); }
  }

  async function updatePlan(keyId: string, plan: string) {
    try {
      const res = await fetch(`/api/admin/api-keys/${keyId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(adminSecret ? { 'x-admin-secret': adminSecret } : {}) }, body: JSON.stringify({ plan }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed');
      fetchKeys();
    } catch (e:any) { setError(e.message); }
  }

  async function issueJWT(keyId: string) {
    setIssueLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/api-keys/${keyId}/issue-jwt`, { method: 'POST', headers: adminSecret ? { 'x-admin-secret': adminSecret } : undefined });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to issue JWT');
      setIssued({ keyId, tokens: data.data.tokens });
      setShowIssueModal(true);
    } catch (e:any) { setError(e.message); } finally { setIssueLoading(false); }
  }

  if (!validated) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-24 left-1/3 w-[420px] h-[420px] bg-red-500/10 blur-3xl rounded-full animate-pulse" />
          <div className="absolute bottom-10 right-1/4 w-[360px] h-[360px] bg-purple-500/10 blur-3xl rounded-full animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[480px] bg-gradient-to-r from-red-500/5 via-pink-500/5 to-blue-500/5 blur-3xl rounded-full" />
        </div>
        <div className="relative z-10 min-h-[70vh] flex items-center justify-center px-4 py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md space-y-7 bg-gray-900/60 backdrop-blur-md ring-1 ring-gray-800/60 p-8 rounded-2xl shadow-[0_0_40px_-10px_rgba(255,0,0,0.25)]">
            <div className="space-y-3 text-center">
              <h1 className="text-3xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-red-400 via-orange-300 to-rose-300 bg-clip-text text-transparent">Admin Access</span>
              </h1>
              <p className="text-sm text-gray-400">Authenticate to manage API key lifecycle & usage controls.</p>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-gray-400 font-medium">Admin Secret</label>
                <input type="password" value={adminSecret} onChange={e=>setAdminSecret(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-gray-800/70 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm" />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={validateSecret} disabled={!adminSecret || validating} className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 py-3 text-sm font-semibold tracking-wide disabled:opacity-50 shadow-[0_0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_24px_-4px_rgba(255,80,80,0.55)] transition-shadow">
                <span className="relative z-10 flex items-center justify-center gap-2">{validating ? 'Validating...' : 'Enter Console'}</span>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 transition-opacity" />
              </motion.button>
              <AnimatePresence>{error && (
                <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} className="text-xs p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 shadow-inner">
                  {error}
                </motion.div>
              )}</AnimatePresence>
              <p className="text-[11px] text-gray-500 leading-relaxed">Use JWT with <code className="px-1.5 py-0.5 bg-gray-800/80 rounded text-[10px] border border-gray-700">admin</code> permission for production auditing. Secret stored only in session.</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-10 w-[500px] h-[500px] bg-red-500/10 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[460px] h-[460px] bg-blue-500/10 blur-3xl rounded-full animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[780px] h-[520px] bg-gradient-to-r from-red-500/5 via-purple-500/5 to-blue-500/5 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 p-6 space-y-12 max-w-7xl mx-auto">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">API Key</span>{' '}
              <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">Console</span>
            </h1>
            <p className="text-sm text-gray-400 mt-2">Issue, rotate & govern programmatic access with precision controls.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>fetchKeys()} className="px-4 py-2 text-xs rounded-lg bg-gray-900/70 border border-gray-700 hover:border-red-500/60 hover:text-red-300 transition-colors">Refresh</button>
            <button onClick={()=>{setValidated(false); setKeys([]);}} className="px-4 py-2 text-xs rounded-lg bg-gray-950/70 border border-gray-800 hover:border-gray-600 transition-colors">Lock</button>
          </div>
        </header>

        {showPlainKey && (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="relative p-5 rounded-2xl border border-emerald-600/30 bg-gradient-to-br from-emerald-900/40 via-gray-900/40 to-neutral-900 shadow-[0_0_30px_-12px_rgba(16,185,129,0.45)]">
            <button onClick={()=>setShowPlainKey(null)} className="absolute top-2 right-2 text-xs text-gray-400 hover:text-gray-200">×</button>
            <p className="font-medium text-emerald-200 mb-3">Copy this new key now (will not be shown again)</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 break-all text-[11px] bg-gray-950/60 p-3 rounded-lg border border-gray-800/80 shadow-inner">{showPlainKey}</code>
              <button onClick={()=>copy(showPlainKey)} className="px-3 py-2 rounded-md bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 text-[11px] border border-emerald-500/40">Copy</button>
            </div>
          </motion.div>
        )}

        {/* Top dashboard cards */}
        <section className="grid gap-8 md:grid-cols-3">
          {/* Create Key */}
          <motion.form layout onSubmit={createKey} className="relative overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-900/60 backdrop-blur-sm p-6 space-y-5 ring-1 ring-gray-800/40">
            <h2 className="font-semibold text-sm tracking-wide text-gray-200 flex items-center gap-2"><span className="w-1.5 h-4 bg-gradient-to-b from-red-500 to-orange-400 rounded" />Create API Key</h2>
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <label className="space-y-1 col-span-1">
                <span className="block text-gray-400">Plan</span>
                <select value={newKeyPlan} onChange={e=>setNewKeyPlan(e.target.value)} className="w-full px-2 py-1.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-red-500/60 text-gray-100">
                  {['free','basic','premium','enterprise','test'].map(p => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label className="space-y-1">
                <span className="block text-gray-400">Requests</span>
                <input type="number" value={newKeyRateRequests} onChange={e=>setNewKeyRateRequests(parseInt(e.target.value)||0)} className="w-full px-2 py-1.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-red-500/60" />
              </label>
              <label className="space-y-1">
                <span className="block text-gray-400">Window</span>
                <input value={newKeyRateWindow} onChange={e=>setNewKeyRateWindow(e.target.value)} className="w-full px-2 py-1.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-red-500/60" />
              </label>
              <label className="space-y-1">
                <span className="block text-gray-400">Expires In</span>
                <input value={newKeyExpiresIn} onChange={e=>setNewKeyExpiresIn(e.target.value)} className="w-full px-2 py-1.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-red-500/60" />
              </label>
            </div>
            <label className="flex items-center gap-2 text-[11px] text-gray-400">
              <input type="checkbox" checked={createWithJWT} onChange={e=>setCreateWithJWT(e.target.checked)} className="rounded border-gray-600 bg-gray-800" />
              Issue JWT immediately
            </label>
            <motion.button whileTap={{ scale: 0.97 }} disabled={creating} className="w-full text-xs font-semibold rounded-md py-2.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-400 hover:from-red-500 hover:to-orange-300 disabled:opacity-50 shadow-[0_0_18px_-6px_rgba(255,80,80,0.45)]">
              {creating ? (createWithJWT ? 'Creating + Issuing...' : 'Creating...') : (createWithJWT ? 'Create & Issue JWT' : 'Generate Key')}
            </motion.button>
          </motion.form>

          {/* Filters */}
          <motion.div layout className="rounded-2xl border border-gray-800/80 bg-gray-900/60 p-6 space-y-5 text-[11px] ring-1 ring-gray-800/40">
            <h2 className="font-semibold text-gray-200 tracking-wide flex items-center gap-2"><span className="w-1.5 h-4 bg-gradient-to-b from-orange-400 to-red-500 rounded" />Filters</h2>
            <label className="space-y-1 block">
              <span className="text-gray-400">Status</span>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="w-full px-2 py-1.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-red-500/60">
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="revoked">Revoked</option>
                <option value="expired">Expired</option>
              </select>
            </label>
            <div className="text-[10.5px] text-gray-500 leading-relaxed space-y-1.5">
              <p><span className="text-gray-300">Tip:</span> Rotate test keys regularly & assign minimal scopes.</p>
              <p>Enterprise plan = extended burst + custom SLA.</p>
            </div>
          </motion.div>

            {/* Stats */}
          <motion.div layout className="rounded-2xl border border-gray-800/80 bg-gray-900/60 p-6 space-y-4 text-[11px] ring-1 ring-gray-800/40">
            <h2 className="font-semibold text-gray-200 tracking-wide flex items-center gap-2"><span className="w-1.5 h-4 bg-gradient-to-b from-pink-400 to-red-500 rounded" />Quick Stats</h2>
            <ul className="space-y-1">
              <li className="flex justify-between"><span className="text-gray-400">Total Keys</span><span className="text-gray-200">{keys.length}</span></li>
              <li className="flex justify-between"><span className="text-gray-400">Active</span><span className="text-emerald-300">{keys.filter(k=>k.status==='active').length}</span></li>
              <li className="flex justify-between"><span className="text-gray-400">Revoked</span><span className="text-rose-300">{keys.filter(k=>k.status==='revoked').length}</span></li>
              <li className="flex justify-between"><span className="text-gray-400">Expired</span><span className="text-amber-300">{keys.filter(k=>k.status==='expired').length}</span></li>
            </ul>
          </motion.div>
        </section>

        <AnimatePresence>{error && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 shadow">
            {error}
          </motion.div>
        )}</AnimatePresence>

        {/* Keys Table */}
        <section className="rounded-2xl border border-gray-800/80 overflow-hidden bg-gray-900/50 backdrop-blur-sm ring-1 ring-gray-800/40">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/70">
            <h2 className="font-medium text-gray-200 text-sm tracking-wide">Keys</h2>
            <div className="text-[10px] text-gray-500">Auto-masked • Plain shown once</div>
          </div>
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700/50">
            <table className="w-full text-[11.5px]">
              <thead className="bg-gray-800/60 text-gray-300 uppercase tracking-wide text-[10px]">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Key</th>
                  <th className="px-3 py-2 text-left font-medium">Plan</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Rate</th>
                  <th className="px-3 py-2 text-left font-medium">Usage</th>
                  <th className="px-3 py-2 text-left font-medium">Created</th>
                  <th className="px-3 py-2 text-left font-medium">Expires</th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {loading && (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full border-2 border-gray-800" />
                        <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-t-red-500 animate-spin" />
                      </div>
                      <span className="text-xs">Loading keys...</span>
                    </div>
                  </td></tr>
                )}
                {!loading && keys.length === 0 && (
                  <tr><td colSpan={8} className="px-6 py-14 text-center text-gray-500">No API keys found.</td></tr>
                )}
                <AnimatePresence>
                  {!loading && keys.map(k => (
                    <motion.tr key={k.keyId} layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-3 py-2 font-mono text-[10px] text-gray-400" title={k.hashedKey}>{k.prefix}</td>
                      <td className="px-3 py-2">
                        <select value={k.plan} onChange={e=>updatePlan(k.keyId, e.target.value)} className="bg-gray-950/60 border border-gray-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500/60 text-gray-200">
                          {['free','basic','premium','enterprise','test'].map(pl => <option key={pl} value={pl}>{pl}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${statusPill(k.status)}`}>{k.status}</span></td>
                      <td className="px-3 py-2 tabular-nums text-gray-300">{k.rateLimit.requests}/{k.rateLimit.window}</td>
                      <td className="px-3 py-2 tabular-nums text-gray-300">{k.usage?.total ?? 0}</td>
                      <td className="px-3 py-2 text-gray-400">{new Date(k.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-gray-400">{k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : '-'}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {k.status === 'active' && <button onClick={()=>revoke(k.keyId)} className="px-2 py-1 rounded bg-red-600/30 hover:bg-red-600/50 text-red-200 text-[10px] border border-red-500/30">Revoke</button>}
                          {k.status === 'active' && <button disabled={issueLoading} onClick={()=>issueJWT(k.keyId)} className="px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-[10px] border border-blue-500/30">{issueLoading ? '...' : 'Issue JWT'}</button>}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </section>

        {showIssueModal && issued?.tokens && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="w-full max-w-2xl bg-gray-900/80 border border-gray-700 rounded-2xl p-6 space-y-5 relative">
            <button onClick={()=>{setShowIssueModal(false);}} className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-sm">×</button>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-red-400 to-orange-300 bg-clip-text text-transparent">JWT Issued</h3>
            <div className="grid gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Access Token</p>
                <div className="relative group">
                    <textarea readOnly value={issued.tokens?.accessToken || ''} className="w-full text-[10px] leading-relaxed font-mono bg-gray-950/60 border border-gray-700 rounded-lg p-3 pr-16 resize-none h-32" />
                    <button onClick={()=> issued?.tokens && copy(issued.tokens.accessToken)} className="absolute top-2 right-2 px-2 py-1 text-[10px] rounded bg-gray-800/70 hover:bg-gray-700 border border-gray-600">Copy</button>
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Refresh Token</p>
                <div className="relative group">
                    <textarea readOnly value={issued.tokens?.refreshToken || ''} className="w-full text-[10px] leading-relaxed font-mono bg-gray-950/60 border border-gray-700 rounded-lg p-3 pr-16 resize-none h-24" />
                    <button onClick={()=> issued?.tokens && copy(issued.tokens.refreshToken)} className="absolute top-2 right-2 px-2 py-1 text-[10px] rounded bg-gray-800/70 hover:bg-gray-700 border border-gray-600">Copy</button>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3 text-[11px]">
                <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50"><div className="text-gray-400">KeyId</div><div className="font-mono text-gray-200 mt-1">{issued.keyId}</div></div>
                  <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50"><div className="text-gray-400">Expires In</div><div className="text-gray-200 mt-1">{issued.tokens?.expiresIn}</div></div>
                  <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50"><div className="text-gray-400">Type</div><div className="text-gray-200 mt-1">{issued.tokens?.tokenType}</div></div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={()=>issueJWT(issued.keyId)} className="px-3 py-2 rounded-md bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 text-[11px] border border-blue-500/40">Re-Issue</button>
                <button onClick={()=>setShowIssueModal(false)} className="px-3 py-2 rounded-md bg-gray-700/40 hover:bg-gray-600/40 text-gray-200 text-[11px] border border-gray-600/50">Close</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
}
