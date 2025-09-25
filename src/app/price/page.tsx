import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import dynamic from 'next/dynamic';

export const metadata: Metadata = generatePageMetadata({
  title: "Pricing - Screenpick AI Movie Recommender",
  description: "View Screenpick pricing plans. Compare free, Pro, and Enterprise options for AI-powered movie recommendations and API access.",
  path: "/price",
  keywords: "screenpick pricing, movie recommendation pricing, api pricing, subscription plans"
});

const PriceClient = dynamic(() => import('./client'));

export default function PricePage() {
  return <PriceClient />;
}
