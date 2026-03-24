"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WA_LINKS } from "@/lib/constants";

export function PainPoints() {
  const t = useTranslations("pain");

  const items = [0, 1, 2, 3].map((i) => ({
    icon: t(`items.${i}.icon`),
    title: t(`items.${i}.title`),
    desc: t(`items.${i}.desc`),
  }));

  return (
    <section className="py-24 px-6 relative bg-white/[0.01]">
      <div className="max-w-[1100px] mx-auto relative z-10">
        <SectionHeading label={t("label")} title={t("title")} center />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-12">
          {items.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <motion.div
                className="p-6 rounded-card bg-white/[0.02] border border-red-500/[0.08] h-full"
                whileHover={{
                  borderColor: "rgba(239,68,68,0.25)",
                  backgroundColor: "rgba(239,68,68,0.03)",
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-[30px] mb-3.5">{p.icon}</div>
                <h3 className="text-[15px] font-bold text-white leading-snug">
                  {p.title}
                </h3>
                <p className="text-[13px] text-muted leading-relaxed mt-2">
                  {p.desc}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="text-center mt-10">
            <CtaButton href={WA_LINKS.call}>{t("cta")}</CtaButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
