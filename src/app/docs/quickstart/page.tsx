import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import QuickstartContent from "@/components/docs/quickstart-content";

export const metadata: Metadata = generatePageMetadata({
  title: "Quickstart Guide - Screenpick API",
  description: "Get up and running with the Screenpick Movie Recommendation API in under 5 minutes. Follow these simple steps to obtain an API key and make your first request.",
  path: "/docs/quickstart",
  keywords: "movie api quickstart, screenpick quickstart, movie recommendation api example",
});

export default function QuickstartPage() {
  return <QuickstartContent />;
}
