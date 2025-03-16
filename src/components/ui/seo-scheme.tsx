import Script from "next/script";

export function SeoSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://Screenpick.io/#website",
        url: "https://Screenpick.io/",
        name: "Screenpick - AI Movie Recommendation Generator",
        description:
          "Discover your next favorite movie with our AI-powered recommendation engine.",
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate:
                "https://Screenpick.io/search?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        ],
      },
      {
        "@type": "Organization",
        "@id": "https://Screenpick.io/#organization",
        name: "Screenpick",
        url: "https://Screenpick.io/",
        logo: {
          "@type": "ImageObject",
          inLanguage: "en-US",
          url: "https://Screenpick.io/logo.png",
          width: 512,
          height: 512,
          caption: "Screenpick",
        },
        sameAs: [
          "https://twitter.com/Screenpick",
          "https://www.facebook.com/Screenpick",
          "https://www.linkedin.com/company/Screenpick",
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "Screenpick AI Movie Recommendation Generator",
        operatingSystem: "Web",
        applicationCategory: "EntertainmentApplication",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "1024",
        },
      },
    ],
  };

  return (
    <Script id="schema-org" type="application/ld+json">
      {JSON.stringify(schema)}
    </Script>
  );
}
