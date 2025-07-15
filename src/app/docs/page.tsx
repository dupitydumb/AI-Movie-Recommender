import { Metadata } from "next";
import DocsContent from "./docs-content";

export const metadata: Metadata = {
  title: "API Documentation - Movie Recommendation API",
  description: "Complete API documentation for Screenpick's movie recommendation service. Learn how to integrate our AI-powered movie suggestions into your application.",
  keywords: "movie API, recommendation API, TMDB API, movie database API, film API documentation, AI movie API",
  openGraph: {
    title: "API Documentation - Screenpick Movie Recommendation API",
    description: "Complete API documentation for integrating AI-powered movie recommendations into your application.",
    url: "https://Screenpick.fun/docs",
    type: "website",
  },
};

export default function Docs() {
  return <DocsContent />;
}
