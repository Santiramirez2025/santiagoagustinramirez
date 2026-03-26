"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { WA_LINKS } from "@/lib/constants";

const CREDENTIALS = [
  { icon: "🎓", key: "coach" },
  { icon: "📊", key: "marketing" },
  { icon: "💻", key: "dev" },
];

const PLAN_COLORS = {
  starter: { border: "rgba(161,161,170,0.15)", accent: "#A1A1AA", bg: "rgba(255,255,255,0.02)" },
  pro: { border: "rgba(124,58,237,0.3)", accent: "#A78BFA", bg: "rgba(124,58,237,0.04)" },
  vip: { border: "rgba(245,158,11,0.25)", accent: "#F59E0B", bg: "rgba(245,158,11,0.03)" },
};

export function Coaching() {
  const t = useTranslations("coaching");

  const plans = (["starter", "pro", "vip"] as const).map((key) => ({
    key,
    name: t(`plans.${key}.name`),
    price: t(`plans.${key}.price`),
    period: t(`plans.${key}.period`),
    desc: t(`plans.${key}.desc`),
    features: [0, 1, 2, 3, 4].map((i) => {
      try { return t(`plans.${key}.features.${i}`); } catch { return null; }
    }).filter(Boolean) as string[],
    popular: key === "pro",
    cta: t(`plans.${key}.cta`),
  }));

  return (
    <section id="coaching" className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[10%] right-[-8%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.05),transparent_70%)] blur-[80px]" />
      <div className="absolute bottom-[10%] left-[-8%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.05),transparent_70%)] blur-[80px]" />

      <div className="max-w-[1100px] mx-auto relative z-10">
        {/* Header */}
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">
              {t("label")}
            </span>
            <h2 className="text-heading font-extrabold text-white mt-2.5">
              {t("title")}
            </h2>
            <p className="text-[15px] text-muted mt-3 leading-relaxed max-w-xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </Reveal>

        {/* Credentials */}
        <Reveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {CREDENTIALS.map((c) => (
              <div
                key={c.key}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              >
                <span className="text-lg">{c.icon}</span>
                <span className="text-[13px] font-semibold text-zinc-300">
                  {t(`credentials.${c.key}`)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-center items-center gap-3 mt-4">
            <span className="text-[11px] text-zinc-600">{t("certIssuer")}</span>
            <span className="text-zinc-700">·</span>
            <a
              href={t("verifyUrl")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-amber-400/80 hover:text-amber-400 transition-colors underline underline-offset-2"
            >
              {t("verifyLabel")}
            </a>
          </div>
        </Reveal>

        {/* Who is this for */}
        <Reveal delay={0.15}>
          <div className="mt-12 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-white text-center mb-5">
              {t("forWho.title")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-2.5 py-2">
                  <span className="text-green-400 mt-0.5 text-sm">✓</span>
                  <span className="text-sm text-zinc-400 leading-relaxed">
                    {t(`forWho.items.${i}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Pricing plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14">
          {plans.map((plan, i) => {
            const colors = PLAN_COLORS[plan.key];
            return (
              <Reveal key={plan.key} delay={i * 0.08}>
                <motion.div
                  className="relative p-7 rounded-[20px] h-full flex flex-col"
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                  }}
                  whileHover={{
                    y: -6,
                    boxShadow: `0 20px 48px rgba(0,0,0,0.3), 0 0 0 1px ${colors.border}`,
                  }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold"
                      style={{
                        background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                        color: "white",
                        boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
                      }}
                    >
                      {t("popularBadge")}
                    </div>
                  )}

                  <h3
                    className="text-lg font-extrabold"
                    style={{ color: colors.accent }}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-xs text-muted mt-1.5 leading-relaxed">
                    {plan.desc}
                  </p>

                  {/* Price */}
                  <div className="mt-5 mb-5">
                    <span className="text-3xl font-extrabold text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm text-zinc-500 ml-1.5">
                      {plan.period}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5 flex-1">
                    {plan.features.map((feature, fi) => (
                      <div key={fi} className="flex items-start gap-2">
                        <span
                          className="mt-1 text-xs"
                          style={{ color: colors.accent }}
                        >
                          ✓
                        </span>
                        <span className="text-[13px] text-zinc-400 leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-6">
                    {plan.popular ? (
                      <CtaButton
                        href={WA_LINKS.coaching}
                        className="!w-full !justify-center"
                      >
                        {plan.cta}
                      </CtaButton>
                    ) : (
                      <CtaButton
                        href={WA_LINKS.coaching}
                        variant="secondary"
                        className="!w-full !justify-center"
                      >
                        {plan.cta}
                      </CtaButton>
                    )}
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>

        {/* Bottom note */}
        <Reveal delay={0.3}>
          <div className="text-center mt-10">
            <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
              {t("note")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}