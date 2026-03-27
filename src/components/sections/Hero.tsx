"use client";

import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { WA_LINKS, RESULTS_STATS } from "@/lib/constants";

// ─── Animated counter ─────────────────────────────────────────────────────────

function AnimatedStat({ value, label, delay }: { value: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const numericPart = value.replace(/[^0-9]/g, "");
  const suffix = value.replace(/[0-9]/g, "");
  const target = parseInt(numericPart) || 0;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || target === 0) return;
    let frame: number;
    const duration = 1200;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => { clearTimeout(timeout); cancelAnimationFrame(frame); };
  }, [isInView, target, delay]);

  return (
    <div ref={ref} className="flex-1 py-5 px-3 text-center">
      <div className="text-[28px] sm:text-[32px] font-extrabold text-white tracking-tight tabular-nums">
        {target > 0 ? count : value}
        {target > 0 && suffix}
      </div>
      <div className="text-[10px] text-zinc-500 font-medium mt-1.5 leading-tight uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

// ─── Floating trust badges ────────────────────────────────────────────────────

function FloatingBadge({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className: string;
  delay: number;
}) {
  return (
    <motion.div
      className={`absolute hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden pt-28 pb-20 px-6">

      {/* ── Background layers ── */}
      <div className="absolute top-[2%] -left-[18%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.1),transparent_65%)] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[5%] -right-[12%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.06),transparent_65%)] blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(124,58,237,0.04),transparent_70%)] blur-[80px] pointer-events-none" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Vertical accent line */}
      <motion.div
        className="absolute left-[8%] top-[15%] hidden lg:block pointer-events-none"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 180, opacity: 1 }}
        transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 1,
          background: "linear-gradient(180deg, rgba(124,58,237,0.4), transparent)",
        }}
      />

      <div className="max-w-[1100px] mx-auto w-full relative z-10">

        {/* ── Availability badge with urgency ── */}
        <Reveal>
          <motion.div
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold mb-8"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.04))",
              border: "1px solid rgba(124,58,237,0.18)",
              color: "#C4B5FD",
            }}
            animate={{ borderColor: ["rgba(124,58,237,0.18)", "rgba(124,58,237,0.35)", "rgba(124,58,237,0.18)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            {t("badge")}
          </motion.div>
        </Reveal>

        {/* ── Headline ── */}
        <Reveal delay={0.06}>
          <h1 className="text-hero font-extrabold text-white max-w-[780px] leading-[1.02]">
            {t("title1")}
            <br />
            <span className="text-gradient">{t("titleHighlight")}</span>
          </h1>
        </Reveal>

        {/* ── Subtitle ── */}
        <Reveal delay={0.12}>
          <p className="text-[clamp(15px,1.9vw,18px)] text-zinc-400 leading-[1.75] max-w-[520px] mt-6">
            {t.rich("subtitle", {
              highlight: () => (
                <strong className="text-white font-semibold">{t("subtitleHighlight")}</strong>
              ),
            })}
          </p>
        </Reveal>

        {/* ── Trust micro-proof ── */}
        <Reveal delay={0.16}>
          <div className="flex items-center gap-3 mt-5">
            <div className="flex -space-x-2">
              {["M", "C", "R"].map((initial, i) => (
                <div
                  key={initial}
                  className="w-7 h-7 rounded-full border-2 border-[#050507] flex items-center justify-center text-[10px] font-bold text-white"
                  style={{
                    background: ["#7C3AED", "#F59E0B", "#10B981"][i],
                    zIndex: 3 - i,
                  }}
                >
                  {initial}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-amber-500 text-[11px]">★</span>
                ))}
              </div>
              <span className="text-[11px] text-zinc-500 font-medium ml-1">
                {t("trustLine")}
              </span>
            </div>
          </div>
        </Reveal>

        {/* ── CTAs ── */}
        <Reveal delay={0.2}>
          <div className="flex gap-3 mt-9 flex-wrap">
            <CtaButton href={WA_LINKS.demo}>
              {t("cta")}
            </CtaButton>
            <CtaButton href="#proyectos" variant="secondary" external={false}>
              {t("ctaSecondary")}
            </CtaButton>
          </div>
          <p className="text-[11px] text-zinc-600 mt-3.5 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" />
            </svg>
            {t("ctaSubtext")}
          </p>
        </Reveal>

        {/* ── Stats bar ── */}
        <Reveal delay={0.28}>
          <div
            className="flex mt-12 rounded-2xl overflow-hidden max-w-[480px]"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01))",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {RESULTS_STATS.map((s, i) => (
              <div
                key={s.key}
                style={{
                  borderRight: i < RESULTS_STATS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  flex: 1,
                }}
              >
                <AnimatedStat
                  value={s.value}
                  label={t(`stats.${s.key}`)}
                  delay={0.4 + i * 0.15}
                />
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── Floating badges (desktop only) ── */}
        <FloatingBadge className="top-[12%] right-[2%]" delay={1.2}>
          <span className="text-lg">⚡</span>
          <div>
            <div className="text-[11px] font-bold text-white">{t("floatingSpeed")}</div>
            <div className="text-[9px] text-zinc-500">{t("floatingSpeedSub")}</div>
          </div>
        </FloatingBadge>

        <FloatingBadge className="top-[55%] right-[5%]" delay={1.5}>
          <span className="text-lg">🛡️</span>
          <div>
            <div className="text-[11px] font-bold text-white">{t("floatingRisk")}</div>
            <div className="text-[9px] text-zinc-500">{t("floatingRiskSub")}</div>
          </div>
        </FloatingBadge>

      </div>
    </section>
  );
}