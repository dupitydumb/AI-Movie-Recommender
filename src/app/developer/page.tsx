import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import dynamic from 'next/dynamic';

const DeveloperClientPage = dynamic(() => import('./page-client-impl'));

export const metadata: Metadata = generatePageMetadata({
  title: "Developer Portal - Free Movie Recommendation API",
  description: "Generate test JWT tokens and access the #1 free AI-powered movie recommendation API. 100+ free requests and developer tools.",
  path: "/developer",
  keywords: "developer portal, movie recommendation api, free movie api, jwt token generator, screenpick api"
});

export default function DeveloperPage() {
  return <DeveloperClientPage />;
}
