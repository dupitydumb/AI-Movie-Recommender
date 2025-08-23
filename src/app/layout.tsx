import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SeoSchema } from "@/components/ui/seo-scheme";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { generatePageMetadata } from "@/lib/metadata";
import { Provider } from "@/components/ui/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://Screenpick.fun'),
  title: {
    default: "Movie Recommender: Find the Best Movie Recommendations",
    template: "%s | Screenpick - AI Movie Recommender"
  },
  description:
    "Looking for a movie recommender? Our AI-powered movie recommendation engine provides personalized suggestions to help you discover movies you'll love.",
  keywords:
    "AI movie recommendations, movie recommendation engine, find movies, movie suggestions, personalized movie recommendations, discover movies, movie discovery, movie suggestions AI, find your next movie, movie recommendation system, personalized movie suggestions, AI-powered movie recommendations, best movies to watch, movie finder, film recommendations",
  authors: [{ name: "Screenpick Team" }],
  creator: "Screenpick",
  publisher: "Screenpick",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://Screenpick.fun",
    siteName: "Screenpick",
    title: "AI Movie Recommendation Generator",
    description:
      "Discover your next favorite movie with our AI-powered recommendation engine. Get personalized suggestions based on your mood and preferences.",
    images: [
      {
        url: "https://opengraph.b-cdn.net/production/images/2161793f-193f-4d1d-81af-c32901853530.jpg?token=LzPD2V4bNX5B8NQ59qUlIwyPh5Ptq0irwzYZzlz_f0A&height=630&width=1200&expires=33278216178",
        width: 1200,
        height: 630,
        alt: "Screenpick - AI Movie Recommendation Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Movie Recommendation Generator",
    description:
      "Discover your next favorite movie with our AI-powered recommendation engine.",
    images: [
      "https://opengraph.b-cdn.net/production/images/2161793f-193f-4d1d-81af-c32901853530.jpg?token=LzPD2V4bNX5B8NQ59qUlIwyPh5Ptq0irwzYZzlz_f0A&height=630&width=1200&expires=33278216178",
    ],
    creator: "@Screenpick",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://Screenpick.fun",
  },
  verification: {
    google: "aeZs0gNhABslw_UXbjBW8SSu8PALbQhO8cx9oaD92yE",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-7256147079060358" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <Provider>
          {children}
        </Provider>
        <SeoSchema />
      </body>
    </html>
  );
}
