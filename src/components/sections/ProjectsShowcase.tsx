"use client";

import { useState, Suspense, lazy } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PROJECTS, WA_LINKS } from "@/lib/constants";

const ProjectDevice = lazy(() =>
  import("@/components/3d/ProjectDevice").then((m) => ({
    default: m.ProjectDevice,
  }))
);

function DeviceFallback({ color }: { color: string }) {
  return (
    <div className="w-full h-[360px] md:h-[420px] flex items-center justify-center">
      <motion.div
        className="w-20 h-40 rounded-2xl border-2"
        style={{ borderColor: color + "60" }}
        animate={{
          rotateY: [0, 15, -15, 0],
          y: [0, -8, 0],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="w-full h-full rounded-2xl opacity-20"
          style={{ background: color }}
        />
      </motion.div>
    </div>
  );
}

export function ProjectsShowcase() {
  const t = useTranslations("projects");
  const [active, setActive] = useState(0);
  const project = PROJECTS[active];

  return (
    <section id="proyectos" className="py-24 px-6 relative">
      <div className="max-w-[1100px] mx-auto relative z-10">
        <SectionHeading
          label={t("label")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        {/* Project tabs */}
        <div className="flex gap-2 mt-10 flex-wrap">
          {PROJECTS.map((p, i) => (
            <motion.button
              key={p.id}
              onClick={() => setActive(i)}
              className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer border transition-all duration-200"
              style={{
                background:
                  active === i ? p.color + "15" : "rgba(255,255,255,0.02)",
                borderColor: active === i ? p.color + "40" : "rgba(255,255,255,0.06)",
                color: active === i ? p.color : "#71717A",
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {p.name}
            </motion.button>
          ))}
        </div>

        {/* Project detail + 3D */}
        <AnimatePresence mode="wait">
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 rounded-card card-base overflow-hidden"
            style={{
              borderColor: project.color + "20",
            }}
          >
            {/* Color bar */}
            <div
              className="h-1"
              style={{
                background: `linear-gradient(90deg, ${project.color}, transparent)`,
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left: 3D device */}
              <div className="relative bg-gradient-to-br from-white/[0.01] to-transparent">
                <Suspense fallback={<DeviceFallback color={project.color} />}>
                  <ProjectDevice
                    color={project.color}
                    isActive={true}
                  />
                </Suspense>
              </div>

              {/* Right: Info */}
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-extrabold text-white">
                    {project.name}
                  </h3>
                  <span className="text-[9px] font-bold text-green-300 px-2.5 py-1 rounded-lg bg-green-500/[0.08] border border-green-500/[0.15]">
                    {t("liveTag")}
                  </span>
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: project.color }}
                >
                  {project.type}
                </span>

                <div className="mt-6 space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-red-400">
                      {t("problemLabel")}:
                    </span>
                    <p className="text-sm text-muted mt-0.5">{project.problem}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-green-400">
                      {t("solutionLabel")}:
                    </span>
                    <p className="text-sm text-zinc-400 mt-0.5">
                      {project.solution}
                    </p>
                  </div>
                </div>

                <div
                  className="mt-5 px-4 py-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: project.color + "0A",
                    border: `1px solid ${project.color}20`,
                    color: project.color,
                  }}
                >
                  📊 {project.result}
                </div>

                <div className="flex gap-1.5 flex-wrap mt-5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold text-zinc-600 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <Reveal delay={0.2}>
          <div className="text-center mt-11">
            <CtaButton href={WA_LINKS.default}>
              {t("cta")}
            </CtaButton>
          </div>
        </Reveal>

        {/* Confidentiality disclaimer */}
        <Reveal delay={0.25}>
          <div className="mt-8 flex items-center justify-center gap-2 text-center">
            <span className="text-zinc-700 text-lg">🔒</span>
            <p className="text-[11px] text-zinc-600 max-w-lg leading-relaxed">
              {t("disclaimer")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
