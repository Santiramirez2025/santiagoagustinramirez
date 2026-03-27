"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { WA_LINKS } from "@/lib/constants";

export function Differentiator() {
  const t = useTranslations("differentiator");

  const features = [0, 1, 2, 3].map((i) => ({
    icon: t(`features.${i}.icon`),
    title: t(`features.${i}.title`),
    desc: t(`features.${i}.desc`),
  }));

  return (
    <section className="py-28 px-6 relative overflow-hidden">
      <div className="absolute top-[20%] -right-[8%] w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.07),transparent_65%)] blur-[100px] pointer-events-none" />

      <div className="max-w-[1100px] mx-auto relative z-10">
        <Reveal>
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-purple-400">{t("label")}</span>
            <h2 className="text-[clamp(28px,4vw,44px)] font-extrabold text-white mt-2.5 tracking-tight leading-[1.1]">{t("title")}</h2>
            <p className="text-[15px] text-zinc-500 mt-3 leading-relaxed">{t("subtitle")}</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-14">
          {features.map((item, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <motion.div
                className="relative p-6 rounded-[18px] h-full group"
                style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.05), rgba(124,58,237,0.01))", border: "1px solid rgba(124,58,237,0.1)" }}
                whileHover={{ borderColor: "rgba(124,58,237,0.25)", y: -3, boxShadow: "0 16px 40px rgba(124,58,237,0.08)" }}
                transition={{ duration: 0.25 }}
              >
                <span className="absolute top-4 right-5 text-[40px] font-black leading-none pointer-events-none select-none text-accent/[0.06]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="text-[28px] mb-3.5">{item.icon}</div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <div className="w-6 h-[2px] rounded-full mt-2.5 mb-2.5 bg-accent/30" />
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.35}>
          <div className="mt-12 px-6 py-4 rounded-2xl flex items-center gap-3 flex-wrap"
            style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.05), rgba(34,197,94,0.02))", border: "1px solid rgba(34,197,94,0.12)" }}>
            <span className="text-xl">💡</span>
            <span className="text-sm text-green-300 font-semibold">{t("proof")}</span>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="mt-8">
            <CtaButton href={WA_LINKS.demo}>{t("cta")}</CtaButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}