import Script from "next/script";

export function SeoSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://Screenpick.fun/#website",
        url: "https://Screenpick.fun/",
        name: "Screenpick: AI Movie Finder",
        description:
          "Discover movies you'll love with Screenpick, the AI-powered movie recommendation engine. Get personalized suggestions and find your next favorite film today!",
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate:
                "https://Screenpick.fun/search?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        ],
        publisher: {
          "@id": "https://Screenpick.fun/#organization"
        }
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
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: "English"
        }
      },
      {
        "@type": "WebApplication",
        name: "Screenpick AI Movie Recommendation Generator",
        description: "AI-powered movie recommendation engine that provides personalized movie suggestions based on user preferences and mood.",
        url: "https://Screenpick.fun/",
        operatingSystem: "Web",
        applicationCategory: "EntertainmentApplication",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock"
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "1024",
          bestRating: "5",
          worstRating: "1"
        },
        featureList: [
          "AI-powered movie recommendations",
          "Personalized suggestions",
          "Search by mood and preferences",
          "TMDB integration",
          "Real-time results"
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How does the AI movie recommendation work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Our AI analyzes your preferences, mood, and viewing history to suggest movies tailored specifically to your taste using advanced machine learning algorithms."
            }
          },
          {
            "@type": "Question", 
            name: "Is the movie recommendation service free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Screenpick offers free AI-powered movie recommendations. You can get personalized movie suggestions without any cost."
            }
          },
          {
            "@type": "Question",
            name: "How accurate are the movie recommendations?", 
            acceptedAnswer: {
              "@type": "Answer",
              text: "Our AI recommendation engine has a high accuracy rate, with users rating our suggestions 4.8/5 stars on average. The more you use it, the better it understands your preferences."
            }
          }
        ]
      }
    ],
  };

  return (
    <Script id="schema-org" type="application/ld+json">
      {JSON.stringify(schema)}
    </Script>
  );
}
