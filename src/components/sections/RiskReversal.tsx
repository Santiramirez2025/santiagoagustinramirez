"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { WA_LINKS } from "@/lib/constants";

const ICONS = ["✅", "💰", "🔧", "📦"];

export function RiskReversal() {
  const t = useTranslations("risk");
  const items = [0, 1, 2, 3].map((i) => t(`items.${i}`));

  return (
    <section className="py-28 px-6 relative">
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(124,58,237,0.05),transparent_70%)] blur-[80px] pointer-events-none" />

      <div className="max-w-[700px] mx-auto relative z-10">
        <Reveal>
          <motion.div
            className="relative p-10 sm:p-12 rounded-[24px] text-center overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.07), rgba(124,58,237,0.02))",
              border: "1px solid rgba(124,58,237,0.15)",
            }}
            whileHover={{ borderColor: "rgba(124,58,237,0.25)" }}
          >
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)" }} />

            {/* Shield with glow */}
            <motion.div
              className="text-5xl mb-5 inline-block"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🛡️
            </motion.div>

            <h2 className="text-[clamp(24px,3.5vw,36px)] font-extrabold text-white tracking-tight">{t("title")}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              {items.map((text, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 text-left px-4 py-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                >
                  <span className="text-lg flex-shrink-0">{ICONS[i]}</span>
                  <span className="text-sm text-zinc-300 font-medium">{text}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-8">
              <CtaButton href={WA_LINKS.call}>{t("cta")}</CtaButton>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}