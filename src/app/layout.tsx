import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Screenpick - AI Movie Recommendation Generator | Find Your Perfect Movie",
  description:
    "Discover your next favorite movie with Screenpick's AI-powered recommendation engine. Get personalized movie suggestions based on your preferences, mood, and interests.",
  keywords:
    "AI movie recommendations, movie recommendation generator, AI movie suggestions, find movies to watch, personalized movie recommendations, movie AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://Screenpick.fun",
    siteName: "Screenpick",
    title: "Screenpick - AI Movie Recommendation Generator",
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
    title: "Screenpick - AI Movie Recommendation Generator",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-3YKPKP74MD"
        ></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-3YKPKP74MD');
          `}
        </script>
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
