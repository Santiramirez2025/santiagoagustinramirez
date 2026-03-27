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
    <section className="py-28 px-6 relative">
      <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.06),transparent_70%)] blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.04),transparent_70%)] blur-[60px] pointer-events-none" />

      <div className="max-w-[1100px] mx-auto relative z-10">
        <SectionHeading label={t("label")} title={t("title")} subtitle={t("subtitle")} center />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <motion.div
                className="p-6 rounded-[18px] h-full"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                whileHover={{ borderColor: "rgba(124,58,237,0.2)", y: -3 }}
                transition={{ duration: 0.25 }}
              >
                {/* Icon in container */}
                <div className="w-12 h-12 rounded-xl bg-accent/[0.08] border border-accent/[0.12] flex items-center justify-center text-[24px] mb-4">
                  {f.icon}
                </div>
                <h3 className="text-[15px] font-bold text-white">{f.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed mt-2">{f.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.35}>
          <div className="text-center mt-10">
            <CtaButton href={WA_LINKS.default}>{t("cta")}</CtaButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}