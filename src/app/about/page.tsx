import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import AboutContent from "./about-content";

export const metadata: Metadata = generatePageMetadata({
  title: "About Us - AI Movie Recommendation Engine",
  description: "Learn about Screenpick, the AI-powered movie recommendation platform that helps you discover your next favorite film. Built by movie enthusiasts for movie lovers.",
  path: "/about",
  keywords: "about screenpick, AI movie recommendations, movie discovery platform, personalized film suggestions, movie recommendation technology",
});

export default function About() {
  return <AboutContent />;
}
