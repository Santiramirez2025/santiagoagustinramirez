"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { WA_LINKS } from "@/lib/constants";

const ICONS = ["✅", "💰", "🔧", "📦"];

export function RiskReversal() {
  const t = useTranslations("risk");

  const items = [0, 1, 2, 3].map((i) => t(`items.${i}`));

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-[700px] mx-auto relative z-10">
        <Reveal>
          <div className="p-10 rounded-[20px] bg-gradient-to-br from-accent/[0.06] to-accent/[0.02] border border-accent/[0.12] text-center">
            <div className="text-4xl mb-4">🛡️</div>
            <h2 className="text-[clamp(22px,3vw,32px)] font-extrabold text-white tracking-tight">
              {t("title")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7">
              {items.map((text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 text-left py-2.5"
                >
                  <span className="text-lg flex-shrink-0">{ICONS[i]}</span>
                  <span className="text-sm text-zinc-300 font-medium">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-7">
              <CtaButton href={WA_LINKS.call}>{t("cta")}</CtaButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
