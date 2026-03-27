"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WA_LINKS } from "@/lib/constants";

export function Services() {
  const t = useTranslations("services");

  const items = [0, 1, 2, 3, 4].map((i) => ({
    icon: t(`items.${i}.icon`),
    name: t(`items.${i}.name`),
    desc: t(`items.${i}.desc`),
    result: t(`items.${i}.result`),
    from: t(`items.${i}.from`),
  }));

  // Index 2 = E-commerce (most popular)
  const popularIndex = 2;

  return (
    <section className="py-28 px-6 relative bg-white/[0.015]">
      <div className="max-w-[1100px] mx-auto relative z-10">
        <SectionHeading label={t("label")} title={t("title")} subtitle={t("subtitle")} center />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-12">
          {items.map((s, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <motion.div
                className="relative p-6 rounded-[18px] h-full flex flex-col"
                style={{
                  background: i === popularIndex
                    ? "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(124,58,237,0.02))"
                    : "rgba(255,255,255,0.02)",
                  border: i === popularIndex
                    ? "1px solid rgba(124,58,237,0.2)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
                whileHover={{ borderColor: "rgba(124,58,237,0.25)", y: -3 }}
                transition={{ duration: 0.25 }}
              >
                {/* Popular badge */}
                {i === popularIndex && (
                  <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-white bg-gradient-to-r from-accent to-accent-dark">
                    POPULAR
                  </div>
                )}

                <div className="w-11 h-11 rounded-xl bg-accent/[0.08] border border-accent/[0.12] flex items-center justify-center text-[22px] mb-3.5">
                  {s.icon}
                </div>
                <h3 className="text-[15px] font-bold text-white">{s.name}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed mt-1.5 flex-1">{s.desc}</p>

                {/* Result tag */}
                <div className="mt-4 px-2.5 py-1.5 rounded-lg bg-green-500/[0.06] border border-green-500/[0.08] text-[11px] font-semibold text-green-300 w-fit">
                  → {s.result}
                </div>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[10px] text-zinc-600">Desde</span>
                  <span className="text-lg font-extrabold text-white">USD ${s.from}</span>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="text-[13px] text-zinc-600 mt-8 text-center">
            {t("help")}{" "}
            <a href={WA_LINKS.call} target="_blank" rel="noopener noreferrer"
              className="text-purple-400 underline font-semibold hover:text-purple-300 transition-colors">
              {t("helpLink")}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}