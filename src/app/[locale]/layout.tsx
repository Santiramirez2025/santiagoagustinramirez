import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/ui/JsonLd";
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

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  const baseUrl = "https://santiagoramirez.dev";

  return {
    title: {
      default: t("title"),
      template: `%s | Santiago Ramírez`,
    },
    description: t("description"),
    keywords: locale === "es"
      ? [
          "desarrollo de apps Villa María",
          "aplicaciones web Córdoba",
          "e-commerce Argentina",
          "marketplace a medida",
          "sistema de gestión",
          "coaching para emprendedores",
          "marketing digital Córdoba",
          "desarrollador freelance Argentina",
        ]
      : [
          "app development Argentina",
          "custom web applications",
          "e-commerce development",
          "marketplace builder",
          "business coaching",
          "digital marketing strategy",
          "freelance developer LATAM",
        ],
    authors: [{ name: "Santiago Ramírez", url: baseUrl }],
    creator: "Santiago Ramírez",
    publisher: "Santiago Ramírez",
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: locale === "es" ? baseUrl : `${baseUrl}/en`,
      locale: locale === "es" ? "es_AR" : "en_US",
      type: "website",
      siteName: "Santiago Ramírez",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: locale === "es" ? baseUrl : `${baseUrl}/en`,
      languages: {
        es: baseUrl,
        en: `${baseUrl}/en`,
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
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://wa.me" />
      </head>
      <body className="font-sans antialiased bg-[#050507] text-zinc-300">
        {/* Skip to main content - accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:text-sm focus:font-bold"
        >
          {locale === "es" ? "Ir al contenido principal" : "Skip to main content"}
        </a>

        <NextIntlClientProvider messages={messages}>
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