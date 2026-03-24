"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="py-6 border-t border-white/[0.04] text-center">
      <p className="text-[11px] text-zinc-800">{t("copy")}</p>
    </footer>
  );
}
