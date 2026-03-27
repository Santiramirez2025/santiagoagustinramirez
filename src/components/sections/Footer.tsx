"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="relative py-8 px-6 text-center">
      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)" }} />
      <p className="text-[11px] text-zinc-700">{t("copy")}</p>
    </footer>
  );
}