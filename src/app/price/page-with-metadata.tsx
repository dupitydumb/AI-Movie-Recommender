import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Pricing Plans - AI Movie Recommendation API",
  description: "Choose the perfect plan for your movie recommendation needs. From free personal use to enterprise solutions with our AI-powered movie suggestion API.",
  path: "/price",
  keywords: "pricing, movie API pricing, recommendation API plans, free movie API, enterprise movie recommendations",
});

export default function Price() {
  
}
