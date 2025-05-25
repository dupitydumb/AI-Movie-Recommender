import Script from "next/script";

export function SeoSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://Screenpick.fun/#website",
        url: "https://Screenpick.fun/",
        name: "Screenpick - AI Movie Recommendations and Personalized Movie Suggestions",
        description:
          "Discover your next favorite movie with our AI-powered movie recommendation engine. Get personalized movie suggestions and find movies you'll love.",
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
        "@id": "https://Screenpick.fun/#organization",
        name: "Screenpick",
        url: "https://Screenpick.fun/",
        logo: {
          "@type": "ImageObject",
          inLanguage: "en-US",
          url: "https://Screenpick.fun/logo.png",
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
