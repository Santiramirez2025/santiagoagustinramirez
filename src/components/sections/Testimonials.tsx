"use client";

import { useTranslations } from "next-intl";
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
    <section className="py-24 px-6 relative bg-white/[0.015]">
      <div className="max-w-[1100px] mx-auto relative z-10">
        <SectionHeading label={t("label")} title={t("title")} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-11">
          {items.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.08}>
              <div className="p-7 rounded-card card-base h-full">
                <div className="flex gap-0.5 mb-3.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-[15px] text-amber-500">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed italic">
                  &ldquo;{item.text}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-[13px] font-extrabold">
                    {item.name[0]}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-white">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-zinc-600">{item.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
