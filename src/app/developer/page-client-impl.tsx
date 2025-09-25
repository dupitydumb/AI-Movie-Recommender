"use client";
import { Provider } from "@/components/ui/provider";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { SeoSchema } from "@/components/ui/seo-scheme";
import React, { useState, useEffect } from "react";
import { toaster, Toaster } from "@/components/ui/toaster";
import { Key, Code2, Clock, Zap, AlertTriangle, Copy, CheckCircle, Sparkles, Terminal, Shield } from "lucide-react";
import { motion } from "framer-motion";
import ReactGA from "react-ga4";
import { DialogActionTrigger, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogRoot } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Code } from "@chakra-ui/react";

interface GeneratedKey {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
  expiresAt: string;
  requestLimit?: number;
  user?: {
    id?: string;
    userId?: string;
    email?: string;
    plan?: string;
    permissions?: string[];
    isTestUser?: boolean;
    requestLimit?: number;
    rateLimit?: { requests: number; window: string };
  };
}

export default function DeveloperClientPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<GeneratedKey | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  useEffect(() => {
    ReactGA.initialize("G-3YKPKP74MD");
    ReactGA.send({ hitType: "pageview", page: "/developer" });
  }, []);

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    setShowWarningDialog(false);
    try {
      const response = await fetch('/api/auth/test-token', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await response.json();
      if (data.success && data.tokens) {
        setGeneratedKey({
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
          expiresAt: data.user?.expiresAt || new Date(Date.now() + 3*60*60*1000).toISOString(),
          requestLimit: data.user?.requestLimit || 100,
          user: data.user || { isTestUser: true, requestLimit: 100 }
        });
        if (data.isExistingToken) {
          const tokenInfo = data.tokenInfo;
          const hours = tokenInfo?.timeRemaining?.hours || 0;
          const minutes = tokenInfo?.timeRemaining?.minutes || 0;
          toaster.create({ title: "Existing Token Retrieved", description: `Found your active token! ${hours}h ${minutes}m remaining. ${tokenInfo?.usage?.requestsRemaining || 0} requests left.` });
        } else {
          toaster.create({ title: "Test JWT Generated Successfully", description: "Your test JWT token is ready for development use." });
        }
      } else {
        const errorMessage = data.error?.message || data.message || 'Failed to generate JWT token';
        const errorDetails = data.error?.details || '';
        toaster.create({ title: "Generation Failed", description: `${errorMessage}${errorDetails ? ': ' + errorDetails : ''}` });
      }
    } catch {
      toaster.create({ title: "Network Error", description: "Failed to communicate with server. Please try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(type);
      setTimeout(() => setCopiedToken(null), 2000);
      toaster.create({ title: "Copied to Clipboard", description: `${type} copied successfully` });
    } catch {
      toaster.create({ title: "Copy Failed", description: "Failed to copy to clipboard" });
    }
  };

  return (
    <Provider>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        <SeoSchema />
        <Header />
        <main className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-green-500/5 rounded-full blur-3xl"></div>
          </div>
          <section className="relative z-10 pt-20 pb-16 px-4">
            <div className="max-w-6xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
                  <Code2 className="w-4 h-4" />
                  #1 Free Movie API • Developer Portal
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">Build with the</span><br />
                  <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-green-400 bg-clip-text text-transparent">No.1 Free Movie API</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Generate test JWT tokens instantly and start integrating our <strong className="text-white">AI-powered movie recommendation API</strong> into your applications. <span className="text-blue-400">100% free</span> for testing and development.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="max-w-4xl mx-auto mb-12">
                {!generatedKey ? (
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
                    <div className="mb-8">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                        <Key className="w-8 h-8 text-blue-400" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Generate Free Test JWT Token</h2>
                      <p className="text-gray-400 text-lg">Get instant access to our <span className="text-blue-400 font-semibold">#1 free movie API</span> for testing and development purposes.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl"><Clock className="w-6 h-6 text-blue-400" /><div><div className="font-semibold text-white">3 Hour Validity</div><div className="text-sm text-gray-400">Perfect for testing</div></div></div>
                      <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl"><Zap className="w-6 h-6 text-green-400" /><div><div className="font-semibold text-white">100 Requests</div><div className="text-sm text-gray-400">Rate limit included</div></div></div>
                      <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl"><Shield className="w-6 h-6 text-purple-400" /><div><div className="font-semibold text-white">1 Token Per Day</div><div className="text-sm text-gray-400">Per IP address limit</div></div></div>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-8">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 text-center">
                          <h4 className="font-semibold text-amber-400 mb-1">Token Generation Limits</h4>
                          <div className="text-sm text-gray-300 space-y-1">
                            <p>• Each IP address can generate only <strong>1 test token per day</strong></p>
                            <p>• If you already have an active token, you cannot generate a new one</p>
                            <p>• Tokens automatically expire after 3 hours or 100 requests</p>
                            <p>• You can generate a new token tomorrow or after your current token expires</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogRoot open={showWarningDialog} onOpenChange={(d) => setShowWarningDialog(d.open)}>
                      <DialogTrigger asChild>
                        <Button size="lg" disabled={isGenerating} className="px-8 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-500/50 min-w-[200px]">
                          {isGenerating ? (<div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>Generating...</div>) : (<div className="flex items-center gap-2"><Key className="w-5 h-5" />Generate Test JWT</div>)}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border border-gray-700">
                        <DialogHeader><DialogTitle className="flex items-center gap-2 text-yellow-400"><AlertTriangle className="w-5 h-5" />Test JWT Token - Important Notice</DialogTitle></DialogHeader>
                        <DialogBody className="space-y-4">
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4"><h4 className="font-semibold text-yellow-400 mb-2">Testing Purpose Only</h4><p className="text-gray-300 text-sm">This JWT token is intended for testing and development purposes only.</p></div>
                          <div className="space-y-3 text-sm text-gray-300">
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /><span>Token expires in <strong className="text-white">3 hours</strong></span></div>
                            <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-green-400" /><span>Limited to <strong className="text-white">100 requests</strong> total</span></div>
                            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-purple-400" /><span>Access to all API endpoints for testing</span></div>
                          </div>
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"><h4 className="font-semibold text-red-400 mb-2">Production Usage</h4><p className="text-gray-300 text-sm">For production applications, please obtain a proper API key from our <Button variant="ghost" size="sm" onClick={() => window.open('https://rapidapi.com/AirFU/api/ai-movie-recommender', '_blank')} className="text-blue-400 hover:text-blue-300 underline p-0 h-auto">RapidAPI marketplace</Button>.</p></div>
                        </DialogBody>
                        <DialogFooter>
                          <DialogActionTrigger asChild><Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">Cancel</Button></DialogActionTrigger>
                          <DialogActionTrigger asChild><Button onClick={handleGenerateKey} className="bg-blue-500 hover:bg-blue-600 text-white">I Understand, Generate Token</Button></DialogActionTrigger>
                        </DialogFooter>
                      </DialogContent>
                    </DialogRoot>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center"><CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" /><h3 className="text-2xl font-bold text-white mb-2">JWT Token Generated Successfully!</h3><p className="text-gray-300">Your test token is ready for development use.</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"><div className="p-4 border-b border-gray-800"><div className="flex items-center justify-between"><h4 className="font-semibold text-white flex items-center gap-2"><Key className="w-4 h-4 text-blue-400" />Access Token</h4><Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedKey!.accessToken, 'Access Token')} className="text-gray-400 hover:text-white">{copiedToken === 'Access Token' ? (<CheckCircle className="w-4 h-4 text-green-400" />) : (<Copy className="w-4 h-4" />)}</Button></div></div><div className="p-4"><Code className="text-xs text-gray-300 bg-gray-800 p-3 rounded-lg font-mono break-all">{generatedKey!.accessToken}</Code></div></div>
                      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"><div className="p-4 border-b border-gray-800"><div className="flex items-center justify-between"><h4 className="font-semibold text-white flex items-center gap-2"><Terminal className="w-4 h-4 text-green-400" />Refresh Token</h4><Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedKey!.refreshToken, 'Refresh Token')} className="text-gray-400 hover:text-white">{copiedToken === 'Refresh Token' ? (<CheckCircle className="w-4 h-4 text-green-400" />) : (<Copy className="w-4 h-4" />)}</Button></div></div><div className="p-4"><Code className="text-xs text-gray-300 bg-gray-800 p-3 rounded-lg font-mono break-all">{generatedKey!.refreshToken}</Code></div></div>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"><h4 className="font-semibold text-white mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" />Token Information</h4><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm"><div><div className="text-gray-400">User ID</div><div className="font-mono text-white">{generatedKey!.user?.id || generatedKey!.user?.userId || 'N/A'}</div></div><div><div className="text-gray-400">Plan</div><div className="font-mono text-white capitalize">{generatedKey!.user?.plan || 'Test User'}</div></div><div><div className="text-gray-400">Rate Limit</div><div className="font-mono text-white">{generatedKey!.requestLimit || generatedKey!.user?.rateLimit?.requests || 100} requests</div></div><div><div className="text-gray-400">Expires At</div><div className="font-mono text-white">{new Date(generatedKey!.expiresAt).toLocaleString()}</div></div></div></div>
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"><h4 className="font-semibold text-white mb-4 flex items-center gap-2"><Code2 className="w-4 h-4 text-blue-400" />Quick Start Example</h4><div className="bg-gray-800 rounded-lg p-4 font-mono text-sm"><pre className="text-gray-300 overflow-x-auto">{`// Using your JWT token\nconst response = await fetch('https://screenpick.fun/api/search?q=sci-fi movies', {\n  headers: {\n    'Authorization': 'Bearer ${generatedKey!.accessToken.substring(0, 50)}...',\n    'Content-Type': 'application/json'\n  }\n});\n\nconst data = await response.json();\nconsole.log(data.movies);`}</pre></div></div>
                    <div className="text-center"><Button onClick={() => setGeneratedKey(null)} size="lg" className="px-6 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-gray-500/50">Generate Another Token</Button></div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </section>
          <section className="relative z-10 px-4 pb-20">
            <div className="max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Ready to Build?</span></h2>
                <p className="text-gray-400 text-lg mb-8">Explore our comprehensive API documentation and start building amazing movie experiences.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button onClick={() => window.location.href = '/docs'} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl cursor-pointer">View Documentation</Button>
                  <Button onClick={() => window.location.href = '/docs/quickstart'} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-6 py-3 rounded-xl cursor-pointer">Quick Start Guide</Button>
                </div>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: <Code2 className="w-6 h-6" />, title: "RESTful API", description: "Clean, intuitive endpoints that follow REST conventions for easy integration." },
                  { icon: <Zap className="w-6 h-6" />, title: "Lightning Fast", description: "Sub-second response times with globally distributed infrastructure." },
                  { icon: <Shield className="w-6 h-6" />, title: "Secure & Reliable", description: "JWT authentication, rate limiting, and 99.9% uptime guarantee." }
                ].map((feature, index) => (
                  <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="p-6 bg-gray-900/30 rounded-2xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 text-blue-400">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
      <Toaster />
    </Provider>
  );
}
