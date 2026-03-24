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

  return (
    <section className="py-24 px-6 relative bg-white/[0.015]">
      <div className="max-w-[1100px] mx-auto relative z-10">
        <SectionHeading
          label={t("label")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 mt-11">
          {items.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.06}>
              <motion.div
                className="p-6 rounded-card card-base h-full flex flex-col"
                whileHover={{ borderColor: "rgba(124,58,237,0.2)" }}
              >
                <div className="text-[30px] mb-3">{s.icon}</div>
                <h3 className="text-[15px] font-bold text-white">{s.name}</h3>
                <p className="text-xs text-muted leading-relaxed mt-1.5 flex-1">
                  {s.desc}
                </p>
                <div className="mt-3.5 px-2.5 py-1.5 rounded-lg bg-green-500/[0.06] text-[11px] font-semibold text-green-300 w-fit">
                  → {s.result}
                </div>
                <div className="mt-2.5 text-sm font-extrabold text-purple-400">
                  Desde USD ${s.from}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="text-[13px] text-zinc-600 mt-6 text-center">
            {t("help")}{" "}
            <a
              href={WA_LINKS.call}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 underline font-semibold hover:text-purple-300 transition-colors"
            >
              {t("helpLink")}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
