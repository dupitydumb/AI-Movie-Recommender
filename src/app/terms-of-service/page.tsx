import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import dynamic from 'next/dynamic';

export const metadata: Metadata = generatePageMetadata({
  title: "Terms of Service - Screenpick",
  description: "Read the Screenpick Terms of Service. Understand your rights, responsibilities, and usage limitations when using our AI movie recommendation platform.",
  path: "/terms-of-service",
  keywords: "terms of service, screenpick terms, user agreement, legal terms"
});

const TermsClient = dynamic(() => import('./client'));

export default function TermsOfService() {
  return <TermsClient />;
}
