"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Testimonials() {
  const t = useTranslations("testimonials");

  const items = [0, 1, 2].map((i) => ({
    name: t(`items.${i}.name`),
    role: t(`items.${i}.role`),
    text: t(`items.${i}.text`),
  }));

  return (
    <section className="py-28 px-6 relative bg-white/[0.015]">
      <div className="max-w-[1100px] mx-auto relative z-10">
        <SectionHeading label={t("label")} title={t("title")} center />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          {items.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.08}>
              <motion.div
                className="relative p-7 rounded-[18px] h-full"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                whileHover={{ borderColor: "rgba(124,58,237,0.15)", y: -3 }}
                transition={{ duration: 0.25 }}
              >
                {/* Large quote mark */}
                <span className="absolute top-5 right-6 text-[48px] font-serif leading-none text-accent/[0.06] pointer-events-none select-none">&ldquo;</span>

                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-[14px] text-amber-500">★</span>
                  ))}
                </div>

                <p className="text-[14px] text-zinc-400 leading-[1.75] italic pr-6">
                  &ldquo;{item.text}&rdquo;
                </p>

                <div className="mt-6 pt-5 border-t border-white/[0.04] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-[13px] font-extrabold flex-shrink-0">
                    {item.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-white flex items-center gap-1.5">
                      {item.name}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-blue-400 flex-shrink-0">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="text-[11px] text-zinc-600">{item.role}</div>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}