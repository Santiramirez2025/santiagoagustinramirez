"use client";

import { useTranslations } from "next-intl";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { WA_LINKS } from "@/lib/constants";
import { CtaButton } from "@/components/ui/CtaButton";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function Navbar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 50));

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-[100] glass transition-all duration-300"
      style={{
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-[13px] font-extrabold text-white shadow-[0_2px_12px_rgba(124,58,237,0.3)]">
            SR
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">
            Santiago Ramírez
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#proceso"
            className="hidden md:inline text-[13px] text-muted no-underline font-medium hover:text-white transition-colors"
          >
            {t("process")}
          </a>
          <a
            href="#proyectos"
            className="hidden md:inline text-[13px] text-muted no-underline font-medium hover:text-white transition-colors"
          >
            {t("projects")}
          </a>
          <a
            href="#coaching"
            className="hidden md:inline text-[13px] text-muted no-underline font-medium hover:text-amber-400 transition-colors"
          >
            {t("coaching")}
          </a>
          <LanguageSwitcher />
          <div className="hidden sm:block">
            <CtaButton href={WA_LINKS.call} className="!py-2.5 !px-5 !text-[13px]">
              {t("cta")}
            </CtaButton>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
