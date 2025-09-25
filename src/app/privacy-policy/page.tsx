import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import dynamic from 'next/dynamic';

export const metadata: Metadata = generatePageMetadata({
  title: "Privacy Policy - Screenpick",
  description: "Read the Screenpick Privacy Policy. Learn how we handle information, protect user data, and what data we collect.",
  path: "/privacy-policy",
  keywords: "privacy policy, screenpick privacy, data usage, user privacy, data collection"
});

// Dynamically load client component (no ssr option inside server component)
const PrivacyPolicyClient = dynamic(() => import('./client'));

export default function PrivacyPolicy() {
  return <PrivacyPolicyClient />;
}
