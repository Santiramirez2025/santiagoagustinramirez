"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { motion } from "framer-motion";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggle = () => {
    const next = locale === "es" ? "en" : "es";
    router.replace(pathname, { locale: next });
  };

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-zinc-400 cursor-pointer transition-colors hover:border-accent/20 hover:text-white"
      aria-label="Switch language"
    >
      {locale === "es" ? "EN" : "ES"}
    </motion.button>
  );
}
