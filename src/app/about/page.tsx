import { Metadata } from "next";
import AboutContent from "./about-content";

export const metadata: Metadata = {
  title: "About Us - AI Movie Recommendation Engine",
  description: "Learn about Screenpick, the AI-powered movie recommendation platform that helps you discover your next favorite film. Built by movie enthusiasts for movie lovers.",
  keywords: "about screenpick, AI movie recommendations, movie discovery platform, personalized film suggestions, movie recommendation technology",
  openGraph: {
    title: "About Screenpick - AI Movie Recommendation Engine",
    description: "Learn about our AI-powered movie recommendation platform that helps you discover your next favorite film.",
    url: "https://Screenpick.fun/about",
    type: "website",
  },
};

export default function About() {
  return <AboutContent />;
}
