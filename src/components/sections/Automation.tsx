"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WA_LINKS } from "@/lib/constants";

export function Automation() {
  const t = useTranslations("automation");

  const features = [0, 1, 2, 3].map((i) => ({
    icon: t(`features.${i}.icon`),
    title: t(`features.${i}.title`),
    desc: t(`features.${i}.desc`),
  }));

  return (
    <section className="py-24 px-6 relative">
      <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.06),transparent_70%)] blur-[80px]" />

      <div className="max-w-[1100px] mx-auto relative z-10">
        <SectionHeading
          label={t("label")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-12">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <motion.div
                className="p-6 rounded-card card-base h-full"
                whileHover={{ borderColor: "rgba(124,58,237,0.2)" }}
              >
                <div className="text-[30px] mb-3">{f.icon}</div>
                <h3 className="text-[15px] font-bold text-white">{f.title}</h3>
                <p className="text-[13px] text-muted leading-relaxed mt-2">
                  {f.desc}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="text-center mt-10">
            <CtaButton href={WA_LINKS.default}>{t("cta")}</CtaButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
