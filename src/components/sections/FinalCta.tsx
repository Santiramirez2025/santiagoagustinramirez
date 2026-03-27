"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { WA_LINKS } from "@/lib/constants";

export function FinalCta() {
  const t = useTranslations("finalCta");

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(124,58,237,0.1),transparent_65%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)" }} />

      <div className="max-w-[640px] mx-auto text-center relative z-10">
        <Reveal>
          <motion.h2
            className="text-[clamp(30px,5.5vw,54px)] font-extrabold text-white leading-[1.06] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t("title1")}
            <br />
            <span className="text-gradient">{t("titleHighlight")}</span>
          </motion.h2>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="text-base text-zinc-500 leading-relaxed mt-6 max-w-[480px] mx-auto">{t("subtitle")}</p>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="flex gap-3 justify-center flex-wrap mt-9">
            <CtaButton href={WA_LINKS.demo}>{t("cta")}</CtaButton>
            <CtaButton href={WA_LINKS.call} variant="secondary">{t("ctaSecondary")}</CtaButton>
          </div>
          <p className="text-[11px] text-zinc-600 mt-4 flex items-center justify-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/>
            </svg>
            {t("trustLine")}
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <p className="text-xs text-zinc-700 mt-6">{t("location")}</p>
        </Reveal>
      </div>
    </section>
  );
}