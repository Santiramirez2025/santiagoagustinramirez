import type { MetadataRoute } from "next";

const BASE_URL = "https://santiagoagustinramirez.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          es: BASE_URL,
          en: `${BASE_URL}/en`,
        },
      },
    },
  ];
}