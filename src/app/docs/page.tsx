

import DocsContent from "./docs-content";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "API Documentation - Screenpick Movie Recommendation API",
  description: "Explore the Screenpick API documentation. Learn how to integrate the #1 free AI movie recommendation API into your application.",
  path: "/docs",
  keywords: "movie recommendation API docs, screenpick api documentation, free movie api, film recommendation api, integrate movie api"
});

export default function Docs() {
  return <DocsContent />;
}
