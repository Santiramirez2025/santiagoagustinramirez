import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/ui/JsonLd";
import { MetaPixel } from "@/components/ui/MetaPixel";
import type { Metadata } from "next";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: true,
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const BASE_URL = "https://santiagoagustinramirez.com";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: {
      default: t("title"),
      template: `%s | Santiago Ramírez`,
    },
    description: t("description"),
    keywords: locale === "es"
      ? [
          "desarrollo de apps Villa María",
          "aplicaciones web Córdoba Argentina",
          "e-commerce Argentina",
          "marketplace a medida",
          "sistema de gestión para negocios",
          "coaching para emprendedores",
          "marketing digital Córdoba",
          "desarrollador freelance Argentina",
          "app para mi negocio",
          "tienda online Argentina",
        ]
      : [
          "app development Argentina",
          "custom web applications",
          "e-commerce development LATAM",
          "marketplace builder",
          "business coaching Argentina",
          "digital marketing strategy",
          "freelance developer LATAM",
          "custom business system",
        ],
    authors: [{ name: "Santiago Ramírez", url: BASE_URL }],
    creator: "Santiago Ramírez",
    publisher: "Santiago Ramírez",
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: locale === "es" ? BASE_URL : `${BASE_URL}/en`,
      locale: locale === "es" ? "es_AR" : "en_US",
      type: "website",
      siteName: "Santiago Ramírez",
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
    alternates: {
      canonical: locale === "es" ? BASE_URL : `${BASE_URL}/en`,
      languages: {
        es: BASE_URL,
        en: `${BASE_URL}/en`,
      },
    },
    category: "technology",
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={dmSans.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-[#050507] text-zinc-300">
        {/* Accessibility: skip to content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:text-sm focus:font-bold"
        >
          {locale === "es" ? "Ir al contenido" : "Skip to content"}
        </a>

        <NextIntlClientProvider messages={messages}>
          <MetaPixel />
          <JsonLd locale={locale} />
          <div id="main-content">
            {children}
          </div>
        </NextIntlClientProvider>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}