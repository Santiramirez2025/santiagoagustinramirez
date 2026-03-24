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
    <section id="proceso" className="py-24 px-6 relative bg-white/[0.015]">
      <div className="max-w-[1100px] mx-auto relative z-10">
        <SectionHeading
          label={t("label")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-11">
          {steps.map((p, i) => (
            <Reveal key={p.step} delay={i * 0.08}>
              <motion.div
                className="p-6 rounded-card card-base h-full relative overflow-hidden"
                whileHover={{ y: -4, borderColor: "rgba(124,58,237,0.2)" }}
              >
                <span className="absolute top-3 right-4 text-5xl font-black text-accent/[0.06]">
                  {p.step}
                </span>
                <div className="text-[30px] mb-3">{p.icon}</div>
                <h3 className="text-[17px] font-bold text-white">{p.title}</h3>
                <div className="text-xs font-bold text-purple-400 mt-1.5">
                  {p.time}
                </div>
                <p className="text-[13px] text-muted leading-relaxed mt-2.5">
                  {p.desc}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Timeline bar */}
        <Reveal delay={0.3}>
          <div className="mt-8 px-5 py-4 rounded-[14px] bg-accent/[0.04] border border-accent/[0.1] flex items-center gap-2.5 flex-wrap text-xs text-muted">
            <span className="font-bold text-purple-300">Timeline real:</span>
            {timeline.map((text, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-zinc-700">→</span>}
                <span
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] ${
                    i === 3
                      ? "bg-green-500/[0.1] text-green-300"
                      : "bg-white/[0.05] text-zinc-300"
                  }`}
                >
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
