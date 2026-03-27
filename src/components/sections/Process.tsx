"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Process() {
  const t = useTranslations("process");

  const steps = [0, 1, 2, 3].map((i) => ({
    step: t(`steps.${i}.step`),
    icon: t(`steps.${i}.icon`),
    title: t(`steps.${i}.title`),
    time: t(`steps.${i}.time`),
    desc: t(`steps.${i}.desc`),
  }));

  const timeline = [0, 1, 2, 3].map((i) => t(`timeline.${i}`));

  return (
    <section id="proceso" className="py-28 px-6 relative bg-white/[0.015]">
      <div className="max-w-[1100px] mx-auto relative z-10">
        <SectionHeading label={t("label")} title={t("title")} subtitle={t("subtitle")} center />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14 relative">
          {/* Connector line (desktop) */}
          <div className="absolute top-[52px] left-[12.5%] right-[12.5%] h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent hidden lg:block pointer-events-none" />

          {steps.map((p, i) => (
            <Reveal key={p.step} delay={i * 0.1}>
              <motion.div
                className="relative p-6 rounded-[18px] h-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                whileHover={{ y: -4, borderColor: "rgba(124,58,237,0.2)", boxShadow: "0 16px 40px rgba(0,0,0,0.2)" }}
                transition={{ duration: 0.25 }}
              >
                {/* Step number watermark */}
                <span className="absolute top-3 right-4 text-[50px] font-black text-accent/[0.05] leading-none pointer-events-none select-none">{p.step}</span>

                {/* Step circle indicator */}
                <div className="relative z-10 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/[0.08] border border-accent/[0.15] flex items-center justify-center text-[24px]">
                    {p.icon}
                  </div>
                  {i < 3 && (
                    <div className="absolute top-1/2 -right-8 w-6 h-[1px] bg-accent/10 hidden lg:block" />
                  )}
                </div>

                <h3 className="text-[17px] font-bold text-white">{p.title}</h3>
                <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-accent/[0.06] text-[11px] font-bold text-purple-400">
                  {p.time}
                </div>
                <p className="text-[13px] text-zinc-500 leading-relaxed mt-3">{p.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Timeline progress bar */}
        <Reveal delay={0.4}>
          <div className="mt-10 px-5 py-4 rounded-2xl bg-accent/[0.03] border border-accent/[0.08] flex items-center gap-2 flex-wrap text-xs text-muted">
            <span className="font-bold text-purple-300 mr-1">Timeline:</span>
            {timeline.map((text, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <motion.svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1 }}>
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="rgba(124,58,237,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </motion.svg>
                )}
                <span className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] ${
                  i === 3 ? "bg-green-500/[0.1] text-green-300 border border-green-500/[0.1]" : "bg-white/[0.05] text-zinc-300"
                }`}>
                  {text}
                </span>
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}