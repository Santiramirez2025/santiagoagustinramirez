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

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
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
      canonical: locale === "es" ? "/" : `/${locale}`,
      languages: {
        es: "/",
        en: "/en",
      },
    },
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
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <JsonLd locale={locale} />
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
