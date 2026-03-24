"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { WA_LINKS } from "@/lib/constants";

export function FinalCta() {
  const t = useTranslations("finalCta");

  return (
    <section className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(124,58,237,0.08),transparent_70%)]" />

      <div className="max-w-[620px] mx-auto text-center relative z-10">
        <Reveal>
          <h2 className="text-[clamp(28px,5vw,50px)] font-extrabold text-white leading-tight tracking-tight">
            {t("title1")}
            <br />
            <span className="text-purple-400">{t("titleHighlight")}</span>
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="text-base text-muted leading-relaxed mt-5 max-w-[480px] mx-auto">
            {t("subtitle")}
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="flex gap-3 justify-center flex-wrap mt-8">
            <CtaButton href={WA_LINKS.demo}>{t("cta")}</CtaButton>
            <CtaButton href={WA_LINKS.call} variant="secondary">
              {t("ctaSecondary")}
            </CtaButton>
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          <p className="text-xs text-zinc-700 mt-5">{t("location")}</p>
        </Reveal>
      </div>
    </section>
  );
}
