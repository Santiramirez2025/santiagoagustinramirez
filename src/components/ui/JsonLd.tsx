export function JsonLd({ locale }: { locale: string }) {
  const isEs = locale === "es";

  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Santiago Ramírez - Desarrollo de Apps",
    description: isEs
      ? "Desarrollo de apps, marketplaces, e-commerce y sistemas a medida. Demo funcional en 48hs."
      : "Custom app development, marketplaces, e-commerce and systems. Working demo in 48hrs.",
    url: "https://santiagoramirez.dev",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Villa María",
      addressRegion: "Córdoba",
      addressCountry: "AR",
    },
    priceRange: "$$",
    areaServed: [
      { "@type": "Country", name: "Argentina" },
      { "@type": "Country", name: "Spain" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: isEs ? "Servicios de desarrollo" : "Development services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "PWA Mobile App",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Marketplace",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "E-commerce",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: isEs ? "Sistema a medida" : "Custom System",
          },
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
