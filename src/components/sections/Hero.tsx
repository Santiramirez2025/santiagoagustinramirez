"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { WA_LINKS, RESULTS_STATS } from "@/lib/constants";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden pt-28 pb-20 px-6">
      {/* Background effects */}
      <div className="absolute top-[5%] -left-[15%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.12),transparent_70%)] blur-[100px]" />
      <div className="absolute bottom-[10%] -right-[10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.06),transparent_70%)] blur-[80px]" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-[1100px] mx-auto w-full relative z-10">
        {/* Badge */}
        <Reveal>
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/[0.08] border border-accent/[0.15] text-xs font-semibold text-purple-300 mb-7"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="w-[7px] h-[7px] rounded-full bg-green-500 shadow-[0_0_8px_#22C55E]" />
            {t("badge")}
          </motion.div>
        </Reveal>

        {/* Headline */}
        <Reveal delay={0.06}>
          <h1 className="text-hero font-extrabold text-white max-w-[750px]">
            {t("title1")}
            <br />
            <span className="text-gradient">{t("titleHighlight")}</span>
          </h1>
        </Reveal>

        {/* Subtitle */}
        <Reveal delay={0.12}>
          <p className="text-[clamp(16px,2vw,19px)] text-zinc-400 leading-relaxed max-w-[540px] mt-5">
            {t.rich("subtitle", {
              highlight: () => (
                <strong className="text-white">{t("subtitleHighlight")}</strong>
              ),
            })}
          </p>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={0.18}>
          <div className="flex gap-3 mt-10 flex-wrap">
            <CtaButton href={WA_LINKS.demo}>{t("cta")}</CtaButton>
            <CtaButton href="#proyectos" variant="secondary" external={false}>
              {t("ctaSecondary")}
            </CtaButton>
          </div>
        </Reveal>

        {/* Stats */}
        <Reveal delay={0.24}>
          <div className="flex mt-14 bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden max-w-[440px]">
            {RESULTS_STATS.map((s, i) => (
              <div
                key={s.key}
                className="flex-1 py-5 px-3.5 text-center"
                style={{
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                <motion.div
                  className="text-[28px] font-extrabold text-white tracking-tight"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                >
                  {s.value}
                </motion.div>
                <div className="text-[10px] text-zinc-600 font-medium mt-1 leading-tight">
                  {t(`stats.${s.key}`)}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
