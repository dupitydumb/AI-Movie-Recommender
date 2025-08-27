"use client";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Breadcrumb, BreadcrumbStructuredData } from "@/components/ui/breadcrumb";
import { Check, Copy, Rocket, Terminal, Zap, KeyRound, Search, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function QuickstartContent() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2500);
    });
  };
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Documentation", href: "/docs" },
    { label: "Quickstart", href: "/docs/quickstart", isCurrentPage: true },
  ];
  const baseUrl = "https://screenpick.fun/api";
  const curlPing = `curl -s ${baseUrl}/ping`;
  const curlSearch = `curl -s -H "Authorization: Bearer YOUR_API_KEY" \n  "${baseUrl}/search?q=classic+space+adventure"`;
  const jsFetch = `const res = await fetch('${baseUrl}/search?q=thrilling+heist', {\n  headers: {\n    Authorization: 'Bearer YOUR_API_KEY'\n  }\n});\nconst data = await res.json();\nconsole.log(data.results[0]);`;
  const nodeAxios = `import axios from 'axios';\n\nconst client = axios.create({\n  baseURL: '${baseUrl}',\n  headers: { Authorization: 'Bearer ' + process.env.SCREENPICK_API_KEY }\n});\n\n(async () => {\n  const { data } = await client.get('/search', { params: { q: 'feel good animated movies' }});\n  console.log(data.results.map(m => m.title));\n})();`;
  const pythonReq = `import os, requests\nAPI_KEY = os.environ.get('SCREENPICK_API_KEY')\nresp = requests.get('${baseUrl}/search', params={'q':'emotional drama'}, headers={'Authorization': f'Bearer {API_KEY}'})\nprint(resp.json()['results'][0]['title'])`;
  const errorHandling = `async function api(path, params) {\n  const url = new URL('${baseUrl}' + path);\n  Object.entries(params || {}).forEach(([k,v]) => url.searchParams.set(k, String(v)));\n  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_SCREENPICK_KEY } });\n  if (!res.ok) {\n    let msg = res.status + ' error';\n    try {\n      const err = await res.json();\n      msg = err.error?.message || msg;\n    } catch {}\n    if (res.status === 429) {\n      const retry = res.headers.get('Retry-After') || '60';\n      throw new Error('Rate limited. Retry after ' + retry + 's');\n    }\n    throw new Error(msg);\n  }\n  return res.json();\n}`;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 left-1/3 w-96 h-96 bg-red-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-purple-500/10 blur-3xl rounded-full" />
      </div>
      <div className="relative z-10">
        <Header />
        <section className="pt-6 px-4 max-w-6xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />
        </section>
        <section className="px-4 pt-10 pb-6 max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-5">
              <Rocket className="w-4 h-4" />
              Quickstart
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Get Productive In <span className="bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">5 Minutes</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Follow these focused steps to obtain an API key, make your first request, and parse movie recommendations using Screenpick.
            </p>
          </div>
        </section>
        <section className="px-4 pb-20 max-w-6xl mx-auto space-y-12">
          <QuickstartStep
            number={1}
            title="Create a Free Account & Get API Key"
            icon={<KeyRound className="w-5 h-5" />}
            body={
              <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <p>Visit the RapidAPI listing and subscribe to the Free plan. Copy the provided API key.</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Go to <a href="https://rapidapi.com/AirFU/api/ai-movie-recommender" target="_blank" rel="noopener noreferrer" className="text-red-400 underline">Screenpick on RapidAPI</a>
                  </li>
                  <li>Sign in & click Subscribe</li>
                  <li>
                    Copy your <code className="px-1 bg-gray-800 rounded">X-RapidAPI-Key</code>
                  </li>
                  <li>
                    Store it securely (e.g. <code className="px-1 bg-gray-800 rounded">SCREENPICK_API_KEY</code> env var)
                  </li>
                </ol>
                <div className="bg-yellow-900/30 border border-yellow-600/30 p-3 rounded-md text-yellow-200 text-xs">Never commit API keys to Git – use environment variables.</div>
              </div>
            }
          />
          <QuickstartStep
            number={2}
            title="Test Connectivity"
            icon={<Terminal className="w-5 h-5" />}
            body={
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">Ping the health endpoint – you should receive a simple JSON confirming availability.</p>
                <CodeBlock id="curl-ping" onCopy={copy} copied={copied} code={curlPing} language="bash" />
              </div>
            }
          />
          <QuickstartStep
            number={3}
            title="Make Your First Search"
            icon={<Search className="w-5 h-5" />}
            body={
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  Use natural language in the <code className="px-1 bg-gray-800 rounded">q</code> parameter – the AI interprets intent (genre, mood, era, style).
                </p>
                <CodeBlock id="curl-search" onCopy={copy} copied={copied} code={curlSearch} language="bash" />
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 overflow-x-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">{`Example partial response:
{\n  "query": "classic space adventure",\n  "results": [\n    { "id": 11, "title": "Star Wars: A New Hope", "year": 1977, "imdb_id": "tt0076759" },\n    { "id": 1893, "title": "Star Wars: Attack of the Clones", ... }\n  ],\n  "count": 20\n}`}</pre>
                </div>
              </div>
            }
          />
          <QuickstartStep
            number={4}
            title="Integrate in Your Code"
            icon={<Zap className="w-5 h-5" />}
            body={
              <div className="space-y-6">
                <Tabs defaultValue="js" className="w-full">
                  <TabsList className="mb-2">
                    <TabsTrigger value="js">Browser Fetch</TabsTrigger>
                    <TabsTrigger value="node">Node.js (Axios)</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>
                  <TabsContent value="js"><CodeBlock id="js-fetch" onCopy={copy} copied={copied} code={jsFetch} language="javascript" /></TabsContent>
                  <TabsContent value="node"><CodeBlock id="node-axios" onCopy={copy} copied={copied} code={nodeAxios} language="javascript" /></TabsContent>
                  <TabsContent value="python"><CodeBlock id="py-req" onCopy={copy} copied={copied} code={pythonReq} language="python" /></TabsContent>
                </Tabs>
              </div>
            }
          />
          <QuickstartStep
            number={5}
            title="Handle Errors & Rate Limits"
            icon={<Shield className="w-5 h-5" />}
            body={
              <div className="space-y-4 text-sm text-gray-300">
                <p>
                  Check HTTP status codes. On <code className="px-1 bg-gray-800 rounded">429</code> back off & retry after the <code className="px-1 bg-gray-800 rounded">Retry-After</code> header.
                </p>
                <CodeBlock id="err-handling" onCopy={copy} copied={copied} code={errorHandling} language="javascript" />
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
                  <li>400 – Validate your parameters</li>
                  <li>401 – Wrong / missing key</li>
                  <li>429 – Too many requests (respect headers)</li>
                  <li>500+ – Temporary server issue, implement retry</li>
                </ul>
              </div>
            }
          />
          <div className="bg-gradient-to-r from-red-900/40 via-pink-900/30 to-purple-900/30 border border-red-500/30 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Next Steps</h3>
            <p className="text-gray-300 text-sm mb-6 max-w-2xl mx-auto">Explore genre discovery, trending titles, and detailed movie lookup endpoints in the full documentation. Scale usage by upgrading your plan when needed.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/docs" className="inline-block"><Button className="bg-red-500 hover:bg-red-600">View Full Docs</Button></a>
              <a href="https://github.com/screenpick/examples" target="_blank" rel="noopener noreferrer" className="inline-block"><Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white">Code Examples Repo</Button></a>
            </div>
          </div>
        </section>
        <Footer />
        <BreadcrumbStructuredData items={breadcrumbItems} />
      </div>
    </div>
  );
}

function QuickstartStep({ number, title, body, icon }: { number: number; title: string; body: React.ReactNode; icon: React.ReactNode; }) {
  return (
    <div className="relative rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur-sm p-6">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-pink-600 font-bold">
            {number}
          </div>
          <div className="flex-1 w-px bg-gradient-to-b from-red-500/50 to-transparent mt-2" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-300">{icon}</span>
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          </div>
          {body}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ code, language, id, onCopy, copied }: { code: string; language: string; id: string; onCopy: (c: string, id: string) => void; copied: string | null; }) {
  return (
    <div className="relative group">
      <Button size="sm" variant="ghost" onClick={() => onCopy(code, id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10">
        {copied === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className="text-xs md:text-sm bg-gray-900/80 border border-gray-700 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-words">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
