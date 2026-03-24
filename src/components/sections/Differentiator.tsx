"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WA_LINKS } from "@/lib/constants";

export function Differentiator() {
  const t = useTranslations("differentiator");

  const features = [0, 1, 2, 3].map((i) => ({
    icon: t(`features.${i}.icon`),
    title: t(`features.${i}.title`),
    desc: t(`features.${i}.desc`),
  }));

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute top-[30%] -right-[5%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.06),transparent_70%)] blur-[80px]" />

      <div className="max-w-[1100px] mx-auto relative z-10">
        <SectionHeading
          label={t("label")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-12">
          {features.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="p-6 rounded-card bg-gradient-to-br from-accent/[0.04] to-accent/[0.01] border border-accent/[0.1] h-full">
                <div className="text-[28px] mb-3">{item.icon}</div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-xs text-muted leading-relaxed mt-1.5">
                  {item.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="mt-10 px-6 py-4 rounded-[14px] bg-green-500/[0.04] border border-green-500/[0.12] flex items-center gap-3 flex-wrap">
            <span className="text-xl">💡</span>
            <span className="text-sm text-green-300 font-semibold">
              {t("proof")}
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.35}>
          <div className="mt-7">
            <CtaButton href={WA_LINKS.demo}>{t("cta")}</CtaButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
