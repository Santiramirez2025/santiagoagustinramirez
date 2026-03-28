export function JsonLd({ locale }: { locale: string }) {
  const isEs = locale === "es";
  const url = "https://santiagoagustinramirez.com";

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Santiago Agustín Ramírez",
    url,
    jobTitle: isEs
      ? "Desarrollador de Apps, Coach Profesional y Lic. en Marketing"
      : "App Developer, Professional Coach & Marketing BA",
    description: isEs
      ? "Desarrollo de apps, coaching y estrategia digital para negocios. Villa María, Córdoba."
      : "App development, coaching and digital strategy for businesses. Villa María, Argentina.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Villa María",
      addressRegion: "Córdoba",
      addressCountry: "AR",
    },
    knowsAbout: [
      "Web Development",
      "Mobile App Development",
      "E-commerce",
      "Digital Marketing",
      "Business Coaching",
      "Next.js",
      "React",
      "TypeScript",
      "PostgreSQL",
    ],
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Santiago Ramírez · Desarrollo de Apps y Coaching",
    url,
    telephone: "+5493536561265",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Villa María",
      addressRegion: "Córdoba",
      addressCountry: "AR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -32.4074,
      longitude: -63.2429,
    },
    priceRange: "$$",
    areaServed: [
      { "@type": "Country", name: "Argentina" },
      { "@type": "Country", name: "Spain" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: isEs ? "Servicios" : "Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: isEs ? "App móvil PWA" : "PWA Mobile App",
            description: isEs
              ? "Aplicación móvil instalable desde el navegador"
              : "Mobile app installable from browser",
          },
          priceSpecification: {
            "@type": "PriceSpecification",
            price: "1800",
            priceCurrency: "USD",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Marketplace",
          },
          priceSpecification: {
            "@type": "PriceSpecification",
            price: "4500",
            priceCurrency: "USD",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "E-commerce",
          },
          priceSpecification: {
            "@type": "PriceSpecification",
            price: "2800",
            priceCurrency: "USD",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Landing page",
          },
          priceSpecification: {
            "@type": "PriceSpecification",
            price: "900",
            priceCurrency: "USD",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: isEs ? "Sistema a medida" : "Custom System",
          },
          priceSpecification: {
            "@type": "PriceSpecification",
            price: "3500",
            priceCurrency: "USD",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: isEs ? "Coaching y Mentoría" : "Coaching & Mentoring",
          },
          priceSpecification: {
            "@type": "PriceSpecification",
            price: "75",
            priceCurrency: "USD",
          },
        },
      ],
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: isEs
      ? [
          {
            "@type": "Question",
            name: "¿Cuánto tarda en estar lista mi app?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "El proceso completo toma 15 días. En 48 horas recibís una demo funcional personalizada para probar en tu celular.",
            },
          },
          {
            "@type": "Question",
            name: "¿Tengo que pagar antes de ver algo funcionando?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Primero te mando una demo gratis con tu marca y tu lógica. Si te convence, arrancamos. Si no, no pagás nada.",
            },
          },
          {
            "@type": "Question",
            name: "¿Qué incluye el soporte?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "30 días de soporte post-entrega incluido. Ajustes menores, dudas y acompañamiento para que arranques bien.",
            },
          },
        ]
      : [
          {
            "@type": "Question",
            name: "How long does it take to build my app?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The full process takes 15 days. Within 48 hours you receive a personalized working demo to try on your phone.",
            },
          },
          {
            "@type": "Question",
            name: "Do I have to pay before seeing anything working?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. First I send you a free demo with your brand and your logic. If you like it, we start. If not, you don't pay.",
            },
          },
          {
            "@type": "Question",
            name: "What does support include?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "30 days of post-delivery support included. Minor adjustments, questions and guidance to get you started.",
            },
          },
        ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}