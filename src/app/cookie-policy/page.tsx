import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import dynamic from 'next/dynamic';

export const metadata: Metadata = generatePageMetadata({
  title: "Cookie Policy - Screenpick",
  description: "Read the Screenpick Cookie Policy. Learn how we use minimal cookies (Google Analytics only) and do not store personal data or search queries.",
  path: "/cookie-policy",
  keywords: "cookie policy, screenpick cookies, analytics cookies, privacy, tracking policy"
});

const CookiePolicyClient = dynamic(() => import('./client'));

export default function CookiePolicy() {
  return <CookiePolicyClient />;
}
