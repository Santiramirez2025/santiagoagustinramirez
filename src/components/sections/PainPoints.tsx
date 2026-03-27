"use client";

import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { WA_LINKS } from "@/lib/constants";

// ─── Animated cost counter ────────────────────────────────────────────────────

function CostCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [count, setCount] = useState(0);
  const target = 47500; // pesos perdidos por mes (ejemplo persuasivo)

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    const duration = 2000;
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
    }, 600);

    return () => { clearTimeout(timeout); cancelAnimationFrame(frame); };
  }, [isInView]);

  const t = useTranslations("pain");

  return (
    <motion.div
      ref={ref}
      className="mt-12 mx-auto max-w-lg rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(239,68,68,0.02))",
        border: "1px solid rgba(239,68,68,0.12)",
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {/* Red top bar */}
      <div
        style={{
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)",
        }}
      />
      <div className="px-6 py-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="flex-shrink-0">
          <motion.div
            className="text-3xl sm:text-4xl font-extrabold text-red-400 tabular-nums"
            animate={isInView ? { opacity: [0.6, 1, 0.6] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            ${count.toLocaleString("es-AR")}
          </motion.div>
          <div className="text-[10px] text-red-400/60 font-semibold uppercase tracking-wider mt-0.5">
            {t("costLabel")}
          </div>
        </div>
        <div className="w-px h-8 bg-red-500/10 hidden sm:block" />
        <p className="text-[13px] text-zinc-400 leading-relaxed">
          {t("costDesc")}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Pain card ────────────────────────────────────────────────────────────────

function PainCard({
  icon,
  title,
  desc,
  index,
}: {
  icon: string;
  title: string;
  desc: string;
  index: number;
}) {
  return (
    <Reveal delay={index * 0.07}>
      <motion.div
        className="relative p-6 rounded-[18px] h-full group cursor-default"
        style={{
          background: "rgba(255,255,255,0.015)",
          border: "1px solid rgba(239,68,68,0.06)",
        }}
        whileHover={{
          borderColor: "rgba(239,68,68,0.2)",
          backgroundColor: "rgba(239,68,68,0.025)",
          y: -3,
        }}
        transition={{ duration: 0.25 }}
      >
        {/* Number watermark */}
        <span
          className="absolute top-4 right-5 text-[42px] font-black leading-none pointer-events-none select-none"
          style={{ color: "rgba(239,68,68,0.04)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Icon with red glow on hover */}
        <div className="relative w-fit mb-4">
          <span className="text-[28px] relative z-10">{icon}</span>
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "rgba(239,68,68,0.15)", transform: "scale(2.5)" }}
          />
        </div>

        <h3 className="text-[15px] font-bold text-white leading-snug pr-8">
          {title}
        </h3>

        {/* Red accent line */}
        <motion.div
          className="w-8 h-[2px] rounded-full mt-3 mb-3"
          style={{ background: "rgba(239,68,68,0.3)" }}
          whileHover={{ width: 48, background: "rgba(239,68,68,0.5)" }}
          transition={{ duration: 0.3 }}
        />

        <p className="text-[13px] text-zinc-500 leading-relaxed">
          {desc}
        </p>
      </motion.div>
    </Reveal>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function PainPoints() {
  const t = useTranslations("pain");

  const items = [0, 1, 2, 3].map((i) => ({
    icon: t(`items.${i}.icon`),
    title: t(`items.${i}.title`),
    desc: t(`items.${i}.desc`),
  }));

  return (
    <section className="py-28 px-6 relative overflow-hidden">
      {/* Subtle red ambient glow */}
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[radial-gradient(ellipse,rgba(239,68,68,0.03),transparent_70%)] blur-[80px] pointer-events-none" />

      <div className="max-w-[1100px] mx-auto relative z-10">
        {/* Header */}
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-400/80">
              {t("label")}
            </span>
            <h2 className="text-[clamp(28px,4vw,44px)] font-extrabold text-white mt-2.5 tracking-tight leading-[1.1]">
              {t("title")}
            </h2>
            <p className="text-[15px] text-zinc-500 mt-3 leading-relaxed max-w-md mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </Reveal>

        {/* Pain cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-14">
          {items.map((p, i) => (
            <PainCard key={i} icon={p.icon} title={p.title} desc={p.desc} index={i} />
          ))}
        </div>

        {/* Cost counter */}
        <CostCounter />

        {/* Bridge to solution */}
        <Reveal delay={0.35}>
          <div className="text-center mt-10">
            <p className="text-sm text-zinc-500 mb-5">
              {t("bridge")}
            </p>
            <CtaButton href={WA_LINKS.call}>{t("cta")}</CtaButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}